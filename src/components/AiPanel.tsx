import { useState, type FormEvent } from "react"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"

type Question = {
  question: string
  options: string[]
  answer: number
  explanation: string
}

/** Strips the code fence models wrap around JSON even when told not to. */
function parseQuestions(raw: string): Question[] | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start === -1 || end <= start) return null

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as { questions?: unknown }
    if (!Array.isArray(parsed.questions)) return null
    const questions = parsed.questions.filter(
      (item): item is Question =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Question).question === "string" &&
        Array.isArray((item as Question).options) &&
        typeof (item as Question).answer === "number"
    )
    return questions.length ? questions : null
  } catch {
    return null
  }
}

function Quiz({ questions }: { questions: Question[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const answered = Object.keys(picked).length
  const correct = questions.filter((q, i) => picked[i] === q.answer).length

  return (
    <div>
      <p className="mt-5 mb-4 text-xs text-cream/60">
        {answered} of {questions.length} answered
        {answered === questions.length ? ` · ${correct} correct` : ""}
      </p>
      <ol className="grid gap-6">
        {questions.map((item, index) => {
          const choice = picked[index]
          const settled = choice !== undefined
          return (
            <li key={index}>
              <p className="mb-3 text-sm leading-6 text-cream">
                {index + 1}. {item.question}
              </p>
              <ul className="grid gap-2">
                {item.options.map((option, optionIndex) => {
                  const isPicked = choice === optionIndex
                  const isAnswer = item.answer === optionIndex
                  const tone = !settled
                    ? "border-white/10 hover:border-white/25"
                    : isAnswer
                      ? "border-matcha/60 bg-matcha/10"
                      : isPicked
                        ? "border-clay/60 bg-clay/10"
                        : "border-white/10 opacity-60"
                  return (
                    <li key={optionIndex}>
                      <button
                        type="button"
                        disabled={settled}
                        onClick={() => setPicked((previous) => ({ ...previous, [index]: optionIndex }))}
                        className={`w-full rounded-xl border px-4 py-2.5 text-left text-xs leading-5 text-cream/85 transition-colors ${tone}`}
                      >
                        {option}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {settled && item.explanation && (
                <p className="mt-3 border-l-2 border-matcha/40 pl-3 text-xs leading-6 text-cream/65">
                  {item.explanation}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {answered === questions.length && (
        <button
          type="button"
          className="quiet-button mt-6"
          onClick={() => setPicked({})}
        >
          Try again
        </button>
      )}
    </div>
  )
}

/**
 * Doubt solver and quiz generator. Talks to /api/ai, which holds the provider
 * key; the browser never sees one.
 */
export function AiPanel() {
  const [mode, setMode] = useState<"doubt" | "quiz">("doubt")
  const [prompt, setPrompt] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [answer, setAnswer] = useState("")
  const [questions, setQuestions] = useState<Question[] | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = prompt.trim()
    if (!question || busy) return

    setBusy(true)
    setError("")
    setAnswer("")
    setQuestions(null)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt: question }),
      })
      const data = (await response.json()) as { content?: string; error?: string }

      if (!response.ok) {
        setError(data.error ?? "That did not go through.")
        return
      }

      const content = data.content ?? ""
      if (mode === "quiz") {
        const parsed = parseQuestions(content)
        if (!parsed) {
          setError("The questions came back malformed. Try again.")
          return
        }
        setQuestions(parsed)
      } else {
        setAnswer(content)
      }
    } catch {
      setError("Could not reach the server.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="goal-card p-6" aria-labelledby="ai-heading">
      <div className="card-topline">
        <h2 id="ai-heading" className="eyebrow">Study help</h2>
        <span aria-hidden="true" className="small-star">✳</span>
      </div>

      <div className="mt-4 mb-4 flex gap-2">
        {(["doubt", "quiz"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setMode(option)
              setAnswer("")
              setQuestions(null)
              setError("")
            }}
            className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
              mode === option
                ? "bg-matcha/15 text-matcha"
                : "text-cream/55 hover:text-cream"
            }`}
          >
            {option === "doubt" ? "Explain it" : "Quiz me"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid gap-3" noValidate>
        <label htmlFor="ai-prompt" className="text-xs text-cream/60">
          {mode === "doubt"
            ? "What are you stuck on?"
            : "What should the questions cover?"}
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
          maxLength={4000}
          placeholder={
            mode === "doubt"
              ? "e.g. Why does the chain rule work the way it does?"
              : "e.g. Organic chemistry · alkenes, 8 questions"
          }
          className="w-full resize-y rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-sm leading-6 text-cream outline-none placeholder:text-cream/35 focus:border-matcha/40"
        />
        <button className="primary-button justify-self-start" type="submit" disabled={busy || !prompt.trim()}>
          <span aria-hidden="true">{busy ? "…" : "✳"}</span>
          {busy ? "Thinking" : mode === "doubt" ? "Explain" : "Generate"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-xs leading-6 text-clay" role="alert">
          {error}
        </p>
      )}

      {answer && (
        <div className="mt-6 border-t border-white/10 pt-5 text-sm leading-7 text-cream/85 [&_h1]:mt-5 [&_h1]:text-lg [&_h2]:mt-5 [&_h2]:text-base [&_h3]:mt-4 [&_h3]:text-sm [&_code]:rounded [&_code]:bg-white/5 [&_code]:px-1 [&_li]:ml-4 [&_li]:list-disc [&_ol]:mt-3 [&_p]:mt-3 [&_pre]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-white/5 [&_pre]:p-3 [&_ul]:mt-3">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {answer}
          </ReactMarkdown>
        </div>
      )}

      {questions && <Quiz questions={questions} />}
    </section>
  )
}
