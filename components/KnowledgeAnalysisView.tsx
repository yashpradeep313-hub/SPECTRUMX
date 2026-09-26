/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Concept, KnowledgeGap, StudentProfile } from '../types';
import { ConceptGraph } from './ConceptGraph';
import { MasteryRadar } from './MasteryRadar';
import { AlertTriangle, CheckCircle2, Lock, ArrowRight, Sparkles, Brain, Layers, ShieldAlert, BookOpen } from 'lucide-react';

interface KnowledgeAnalysisViewProps {
  concepts: Concept[];
  gaps: KnowledgeGap[];
  studentProfile: StudentProfile;
  domainName: string;
  onProceedToLearning: () => void;
  onOpenAiTutor: (conceptName: string, misconception?: string) => void;
}

export const KnowledgeAnalysisView: React.FC<KnowledgeAnalysisViewProps> = ({
  concepts,
  gaps,
  studentProfile,
  domainName,
  onProceedToLearning,
  onOpenAiTutor
}) => {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const masteredCount = concepts.filter(c => c.status === 'mastered').length;
  const gapCount = gaps.length;
  const blockedCount = concepts.filter(c => c.status === 'blocked').length;

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* Top Analysis Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-rose-400" />
              Stage 2 of 5: Cognitive Gap & Dependency Analysis
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Diagnostic Knowledge Analysis: {domainName}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Our Bayesian Knowledge engine maps your performance against a directed prerequisite ontology. We isolate root-cause misconceptions so you don't waste time on concepts you cannot yet absorb.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="block text-2xl font-bold text-emerald-400 font-mono">{masteredCount}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Mastered</span>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <span className="block text-2xl font-bold text-rose-400 font-mono">{gapCount}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Root Gaps</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-2xl font-bold text-slate-400 font-mono">{blockedCount}</span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Blocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisite Knowledge Graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Interactive Prerequisite Dependency Graph
          </h3>
          <span className="text-xs text-slate-400">
            Click any node to see prerequisite blockers
          </span>
        </div>
        <ConceptGraph
          concepts={concepts}
          onSelectConcept={c => setSelectedConcept(c)}
          selectedConceptId={selectedConcept?.id}
        />
      </div>

      {/* Selected Node Drawer if active */}
      {selectedConcept && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl animate-in fade-in duration-200 flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {selectedConcept.category}
              </span>
              <h4 className="text-base font-bold text-white">{selectedConcept.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                selectedConcept.status === 'gap'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : selectedConcept.status === 'mastered'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {selectedConcept.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedConcept.description}
            </p>
            {selectedConcept.prerequisites.length > 0 && (
              <div className="text-xs text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Requires mastery of: </span>
                {selectedConcept.prerequisites.map(pId => {
                  const pConcept = concepts.find(c => c.id === pId);
                  return pConcept?.name;
                }).join(', ')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenAiTutor(selectedConcept.name, selectedConcept.misconception)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Ask AI Tutor
            </button>
            <button
              onClick={() => setSelectedConcept(null)}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Detected Root-Cause Gaps Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-bold text-white">Detected Root-Cause Knowledge Gaps</h3>
          </div>
          <span className="text-xs text-rose-400/90 font-medium">
            Requires Just-in-Time Remediation
          </span>
        </div>

        {gaps.length === 0 ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-200">No Critical Foundational Gaps Found!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              You've demonstrated solid understanding across foundational prerequisites. Your personalized path will focus on accelerated application and advanced edge cases.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-rose-500/60 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
                      {gap.severity} Bottleneck
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{gap.conceptName}</h4>
                  </div>
                  <button
                    onClick={() => onOpenAiTutor(gap.conceptName, gap.rootCause)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs transition-colors flex items-center gap-1"
                    title="Ask AI Tutor about this gap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium hidden sm:inline">AI Help</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-rose-300">Root Cause: </span>
                  {gap.rootCause}
                </p>

                {gap.blockedConcepts.length > 0 && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-slate-300">Cascading Block: </strong>
                      Prevents learning {gap.blockedConcepts.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bloom's Cognitive Radar & Concept Mastery */}
      <MasteryRadar
        concepts={concepts}
        bloomsAffinity={studentProfile.bloomsAffinity}
        overallMastery={studentProfile.overallMastery}
      />

      {/* Bottom CTA Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Knowledge Topology Configured</h4>
          <p className="text-xs text-slate-400">
            Next, our engine generates an optimized learning path with remediation modules prioritized first.
          </p>
        </div>

        <button
          onClick={onProceedToLearning}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <span>Generate Personalized Learning Path</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
