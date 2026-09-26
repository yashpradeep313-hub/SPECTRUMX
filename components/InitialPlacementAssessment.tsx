/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagnosticQuestion, UserProfile } from '../types';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Brain,
  Award,
  Zap,
  HelpCircle,
  AlertCircle,
  Flame,
  Layers,
  GraduationCap,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type DeterminedLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface DiagnosticResult {
  score: number;
  total: number;
  percentage: number;
  level: DeterminedLevel;
  levelDescription: string;
  recommendedFocus: string[];
  suggestedTheta: string;
}

interface InitialPlacementAssessmentProps {
  curriculumName: string;
  syllabusFileName?: string;
  currentUser: UserProfile;
  customQuestions?: DiagnosticQuestion[];
  onCompletePlacement: (result: DiagnosticResult) => void;
  onSkip?: () => void;
}

// Curated 5 diagnostic assessment questions spanning Beginner, Intermediate, and Advanced concepts
const DEFAULT_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'init-q1',
    conceptId: 'variables_primitives',
    conceptName: 'Variables, Bindings & Value Mutation',
    question: 'What is the output of the following Python snippet?',
    codeSnippet: `a = [1, 2, 3]
b = a
b.append(4)
print(len(a))`,
    options: [
      '3 (Because only b was modified)',
      '4 (Both names refer to the same mutable list in memory)',
      'Error: Cannot assign list to another variable',
      'None'
    ],
    correctIndex: 1,
    explanation: 'Variables in Python are object references. "b = a" does not copy the list; both bind to the exact same list instance in heap memory.',
    misconceptionIfWrong: 'Believing assignment creates an independent value copy for mutable objects.',
    difficulty: 'foundational',
    bloomsLevel: 'understand'
  },
  {
    id: 'init-q2',
    conceptId: 'loops_intervals',
    conceptName: 'Loop Bounds & range() Half-Open Intervals',
    question: 'How many iterations does the loop execute and what is the last value printed?',
    codeSnippet: `total = 0
for i in range(1, 5):
    total += i
print(total)`,
    options: [
      '15 (i goes 1, 2, 3, 4, 5)',
      '10 (range is half-open [1, 5), so i takes values 1, 2, 3, 4)',
      '4',
      'SyntaxError'
    ],
    correctIndex: 1,
    explanation: 'Python range(start, stop) follows mathematical half-open intervals: 1 + 2 + 3 + 4 = 10. The stop boundary 5 is strictly exclusive.',
    misconceptionIfWrong: 'Assuming range(start, stop) includes the upper stop value.',
    difficulty: 'foundational',
    bloomsLevel: 'apply'
  },
  {
    id: 'init-q3',
    conceptId: 'functions_returns',
    conceptName: 'Function Return Value vs stdout Contracts',
    question: 'What is the final value and type of result after calling this function?',
    codeSnippet: `def compute_tax(income):
    tax = income * 0.2
    print(tax)

result = compute_tax(1000)`,
    options: [
      'result = 200.0 (float)',
      'result = None (NoneType)',
      'result = "200.0" (string)',
      'Error: Function must have a return statement'
    ],
    correctIndex: 1,
    explanation: 'print() sends text to standard output, but functions lacking an explicit "return" statement evaluate to None in Python by language specification.',
    misconceptionIfWrong: 'Confusing print() output on screen with the return value of an invocation frame.',
    difficulty: 'intermediate',
    bloomsLevel: 'analyze'
  },
  {
    id: 'init-q4',
    conceptId: 'recursion_frames',
    conceptName: 'Recursive Call-Stack Frames & Base Conditions',
    question: 'What happens when evaluating solve(3)?',
    codeSnippet: `def solve(n):
    if n == 0:
        return 0
    return n + solve(n - 1)`,
    options: [
      'Returns 6 (Evaluates 3 + 2 + 1 + 0 across 4 stack frames)',
      'Infinite Recursion / RecursionError',
      'Returns 3',
      'Returns None'
    ],
    correctIndex: 0,
    explanation: 'The call stack pushes frames for solve(3), solve(2), solve(1), and solve(0). When the base case n==0 is satisfied, unwinding accumulates 0+1+2+3 = 6.',
    misconceptionIfWrong: 'Failing to track how return expressions aggregate during stack unwinding.',
    difficulty: 'intermediate',
    bloomsLevel: 'apply'
  },
  {
    id: 'init-q5',
    conceptId: 'mutable_defaults',
    conceptName: 'CPython Bytecode & Mutable Default Argument Traps',
    question: 'What is printed after these three successive function calls?',
    codeSnippet: `def append_item(val, items=[]):
    items.append(val)
    return items

append_item(1)
append_item(2)
print(append_item(3))`,
    options: [
      '[3] (Each invocation gets a brand new default empty list)',
      '[1, 2, 3] (The default list object is instantiated once at function definition time)',
      'TypeError: Default argument must be immutable',
      '[None, None, 3]'
    ],
    correctIndex: 1,
    explanation: 'Default parameter values in Python are evaluated once at function definition time (def statement), not at invocation time. All calls share the identical list.',
    misconceptionIfWrong: 'Believing default parameter expressions re-evaluate fresh on each call.',
    difficulty: 'advanced',
    bloomsLevel: 'evaluate'
  }
];

