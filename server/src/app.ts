import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import apiRouter from './routes/api';

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Mount API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong on the server.' });
});

app.listen(env.PORT, () => {
  console.log(`✨ ReceptionAI backend server running on port ${env.PORT}`);
  console.log(`🌸 Mode: SQLite database listening at ${env.DATABASE_URL}`);
});

export default app;
// trigger restart nodemon
