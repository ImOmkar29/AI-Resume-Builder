import { Router } from 'express';
import { z } from 'zod';
import { getOpenAI } from '../services/openai.js';

const router = Router();

const atsBody = z.object({
  summary: z.string().default(''),
  skills: z.array(z.string()).default([]),
  jobDescription: z.string(),
});

router.post('/ats-score', async (req, res) => {
  try {
    const { summary, skills, jobDescription } = atsBody.parse(req.body);
    const client = getOpenAI();

    const prompt = `You are an ATS evaluator. Compare the candidate's resume (summary and skills) with the job description. Return concise JSON with fields: atsScore (0-100), keywordMatchPercent (0-100), missingSkills (string[]), recommendations (string[]). Make it strictly valid JSON.

RESUME SUMMARY:\n${summary}\n\nRESUME SKILLS:\n${skills.join(', ')}\n\nJOB DESCRIPTION:\n${jobDescription}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const content = resp.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(content);
    res.json(json);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'ATS score failed' });
  }
});

const tailorBody = z.object({
  summary: z.string().default(''),
  skills: z.array(z.string()).default([]),
  jobDescription: z.string(),
});

router.post('/tailor', async (req, res) => {
  try {
    const { summary, skills, jobDescription } = tailorBody.parse(req.body);
    const client = getOpenAI();
    const prompt = `Tailor the resume summary and skills to better match the job description while remaining truthful. Return JSON with fields: summary (string), skills (string[]). Keep skills concise and role-relevant.\n\nCURRENT SUMMARY:\n${summary}\n\nCURRENT SKILLS:\n${skills.join(', ')}\n\nJOB DESCRIPTION:\n${jobDescription}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    });
    const content = resp.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(content);
    res.json(json);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Tailoring failed' });
  }
});

const suggestBody = z.object({
  roleOrSummary: z.string(),
});

router.post('/suggest-skills', async (req, res) => {
  try {
    const { roleOrSummary } = suggestBody.parse(req.body);
    const client = getOpenAI();
    const prompt = `Suggest 10-20 concise, deduplicated, industry-standard resume skills for: "${roleOrSummary}". Return strictly JSON: { skills: string[] }.`;
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Respond ONLY with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });
    const content = resp.choices[0]?.message?.content ?? '{}';
    const json = JSON.parse(content);
    res.json(json);
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Skill suggestion failed' });
  }
});

export default router;


