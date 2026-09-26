/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LearningModule } from '../types';
import { BookOpen, CheckCircle2, Clock, Sparkles, Lightbulb, Code2, AlertTriangle, ArrowRight, Bot, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface PersonalizedLearningViewProps {
  modules: LearningModule[];
  onCompleteModule: (moduleId: string) => void;
  onProceedToQuiz: () => void;
  onOpenAiTutor: (conceptName: string) => void;
}

export const PersonalizedLearningView: React.FC<PersonalizedLearningViewProps> = ({
  modules,
  onCompleteModule,
  onProceedToQuiz,
  onOpenAiTutor
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(modules[0]?.id || '');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [modalityMode, setModalityMode] = useState<Record<string, 'analogy' | 'code' | 'academic'>>({});

  const activeModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const completedCount = modules.filter(m => m.completed).length;
  const currentMode = (activeModule ? modalityMode[activeModule.id] : undefined) || 'analogy';

  const toggleSolution = (modId: string) => {
    setRevealedSolutions(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const setModuleModality = (modId: string, mode: 'analogy' | 'code' | 'academic') => {
    setModalityMode(prev => ({ ...prev, [modId]: mode }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Stage 3 of 5: Personalized Learning & Remediation
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Dynamic Curriculum Tailored to Your Gaps
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              We topologically ordered this curriculum so foundational prerequisites are strengthened before advanced patterns. Already-mastered topics have been compressed.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
              {completedCount}/{modules.length}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Modules Reviewed</span>
              <span className="text-[11px] text-slate-400">Ready for calibration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Hub Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Module Navigation Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-1">
            Topological Learning Path
          </span>

          <div className="space-y-2">
            {modules.map((mod, idx) => {
              const isActive = mod.id === activeModuleId;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleId(mod.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 relative ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    mod.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {mod.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {mod.isRemediation && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold uppercase">
                          Remediation
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mod.estimatedMinutes}m
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1 truncate">
                      {mod.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {mod.conceptName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              Need a personalized explanation?
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Have our AI tutor explain this in terms of your hobbies, work domain, or with live counter-examples.
            </p>
            <button
              onClick={() => onOpenAiTutor(activeModule?.conceptName || 'Concepts')}
              className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI Tutor Socratic Question
            </button>
          </div>
        </div>

        {/* Right Column: Active Module Content */}
        {activeModule && (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Module Header */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                    {activeModule.conceptName}
                  </span>
                  {activeModule.isRemediation && (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Priority Gap Remediation
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onCompleteModule(activeModule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeModule.completed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeModule.completed ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {activeModule.completed ? 'Marked Complete' : 'Mark as Understood'}
                </button>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-white">
                {activeModule.title}
              </h3>

              {activeModule.prerequisiteReason && (
                <p className="text-xs text-amber-300/90 font-medium">
                  💡 Why this matters: {activeModule.prerequisiteReason}
                </p>
              )}
            </div>

            {/* Core Summary */}
            <div className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              {activeModule.summary}
            </div>

            {/* Explain Differently: Modality Switcher */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  "Explain Differently" (Multi-Modal AI Framing):
                </span>
                <div className="flex gap-1.5 text-xs">
                  <button
                    onClick={() => setModuleModality(activeModule.id, 'analogy')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      currentMode === 'analogy'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Analogy
                  </button>
                  <button
                    onClick={() => setModuleModality(activeModule.id, 'code')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      currentMode === 'code'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3 h-3 text-emerald-400" /> Code Fix
                  </button>
                  <button
                    onClick={() => setModuleModality(activeModule.id, 'academic')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      currentMode === 'academic'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" /> Formal Invariant
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg text-xs leading-relaxed text-slate-300 border border-slate-800">
                {currentMode === 'analogy' && (
                  <p>
                    <strong className="text-amber-300">Physical Metaphor: </strong>
                    {activeModule.analogy}
                  </p>
                )}
                {currentMode === 'code' && (
                  <p>
                    <strong className="text-emerald-300">Engineering Application: </strong>
                    {activeModule.interactiveExample?.outputExplanation || 'Focus on testing your base conditions and boundary invariant edge cases.'}
                  </p>
                )}
                {currentMode === 'academic' && (
                  <p>
                    <strong className="text-indigo-300">Formal Invariant: </strong>
                    All state transitions must adhere to inductive step bounds. Non-converging recurrence relations violate termination proofs.
                  </p>
                )}
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Conceptual Pillars
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                {activeModule.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs mt-0.5">
                      {i + 1}
                    </span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Code Example */}
            {activeModule.interactiveExample && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    Correct Idiomatic Pattern ({activeModule.interactiveExample.language})
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-200 overflow-x-auto shadow-inner">
                  <pre>{activeModule.interactiveExample.code}</pre>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Note: {activeModule.interactiveExample.outputExplanation}
                </p>
              </div>
            )}

            {/* Common Pitfalls Alert */}
            {activeModule.commonPitfalls.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Common Misconceptions & Pitfalls to Avoid:
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {activeModule.commonPitfalls.map((pitfall, i) => (
                    <li key={i}>{pitfall}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practice Challenge & Self-Check */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Quick Mental Practice Challenge:
                </span>
                <button
                  onClick={() => toggleSolution(activeModule.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>{revealedSolutions[activeModule.id] ? 'Hide Solution' : 'Show Solution Guide'}</span>
                  {revealedSolutions[activeModule.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeModule.practiceChallenge.prompt}
              </p>

              {revealedSolutions[activeModule.id] && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 animate-in fade-in duration-200">
                  <strong className="text-indigo-400 block mb-0.5">Solution & Guide:</strong>
                  {activeModule.practiceChallenge.answerGuide}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Done absorbing this unit? Validate your understanding in the adaptive quiz.
              </div>

              <button
                onClick={onProceedToQuiz}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <span>Launch Adaptive Quiz Calibration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
