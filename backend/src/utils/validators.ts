import { z } from 'zod';

export const createProjectSchema = z.object({
  projectName: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  language: z.string().default('javascript'),
});

export const updateFileSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string().max(1_000_000), // 1MB per file max
  language: z.string().default('plaintext'),
});

export const updateProjectSchema = z.object({
  projectName: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  activeFilePath: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const codeExecutionSchema = z.object({
  language: z.enum(['javascript', 'typescript']),
  code: z.string().min(1).max(50_000), // 50KB max
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateFileInput = z.infer<typeof updateFileSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CodeExecutionInput = z.infer<typeof codeExecutionSchema>;
