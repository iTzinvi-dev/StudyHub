import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '../types';
import { generateQuizQuestions } from '../utils/gemini';
import { KatexText } from '../components/KatexText';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  ArrowRight,
  Sigma
} from 'lucide-react';

export const QuizzesView: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState('Calculus & Derivatives');
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Default math questions with KaTeX
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'What is the derivative of the exponential function $f(x) = e^{3x}$ with respect to $x$?',
      options: [
        '$f\'(x) = e^{3x}$',
        '$f\'(x) = 3e^{3x}$',
        '$f\'(x) = 3x e^{3x-1}$',
        '$f\'(x) = \\frac{1}{3} e^{3x}$'
      ],
      correctIndex: 1,
      explanation: 'By the chain rule: $\\frac{d}{dx}[e^{u}] = e^{u} \\cdot \\frac{du}{dx}$. For $u = 3x$, $\\frac{du}{dx} = 3$, so $f\'(x) = 3e^{3x}$.'
    },
    {
      id: 'q2',
      question: 'For a quadratic equation $ax^2 + bx + c = 0$, what does the discriminant $\\Delta = b^2 - 4ac > 0$ imply?',
      options: [
        'Two distinct real roots',
        'One repeated real root',
        'Two complex conjugate roots',
        'No solution exists'
      ],
      correctIndex: 0,
      explanation: 'When $\\Delta = b^2 - 4ac > 0$, the quadratic formula $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ yields two distinct real solutions.'
    },
    {
      id: 'q3',
      question: 'Evaluate the definite integral $\\int_{0}^{2} 3x^2 \\, dx$:',
      options: [
        '$6$',
        '$8$',
        '$12$',
        '$24$'
      ],
      correctIndex: 1,
      explanation: 'The antiderivative of $3x^2$ is $x^3$. Evaluating from $0$ to $2$: $\\left[ x^3 \\right]_{0}^{2} = 2^3 - 0^3 = 8$.'
    }
  ]);

  const curatedTopics = [
    'Calculus & Derivatives',
    'Quadratic & Polynomial Equations',
    'Quantum Physics & Wave Mechanics',
    'Linear Algebra & Matrices',
    'Operating Systems & Concurrency',
    'Discrete Math & Logic',
    'World History & Civilizations',
    'Philosophy & Ethics'
  ];

  const handleGenerate = async (customTopic?: string) => {
    const t = (customTopic || topicInput).trim();
    if (!t || isLoading) return;

    setIsLoading(true);
    setActiveTopic(t);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);

    try {
      const generated = await generateQuizQuestions(t, 4);
      if (generated && generated.length > 0) {
        setQuestions(generated);
      }
    } catch {
      console.warn('Fallback recall questions used');
    } finally {
      setIsLoading(false);
      setTopicInput('');
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex
    }));
  };

  const currentQ = questions[currentIdx] || questions[0];
  const correctCount = Object.entries(selectedAnswers).filter(
    ([idx, ans]) => questions[parseInt(idx)]?.correctIndex === ans
  ).length;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-transparent text-white relative z-10 custom-scrollbar">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Test
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <p className="text-sm text-slate-300 font-qurova">
            Active recall retrieval tests to solidify concept mastery.
          </p>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#0EA5E9] border border-white/10 flex items-center gap-1.5 shadow-sm">
            <Sigma className="w-3 h-3 text-[#0EA5E9]" />
            KaTeX Math & Universal Subjects
          </span>
        </div>

        {/* Topic Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3 font-qurova"
        >
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Type any subject (e.g. Graph Theory, Dynamic Programming, Quantum Physics)..."
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-2xl liquid-glass border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] backdrop-blur-2xl"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:brightness-110 text-white font-semibold text-sm transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
            <span>Generate Recall Set</span>
          </button>
        </form>

        {/* Quick topic tags */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto py-1 no-scrollbar text-xs font-qurova">
          <span className="text-slate-400 text-[11px] shrink-0">Suggestions:</span>
          {curatedTopics.map((ct) => (
            <button
              key={ct}
              onClick={() => {
                setTopicInput(ct);
                handleGenerate(ct);
              }}
              disabled={isLoading}
              className="shrink-0 px-3 py-1 rounded-xl liquid-glass hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-[11px] transition-all cursor-pointer shadow-sm"
            >
              {ct}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Quiz Card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="max-w-3xl mx-auto mt-8"
      >
        {!isCompleted ? (
          <div className="p-6 sm:p-8 rounded-3xl liquid-glass-card shadow-2xl backdrop-blur-2xl">
            {/* Topic label & question counter */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-300 font-qurova">
              <span className="font-semibold text-base text-[#0EA5E9]">{activeTopic}</span>
              <span className="font-mono">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text with KaTeX */}
            <div className="text-xl sm:text-2xl font-semibold text-white mt-5 leading-snug">
              <KatexText content={currentQ.question} inline={true} />
            </div>

            {/* MCQ Options with KaTeX */}
            <div className="mt-6 space-y-3 font-qurova">
              {currentQ.options.map((opt, optIdx) => {
                const hasAnswered = selectedAnswers[currentIdx] !== undefined;
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let stateClasses = 'bg-white/[0.04] border-white/10 hover:border-[#0EA5E9]/50 hover:bg-white/[0.08]';
                if (hasAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-950/80 border-emerald-500 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
                  } else if (isSelected && !isCorrect) {
                    stateClasses = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                  } else {
                    stateClasses = 'bg-white/[0.02] border-white/5 opacity-40';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-start justify-between gap-3 cursor-pointer ${stateClasses}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-white/[0.08] border border-white/15 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5 text-[#0EA5E9]">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="leading-relaxed text-sm text-white break-words">
                        <KatexText content={opt} inline={true} />
                      </div>
                    </div>

                    {hasAnswered && (
                      <div className="shrink-0 mt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box on reveal with KaTeX */}
            {selectedAnswers[currentIdx] !== undefined && (
              <div className="mt-6 p-4 rounded-2xl bg-white/[0.06] border border-white/15 animate-in fade-in">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#0EA5E9] mb-1 font-mono">
                  Active Recall Insight
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-qurova">
                  <KatexText content={currentQ.explanation} />
                </div>

                {currentIdx < questions.length - 1 ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setCurrentIdx((prev) => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:brightness-110"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsCompleted(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:brightness-110"
                    >
                      <span>Finish Quiz</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Completion Summary */
          <div className="p-8 rounded-3xl liquid-glass-card shadow-2xl text-center backdrop-blur-2xl">
            <Sparkles className="w-10 h-10 text-[#0EA5E9] mx-auto mb-2" />
            <h2 className="text-3xl font-semibold text-white">Recall Session Concluded</h2>
            <p className="text-sm text-slate-300 mt-1 font-qurova">
              Topic: <strong className="text-white">{activeTopic}</strong>
            </p>

            <div className="my-6 py-6 px-8 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto shadow-inner">
              <div className="text-5xl font-bold text-[#0EA5E9]">
                {correctCount} / {questions.length}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-mono">
                Accuracy Score ({Math.round((correctCount / questions.length) * 100)}%)
              </div>
            </div>

            <div className="flex justify-center gap-3 font-qurova">
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setIsCompleted(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-white/15 hover:bg-white/[0.08] text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Questions</span>
              </button>

              <button
                onClick={() => handleGenerate()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md hover:brightness-110 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>New Question Set</span>
              </button>
            </div>
          </div>
        )}
      </motion.section>
    </main>
  );
};
