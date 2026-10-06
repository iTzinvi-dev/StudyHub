import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { generateQuizQuestions } from '../utils/gemini';
import { Brain, Sparkles, CheckCircle2, XCircle, RotateCcw, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuizzesView: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState('Operating Systems & Concurrency');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'os-1',
      question: 'Which condition is NOT one of the four necessary Coffman conditions required for Deadlock to occur?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctIndex: 2,
      explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot occur.'
    },
    {
      id: 'os-2',
      question: 'What is the primary difference between a process and a thread in Unix-based systems?',
      options: [
        'Threads share the virtual address space and heap of their parent process',
        'Processes execute faster than threads',
        'Threads do not possess their own program counter or stack',
        'Processes cannot communicate across networks'
      ],
      correctIndex: 0,
      explanation: 'Threads in the same process share text, data, and open file descriptors, while maintaining distinct registers, stack, and thread ID.'
    },
    {
      id: 'os-3',
      question: 'Why do operating systems use a Translation Lookaside Buffer (TLB)?',
      options: [
        'To cache recent virtual-to-physical address mappings and avoid multiple DRAM accesses per instruction',
        'To compress disk swap partitions',
        'To schedule priority interrupts',
        'To balance load between GPU and CPU'
      ],
      correctIndex: 0,
      explanation: 'Without a TLB, every memory read requires multiple memory accesses to traverse multi-level page tables before reading data.'
    },
    {
      id: 'os-4',
      question: 'In Peterson’s Algorithm for two-process mutual exclusion, what prevents starvation?',
      options: [
        'A randomized exponential backoff mechanism',
        'The "turn" variable explicitly favors the other process if both are interested',
        'Hardware-level atomic compare-and-swap instructions',
        'Interrupt masking by the kernel'
      ],
      correctIndex: 1,
      explanation: 'Setting turn = other yields priority to the peer if both have their flag raised, ensuring bounded waiting.'
    }
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const curatedTopics = [
    'Operating Systems',
    'Calculus & Derivatives',
    'Graph Algorithms & Trees',
    'Distributed Consensus & Paxos',
    'System Design & Microservices'
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const topic = (topicToUse || topicInput).trim();
    if (!topic || isLoading) return;

    setIsLoading(true);
    try {
      const result = await generateQuizQuestions(topic);
      if (result && result.length > 0) {
        setQuestions(result);
        setActiveTopic(topic);
        setCurrentIdx(0);
        setSelectedAnswers({});
        setIsCompleted(false);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return;
    const updated = { ...selectedAnswers, [currentIdx]: optionIdx };
    setSelectedAnswers(updated);

    // If answer is correct and this is the last question
    if (currentIdx === questions.length - 1) {
      setTimeout(() => {
        setIsCompleted(true);
        // Celebration confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFFFCC', '#34D399']
        });
      }, 900);
    }
  };

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => questions[parseInt(qIdx, 10)]?.correctIndex === ansIdx
  ).length;

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-[#1A1A00]/95 text-[#FFFFCC]">
      <header className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-[#FFFFCC] font-normal italic">
          Test
        </h1>
        <p className="text-sm text-[#E6E6B8]/75 mt-1">
          Active recall retrieval tests to solidify concept mastery.
        </p>

        {/* Topic Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Type any subject (e.g. Graph Theory, Dynamic Programming, Quantum Physics)..."
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl bg-[#2A2A05] border border-[#FFD700]/30 text-sm text-[#FFFFCC] placeholder-[#E6E6B8]/40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-sm transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#1A1A00]" /> : <Sparkles className="w-4 h-4 text-[#1A1A00]" />}
            <span>Generate Recall Set</span>
          </button>
        </form>

        {/* Quick topic tags */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto py-1 no-scrollbar text-xs">
          <span className="text-[#E6E6B8]/50 text-[11px] shrink-0">Suggestions:</span>
          {curatedTopics.map((ct) => (
            <button
              key={ct}
              onClick={() => {
                setTopicInput(ct);
                handleGenerate(ct);
              }}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-1 rounded-md bg-[#2A2A05]/80 hover:bg-[#333308] border border-[#FFD700]/20 text-[#FFFFCC]/80 hover:text-[#FFD700] text-[11px] transition-colors"
            >
              {ct}
            </button>
          ))}
        </div>
      </header>

      {/* Quiz Card */}
      <section className="max-w-3xl mx-auto mt-8">
        {!isCompleted ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#2A2A05]/70 border border-[#FFD700]/30 shadow-2xl">
            {/* Topic label & question counter */}
            <div className="flex items-center justify-between pb-3 border-b border-[#FFFFCC]/10 text-xs text-[#E6E6B8]/70">
              <span className="font-serif italic text-base text-[#FFD700]">{activeTopic}</span>
              <span className="font-mono">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-serif text-[#FFFFCC] mt-5 leading-snug">
              {currentQ.question}
            </h2>

            {/* MCQ Options */}
            <div className="mt-6 space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const hasAnswered = selectedAnswers[currentIdx] !== undefined;
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let stateClasses = 'bg-[#1A1A00]/80 border-[#FFFFCC]/15 hover:border-[#FFD700]/50 hover:bg-[#222203]';
                if (hasAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                  } else if (isSelected && !isCorrect) {
                    stateClasses = 'bg-rose-950/60 border-rose-500 text-rose-100';
                  } else {
                    stateClasses = 'bg-[#1A1A00]/40 border-[#FFFFCC]/10 opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={hasAnswered}
                    className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start justify-between gap-3 ${stateClasses}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#2A2A05] border border-[#FFD700]/30 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5 text-[#FFD700]">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
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

            {/* Explanation box on reveal */}
            {selectedAnswers[currentIdx] !== undefined && (
              <div className="mt-6 p-4 rounded-xl bg-[#1A1A00]/90 border border-[#FFD700]/30 animate-in fade-in">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD700] mb-1">
                  Active Recall Insight
                </div>
                <p className="text-xs sm:text-sm text-[#E6E6B8] leading-relaxed">
                  {currentQ.explanation}
                </p>

                {currentIdx < questions.length - 1 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setCurrentIdx((prev) => prev + 1)}
                      className="px-4 py-2 rounded-lg bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4 text-[#1A1A00]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Completion Summary */
          <div className="p-8 rounded-2xl bg-[#2A2A05]/80 border border-[#FFD700]/30 shadow-2xl text-center">
            <Sparkles className="w-10 h-10 text-[#FFD700] mx-auto mb-2" />
            <h2 className="text-3xl font-serif text-[#FFFFCC]">Recall Session Concluded</h2>
            <p className="text-sm text-[#E6E6B8]/75 mt-1">
              Topic: <strong className="text-[#FFD700]">{activeTopic}</strong>
            </p>

            <div className="my-6 py-6 px-8 rounded-xl bg-[#1A1A00] border border-[#FFD700]/25 max-w-sm mx-auto">
              <div className="font-serif text-5xl text-[#FFD700]">
                {correctCount} / {questions.length}
              </div>
              <div className="text-xs text-[#E6E6B8]/70 uppercase tracking-widest mt-1">
                Accuracy Score ({Math.round((correctCount / questions.length) * 100)}%)
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setIsCompleted(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-[#FFFFCC]/30 hover:bg-[#2A2A05] text-xs font-semibold text-[#FFFFCC] flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Questions</span>
              </button>

              <button
                onClick={() => handleGenerate()}
                className="px-6 py-2.5 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#1A1A00]" />
                <span>New Question Set</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
