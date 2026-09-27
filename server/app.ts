/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PORT, ROOT_DIR, getGeminiApiKey } from './config';

// Import route modules
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import syllabusRoutes from './routes/syllabus.routes';
import pyqRoutes from './routes/pyq.routes';
import assessmentRoutes from './routes/assessment.routes';
import courseRoutes from './routes/course.routes';
import documentRoutes from './routes/document.routes';
import tutorRoutes from './routes/tutor.routes';
import bktRoutes from './routes/bkt.routes';

export const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes Mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', syllabusRoutes);
app.use('/api', pyqRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', courseRoutes);
app.use('/api', documentRoutes);
app.use('/api', tutorRoutes);
app.use('/api/bkt', bktRoutes);

// Global Error Handler for API
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ServerError]', err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error',
    });
  }
  next(err);
});

// Boot Server function
export async function startServer(port: number = PORT) {
  const distPath = path.resolve(ROOT_DIR, 'dist');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    // Production: serve built static files
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Development: integrate Vite in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(port, () => {
    const hasKey = Boolean(getGeminiApiKey());
    console.log(`\n======================================================`);
    console.log(`🚀 SpectrumX Adaptive Backend Running on http://localhost:${port}`);
    console.log(`🛡️  Gemini AI Status: ${hasKey ? 'Live API Key Connected' : '3-Tier High-Availability Backup Engine Active'}`);
    console.log(`🗄️  Persistent File Database: Initialized & Synchronized`);
    console.log(`======================================================\n`);
  });

  return server;
}
