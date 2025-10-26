import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import aiRouter from './routes/ai.js';
import resumesRouter from './routes/resumes.js';
import uploadRouter from './routes/upload.js';
import paymentsRouter from './routes/payments.js';

const envSchema = z.object({
  PORT: z.string().optional(),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const env = envSchema.parse(process.env);

const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/ai', aiRouter);
app.use('/api/resumes', resumesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/payments', paymentsRouter);

const port = Number(env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${port}`);
});


