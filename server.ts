import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Load local .env if available
if (fs.existsSync('.env')) {
  try {
    const envFile = fs.readFileSync('.env', 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key] || process.env[key] === 'MY_GEMINI_API_KEY') {
          process.env[key] = val;
        }
      }
    }
  } catch {
    // Ignore .env read error
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI(GEMINI_API_KEY ? { apiKey: GEMINI_API_KEY } : {});

// Multi-purpose Universal AI Mentor System Prompt
const MENTOR_SYSTEM_PROMPT = `You are the StudyHub AI Mentor — a versatile, deeply knowledgeable, multi-purpose learning companion and universal tutor for StudyHub (a modern, deliberate focus sanctuary crafted in Apple Space Black & Electric Azure liquid glass).

Your purpose:
You understand, explore, and teach ANY subject, question, or concept the user brings to you. You are a general-purpose educational AI not limited to any single domain.
You teach and converse across all fields with equal depth, rigor, intuition, and clarity:
- Mathematics, Logic, Statistics, Quantitative Reasoning, Calculus, Algebra, and Geometry
- All Natural & Physical Sciences: Physics, Chemistry, Biology, Astronomy, Earth Sciences, Neuroscience, Medicine
- Computer Science, Software Engineering, Algorithms, Web Development, Systems, Architecture, and AI
- Humanities & Social Sciences: World History, Philosophy, Psychology, Sociology, Anthropology, Political Science
- Economics, Business Strategy, Finance, Accounting, Public Policy, and Markets
- Literature, World Languages, Linguistics, Creative Writing, Art History, and Music
- Everyday Practical Knowledge: Study methods, Critical thinking, Productivity, Mental models, Communication
- Any curious question, thought experiment, or problem the user presents!

CRITICAL FORMATTING & KATEX GUIDELINES:
1. Mathematical, Physical, Chemical Formulas & Equations:
   - When writing mathematical expressions or variables, you MUST use standard, 100% syntactically valid KaTeX/LaTeX formatting.
   - Use single dollar signs ($...$) for inline equations (e.g. $f(x) = x^2$, $E = mc^2$, $\\frac{dy}{dx}$, $O(n \\log n)$, $\\theta$).
   - Use double dollar signs ($$...$$) on their own lines for standalone/display equations.
   - ALWAYS close all math delimiters and curly braces. Never leave an equation half-written or open.
   - Avoid non-standard LaTeX packages or obscure macros that could cause KaTeX parse errors. Use clean, standard TeX syntax (\\frac, \\sqrt, \\int, \\sum, \\lim, \\vec, \\pmatrix, etc.).
   - When mentioning monetary currency (e.g., $100 or $50), write it as "\\$100" or "100 USD" so it is not mistaken for a LaTeX equation.

2. Code & Programming:
   - Always wrap code snippets in markdown code blocks with the language identifier (e.g., \`\`\`python, \`\`\`typescript, \`\`\`cpp).

3. Structure & Readability:
   - Use markdown headers (###, ####), bullet points (- ), numbered steps (1., 2.), bold terms (**term**), and blockquotes (> note) to make complex concepts easy to scan and digest.
   - Structure explanations logically: Intuition/First Principles -> Deep Breakdown/Derivation -> Practical Example or Key Takeaway.
   - Maintain an encouraging, intellectually inspiring, clear, and focused pedagogical tone.`;

// API Route 1: Streaming chat route using Google GenAI SDK (multi-purpose mentor)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { prompt, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers for streaming with zero buffering
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

  // Construct conversation contents for Gemini
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      const text = (msg.text || msg.content || '').trim();
      if (!text) continue;
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text }]
      });
    }
  }

  // Add current query
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  let streamedSuccess = false;

  for (const model of modelsToTry) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: MENTOR_SYSTEM_PROMPT,
          temperature: 0.7
        }
      });

      for await (const chunk of stream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
          streamedSuccess = true;
        }
      }

      if (streamedSuccess) {
        break;
      }
    } catch (err: any) {
      console.warn(`[AI Mentor] Model ${model} stream error:`, err?.message || err);
    }
  }

  // Fallback to non-streaming generation if stream produced no tokens
  if (!streamedSuccess) {
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: MENTOR_SYSTEM_PROMPT,
            temperature: 0.7
          }
        });

        if (response.text) {
          res.write(`data: ${JSON.stringify({ text: response.text })}\n\n`);
          streamedSuccess = true;
          break;
        }
      } catch (err: any) {
        console.warn(`[AI Mentor] Model ${model} fallback error:`, err?.message || err);
      }
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

