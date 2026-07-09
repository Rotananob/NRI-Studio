import apiClient from './axiosClient';
import { Project, ExecutionResult } from '../types/file.types';
import { useAuthStore } from '../store/authStore';

// Local storage helpers for Guest mode
const getGuestProjects = (): Project[] => {
  const data = localStorage.getItem('guest_projects');
  return data ? JSON.parse(data) : [];
};

const saveGuestProjects = (projects: Project[]) => {
  localStorage.setItem('guest_projects', JSON.stringify(projects));
};

const generateId = () => Math.random().toString(36).substring(2, 15);

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    if (useAuthStore.getState().isGuest) return getGuestProjects();
    const res = await apiClient.get('/files/projects');
    return res.data.projects;
  },

  getById: async (id: string): Promise<Project> => {
    if (useAuthStore.getState().isGuest) {
      const proj = getGuestProjects().find(p => p._id === id);
      if (!proj) throw new Error('Not found');
      return proj;
    }
    const res = await apiClient.get(`/files/projects/${id}`);
    return res.data.project;
  },

  create: async (data: { projectName: string; description?: string; language?: string }): Promise<Project> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects();
      const newProj: Project = {
        _id: generateId(),
        projectName: data.projectName,
        description: data.description || '',
        language: data.language || 'javascript',
        files: [],
        ownerId: 'guest',
        totalSize: 0,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveGuestProjects([...projects, newProj]);
      return newProj;
    }
    const res = await apiClient.post('/files/projects', data);
    return res.data.project;
  },

  saveFile: async (
    projectId: string,
    file: { path: string; content: string; language: string }
  ): Promise<void> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects();
      const projIndex = projects.findIndex(p => p._id === projectId);
      if (projIndex > -1) {
        const fileIndex = projects[projIndex].files.findIndex(f => f.path === file.path);
        if (fileIndex > -1) {
          projects[projIndex].files[fileIndex] = {
            ...projects[projIndex].files[fileIndex],
            content: file.content,
            language: file.language,
            size: new Blob([file.content]).size,
            lastModified: new Date().toISOString()
          };
        } else {
          projects[projIndex].files.push({
            path: file.path,
            content: file.content,
            language: file.language,
            size: new Blob([file.content]).size,
            lastModified: new Date().toISOString()
          });
        }
        saveGuestProjects(projects);
      }
      return;
    }
    await apiClient.patch(`/files/projects/${projectId}/file`, file);
  },

  renameProject: async (projectId: string, projectName: string): Promise<void> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects();
      const p = projects.find(x => x._id === projectId);
      if (p) {
        p.projectName = projectName;
        saveGuestProjects(projects);
      }
      return;
    }
    await apiClient.patch(`/files/projects/${projectId}/rename`, { projectName });
  },

  renameFile: async (projectId: string, oldPath: string, newPath: string): Promise<void> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects();
      const p = projects.find(x => x._id === projectId);
      if (p) {
        const f = p.files.find(x => x.path === oldPath);
        if (f) f.path = newPath;
        saveGuestProjects(projects);
      }
      return;
    }
    await apiClient.patch(`/files/projects/${projectId}/file/rename`, { oldPath, newPath });
  },

  deleteFile: async (projectId: string, path: string): Promise<void> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects();
      const p = projects.find(x => x._id === projectId);
      if (p) {
        p.files = p.files.filter(f => f.path !== path);
        saveGuestProjects(projects);
      }
      return;
    }
    await apiClient.delete(`/files/projects/${projectId}/file`, { data: { path } });
  },

  delete: async (id: string): Promise<void> => {
    if (useAuthStore.getState().isGuest) {
      const projects = getGuestProjects().filter(p => p._id !== id);
      saveGuestProjects(projects);
      return;
    }
    await apiClient.delete(`/files/projects/${id}`);
  },

  execute: async (code: string, language: 'javascript' | 'typescript' = 'javascript'): Promise<ExecutionResult> => {
    // Both Guests and Authenticated users use the real backend execution API since it's now public
    const res = await apiClient.post('/files/execute', { code, language });
    return res.data;
  },
};
