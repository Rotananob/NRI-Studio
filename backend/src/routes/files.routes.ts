import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken';
import { codeExecRateLimiter } from '../middleware/rateLimiter';
import {
  getProjects,
  getProject,
  createProject,
  updateFile,
  deleteFile,
  deleteProject,
  executeCode,
  renameProject,
  renameFile,
} from '../controllers/files.controller';

const router = Router();

// Public routes (Rate limited)
// POST   /api/files/execute           — Run code in sandbox
router.post('/execute', codeExecRateLimiter, executeCode);

// All project routes require auth
router.use('/projects', verifyFirebaseToken);

// GET    /api/files/projects          — List user's projects
router.get('/projects', getProjects);

// GET    /api/files/projects/:id      — Get single project
router.get('/projects/:id', getProject);

// POST   /api/files/projects          — Create new project
router.post('/projects', createProject);

// PATCH  /api/files/projects/:id/rename — Rename project
router.patch('/projects/:id/rename', renameProject);

// PATCH  /api/files/projects/:id/file — Save/update a file in project
router.patch('/projects/:id/file', updateFile);

// PATCH  /api/files/projects/:id/file/rename — Rename a file
router.patch('/projects/:id/file/rename', renameFile);

// DELETE /api/files/projects/:id/file — Delete a file from project
router.delete('/projects/:id/file', deleteFile);

// DELETE /api/files/projects/:id      — Delete entire project
router.delete('/projects/:id', deleteProject);

export default router;
