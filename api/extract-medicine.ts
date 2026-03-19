// api/extract-medicine.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Optional: verify token (firebase/jwt/…)

    try {
        const { imageBase64 } = req.body ?? {};
        if (typeof imageBase64 !== 'string' || !imageBase64) {
            return res.status(400).json({ error: 'imageBase64 required' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical OCR assistant. Extract medicine name and batch number from images. If not visible, return null.',
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text:
                                'Extract the medicine name and batch number from this medicine image ' +
                                'and return ONLY valid JSON (no markdown, no fences):\n\n' +
                                '{\n  "medicine_name": string | null,\n  "batch_number": string | null\n}',
                        },
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                        },
                    ],
                },
            ]
        });

        const text = completion.choices?.[0]?.message?.content?.trim() ?? '';
        const result = JSON.parse(text);

        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Processing failed' });
    }
}