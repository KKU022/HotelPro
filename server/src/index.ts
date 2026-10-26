import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDatabase, getDbState } from './config/db';
import { notFoundHandler, centralErrorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import bookingRoutes from './routes/bookings';
import adminRoutes from './routes/admin';

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Restrict CORS to approved origins; permit server-to-server and curl requests without an Origin header
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (env.CORS_ORIGIN.includes(origin)) {
      return callback(null, true);
    }
    const error: Error & { statusCode?: number } = new Error(
      `CORS access denied: Origin '${origin}' is not authorized.`
    );
    error.statusCode = 403;
    return callback(error);
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Lightweight in-memory rate limiter for authentication routes
const authRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const authRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;

  const record = authRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    authRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (record.count >= maxRequests) {
    res.status(429).json({ message: 'Too many authentication attempts. Please try again in a minute.' });
    return;
  }

  record.count += 1;
  next();
};

// Health Check Endpoint (Reflects live MongoDB connection state)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    db: getDbState(),
  });
});

// Mount API Modules
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for unknown /api routes
app.use('/api', notFoundHandler);

// Catch-all 404 for any other unrecognized routes
app.use('*', notFoundHandler);

// Central error handling middleware (registered last)
app.use(centralErrorHandler);

// Connect to MongoDB and start server
connectDatabase().then(() => {
  app.listen(env.PORT, () => {
    console.log(`🚀 HotelPro Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`Allowed CORS Origins: ${env.CORS_ORIGIN.join(', ')}`);
  });
});

export { app };
