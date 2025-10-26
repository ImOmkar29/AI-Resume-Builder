import { Client } from 'google-genai';

const client = new Client({ apiKey: process.env.GEMINI_API_KEY });

export const generateSummary = async (req, res) => {
  try {
    const { jobTitle, skills, experience } = req.body;

    const prompt = `
      Write a concise, professional resume summary for a ${jobTitle} with these skills: ${skills.join(", ")}.
      Experience: ${experience}.
      Keep it under 3 sentences and ATS-friendly.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};