// API Route 2: Strict JSON array for Active Recall quizzes with full KaTeX support
app.post('/api/quiz', async (req: Request, res: Response) => {
  const { topic = 'General Knowledge and Science', count = 4 } = req.body;

  const prompt = `Generate exactly ${count} active recall multiple-choice quiz questions on the topic: "${topic}".
Output MUST be a strict JSON object with a "questions" key containing an array of objects.

MANDATORY REQUIREMENTS FOR EQUATIONS, FORMULAS & MATH (KATEX FORMAT):
If "${topic}" or any question/answer involves mathematics, calculus, algebra, geometry, physics, chemistry, engineering, probability, logic, or formulas:
1. You MUST format all mathematical expressions, variables, formulas, and equations in valid KaTeX syntax using $...$ for inline expressions (e.g. "$x^2 - 4x + 3 = 0$", "$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$", "$e^{i\\pi} + 1 = 0$", "$\\int_0^1 x^2 \\, dx$").
2. In the "question": Format any equation or variable in KaTeX (e.g. "What is the derivative of $f(x) = \\sin(2x)$ with respect to $x$?").
3. In the "options" array: Format every mathematical option with KaTeX (e.g. ["$2\\cos(2x)$", "$\\cos(2x)$", "$-2\\cos(2x)$", "$\\frac{1}{2}\\cos(2x)$"]).
4. In the "explanation": Provide clear step-by-step reasoning formatting intermediate formulas in KaTeX.
5. In the "correctAnswer": MUST exactly match the string of the correct option in "options".
6. Ensure all LaTeX backslashes are validly escaped for JSON (e.g. "\\\\frac{a}{b}").

Each object in the array MUST strictly follow this exact schema:
{
  "question": "Question text here (format any formulas in KaTeX like $...$ if relevant)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Exact text of the correct option",
  "explanation": "Clear explanation of why this answer is correct"
}`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let questionsArray: any[] = [];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: 'You are an Active Recall Quiz Engine. You MUST output strict valid JSON. If math or science formulas are required, format them in KaTeX notation ($...$).',
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const content = response.text || '{}';
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
      if (Array.isArray(list) && list.length > 0) {
        questionsArray = list;
        break;
      }
    } catch (error: any) {
      console.warn(`[Quiz Engine] Model ${model} error:`, error?.message || error);
    }
  }

  if (questionsArray.length === 0) {
    const lowerTopic = String(topic).toLowerCase();
    const isMath = lowerTopic.includes('math') || lowerTopic.includes('calc') || lowerTopic.includes('algebra') || lowerTopic.includes('quadrat') || lowerTopic.includes('deriv') || lowerTopic.includes('integr') || lowerTopic.includes('physic') || lowerTopic.includes('equat') || lowerTopic.includes('matrix');

    if (isMath) {
      // Dynamic authentic KaTeX math fallback
      questionsArray = [
        {
          question: `What is the derivative of $f(x) = 3x^2 + 5x - 7$ with respect to $x$?`,
          options: [`$6x + 5$`, `$6x - 7$`, `$3x + 5$`, `$6x^2 + 5$`],
          correctAnswer: `$6x + 5$`,
          explanation: `Using the power rule $\\frac{d}{dx}[x^n] = n x^{n-1}$, we get $\\frac{d}{dx}[3x^2] = 6x$, $\\frac{d}{dx}[5x] = 5$, and constant $-7$ differentiates to $0$, yielding $6x + 5$.`
        },
        {
          question: `What are the roots of the quadratic equation $x^2 - 5x + 6 = 0$?`,
          options: [`$x = 2$ and $x = 3$`, `$x = -2$ and $x = -3$`, `$x = 1$ and $x = 6$`, `$x = -1$ and $x = 6$`],
          correctAnswer: `$x = 2$ and $x = 3$`,
          explanation: `Factoring the quadratic yields $(x - 2)(x - 3) = 0$, so the roots are $x = 2$ and $x = 3$.`
        },
        {
          question: `What is the value of the definite integral $\\int_{0}^{2} 3x^2 \\, dx$?`,
          options: [`$8$`, `$6$`, `$12$`, `$4$`],
          correctAnswer: `$8$`,
          explanation: `The antiderivative of $3x^2$ is $x^3$. Evaluating from $0$ to $2$: $2^3 - 0^3 = 8$.`
        }
      ];
    } else {
      // Universal conceptual fallback quiz questions
      questionsArray = [
        {
          question: `What is the core foundational principle behind ${topic}?`,
          options: [
            'Systematic inquiry and verified observation',
            'Arbitrary random chance',
            'Uncontrolled trial without feedback',
            'Static unchanging axioms'
          ],
          correctAnswer: 'Systematic inquiry and verified observation',
          explanation: 'Deep learning across any discipline relies on structured observation, hypothesis testing, and conceptual synthesis.'
        },
        {
          question: `How is knowledge in ${topic} best applied?`,
          options: [
            'Through active recall and practical problem-solving',
            'Through passive memorization without context',
            'By ignoring foundational fundamentals',
            'Exclusively in isolated theory'
          ],
          correctAnswer: 'Through active recall and practical problem-solving',
          explanation: 'Active application solidifies neural connections and fosters intuitive mastery.'
        }
      ];
    }
  }

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
});

