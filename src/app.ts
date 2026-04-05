import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import recordRoutes from './routes/record.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Route not found',
  });
});

app.use(errorHandler);

export default app;
