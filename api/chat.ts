import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

const MENTOR_SYSTEM_PROMPT = `You are the StudyHub AI Academic & Engineering Mentor.
Your role: Provide concise, crystal-clear, human-crafted explanations for doubts in Mathematics, Algorithms, Computer Science, and Physics.
STRICT KaTeX formatting rules:
- Format all math/science equations using standard Markdown and KaTeX.
- NEVER output raw messy inline math like "1/2*2" or "a/b". Always wrap in LaTeX math blocks: $\\frac{1}{2}$ or $\\frac{a}{b}$.
- Display all significant formulas and equations on their own line using double dollars: $$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$.
- Use inline math single dollars $ ... $ for variables like $O(n \\log n)$, $x$, $\\theta$.
- Keep the tone calm, encouraging, and focused. Avoid conversational fluff or AI clichés.`;

export async function POST(req: Request) {
  try {
    const { prompt, history = [] } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.text || msg.content || ''
    }));

    const responseStream = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: MENTOR_SYSTEM_PROMPT },
        ...formattedHistory,
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.3
    });

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
