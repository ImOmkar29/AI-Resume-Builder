import OpenAI from 'openai';
import { z } from 'zod';

let cached: OpenAI | null = null;

const envSchema = z.object({ OPENAI_API_KEY: z.string() });

export function getOpenAI(): OpenAI {
  if (cached) return cached;
  const env = envSchema.parse(process.env);
  cached = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return cached;
}


