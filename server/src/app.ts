import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './routes/api';

const app = express();

// Standard middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
];

if (env.APP_URL) {
  allowedOrigins.push(env.APP_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const isVercel = origin.endsWith('.vercel.app') || origin.includes('.vercel.app');
    const isAllowed = allowedOrigins.includes(origin) || isVercel;
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS Blocked Origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/healthz', (req, res) => {
  res.json({
    status: "ok",
    message: "ReceptionAI backend is running"
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong on the server.' });
});

const PORT = Number(process.env.PORT || env.PORT || 5000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ ReceptionAI backend server running on port ${PORT}`);
  console.log(`🌸 Mode: SQLite database listening at ${env.DATABASE_URL}`);
});

export default app;
// trigger restart nodemon
