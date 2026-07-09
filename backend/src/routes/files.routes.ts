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
} from '../controllers/files.controller';

const router = Router();

// All file routes require auth
router.use(verifyFirebaseToken);

// GET    /api/files/projects          — List user's projects
router.get('/projects', getProjects);

// GET    /api/files/projects/:id      — Get single project
router.get('/projects/:id', getProject);

// POST   /api/files/projects          — Create new project
router.post('/projects', createProject);

// PATCH  /api/files/projects/:id/file — Save/update a file in project
router.patch('/projects/:id/file', updateFile);

// DELETE /api/files/projects/:id/file — Delete a file from project
router.delete('/projects/:id/file', deleteFile);

// DELETE /api/files/projects/:id      — Delete entire project
router.delete('/projects/:id', deleteProject);

// POST   /api/files/execute           — Run code in sandbox
router.post('/execute', codeExecRateLimiter, executeCode);

export default router;
