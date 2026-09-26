/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MicroLesson, PythonQuestion, ConfidenceLevel } from '../types';
import { BookOpen, CheckCircle2, Play, AlertTriangle, Code2, Sparkles, X, ArrowRight, Lightbulb, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MicroLessonDrawerProps {
  lesson: MicroLesson;
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerification: (isCorrect: boolean, confidence: ConfidenceLevel) => void;
  onOpenAiTutor: (conceptName: string, misconception: string) => void;
}

export const MicroLessonDrawer: React.FC<MicroLessonDrawerProps> = ({
  lesson,
  isOpen,
  onClose,
  onCompleteVerification,
  onOpenAiTutor
}) => {
  const [activeTab, setActiveTab] = useState<'lesson' | 'sandbox' | 'verify'>('lesson');
  const [userCode, setUserCode] = useState(lesson.interactiveExercise.starterCode);
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isSandboxSuccess, setIsSandboxSuccess] = useState(false);

  // Verification question state
  const [verifyChoice, setVerifyChoice] = useState<number | null>(null);
  const [verifyConfidence, setVerifyConfidence] = useState<ConfidenceLevel>('high');
  const [isVerifySubmitted, setIsVerifySubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRunSandbox = () => {
    // Simple in-browser Python evaluator/simulator
    const snippet = lesson.interactiveExercise.expectedSolutionSnippet;
    if (userCode.includes(snippet) || (lesson.conceptId === 'functions_returns' && userCode.includes('return'))) {
      setSandboxOutput(`>>> Executing Python script...\nSquared: 25\n\n[SUCCESS] Correct! return handed 25 back to the caller.`);
      setIsSandboxSuccess(true);
    } else {
      setSandboxOutput(`>>> Executing Python script...\nSquared: None\n\n[MISCONCEPTION] Output is None! Did you use "return" or "print"? Remember: functions must return values to assign them.`);
      setIsSandboxSuccess(false);
    }
  };

  const handleVerifySubmit = () => {
    if (verifyChoice === null) return;
    setIsVerifySubmitted(true);
    const isCorrect = verifyChoice === lesson.verificationQuestion.correctIndex;

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    setTimeout(() => {
      onCompleteVerification(isCorrect, verifyConfidence);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-l border-stone-200 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  {lesson.conceptName}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold uppercase">
                  Remediation Micro-Lesson
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 font-serif mt-0.5">{lesson.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAiTutor(lesson.conceptName, lesson.targetMisconception)}
              className="p-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs flex items-center gap-1 transition-colors"
              title="Ask AI Tutor"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="font-semibold">Ask AI Tutor</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-white px-5 gap-4 text-xs font-semibold">
          {[
            { id: 'lesson', label: '1. Root-Cause Lesson' },
            { id: 'sandbox', label: '2. Python Code Sandbox' },
            { id: 'verify', label: '3. Verification Check' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {activeTab === 'lesson' && (
            <div className="space-y-5">
              {/* Why Assigned Card */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-800 font-serif">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Why you were assigned this micro-lesson:
                </span>
                <p>{lesson.whyAssigned}</p>
              </div>

              {/* Core Explanation */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-700 font-serif">
                  The Core Mental Model Shift
                </h4>
                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm text-slate-800">
                  {lesson.explanation}
                </div>
              </div>

              {/* Side-by-side Broken vs Fixed Code */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-serif">
                  Comparative Code Breakdown:
                </h4>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                    <span>❌ The Misconception (What fails):</span>
                  </div>
                  <div className="bg-slate-900 border border-rose-300 rounded-xl p-3.5 font-mono text-xs text-rose-200 overflow-x-auto shadow-inner">
                    <pre>{lesson.brokenCode}</pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <span>✅ The Idiomatic Fix (How it works):</span>
                  </div>
                  <div className="bg-slate-900 border border-emerald-300 rounded-xl p-3.5 font-mono text-xs text-emerald-200 overflow-x-auto shadow-inner">
                    <pre>{lesson.fixedCode}</pre>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">
                  💡 {lesson.codeExplanation}
                </p>
              </div>

              {/* Next Step CTA */}
              <div className="pt-3 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                >
                  <span>Try It in the Python Sandbox</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-900 block font-serif">Interactive Coding Sandbox:</span>
                <p className="text-slate-700">{lesson.interactiveExercise.prompt}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                  <span>Python Editor:</span>
                  <span className="text-slate-400 font-mono">main.py</span>
                </label>
                <textarea
                  value={userCode}
                  onChange={e => setUserCode(e.target.value)}
                  rows={7}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl p-4 font-mono text-xs text-amber-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                  spellCheck={false}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleRunSandbox}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Python Sandbox</span>
                </button>

                <span className="text-[11px] text-slate-500">
                  Hint: {lesson.interactiveExercise.hint}
                </span>
              </div>

              {sandboxOutput && (
                <div className={`p-4 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed animate-in fade-in duration-200 ${
                  isSandboxSuccess
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  {sandboxOutput}
                </div>
              )}

              {isSandboxSuccess && (
                <div className="pt-3 border-t border-stone-200 flex justify-end">
                  <button
                    onClick={() => setActiveTab('verify')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                  >
                    <span>Proceed to Verification Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="space-y-5">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase font-mono">
                  Verification Question
                </span>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  {lesson.verificationQuestion.questionText}
                </h3>
                {lesson.verificationQuestion.codeSnippet && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-amber-200 overflow-x-auto shadow-inner">
                    <pre>{lesson.verificationQuestion.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {lesson.verificationQuestion.options.map((opt, idx) => {
                  const isSelected = verifyChoice === idx;
                  const isCorrect = idx === lesson.verificationQuestion.correctIndex;

                  let style = 'bg-stone-50 hover:bg-stone-100 text-slate-800 border-stone-200';
                  if (isVerifySubmitted) {
                    if (isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold';
                    else if (isSelected) style = 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
                    else style = 'opacity-40 border-stone-200 text-slate-400';
                  } else if (isSelected) {
                    style = 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !isVerifySubmitted && setVerifyChoice(idx)}
                      disabled={isVerifySubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs leading-relaxed cursor-pointer ${style}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 pt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Confidence Rating */}
              {!isVerifySubmitted && (
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Confidence:</span>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as ConfidenceLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setVerifyConfidence(lvl)}
                        className={`px-3 py-1 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                          verifyConfidence === lvl
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {isVerifySubmitted && (
                <div className={`p-4 rounded-xl border space-y-1 text-xs animate-in fade-in duration-200 ${
                  verifyChoice === lesson.verificationQuestion.correctIndex
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <strong className="block text-sm font-bold font-serif">
                    {verifyChoice === lesson.verificationQuestion.correctIndex
                      ? '🎉 Verification Succeeded! Mastery Unlocked'
                      : 'Not quite. Check the return vs print difference again.'}
                  </strong>
                  <p>{lesson.verificationQuestion.correctExplanation}</p>
                </div>
              )}

              {/* Submit CTA */}
              {!isVerifySubmitted && (
                <div className="pt-3 border-t border-stone-200 flex justify-end">
                  <button
                    onClick={handleVerifySubmit}
                    disabled={verifyChoice === null}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
                  >
                    Submit Verification & Update Mastery
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
