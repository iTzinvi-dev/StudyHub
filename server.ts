import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import Groq from 'groq-sdk';

const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey: GROQ_API_KEY });

// System prompt instructing KaTeX formatting
const MENTOR_SYSTEM_PROMPT = `You are the StudyHub AI Academic & Engineering Mentor.
Your role: Provide concise, crystal-clear, human-crafted explanations for doubts in Mathematics, Algorithms, Computer Science, and Physics.
STRICT KaTeX formatting rules:
- Format all math/science equations using standard Markdown and KaTeX.
- NEVER output raw messy inline math like "1/2*2" or "a/b". Always wrap in LaTeX math blocks: $\\frac{1}{2}$ or $\\frac{a}{b}$.
- Display all significant formulas and equations on their own line using double dollars: $$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$.
- Use inline math single dollars $ ... $ for variables like $O(n \\log n)$, $x$, $\\theta$.
- Keep the tone calm, encouraging, and focused. Avoid conversational fluff or AI clichés.`;

// API Route 1: Streaming text route using Groq SDK (Model: Qwen 3.8 27B)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { prompt, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text || msg.content || ''
    }));

    const stream = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: MENTOR_SYSTEM_PROMPT },
        ...formattedHistory,
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.3
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Groq chat streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Groq chat failed' })}\n\n`);
    res.end();
  }
});

// API Route 2: Strict JSON array for Active Recall quizzes (Model: GPT OSS 20B)
// Format: [{ question, options: [], correctAnswer }]
app.post('/api/quiz', async (req: Request, res: Response) => {
  const { topic = 'Data Structures and Algorithms', count = 3 } = req.body;

  try {
    const prompt = `Generate exactly ${count} active recall quiz questions on the topic: "${topic}".
Output MUST be a strict JSON object with a "questions" key containing an array of objects.
Each object in the array MUST strictly follow this exact schema:
{
  "question": "Question text here (format any formulas in KaTeX like $\\\\frac{1}{2}$)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Exact text of the correct option",
  "explanation": "Clear explanation of why this answer is correct"
}`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: 'You are an Active Recall Quiz Engine. You MUST output strict valid JSON. Do not include markdown code block syntax around the JSON if possible.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Support both direct array or { questions: [...] }
    const questionsArray = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);

    res.json({
      topic,
      questions: questionsArray.map((q: any, i: number) => ({
        id: `q_${Date.now()}_${i}`,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: Array.isArray(q.options)
          ? Math.max(0, q.options.findIndex((opt: string) => opt === q.correctAnswer))
          : 0,
        correctAnswer: q.correctAnswer || (q.options && q.options[0]) || '',
        explanation: q.explanation || 'Verified concept.'
      }))
    });
  } catch (error: any) {
    console.error('Groq quiz generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Vite Middleware for Development
async function startServer() {
  const port = 3000;

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`StudyHub full-stack server running on http://localhost:${port}`);
  });
}

startServer();
