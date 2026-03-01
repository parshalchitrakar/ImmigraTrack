import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

import visaRoutes from './routes/visaRoutes';
import dolRoutes from './routes/dolRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';

import { recalculatePredictions } from './services/predictionService';
import { startCronJobs } from './jobs/scheduledTasks';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://immigra-track.vercel.app', 'https://immigra-track-git-main-parshalchitrakars-projects.vercel.app'] 
    : 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/visa', visaRoutes);
app.use('/api/dol', dolRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Cron Jobs - Monthly Prediction Recalculation (1st of month at midnight)
cron.schedule('0 0 1 * *', async () => {
  console.log('[Cron] Running Prediction Engine Recalculation...');
  try {
    await recalculatePredictions();
  } catch (error) {
    console.error('[Cron] Error during recalculation:', error);
  }
});

// Import new scraper cron jobs
startCronJobs();

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`GreenCard Insights API running on port ${config.port} in ${config.env} mode`);
});

export default app;
