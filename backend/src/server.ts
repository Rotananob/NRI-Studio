import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongoDB } from './config/mongodb';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 NRI Studio Backend running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔐 Auth: Firebase Admin SDK`);
      console.log(`🗄️  Database: MongoDB Atlas\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
