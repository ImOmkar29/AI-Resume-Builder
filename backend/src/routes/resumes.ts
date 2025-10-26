import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// In production, these would be stored in a DB (e.g., Supabase). Placeholder in-memory map.
const userIdToResumes = new Map<string, any[]>();

const resumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().default('Untitled Resume'),
  data: z.any(),
});

router.get('/', (req, res) => {
  const userId = String(req.headers['x-user-id'] ?? 'anon');
  res.json({ resumes: userIdToResumes.get(userId) ?? [] });
});

router.post('/', (req, res) => {
  const userId = String(req.headers['x-user-id'] ?? 'anon');
  const parsed = resumeSchema.parse(req.body);
  const existing = userIdToResumes.get(userId) ?? [];
  const id = parsed.id ?? `r_${Date.now()}`;
  const created = { id, title: parsed.title, data: parsed.data, updatedAt: new Date().toISOString() };
  existing.push(created);
  userIdToResumes.set(userId, existing);
  res.json(created);
});

router.put('/:id', (req, res) => {
  const userId = String(req.headers['x-user-id'] ?? 'anon');
  const { id } = req.params;
  const parsed = resumeSchema.parse(req.body);
  const list = userIdToResumes.get(userId) ?? [];
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list[idx] = { id, title: parsed.title, data: parsed.data, updatedAt: new Date().toISOString() };
  res.json(list[idx]);
});

router.delete('/:id', (req, res) => {
  const userId = String(req.headers['x-user-id'] ?? 'anon');
  const { id } = req.params;
  const list = userIdToResumes.get(userId) ?? [];
  const next = list.filter(r => r.id !== id);
  userIdToResumes.set(userId, next);
  res.json({ ok: true });
});

export default router;