export const InitialPlacementAssessment: React.FC<InitialPlacementAssessmentProps> = ({
  curriculumName,
  syllabusFileName,
  currentUser,
  customQuestions,
  onCompletePlacement,
  onSkip
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [placementResult, setPlacementResult] = useState<DiagnosticResult | null>(null);

  const questions = customQuestions && customQuestions.length >= 3 ? customQuestions : DEFAULT_DIAGNOSTIC_QUESTIONS;
  const currentQ = questions[currentQuestionIndex];
  const isCurrentSubmitted = isAnswerSubmitted[currentQuestionIndex] === true;
  const currentSelected = selectedAnswers[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: idx }));
  };

  const handleSubmitCurrent = () => {
    if (currentSelected === undefined) return;
    setIsAnswerSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
    if (currentSelected === currentQ.correctIndex) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  };

  const handleNextOrFinish = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate Diagnostic Placement Result
      let correctCount = 0;
      const missedConcepts: string[] = [];

      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correctCount++;
        } else {
          missedConcepts.push(q.conceptName);
        }
      });

      const percentage = Math.round((correctCount / questions.length) * 100);

      let level: DeterminedLevel = 'Beginner';
      let levelDescription = '';
      let recommendedFocus: string[] = [];
      let suggestedTheta = '-0.8';

      // Attempt backend evaluation
      try {
        const payload = questions.map((q, idx) => ({
          questionId: q.id,
          selectedIndex: selectedAnswers[idx] ?? -1,
        }));
        const evalRes = await fetch('/api/evaluate-initial-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: payload }),
        });
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          if (evalData.level) {
            level = evalData.level;
            levelDescription = evalData.levelDescription;
            recommendedFocus = evalData.recommendedFocus || [];
            suggestedTheta = evalData.suggestedTheta || suggestedTheta;
          }
        }
      } catch (err) {
        console.warn('Backend evaluation fallback to client logic', err);
      }

      if (!levelDescription) {
        if (correctCount >= 4) {
          level = 'Advanced';
          suggestedTheta = '+1.4';
          levelDescription =
            'You possess strong algorithmic intuition and clear comprehension of language runtime semantics, memory bindings, and recursion.';
          recommendedFocus = [
            'Dynamic Programming & State Transitions',
            'Space-Optimized Tabulation & Call-Stack Bounds',
            'Olympiad & Production-Grade Concurrency Patterns'
          ];
        } else if (correctCount >= 2) {
          level = 'Intermediate';
          suggestedTheta = '+0.2';
          levelDescription =
            'You have solid command over control flow and variables, but have latent gaps in call-stack contracts and runtime object mutation.';
          recommendedFocus = [
            'Function Return Contracts vs stdout print()',
            'Recursion Call-Stack Unwinding & Base Conditions',
            'Linear Data Structures (Stacks & Queues)'
          ];
        } else {
          level = 'Beginner';
          suggestedTheta = '-1.2';
          levelDescription =
            'Foundational concepts need calibration. We will start with memory references, conditionals, and interval indexing before moving forward.';
          recommendedFocus = [
            'Variables & Name Binding Semantics',
            'range() Half-Open Intervals & Off-By-One Logic',
            'Function Inputs & Scoping Rules'
          ];
        }
      }

      const result: DiagnosticResult = {
        score: correctCount,
        total: questions.length,
        percentage,
        level,
        levelDescription,
        recommendedFocus,
        suggestedTheta
      };

      setPlacementResult(result);
      setIsCompleted(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>Initial Diagnostic Test • Level Calibration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
              Determining Your Skill Level: Beginner, Intermediate, or Advanced
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Based on your syllabus: <strong className="text-slate-800">{curriculumName}</strong>
              {syllabusFileName && (
                <span className="ml-2 font-mono text-[11px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                  {syllabusFileName}
                </span>
              )}
            </p>
          </div>

          {!isCompleted && onSkip && (
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-slate-700 underline font-medium self-start sm:self-center"
            >
              Skip assessment & set Intermediate
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Diagnostic Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="font-mono font-bold text-indigo-600">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Question Flow */}
      {!isCompleted ? (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question Topic & Target */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-slate-700 text-xs font-mono font-bold">
                Q{currentQuestionIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-700">{currentQ.conceptName}</span>
            </div>

            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
              currentQ.difficulty === 'foundational'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : currentQ.difficulty === 'intermediate'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              Target: {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#0f172a] text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800 shadow-inner">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = currentSelected === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let optionClass = 'border-stone-200 bg-white hover:border-slate-400 hover:bg-stone-50';

              if (isCurrentSubmitted) {
                if (isCorrect) {
                  optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  optionClass = 'border-rose-400 bg-rose-50 text-rose-950';
                } else {
                  optionClass = 'border-stone-200 opacity-60 bg-stone-50';
                }
              } else if (isSelected) {
                optionClass = 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-1 ring-indigo-600';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isCurrentSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 cursor-pointer ${optionClass}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-slate-700'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                  {isCurrentSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation after submission */}
          {isCurrentSubmitted && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 animate-in fade-in duration-200 ${
              currentSelected === currentQ.correctIndex
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {currentSelected === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct Analysis!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Misconception Detected: {currentQ.misconceptionIfWrong}</span>
                  </>
                )}
              </div>
              <p>{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            {!isCurrentSubmitted ? (
              <button
                onClick={handleSubmitCurrent}
                disabled={currentSelected === undefined}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextOrFinish}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Placement & Determine Level'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Screen: Determines BEGINNER, INTERMEDIATE, or ADVANCED */
        placementResult && (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center space-y-3 max-w-lg mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f172a] shadow-lg shadow-emerald-500/20 text-3xl">
                {placementResult.level === 'Advanced' ? '🚀' : placementResult.level === 'Intermediate' ? '⚡' : '🌱'}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Initial Diagnostic Completed
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  Level Determined:{' '}
                  <span className={
                    placementResult.level === 'Advanced'
                      ? 'text-rose-600'
                      : placementResult.level === 'Intermediate'
                      ? 'text-cyan-600'
                      : 'text-emerald-600'
                  }>
                    {placementResult.level}
                  </span>
                </h2>
                <p className="text-xs text-slate-600">
                  You scored <strong className="text-slate-900">{placementResult.score} of {placementResult.total} ({placementResult.percentage}%)</strong> on the initial syllabus test.
                </p>
              </div>
            </div>

            {/* Level Tier Badges Comparison */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as DeterminedLevel[]).map(lvl => {
                const isCurrent = placementResult.level === lvl;
                return (
                  <div
                    key={lvl}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? lvl === 'Advanced'
                          ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-400 font-bold'
                          : lvl === 'Intermediate'
                          ? 'border-cyan-500 bg-cyan-50/70 ring-2 ring-cyan-400 font-bold'
                          : 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400 font-bold'
                        : 'border-stone-200 bg-stone-50/50 opacity-60'
                    }`}
                  >
                    <div className="text-base mb-1">
                      {lvl === 'Advanced' ? '🚀' : lvl === 'Intermediate' ? '⚡' : '🌱'}
                    </div>
                    <div className="text-xs font-bold text-slate-900">{lvl}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {lvl === 'Beginner' ? '0 - 1 Correct' : lvl === 'Intermediate' ? '2 - 3 Correct' : '4 - 5 Correct'}
                    </div>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono uppercase font-bold">
                        Placed Here
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Level Evaluation Narrative */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <strong className="text-slate-900 block font-serif text-sm">
                Pedagogical Assessment Summary:
              </strong>
              <p className="text-slate-600 leading-relaxed">{placementResult.levelDescription}</p>
            </div>

            {/* Recommended Learning Path Focus */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Targeted Modules For Your {placementResult.level} Syllabus Path:
              </span>
              <div className="space-y-2">
                {placementResult.recommendedFocus.map((focus, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200 text-xs font-medium text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-mono flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{focus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm & Launch Personalized Study Desk */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Profile calibrated for <strong className="text-slate-800">{currentUser.name}</strong>
              </span>

              <button
                onClick={() => onCompletePlacement(placementResult)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Personalized {placementResult.level} Workspace</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
