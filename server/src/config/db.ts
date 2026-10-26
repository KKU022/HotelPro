import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (): Promise<void> => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  // Await existing in-flight connection to prevent duplicate connection attempts
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    await connectionPromise;
    return;
  }

  if (!env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI is not set. Database connection skipped.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await connectionPromise;
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (error) {
    isConnected = false;
    connectionPromise = null;
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
