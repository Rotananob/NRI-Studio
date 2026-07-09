import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;           // Firebase UID — primary link
  email: string;
  displayName: string;
  avatar?: string;
  plan: 'free' | 'pro';
  storageUsedBytes: number;
  createdAt: Date;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    avatar: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    storageUsedBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
