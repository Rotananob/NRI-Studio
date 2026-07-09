import mongoose, { Schema, Document } from 'mongoose';

export interface IFileEntry {
  path: string;       // e.g. "src/App.tsx"
  content: string;    // file content
  language: string;   // "typescript", "javascript", "html", etc.
  size: number;       // bytes
  lastModified: Date;
}

export interface IProject extends Document {
  ownerId: string;          // 🔐 Firebase UID — user-scoped
  projectName: string;
  description?: string;
  files: IFileEntry[];
  activeFilePath?: string;  // last opened file
  isPublic: boolean;
  sharedWith: string[];     // Firebase UIDs with read access
  language: string;         // primary language
  totalSize: number;        // total bytes
  createdAt: Date;
  updatedAt: Date;
}

const FileEntrySchema = new Schema<IFileEntry>(
  {
    path: { type: String, required: true },
    content: { type: String, default: '' },
    language: { type: String, default: 'plaintext' },
    size: { type: Number, default: 0 },
    lastModified: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,     // index for fast user queries
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    files: {
      type: [FileEntrySchema],
      default: [],
    },
    activeFilePath: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'javascript',
    },
    totalSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔐 Compound index: ensures users can only query their own projects
ProjectSchema.index({ ownerId: 1, projectName: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
