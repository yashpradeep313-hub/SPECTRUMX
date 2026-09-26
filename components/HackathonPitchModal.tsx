/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Award, Lightbulb, Target, Layers, Cpu, TrendingUp, Presentation, CheckCircle2, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

interface HackathonPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HackathonPitchModal: React.FC<HackathonPitchModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'innovation' | 'architecture' | 'market'>('pitch');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                Hackathon Strategy & Judge Pitch Playbook
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono font-bold">
                  Winning Pitch Kit
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Strategic blueprint, algorithmic innovations, and judge presentation outline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white px-5 gap-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'pitch', label: '3-Minute Pitch Script', icon: Presentation },
            { id: 'innovation', label: 'Novelty & Hackathon Edge', icon: Lightbulb },
            { id: 'architecture', label: 'Algorithmic Architecture', icon: Layers },
            { id: 'market', label: 'Market & EdTech Impact', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* TAB 1: 3-MINUTE PITCH SCRIPT */}
          {activeTab === 'pitch' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Judges Hook (First 30 Seconds):
                </span>
                <p className="text-slate-800 italic font-serif text-sm">
                  “Judges, today 95% of EdTech platforms adjust difficulty like a thermostat: get questions right, things get harder; get questions wrong, things get easier. But they NEVER diagnose WHY you failed. If a student fails a Recursion question because they don’t understand how return values hand memory back to callers, giving them a simpler recursion problem is educational malpractice.
                  <br /><br />
                  Synapse AI solves this. We built a visible, explainable, root-cause driven engine that walks the prerequisite graph and fixes the actual missing foundation live.”
                </p>
              </div>

              {/* 3-Minute Choreography Steps */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm font-serif">Live Demo Step-by-Step Choreography:</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-slate-900 block font-serif">0:00 - 0:45 • Persona & Setup</span>
                    <p className="text-xs text-slate-600">
                      Click the "Alex Chen (Rote Memorizer)" persona. Show that their Recursion node is at 80% surface score, but their Functions prerequisite is fragile at 42%.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-slate-900 block font-serif">0:45 - 1:30 • The Tagged Distractor</span>
                    <p className="text-xs text-slate-600">
                      Answer the active Recursion question with Option B ("None"). Point out: this distractor isn’t random—it specifically tags the misconception: "Treating return like print".
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-slate-900 block font-serif">1:30 - 2:15 • The DAG Lights Up Red</span>
                    <p className="text-xs text-slate-600">
                      Watch the live Directed Acyclic Graph visually rewind! The surface topic isn't where we stop; the root cause prerequisite (Functions & Return Values) pulses red.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-slate-900 block font-serif">2:15 - 3:00 • Micro-Remediation & Triumph</span>
                    <p className="text-xs text-slate-600">
                      Open the targeted micro-lesson, solve the verification check, and watch the prerequisite node turn Emerald Green on the graph!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOVELTY & HACKATHON EDGE */}
          {activeTab === 'innovation' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-serif">What Makes Synapse AI Uniquely Win Hackathons:</h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-bold text-indigo-700 block font-serif">1. Tagged Distractor Misconception Matrix</span>
                  <p className="text-xs text-slate-600">
                    Unlike traditional multiple choice where wrong answers are just (-1), every single wrong option maps to a formal pedagogical trap (e.g. "Off-by-one boundary", "Mutable default argument retention", "Forgetting base case").
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-bold text-amber-700 block font-serif">2. Confidence vs Competence Quadrant</span>
                  <p className="text-xs text-slate-600">
                    Every answer asks for student confidence (Low/Medium/High). High Confidence + Wrong Answer = Dangerous Blindspot that receives urgent remediation. Low Confidence + Correct = Lucky Guess that triggers reinforcement.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-bold text-emerald-700 block font-serif">3. 100% Explainable Personalization</span>
                  <p className="text-xs text-slate-600">
                    No black-box recommendations. Every curriculum adjustment generates a transparent human sentence: "You are seeing this because you selected Option B on the previous question and Functions mastery is only 42%."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-serif">Under the Hood: Algorithmic Architecture</h3>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs space-y-2 text-slate-800">
                <p>• <strong>DAG Model:</strong> Topological Sort + Breadth-First Prerequisite Walk</p>
                <p>• <strong>Bayesian Knowledge Tracing (BKT):</strong> Real-time update of P(L) based on slip (P(S)), guess (P(G)), and transit (P(T)) probabilities.</p>
                <p>• <strong>AI Engine:</strong> Google GenAI SDK (Gemini 3.8 Flash) for custom on-demand syllabus synthesis and contextual Socratic tutoring.</p>
                <p>• <strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, SVG Interactive DAG.</p>
              </div>
            </div>
          )}

          {/* TAB 4: MARKET & EDTECH IMPACT */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm font-serif">Market Opportunity & EdTech Deployment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-bold text-slate-900 block font-serif">B2B Higher Education & Bootcamps</span>
                  <p className="text-xs text-slate-600">
                    Allows professors and instructors to view an aggregate classroom knowledge graph, spotting exactly which foundational concept 60% of students missed before midterms.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-bold text-slate-900 block font-serif">B2C Technical Interview Prep</span>
                  <p className="text-xs text-slate-600">
                    Saves candidates hundreds of hours by eliminating redundant easy questions and zeroing in on the 3 core conceptual blindspots holding back their FAANG offers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF9F6] flex items-center justify-between text-xs text-slate-500">
          <span>Synapse AI • Ready for 3-minute Hackathon Judging</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20"
          >
            Close Pitch Kit
          </button>
        </div>
      </div>
    </div>
  );
};
