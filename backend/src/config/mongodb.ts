import mongoose from 'mongoose';
import { initFirebaseAdmin } from './firebase.admin';

export async function connectMongoDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('❌ MONGODB_URI is missing. Check your .env file.');
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'nri-studio',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Atlas connected');

    // Initialize Firebase Admin after DB connection
    initFirebaseAdmin();

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Reconnecting...');
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}
