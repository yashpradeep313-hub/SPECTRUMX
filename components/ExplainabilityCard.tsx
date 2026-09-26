/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ExplainabilityContext, QuadrantType } from '../types';
import { AlertCircle, HelpCircle, ShieldAlert, Sparkles, TrendingDown, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface ExplainabilityCardProps {
  context: ExplainabilityContext | null;
  onInspectRootCause?: (conceptId: string) => void;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  context,
  onInspectRootCause
}) => {
  if (!context) return null;

  const getQuadrantBadge = (quadrant: QuadrantType) => {
    switch (quadrant) {
      case 'dangerous_misconception':
        return {
          label: 'DANGEROUS MISCONCEPTION (HIGH CONFIDENCE BLINDSPOT)',
          style: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          icon: ShieldAlert
        };
      case 'lucky_guess':
        return {
          label: 'LUCKY GUESS (LOW CONFIDENCE REINFORCEMENT)',
          style: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
          icon: Zap
        };
      case 'true_mastery':
        return {
          label: 'CONFIRMED MASTERY (HIGH CONFIDENCE + ACCURATE)',
          style: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
          icon: CheckCircle2
        };
      case 'known_gap':
      default:
        return {
          label: 'KNOWN GAP (EXPLORATORY MISS)',
          style: 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold',
          icon: HelpCircle
        };
    }
  };

  const badgeInfo = getQuadrantBadge(context.quadrant);
  const Icon = badgeInfo.icon;
  const pLDrop = Math.round((context.priorMasteryPL - context.updatedMasteryPL) * 100);

  return (
    <div className="bg-white border border-indigo-200/90 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-serif">
            Explainable Personalization Engine
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${badgeInfo.style}`}>
          <Icon className="w-3 h-3" />
          <span>{badgeInfo.label}</span>
        </div>
      </div>

      {/* Main Explainability Sentence */}
      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
        <p className="font-medium">
          “{context.reasonText}”
        </p>
      </div>

      {/* Metadata Footprint */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-stone-100 font-mono">
        <div className="flex items-center gap-3">
          <span>Surface Concept: <strong className="text-slate-700">{context.surfaceConceptId}</strong></span>
          <span>·</span>
          <span>Root Cause Prereq: <strong className="text-rose-600">{context.rootCauseConceptName}</strong></span>
        </div>

        {context.rootCauseConceptId && onInspectRootCause && (
          <button
            onClick={() => onInspectRootCause(context.rootCauseConceptId!)}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
          >
            <span>Inspect Missing Prerequisite</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
