import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { topic = 'General Science', count = 3 } = await req.json();

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
          content: 'You are an Active Recall Quiz Engine. You MUST output strict valid JSON. Format: [{ question, options: [], correctAnswer, explanation }]'
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

    const questionsArray = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);

    return Response.json(questionsArray);
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to generate quiz' }, { status: 500 });
  }
}
