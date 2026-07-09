export interface FileEntry {
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: string;
}

export interface Project {
  _id: string;
  ownerId: string;
  projectName: string;
  description?: string;
  files: FileEntry[];
  activeFilePath?: string;
  isPublic: boolean;
  language: string;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tab {
  id: string;         // unique tab id
  projectId: string;
  filePath: string;
  label: string;
  language: string;
  isDirty: boolean;   // unsaved changes
  content: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  executionTimeMs: number;
}
