import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { query } from './config/db';
import authRoutes from './routes/authRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint with PostgreSQL test query
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbResult = await query('SELECT NOW() AS current_time, current_database() AS db_name');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        name: dbResult.rows[0].db_name,
        serverTime: dbResult.rows[0].current_time,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: err.message,
      },
    });
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route Not Found',
    path: req.originalUrl,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled App Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
