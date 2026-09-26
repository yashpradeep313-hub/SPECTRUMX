/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AdaptiveQuestion, Concept, KnowledgeGap } from '../types';
import { Zap, HelpCircle, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Flame, Sparkles, BookOpen, Lightbulb, Code2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdaptiveQuizViewProps {
  questionPool: AdaptiveQuestion[];
  concepts: Concept[];
  gaps: KnowledgeGap[];
  onCompleteQuiz: (results: {
    questionsAnswered: number;
    correctCount: number;
    finalDifficultyReached: number;
    resolvedGaps: string[];
  }) => void;
  onOpenAiTutor: (conceptName: string) => void;
}

export const AdaptiveQuizView: React.FC<AdaptiveQuizViewProps> = ({
  questionPool,
  concepts,
  gaps,
  onCompleteQuiz,
  onOpenAiTutor
}) => {
  // Adaptive test state
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(3); // start at Level 3: Proficient
  const [questionIndex, setQuestionIndex] = useState(0);
  const [history, setHistory] = useState<Array<{ q: AdaptiveQuestion; correct: boolean; diff: number }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [explanationTab, setExplanationTab] = useState<'eli5' | 'practical' | 'academic'>('eli5');

  // Find a question from pool closest to current difficulty, preferring concepts that had knowledge gaps
  const gapConceptIds = new Set(gaps.map(g => g.conceptId));
  const usedQIds = new Set(history.map(h => h.q.id));

  const availableQuestions = questionPool.filter(q => !usedQIds.has(q.id));

  // Sort available by: first targeting gap concepts, then closest difficulty
  const sortedQuestions = [...availableQuestions].sort((a, b) => {
    const aIsGap = gapConceptIds.has(a.conceptId) ? 1 : 0;
    const bIsGap = gapConceptIds.has(b.conceptId) ? 1 : 0;
    if (aIsGap !== bIsGap) return bIsGap - aIsGap;
    return Math.abs(a.difficultyRating - currentDifficulty) - Math.abs(b.difficultyRating - currentDifficulty);
  });

  const currentQ: AdaptiveQuestion | undefined = sortedQuestions[0] || questionPool[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedAnswer === currentQ.correctIndex;
    const nextDiff = isCorrect
      ? Math.min(5, currentDifficulty + 1)
      : Math.max(1, currentDifficulty - 1);

    if (isCorrect) {
      setStreak(prev => prev + 1);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 }
      });
    } else {
      setStreak(0);
    }

    setHistory(prev => [...prev, { q: currentQ, correct: isCorrect, diff: currentDifficulty }]);
  };

  const handleNextQuestion = () => {
    if (!currentQ) return;

    const isCorrect = selectedAnswer === currentQ.correctIndex;
    const nextDiff = isCorrect
      ? Math.min(5, currentDifficulty + 1)
      : Math.max(1, currentDifficulty - 1);

    setCurrentDifficulty(nextDiff);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);

    // After 4 questions, finalize calibration
    if (history.length >= 3) {
      // Calculate resolved gaps
      const correctConceptIds = new Set(
        history.filter(h => h.correct).map(h => h.q.conceptId)
      );
      if (isCorrect) correctConceptIds.add(currentQ.conceptId);

      const resolved = gaps
        .filter(g => correctConceptIds.has(g.conceptId))
        .map(g => g.conceptId);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onCompleteQuiz({
        questionsAnswered: history.length + 1,
        correctCount: history.filter(h => h.correct).length + (isCorrect ? 1 : 0),
        finalDifficultyReached: nextDiff,
        resolvedGaps: resolved
      });
    } else {
      setQuestionIndex(prev => prev + 1);
    }
  };

  const getDifficultyLabel = (diff: number) => {
    switch (diff) {
      case 1:
        return { label: 'Foundational Remediation', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 2:
        return { label: 'Elementary Application', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
      case 3:
        return { label: 'Proficient Standard', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 4:
        return { label: 'Advanced Synthesis', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 5:
        return { label: 'Olympiad / Principal Level', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: 'Calibrated', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const diffInfo = getDifficultyLabel(currentDifficulty);
  const isCorrect = selectedAnswer === currentQ?.correctIndex;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Dynamic IRT Difficulty Meter Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider">
              Computerized Adaptive Testing (CAT) Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <span className="flex items-center gap-1 text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {streak} Question Streak!
              </span>
            )}
            <span className="font-mono text-slate-400">
              Calibration Question {history.length + 1} of 4
            </span>
          </div>
        </div>

        {/* 5-Step Visual Difficulty Gauge */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>Dynamic Difficulty Level:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${diffInfo.color}`}>
                Tier {currentDifficulty}: {diffInfo.label}
              </span>
            </span>
            <span className="font-mono text-indigo-400 font-semibold text-xs">
              IRT Scale (Theta = {(currentDifficulty - 3) * 0.75 >= 0 ? `+${((currentDifficulty - 3) * 0.75).toFixed(1)}` : ((currentDifficulty - 3) * 0.75).toFixed(1)})
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map(lvl => (
              <div
                key={lvl}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  lvl <= currentDifficulty
                    ? lvl <= 2
                      ? 'bg-emerald-500'
                      : lvl === 3
                      ? 'bg-indigo-500'
                      : lvl === 4
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                    : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Adaptive Question Card */}
      {currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative">
          {/* Question Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Targeting: <strong className="text-white">{currentQ.conceptName}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                {currentQ.bloomsLevel}
              </span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Pedagogical Hint'}</span>
            </button>
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 animate-in fade-in duration-200">
              <strong className="text-amber-400 block mb-0.5">Socratic Hint:</strong>
              {currentQ.hint}
            </div>
          )}

          {/* Question Title */}
          <h3 className="text-base md:text-lg font-semibold text-slate-100 leading-snug">
            {currentQ.question}
          </h3>

          {/* Optional Code Snippet */}
          {currentQ.codeSnippet && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-200 overflow-x-auto shadow-inner">
              <pre>{currentQ.codeSnippet}</pre>
            </div>
          )}

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnClass = 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700/80';

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctIndex) {
                  btnClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                } else {
                  btnClass = 'bg-slate-900/40 opacity-40 border-slate-800 text-slate-400';
                }
              } else if (isSelected) {
                btnClass = 'bg-indigo-950/60 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/50';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 text-xs md:text-sm leading-relaxed ${btnClass}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAnswerSubmitted && idx === currentQ.correctIndex
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswerSubmitted && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 pt-0.5">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Post-Submit Adaptive Feedback & Difficulty Recalibration Notice */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-xl border space-y-3 text-xs md:text-sm animate-in fade-in duration-300 ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Correct! Calibration Tier Climbing
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Incorrect. Adjusting Down to Isolate Gap
                    </>
                  )}
                </div>

                <span className={`flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded font-bold ${
                  isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isCorrect ? (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5" /> Next: Tier {Math.min(5, currentDifficulty + 1)}
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-3.5 h-3.5" /> Next: Tier {Math.max(1, currentDifficulty - 1)}
                    </>
                  )}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                {currentQ.explanation}
              </p>

              {/* Multi-modal Explanation Switcher */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Alternative Framing:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setExplanationTab('eli5')}
                      className={`px-2 py-0.5 rounded text-[11px] ${explanationTab === 'eli5' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      ELI5 Analogy
                    </button>
                    <button
                      onClick={() => setExplanationTab('practical')}
                      className={`px-2 py-0.5 rounded text-[11px] ${explanationTab === 'practical' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      Practical
                    </button>
                    <button
                      onClick={() => setExplanationTab('academic')}
                      className={`px-2 py-0.5 rounded text-[11px] ${explanationTab === 'academic' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      Academic
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 text-xs leading-relaxed border border-slate-800">
                  {explanationTab === 'eli5' && currentQ.analogies.eli5}
                  {explanationTab === 'practical' && currentQ.analogies.practical}
                  {explanationTab === 'academic' && currentQ.analogies.academic}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => onOpenAiTutor(currentQ.conceptName)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Tutor to clarify this</span>
            </button>

            <div>
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20"
                >
                  Submit for Calibration
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <span>{history.length >= 3 ? 'Finalize Adaptive Cycle' : 'Next Adaptive Question'}</span>
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