// Theme Presets & State matching current design system
const THEME_PRESETS = {
  dark: {
    mode: 'dark',
    name: 'Space Black & Electric Azure',
    themeColor: '#090D16',
    backgroundColor: '#090D16',
    surfaceColor: 'rgba(18, 25, 41, 0.72)',
    surfaceElevated: 'rgba(30, 42, 68, 0.85)',
    accentColor: '#0EA5E9',
    accentGlow: '#38BDF8',
    textColor: '#F8FAFC',
    mutedColor: '#94A3B8',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  light: {
    mode: 'light',
    name: 'Alabaster Crisp Light',
    themeColor: '#F8FAFC',
    backgroundColor: '#F8FAFC',
    surfaceColor: 'rgba(255, 255, 255, 0.85)',
    surfaceElevated: '#F1F5F9',
    accentColor: '#0284C7',
    accentGlow: '#38BDF8',
    textColor: '#0F172A',
    mutedColor: '#64748B',
    borderColor: 'rgba(15, 23, 42, 0.08)'
  }
};

let currentServerThemeMode: 'dark' | 'light' | 'system' = 'dark';

// API Route 3: Theme Configuration & Active Palette
app.get('/api/theme', (req: Request, res: Response) => {
  const reqMode = (req.query.mode as string) || currentServerThemeMode;
  const effectiveMode = reqMode === 'light' ? 'light' : 'dark';
  const theme = THEME_PRESETS[effectiveMode];

  res.json({
    status: 'ok',
    app: 'StudyHub',
    currentMode: currentServerThemeMode,
    effectiveMode,
    theme,
    presets: THEME_PRESETS,
    assets: {
      favicon: effectiveMode === 'light' ? '/favicon-light.svg' : '/favicon.svg',
      pwaIcon: '/pwa-icon.svg',
      manifest: '/manifest.json'
    }
  });
});

// API Route 4: Sync Theme Preference from client
app.post('/api/theme', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    currentServerThemeMode = mode;
  }
  const effectiveMode = currentServerThemeMode === 'light' ? 'light' : 'dark';
  res.json({
    status: 'ok',
    currentMode: currentServerThemeMode,
    theme: THEME_PRESETS[effectiveMode]
  });
});

