import apiClient from './axiosClient';
import { Project, ExecutionResult } from '../types/file.types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await apiClient.get('/files/projects');
    return res.data.projects;
  },

  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get(`/files/projects/${id}`);
    return res.data.project;
  },

  create: async (data: { projectName: string; description?: string; language?: string }): Promise<Project> => {
    const res = await apiClient.post('/files/projects', data);
    return res.data.project;
  },

  saveFile: async (
    projectId: string,
    file: { path: string; content: string; language: string }
  ): Promise<void> => {
    await apiClient.patch(`/files/projects/${projectId}/file`, file);
  },

  renameProject: async (projectId: string, projectName: string): Promise<void> => {
    await apiClient.patch(`/files/projects/${projectId}/rename`, { projectName });
  },

  renameFile: async (projectId: string, oldPath: string, newPath: string): Promise<void> => {
    await apiClient.patch(`/files/projects/${projectId}/file/rename`, { oldPath, newPath });
  },

  deleteFile: async (projectId: string, path: string): Promise<void> => {
    await apiClient.delete(`/files/projects/${projectId}/file`, { data: { path } });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/files/projects/${id}`);
  },

  execute: async (code: string, language: 'javascript' | 'typescript' = 'javascript'): Promise<ExecutionResult> => {
    const res = await apiClient.post('/files/execute', { code, language });
    return res.data;
  },
};
