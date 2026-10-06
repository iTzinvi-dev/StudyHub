import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { askMentor } from '../utils/gemini';
import { KatexText } from '../components/KatexText';
import { Sparkles, Send, Loader2, BookOpen } from 'lucide-react';

export const MentorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Welcome to the Academic & Engineering Mentor Sanctuary.

I am configured with strict **KaTeX** mathematical rendering. All formulas, proofs, fractions, and algorithmic complexities will be typeset with mathematical rigor.

Example formula format:
$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$

What doubt or theorem can we untangle today?`,
      timestamp: 'Just now'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Derive the Quadratic formula with step-by-step fractions',
    'Explain the Fundamental Theorem of Calculus',
    'Analyze Merge Sort asymptotic complexity with Master Theorem',
    'Derive Bayes Theorem with conditional probabilities'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: 'Now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    const assistantId = `a-${Date.now()}`;
    let accumulated = '';

    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        sender: 'assistant',
        content: '',
        timestamp: 'Now'
      }
    ]);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.content
      }));

      const answer = await askMentor(query, history, (token) => {
        accumulated += token;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      });

      if (!accumulated && answer) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: answer } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Unable to reach neural solver. Please check your connectivity.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#1A1A00]/95 text-[#FFFFCC] p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto pb-4 border-b border-[#FFFFCC]/10">
        <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFCC] font-normal italic">
          AI Mentor
        </h1>
      </header>

      {/* Messages Stream */}
      <section className="flex-1 max-w-4xl w-full mx-auto overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 sm:p-5 rounded-2xl border transition-all ${
                m.sender === 'user'
                  ? 'bg-[#2A2A05] border-[#FFD700]/40 text-[#FFFFCC]'
                  : 'bg-[#1E1E02] border-[#FFFFCC]/15 text-[#E6E6B8] shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-[#FFFFCC]/10 text-[10px] uppercase tracking-wider">
                <span className="font-semibold text-[#FFD700]">
                  {m.sender === 'user' ? 'You' : 'AI Academic Mentor'}
                </span>
                <span className="text-[#E6E6B8]/50">{m.timestamp}</span>
              </div>

              {m.sender === 'user' ? (
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
              ) : (
                <KatexText content={m.content} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-[#2A2A05]/60 border border-[#FFD700]/20 max-w-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
            <span className="text-xs text-[#FFFFCC] font-serif italic">
              Deriving formulas & typeset fractions...
            </span>
          </div>
        )}
      </section>

      {/* Suggested Quick Prompts */}
      <div className="max-w-4xl w-full mx-auto pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#2A2A05]/80 hover:bg-[#333308] border border-[#FFD700]/25 text-[#FFFFCC]/85 hover:text-[#FFD700] text-[11px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="max-w-4xl w-full mx-auto flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask any math theorem, physics derivation, or algorithm proof..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-xl bg-[#2A2A05] border border-[#FFD700]/30 text-sm text-[#FFFFCC] placeholder-[#E6E6B8]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-sm transition-all shadow-md disabled:opacity-40 flex items-center gap-2"
        >
          <span>Send</span>
          <Send className="w-4 h-4 text-[#1A1A00]" />
        </button>
      </form>
    </main>
  );
};
