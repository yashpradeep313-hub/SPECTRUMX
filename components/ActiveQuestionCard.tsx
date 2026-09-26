/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PythonQuestion, ConfidenceLevel, QuestionDistractor } from '../types';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Zap, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveQuestionCardProps {
  question: PythonQuestion;
  onAnswerSubmitted: (
    selectedIndex: number,
    chosenOption: QuestionDistractor,
    isCorrect: boolean,
    confidence: ConfidenceLevel
  ) => void;
  onOpenMicroLesson?: (conceptId: string) => void;
  isAnswerSubmitted: boolean;
  selectedOptionIndex: number | null;
  lastConfidence: ConfidenceLevel;
}

export const ActiveQuestionCard: React.FC<ActiveQuestionCardProps> = ({
  question,
  onAnswerSubmitted,
  onOpenMicroLesson,
  isAnswerSubmitted,
  selectedOptionIndex,
  lastConfidence
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(selectedOptionIndex);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(lastConfidence || 'high');

  // Update local state if props change
  React.useEffect(() => {
    setSelectedIdx(selectedOptionIndex);
  }, [selectedOptionIndex]);

  const isCorrect = selectedIdx === question.correctIndex;
  const currentChosenOption = selectedIdx !== null ? question.options[selectedIdx] : null;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    const option = question.options[selectedIdx];
    const correct = selectedIdx === question.correctIndex;

    if (correct) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }

    onAnswerSubmitted(selectedIdx, option, correct, confidence);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
            Active Assessment: <strong className="text-slate-900">{question.conceptName}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono text-[10px] uppercase font-semibold">
            Difficulty: Level {question.difficulty} of 5
          </span>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          {question.whyThisQuestionAppeared}
        </span>
      </div>

      {/* Question Title & Text */}
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif leading-snug">
          {question.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {question.questionText}
        </p>
      </div>

      {/* Code Snippet */}
      {question.codeSnippet && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-amber-200 overflow-x-auto shadow-inner leading-relaxed">
          <pre>{question.codeSnippet}</pre>
        </div>
      )}

      {/* Multiple-Choice Options */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Your Answer:
        </span>

        {question.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isOptionCorrect = idx === question.correctIndex;

          let optionStyle = 'bg-stone-50/70 hover:bg-stone-100/90 border-stone-200/80 text-slate-800';

          if (isAnswerSubmitted) {
            if (isOptionCorrect) {
              optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
            } else if (isSelected && !isOptionCorrect) {
              optionStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
            } else {
              optionStyle = 'bg-stone-50/40 border-stone-200/50 text-slate-400 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 font-semibold';
          }

          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${optionStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-stone-200/70 text-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-mono text-xs sm:text-[13px]">{opt.text}</span>
              </div>

              {isAnswerSubmitted && isOptionCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {isAnswerSubmitted && isSelected && !isOptionCorrect && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Confidence vs Competence Calibrator */}
      {!isAnswerSubmitted && selectedIdx !== null && (
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 font-serif">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              How confident are you in this answer?
            </span>
            <span className="text-[11px] text-slate-500">
              Detects blind spots & lucky guesses
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as ConfidenceLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setConfidence(lvl)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  confidence === lvl
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {lvl} Confidence
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer Submitted Pedagogical Breakdown */}
      {isAnswerSubmitted && currentChosenOption && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-300 ${
            isCorrect
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5 font-serif text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct Analysis!
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" /> Diagnosed Misconception
                </>
              )}
            </span>
            {currentChosenOption.misconceptionLabel && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 border border-rose-300 font-bold uppercase">
                Tag: {currentChosenOption.misconceptionLabel}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-slate-700">
            {isCorrect ? question.correctExplanation : currentChosenOption.pedagogicalNote}
          </p>

          {!isCorrect && currentChosenOption.rootCausePrereqId && onOpenMicroLesson && (
            <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
              <span className="text-[11px] text-rose-800 font-medium">
                Root-cause prerequisite flagged on DAG!
              </span>
              <button
                onClick={() => onOpenMicroLesson(currentChosenOption.rootCausePrereqId!)}
                className="text-xs font-bold text-rose-800 hover:text-rose-950 underline flex items-center gap-1"
              >
                <span>Launch Micro-Lesson</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit / Advance Button */}
      {!isAnswerSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
            selectedIdx !== null
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              : 'bg-stone-100 text-slate-400 cursor-not-allowed border border-stone-200'
          }`}
        >
          <span>Submit Answer & Update Bayesian Profile</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
