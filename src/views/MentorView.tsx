import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../types';
import { askMentor } from '../utils/gemini';
import { KatexText } from '../components/KatexText';
import { Send, Loader2, Compass } from 'lucide-react';

export const MentorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Welcome to your AI Mentor. I'm here to understand, explore, and teach any topic you want to learn — from science, technology, and mathematics to history, philosophy, literature, economics, and beyond.

What would you like to explore or understand today?`,
      timestamp: 'Just now'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Explain quantum superposition & wave mechanics',
    'What caused the fall of the Western Roman Empire?',
    'Derive the Quadratic formula step-by-step',
    'How does photosynthesis & ATP synthesis work?',
    'Break down Plato’s Allegory of the Cave',
    'How do neural networks learn with backpropagation?',
    'How does monetary policy affect global inflation?',
    'Compare Shakespearean tragedy to Greek tragedy'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const history = messages
        .filter((m) => m.content && m.content.trim())
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
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
            ? { ...m, content: 'Unable to reach learning mentor. Please check your connectivity.' }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent text-white p-4 sm:p-8 relative z-10 custom-scrollbar">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl w-full mx-auto pb-4 border-b border-white/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            AI Mentor
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#0EA5E9] border border-white/10 flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#0EA5E9]" />
            Universal Tutor
          </span>
        </div>
      </motion.header>

      {/* Messages Stream */}
      <section className="flex-1 max-w-4xl w-full mx-auto overflow-y-auto py-6 space-y-4 pr-1 custom-scrollbar">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 sm:p-5 rounded-3xl border transition-all backdrop-blur-2xl ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] border-white/20 text-white shadow-lg'
                  : 'liquid-glass-card border-white/10 text-white shadow-2xl'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/10 text-[10px] uppercase tracking-wider font-mono">
                <span className={`font-semibold ${m.sender === 'user' ? 'text-white/90' : 'text-[#0EA5E9]'}`}>
                  {m.sender === 'user' ? 'You' : 'AI Mentor'}
                </span>
                <span className="text-slate-400">{m.timestamp}</span>
              </div>

              {m.sender === 'user' ? (
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap font-qurova">{m.content}</p>
              ) : (
                <KatexText content={m.content} />
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-4 rounded-2xl liquid-glass border border-white/15 max-w-sm backdrop-blur-xl"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#0EA5E9]" />
            <span className="text-xs text-slate-300 font-qurova italic">
              Thinking...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {/* Suggested Quick Prompts */}
      <div className="max-w-4xl w-full mx-auto pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs font-qurova">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="shrink-0 px-3.5 py-1.5 rounded-xl liquid-glass hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-[11px] transition-all cursor-pointer shadow-sm"
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
        className="max-w-4xl w-full mx-auto flex items-center gap-2 pt-1 font-qurova"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask about any topic, concept, science, history, philosophy, or theory..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl liquid-glass border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] backdrop-blur-2xl"
        />

        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:brightness-110 text-white font-semibold text-sm transition-all shadow-lg disabled:opacity-40 flex items-center gap-2 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </main>
  );
};
