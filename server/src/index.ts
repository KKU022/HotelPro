import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';

// Standalone server entrypoint (used for local development via `npm run dev`)
// In serverless environments (Vercel Functions), app.listen is skipped and requests are handled via api/index.ts
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  connectDatabase().then(() => {
    app.listen(env.PORT, () => {
      console.log(`🚀 HotelPro Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Allowed CORS Origins: ${env.CORS_ORIGIN.join(', ')}`);
    });
  });
}

export { app };
export default app;
