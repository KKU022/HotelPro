import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI is not set. Database connection skipped.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    isConnected = false;
    console.error('❌ Failed to connect to MongoDB:', error);
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ MongoDB error:', err);
});

export const getDbState = (): 'connected' | 'disconnected' | 'connecting' | 'not_configured' => {
  if (!env.MONGO_URI) {
    return 'not_configured';
  }
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    default:
      return 'disconnected';
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