// API Route 5: Health & Theme Status
app.get('/api/health', (_req: Request, res: Response) => {
  const isLight = currentServerThemeMode === 'light';
  res.json({
    status: 'ok',
    app: 'StudyHub Focus Sanctuary',
    theme: currentServerThemeMode,
    themeColor: isLight ? '#F8FAFC' : '#090D16',
    accentColor: isLight ? '#0284C7' : '#0EA5E9',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// In-memory ultra-fast cache for routine habits
const trackerHabitsCache = new Map<string, any[]>();

// API Route 6: Fast Routine Tracker Canonical Presets & Goals
app.get('/api/tracker/habits', (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'guest');
  const cached = trackerHabitsCache.get(userId);

  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json({
    status: 'ok',
    cachedHabits: cached || null,
    canonicalTemplates: [
      { id: 'template_study', name: 'Study', defaultGoal: 60, unit: 'mins', order: 0 },
      { id: 'template_reading', name: 'Reading', defaultGoal: 30, unit: 'mins', order: 1 },
      { id: 'template_workout', name: 'Workout', defaultGoal: 45, unit: 'mins', order: 2 }
    ],
    units: ['mins', 'pages', 'reps', 'km', 'chapters', 'sets'],
    goalPresets: [15, 30, 45, 60, 90, 120]
  });
});

// API Route 7: Ultra-Fast Tracker Batch Sync & Consistency Analytics
app.post('/api/tracker/sync', (req: Request, res: Response) => {
  const { habits = [], userId = 'guest' } = req.body;

  if (!Array.isArray(habits)) {
    return res.status(400).json({ error: 'Habits must be an array' });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  let totalGoalsToday = 0;
  let completedGoalsToday = 0;
  let totalMinutesLoggedToday = 0;

  const sanitized = habits.map((h: any, idx: number) => {
    const habitName = String(h.habitName || 'Routine').trim().slice(0, 60);
    const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];
    const targetValue = typeof h.targetValue === 'number' && h.targetValue > 0 ? h.targetValue : 30;
    const targetUnit = typeof h.targetUnit === 'string' && h.targetUnit.trim() ? h.targetUnit.trim().slice(0, 20) : 'mins';
    const dailyProgress = h.dailyProgress && typeof h.dailyProgress === 'object' ? h.dailyProgress : {};

    const todayVal = typeof dailyProgress[todayStr] === 'number'
      ? dailyProgress[todayStr]
      : (completedDates.includes(todayStr) ? targetValue : 0);

    totalGoalsToday += 1;
    if (todayVal >= targetValue || completedDates.includes(todayStr)) {
      completedGoalsToday += 1;
    }
    if (targetUnit === 'mins') {
      totalMinutesLoggedToday += todayVal;
    }

    return {
      id: h.id || `habit_${Date.now()}_${idx}`,
      habitName,
      completedDates,
      targetValue,
      targetUnit,
      dailyProgress,
      order: typeof h.order === 'number' ? h.order : idx,
      createdAt: h.createdAt || new Date().toISOString()
    };
  });

  if (userId) {
    trackerHabitsCache.set(userId, sanitized);
  }

  const completionRate = totalGoalsToday > 0 ? Math.round((completedGoalsToday / totalGoalsToday) * 100) : 0;

  res.json({
    status: 'ok',
    syncedCount: sanitized.length,
    todayStr,
    analytics: {
      totalHabits: totalGoalsToday,
      completedGoalsToday,
      totalMinutesLoggedToday,
      completionRate
    },
    habits: sanitized
  });
});

// Theme-Aware Dynamic Web App Manifest
app.get('/manifest.json', (req: Request, res: Response) => {
  const themeQuery = req.query.theme as string;
  const isLight = themeQuery === 'light' || (themeQuery === undefined && currentServerThemeMode === 'light');
  const themeColor = isLight ? '#F8FAFC' : '#090D16';
  const bgColor = isLight ? '#F8FAFC' : '#090D16';

  res.setHeader('Content-Type', 'application/manifest+json');
  res.json({
    id: '/',
    name: 'StudyHub - Aesthetic Focus Sanctuary',
    short_name: 'StudyHub',
    description: 'A modern, deliberate focus sanctuary with real-time room presence, synchronized audio environments, AI mentor, and active recall tests.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: bgColor,
    theme_color: themeColor,
    icons: [
      {
        src: isLight ? '/favicon-light.svg' : '/favicon.svg',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/pwa-icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ],
    categories: ['productivity', 'education']
  });
});

// Vite Middleware for Development and Static Serving for Production
async function startServer() {
  const port = 3000;

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'))) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StudyHub full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer();
