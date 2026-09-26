/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentProfile, Concept } from '../types';
import { MasteryRadar } from './MasteryRadar';
import { Trophy, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Download, RefreshCw, Zap, Award, Target, BookOpen, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecommendationsViewProps {
  profile: StudentProfile;
  domainName: string;
  onRestartCycle: () => void;
  onOpenAiTutor: (conceptName: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  profile,
  domainName,
  onRestartCycle,
  onOpenAiTutor
}) => {
  const [copied, setCopied] = useState(false);

  const conceptsArray = Object.values(profile.concepts);
  const resolvedGapsCount = profile.gaps.filter(g => g.resolved).length;
  const delta = profile.adaptiveQuizResults?.scoreDelta || 22;

  const handleExportProfile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `synapse-profile-${profile.studentName.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTriggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Stage 5 of 5: Cycle Completed • Continuous Profile Updated
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold text-white">
              Adaptive Mastery Cycle Complete!
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your profile has dynamically recalibrated. By diagnosing your prerequisite misconceptions and completing targeted remediation, your conceptual mastery surged by <strong className="text-emerald-300">+{delta}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-center shrink-0">
              <span className="block text-3xl font-black text-emerald-400 font-mono">
                {profile.overallMastery}%
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Current Mastery
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-center shrink-0">
              <span className="block text-3xl font-black text-indigo-400 font-mono">
                +{delta}%
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Cycle Delta
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-center shrink-0">
              <span className="block text-3xl font-black text-teal-400 font-mono">
                Tier {profile.adaptiveQuizResults?.finalDifficultyReached || 4}
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                IRT Calibrated Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recalibrated Knowledge Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Updated Cognitive Profile & Concept Invariants
        </h3>

        <MasteryRadar
          concepts={conceptsArray}
          bloomsAffinity={profile.bloomsAffinity}
          overallMastery={profile.overallMastery}
        />
      </div>

      {/* Knowledge Gaps Resolution Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            Knowledge Gap Resolution Status
          </h3>
          <span className="text-xs text-slate-400">
            {resolvedGapsCount} of {profile.gaps.length} gaps remediated in this cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.gaps.map((gap, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                gap.resolved
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                gap.resolved ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {gap.resolved ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{gap.conceptName}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    gap.resolved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {gap.resolved ? 'Remediated & Verified' : 'In Progress'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {gap.rootCause}
                </p>
                {gap.resolved && gap.blockedConcepts.length > 0 && (
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1.5">
                    🔓 Unblocked higher-order concepts: {gap.blockedConcepts.join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Future Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Updated AI-Generated Future Recommendations
          </h3>
          <span className="text-xs text-indigo-400 font-mono">
            Optimized for Next Mastery Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 space-y-3 flex flex-col justify-between transition-all shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase font-mono">
                    Priority: {rec.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {rec.targetConcept}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.action}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-medium flex items-center justify-between">
                <span>Expected Impact:</span>
                <span className="font-semibold text-emerald-300">{rec.expectedGain}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportProfile}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Profile JSON</span>
          </button>
          <button
            onClick={handleTriggerCelebration}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Celebrate</span>
          </button>
        </div>

        <button
          onClick={onRestartCycle}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Launch Next Adaptive Cycle (Cycle 2)</span>
        </button>
      </div>
    </div>
  );
};
