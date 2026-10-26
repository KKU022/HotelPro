import app from '../server/src/app';
import { connectDatabase } from '../server/src/config/db';

/**
 * Vercel Serverless Function Entry Point for HotelPro API
 * Routes all /api/* requests into the Express application with cached MongoDB connection.
 */
export default async function handler(req: any, res: any) {
  await connectDatabase();
  return app(req, res);
}
