import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from 'your-gemini-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY // ✅ key is server-only
    });

    const result = await ai.generate(req.body); // forward frontend prompt
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
