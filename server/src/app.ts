import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { expenseRouter } from './routes/expense.routes.js';
import { incomeRouter } from './routes/income.routes.js';
import { udhaarRouter } from './routes/udhaar.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin.split(',').map((value) => value.trim()) }));
  app.use(express.json({ limit: '100kb' }));
  if (!env.isProd) app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.STATES[mongoose.connection.readyState],
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/income', incomeRouter);
  app.use('/api/expenses', expenseRouter);
  app.use('/api/udhaar', udhaarRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
