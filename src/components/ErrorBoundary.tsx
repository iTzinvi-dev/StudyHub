import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Replaces the Next.js app/error.tsx boundary. Same copy, same classes —
 * `reset` remounts the subtree exactly as Next's retry did.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("StudyHub render error", error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
        <p className="eyebrow">Something stopped working</p>
        <h1 className="mt-4 mb-5">Let’s try that again.</h1>
        <p className="mb-8 text-sm leading-7 text-cream/75">
          The desk couldn’t load properly. Retrying or returning home may clear
          this visit’s unsaved study time.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="primary-button" type="button" onClick={this.reset}>Try again</button>
          <a className="quiet-button inline-flex items-center" href="/">Return home</a>
        </div>
      </main>
    )
  }
}
