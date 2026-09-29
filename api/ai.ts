import type { IncomingMessage, ServerResponse } from "node:http"

/**
 * The only place an AI key is read. Nothing under src/ may import this file or
 * reference the key — Vite inlines every VITE_ variable into the public bundle,
 * so a key here stays on the server and nowhere else.
 *
 * Provider is chosen by whichever key is present. Groq is preferred because its
 * free tier is the one with published limits (llama-3.3-70b-versatile: 30
 * requests/minute, 1,000/day).
 */

type Mode = "doubt" | "quiz"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.3-70b-versatile"
const GEMINI_MODEL = "gemini-2.0-flash"

const DOUBT_SYSTEM = `You are a patient tutor explaining a concept to a student who is studying alone.

Rules:
- Write in a plain textbook voice. No cheerleading, no "great question", no filler.
- Explain the idea first, then the method, then one worked example.
- Use Markdown. Use KaTeX for mathematics: inline as $...$, display as $$...$$.
- Never invent a citation. If you are unsure, say so in one sentence.
- Keep it under 400 words unless the student asks for more.`

const QUIZ_SYSTEM = `You write practice questions for a student revising a topic.

Reply with JSON only, no prose, no code fence, matching exactly:
{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}

Rules:
- Between 5 and 10 questions.
- Exactly four options each, one correct, answer is the zero-based index.
- Plausible distractors drawn from common mistakes, not obvious nonsense.
- One or two sentence explanation per question, plain textbook tone.
- Use KaTeX inside strings for mathematics: $...$ or $$...$$.`

function json(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader("Content-Type", "application/json")
  response.end(JSON.stringify(body))
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(chunk as Buffer)
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"))
  } catch {
    return null
  }
}

async function askGroq(key: string, system: string, prompt: string): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 1400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Groq ${response.status}: ${detail.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error("Groq returned no content")
  return content
}

async function askGemini(key: string, system: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1400 },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Gemini ${response.status}: ${detail.slice(0, 200)}`)
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error("Gemini returned no content")
  return content
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST")
    return json(response, 405, { error: "Use POST." })
  }

  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (!groqKey && !geminiKey) {
    return json(response, 503, {
      error: "No AI provider is configured on the server.",
    })
  }

  const body = (await readBody(request)) as { mode?: Mode; prompt?: string } | null
  const mode = body?.mode
  const prompt = (body?.prompt ?? "").trim()

  if (mode !== "doubt" && mode !== "quiz") {
    return json(response, 400, { error: "mode must be 'doubt' or 'quiz'." })
  }
  if (!prompt) {
    return json(response, 400, { error: "Ask something first." })
  }
  if (prompt.length > 4000) {
    return json(response, 400, { error: "That question is too long. Trim it to 4000 characters." })
  }

  const system = mode === "doubt" ? DOUBT_SYSTEM : QUIZ_SYSTEM

  try {
    const content = groqKey
      ? await askGroq(groqKey, system, prompt)
      : await askGemini(geminiKey!, system, prompt)

    return json(response, 200, { mode, content })
  } catch (error) {
    // The provider's message is useful for debugging but must not leak the key.
    const message = error instanceof Error ? error.message : "The request failed."
    return json(response, 502, { error: message })
  }
}
