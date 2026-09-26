/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DemoPersona } from '../types';
import { DEMO_PERSONAS } from '../data/pythonKnowledgeGraph';
import { Play, Sparkles, User, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

interface DemoWalkthroughBarProps {
  activePersonaId: string;
  onSelectPersona: (persona: DemoPersona) => void;
  onRunAutoDemoStep: () => void;
  currentDemoStep: number; // 0 = idle, 1 = question ready, 2 = failed & diagnosed, 3 = lesson open, 4 = verified & green
  isAutoRunning: boolean;
  onResetDemo: () => void;
}

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({
  activePersonaId,
  onSelectPersona,
  onRunAutoDemoStep,
  currentDemoStep,
  isAutoRunning,
  onResetDemo
}) => {
  const activePersona = DEMO_PERSONAS.find(p => p.id === activePersonaId) || DEMO_PERSONAS[0];

  const stepLabels = [
    '1. Select Persona & Start',
    '2. Fail Question with Tagged Distractor',
    '3. Graph Lights Up Root Cause in Red',
    '4. Complete Targeted Micro-Lesson',
    '5. Verification Solved -> Node Turns Green!'
  ];

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Persona Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            1-Click Demo Persona:
          </span>

          <div className="flex flex-wrap gap-2">
            {DEMO_PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activePersonaId === p.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-600/30'
                    : 'bg-stone-50 text-slate-700 hover:bg-stone-100 hover:text-slate-900 border border-stone-200/80'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({p.id.replace('persona-', '')})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: 3-Minute Hackathon Demo Automator Button */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={onRunAutoDemoStep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentDemoStep === 0
                ? '▶ Run 3-Min Hackathon Demo'
                : currentDemoStep === 4
                ? '🎉 Demo Loop Complete (Click to Reset)'
                : `Next Demo Action: ${stepLabels[currentDemoStep]}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetDemo}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Reset Demo State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Stepper for the 3-Minute Winning Cycle */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-bold text-slate-400 font-mono text-[10px] uppercase">
          Winning Hackathon Loop:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {stepLabels.map((lbl, idx) => {
            const isPassed = currentDemoStep > idx;
            const isCurrent = currentDemoStep === idx;

            return (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] flex items-center gap-1 transition-all ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                    : isCurrent
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {isPassed && <CheckCircle2 className="w-2.5 h-2.5" />}
                {lbl}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
