/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagnosticQuestion, Concept } from '../types';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Brain, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

interface DiagnosticViewProps {
  questions: DiagnosticQuestion[];
  domainName: string;
  onComplete: (answers: Array<{ question: DiagnosticQuestion; selectedIndex: number; isCorrect: boolean; confidence: string }>) => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  questions,
  domainName,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [confidences, setConfidences] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<Record<number, boolean>>({});

  const currentQ = questions[currentIndex];
  const hasSelected = selectedAnswers[currentIndex] !== undefined;
  const isCurrentSubmitted = isSubmitted[currentIndex] === true;
  const currentSelected = selectedAnswers[currentIndex];
  const isCorrect = currentSelected === currentQ?.correctIndex;

  const handleSelectOption = (index: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: index }));
    if (!confidences[currentIndex]) {
      setConfidences(prev => ({ ...prev, [currentIndex]: 'sure' }));
    }
  };

  const handleVerify = () => {
    setIsSubmitted(prev => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Gather all answers and finalize diagnostic
      const results = questions.map((q, idx) => ({
        question: q,
        selectedIndex: selectedAnswers[idx] ?? -1,
        isCorrect: (selectedAnswers[idx] ?? -1) === q.correctIndex,
        confidence: confidences[idx] ?? 'medium'
      }));
      onComplete(results);
    }
  };

  const totalAnswered = Object.keys(isSubmitted).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Brain className="w-3.5 h-3.5" />
              Stage 1 of 5: Baseline Diagnostic Assessment
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Evaluating Foundation in {domainName}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              This initial assessment checks for foundational blind spots, hidden misconceptions, and prerequisite gaps before generating your tailored learning path.
            </p>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <span className="text-xs text-slate-400">Progress</span>
            <span className="text-sm font-bold font-mono text-indigo-400">
              {currentIndex + 1} of {questions.length} Questions
            </span>
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          {/* Question Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700">
                Concept: <span className="text-indigo-400 font-semibold">{currentQ.conceptName}</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/80 uppercase font-mono text-[10px]">
                Bloom's: {currentQ.bloomsLevel}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-md font-semibold text-[11px] capitalize ${
              currentQ.difficulty === 'foundational'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : currentQ.difficulty === 'intermediate'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {currentQ.difficulty} Difficulty
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base md:text-lg font-semibold text-slate-100 leading-snug">
            {currentQ.question}
          </h3>

          {/* Code Snippet if present */}
          {currentQ.codeSnippet && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-indigo-200 leading-relaxed shadow-inner">
              <pre>{currentQ.codeSnippet}</pre>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isChosen = currentSelected === idx;
              let btnClass = 'bg-slate-800/50 hover:bg-slate-800 text-slate-200 border-slate-700';

              if (isCurrentSubmitted) {
                if (idx === currentQ.correctIndex) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                } else if (isChosen && !isCorrect) {
                  btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                } else {
                  btnClass = 'bg-slate-900/40 opacity-40 border-slate-800 text-slate-400';
                }
              } else if (isChosen) {
                btnClass = 'bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isCurrentSubmitted}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 text-xs md:text-sm leading-relaxed ${btnClass}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCurrentSubmitted && idx === currentQ.correctIndex
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrentSubmitted && isChosen && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : isChosen
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Metacognitive Confidence Selector */}
          {!isCurrentSubmitted && (
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Confidence calibration (assists Bayesian gap detection):
              </span>
              <div className="flex gap-2">
                {[
                  { id: 'sure', label: 'Very Confident' },
                  { id: 'medium', label: 'Somewhat Sure' },
                  { id: 'guess', label: 'Educated Guess' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConfidences(prev => ({ ...prev, [currentIndex]: item.id }))}
                    className={`px-3 py-1 rounded-lg text-xs transition-all ${
                      confidences[currentIndex] === item.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post-submission Feedback & Misconception Reveal */}
          {isCurrentSubmitted && (
            <div className={`rounded-xl p-4 border animate-in fade-in duration-300 text-xs md:text-sm space-y-2 ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Correct Reasoning!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Cognitive Knowledge Gap Detected
                  </>
                )}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {currentQ.explanation}
              </p>
              {!isCorrect && currentQ.misconceptionIfWrong && (
                <div className="pt-2 border-t border-rose-900/50 text-xs text-rose-200">
                  <span className="font-semibold text-rose-400">Underlying Misconception: </span>
                  {currentQ.misconceptionIfWrong}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              {currentIndex + 1} / {questions.length} Diagnostic questions
            </div>

            <div>
              {!isCurrentSubmitted ? (
                <button
                  onClick={handleVerify}
                  disabled={!hasSelected}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete & Analyze Gaps'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
