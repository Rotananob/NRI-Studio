import { Request, Response } from 'express';
import { Project } from '../models/File.model';
import { User } from '../models/User.model';
import { AuthenticatedRequest } from '../middleware/verifyFirebaseToken';
import {
  createProjectSchema,
  updateFileSchema,
  codeExecutionSchema,
} from '../utils/validators';
import { executeJavaScript } from '../utils/codeSandbox';

const MAX_STORAGE_FREE = 100 * 1024 * 1024; // 100MB free tier

// ─────────────────────────────────────────────────────────────
//  GET /api/files/projects
// ─────────────────────────────────────────────────────────────
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;

    const projects = await Project.find({ ownerId: uid })
      .select('-files.content') // Don't send full content in list
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to fetch projects' });
  }
}

// ─────────────────────────────────────────────────────────────
//  GET /api/files/projects/:id
// ─────────────────────────────────────────────────────────────
export async function getProject(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, ownerId: uid }).lean();

    if (!project) {
      res.status(404).json({ error: 'NotFound', message: 'Project not found' });
      return;
    }

    res.json({ project });
  } catch (error) {
    console.error('getProject error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to fetch project' });
  }
}

// ─────────────────────────────────────────────────────────────
//  POST /api/files/projects
// ─────────────────────────────────────────────────────────────
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;

    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }

    const { projectName, description, language } = parsed.data;

    // Check storage limit
    const user = await User.findOne({ uid });
    if (user && user.storageUsedBytes >= MAX_STORAGE_FREE) {
      res.status(403).json({ error: 'StorageLimit', message: 'Free tier storage limit (100MB) reached.' });
      return;
    }

    const project = await Project.create({
      ownerId: uid,
      projectName,
      description,
      language,
      files: [],
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to create project' });
  }
}

// ─────────────────────────────────────────────────────────────
//  PATCH /api/files/projects/:id/file  (save/update a file)
// ─────────────────────────────────────────────────────────────
export async function updateFile(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;
    const { id } = req.params;

    const parsed = updateFileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }

    const { path, content, language } = parsed.data;
    const size = Buffer.byteLength(content, 'utf8');

    const project = await Project.findOne({ _id: id, ownerId: uid });
    if (!project) {
      res.status(404).json({ error: 'NotFound', message: 'Project not found' });
      return;
    }

    const existingIndex = project.files.findIndex((f) => f.path === path);

    if (existingIndex >= 0) {
      project.files[existingIndex].content = content;
      project.files[existingIndex].language = language;
      project.files[existingIndex].size = size;
      project.files[existingIndex].lastModified = new Date();
    } else {
      project.files.push({ path, content, language, size, lastModified: new Date() });
    }

    // Update total size
    project.totalSize = project.files.reduce((acc, f) => acc + f.size, 0);
    project.activeFilePath = path;

    await project.save();

    // Update user storage
    await User.updateOne({ uid }, { $set: { storageUsedBytes: project.totalSize } });

    res.json({ message: 'File saved', path, size });
  } catch (error) {
    console.error('updateFile error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to save file' });
  }
}

// ─────────────────────────────────────────────────────────────
//  DELETE /api/files/projects/:id/file
// ─────────────────────────────────────────────────────────────
export async function deleteFile(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { path } = req.body;

    const project = await Project.findOne({ _id: id, ownerId: uid });
    if (!project) {
      res.status(404).json({ error: 'NotFound', message: 'Project not found' });
      return;
    }

    project.files = project.files.filter((f) => f.path !== path);
    project.totalSize = project.files.reduce((acc, f) => acc + f.size, 0);
    await project.save();

    res.json({ message: 'File deleted', path });
  } catch (error) {
    console.error('deleteFile error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to delete file' });
  }
}

// ─────────────────────────────────────────────────────────────
//  DELETE /api/files/projects/:id
// ─────────────────────────────────────────────────────────────
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { uid } = req as AuthenticatedRequest;
    const { id } = req.params;

    const project = await Project.findOneAndDelete({ _id: id, ownerId: uid });
    if (!project) {
      res.status(404).json({ error: 'NotFound', message: 'Project not found' });
      return;
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('deleteProject error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Failed to delete project' });
  }
}

// ─────────────────────────────────────────────────────────────
//  POST /api/files/execute
// ─────────────────────────────────────────────────────────────
export async function executeCode(req: Request, res: Response): Promise<void> {
  try {
    const parsed = codeExecutionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
      return;
    }

    const { code } = parsed.data;
    const result = await executeJavaScript(code);

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      timedOut: result.timedOut,
      executionTimeMs: result.executionTimeMs,
    });
  } catch (error) {
    console.error('executeCode error:', error);
    res.status(500).json({ error: 'InternalError', message: 'Code execution failed' });
  }
}
