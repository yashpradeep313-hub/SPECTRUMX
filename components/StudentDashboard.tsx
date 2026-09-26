/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConceptNode, LearningPathItem, StudentProfile, QuadrantType } from '../types';
import { TrendingUp, Clock, Target, CheckCircle2, AlertTriangle, Layers, Zap, Award, ArrowRight } from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  onSelectConceptFromPath: (conceptId: string) => void;
  lastQuadrant?: QuadrantType;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  onSelectConceptFromPath,
  lastQuadrant
}) => {
  const nodeList: ConceptNode[] = Object.values(profile.nodes);
  const masteredCount = nodeList.filter(n => n.status === 'mastered').length;
  const gapCount = nodeList.filter(n => n.status === 'diagnosed_gap').length;
  const inProgressCount = nodeList.filter(n => n.status === 'in_progress').length;

  const getQuadrantColor = (q?: QuadrantType) => {
    switch (q) {
      case 'dangerous_misconception':
        return 'border-rose-400 bg-rose-50 text-rose-800';
      case 'lucky_guess':
        return 'border-amber-400 bg-amber-50 text-amber-800';
      case 'true_mastery':
        return 'border-emerald-400 bg-emerald-50 text-emerald-800';
      default:
        return 'border-stone-200 bg-stone-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
            Overall Knowledge Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700 font-mono">
              {profile.overallMastery}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">+14% Growth</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">Bayesian weighted P(L)</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
            Mastered Concepts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {masteredCount}
            </span>
            <span className="text-xs text-slate-500">/ {nodeList.length}</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">Verified in assessments</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
            Diagnosed Gaps
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">
              {gapCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">Prioritized</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">Targeted for remediation</span>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 space-y-1 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
            Est. Time to Mastery
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {profile.estimatedMinutesToMastery}
            </span>
            <span className="text-xs text-slate-500">mins</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">Updates in real time</span>
        </div>
      </div>

      {/* Dynamic Learning Path (Auto-Reordering Sequence) */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Dynamic Adaptive Learning Path
            </h3>
            <span className="text-xs text-slate-500">
              Topologically re-sequenced after every answer • Remediates root causes first
            </span>
          </div>

          {lastQuadrant && (
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${getQuadrantColor(lastQuadrant)}`}>
              Last Calibration: {lastQuadrant.replace('_', ' ').toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {profile.activeLearningPath.map((item, idx) => {
            const node = profile.nodes[item.conceptId];
            const isGap = item.status === 'diagnosed_gap';
            const isMastered = item.status === 'mastered';
            const isProgress = item.status === 'in_progress';

            let borderStyle = 'border-stone-200 bg-stone-50/50 hover:bg-stone-50';
            if (isGap) borderStyle = 'border-rose-300 bg-rose-50/60 ring-1 ring-rose-300';
            else if (isMastered) borderStyle = 'border-emerald-300 bg-emerald-50/40';

            return (
              <div
                key={item.conceptId}
                onClick={() => onSelectConceptFromPath(item.conceptId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${borderStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isMastered
                      ? 'bg-emerald-100 text-emerald-800'
                      : isGap
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-stone-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.conceptName}
                      </span>
                      {isGap && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 font-bold uppercase border border-rose-200">
                          🚨 IMMEDIATE REMEDIATION
                        </span>
                      )}
                      {isMastered && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                          MASTERED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.pedagogicalReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {Math.round(item.estimatedPL * 100)}%
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
