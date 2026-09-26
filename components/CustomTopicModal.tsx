/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateCustomCurriculumAI } from '../services/geminiService';
import { PresetCurriculum } from '../types';
import { Sparkles, X, Brain, Loader2, ArrowRight } from 'lucide-react';

interface CustomTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurriculumGenerated: (curriculum: PresetCurriculum) => void;
}

export const CustomTopicModal: React.FC<CustomTopicModalProps> = ({
  isOpen,
  onClose,
  onCurriculumGenerated
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const generated = await generateCustomCurriculumAI(topicInput.trim());
      if (generated && generated.concepts && generated.concepts.length > 0) {
        onCurriculumGenerated(generated);
        onClose();
      } else {
        // Build an intelligent local template if AI generation couldn't parse or no API key
        const slug = topicInput.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const fallbackCurriculum: PresetCurriculum = {
          id: `custom-${slug}`,
          name: topicInput.trim(),
          category: 'Personalized Domain',
          icon: 'Brain',
          tagline: `Master core principles and prerequisite dependencies of ${topicInput.trim()}.`,
          concepts: [
            {
              id: 'c-custom-1',
              name: `${topicInput.trim()} Foundations`,
              description: `Fundamental definitions, baseline axioms, and operational vocabulary.`,
              category: 'Foundations',
              prerequisites: [],
              masteryScore: 0,
              status: 'untested',
              bloomsLevel: 'understand',
              importance: 'foundational'
            },
            {
              id: 'c-custom-2',
              name: `Mechanisms & Invariants`,
              description: `Core structural mechanisms and operational constraints of ${topicInput.trim()}.`,
              category: 'Core Theory',
              prerequisites: ['c-custom-1'],
              masteryScore: 0,
              status: 'untested',
              bloomsLevel: 'apply',
              importance: 'core'
            },
            {
              id: 'c-custom-3',
              name: `Edge Cases & Optimization`,
              description: `Advanced trade-offs, bottleneck identification, and synthesis.`,
              category: 'Advanced Practice',
              prerequisites: ['c-custom-2'],
              masteryScore: 0,
              status: 'untested',
              bloomsLevel: 'evaluate',
              importance: 'advanced'
            }
          ],
          diagnosticQuestions: [
            {
              id: 'diag-c-1',
              conceptId: 'c-custom-1',
              conceptName: `${topicInput.trim()} Foundations`,
              question: `What is the core prerequisite axiom of ${topicInput.trim()}?`,
              options: [
                'Establishing baseline invariant definitions and boundary conditions',
                'Skipping foundational axioms directly to high-throughput deployment',
                'Treating all subproblems as isolated constant factors',
                'Relying purely on heuristic approximations without verification'
              ],
              correctIndex: 0,
              explanation: `In ${topicInput.trim()}, foundational definitions form the invariant contract upon which all higher-level methods depend.`,
              misconceptionIfWrong: `Assuming advanced applications can be understood without rigorous foundational grounding.`,
              difficulty: 'foundational',
              bloomsLevel: 'understand'
            },
            {
              id: 'diag-c-2',
              conceptId: 'c-custom-2',
              conceptName: `Mechanisms & Invariants`,
              question: `When executing mechanisms in ${topicInput.trim()}, what guarantees system stability?`,
              options: [
                'Strict preservation of state invariants across transitions',
                'Arbitrary mutation without boundary checks',
                'Single-pass unverified execution',
                'Decoupling inputs from downstream feedback loops'
              ],
              correctIndex: 0,
              explanation: `Preserving invariant states ensures that downstream processing avoids undefined or divergent states.`,
              misconceptionIfWrong: `Overlooking invariant preservation during state transitions.`,
              difficulty: 'intermediate',
              bloomsLevel: 'analyze'
            }
          ],
          adaptivePool: [
            {
              id: 'ad-c-1',
              conceptId: 'c-custom-2',
              difficultyRating: 3,
              conceptName: `Mechanisms & Invariants`,
              question: `How does ${topicInput.trim()} handle scale and computational constraints?`,
              options: [
                'Through decomposition into modular, verifiable sub-layers',
                'By ignoring edge cases and hoping memory limits suffice',
                'By duplicating redundant computations indefinitely',
                'By removing all validation steps'
              ],
              correctIndex: 0,
              explanation: `Modular decomposition simplifies complexity analysis and enables targeted optimization.`,
              bloomsLevel: 'apply',
              hint: `Consider how complex systems manage cognitive and resource overhead.`,
              analogies: {
                eli5: `Like building with Lego blocks rather than molding a giant fragile clay statue.`,
                practical: `Microservices and clean component boundaries allow safe scaling.`,
                academic: `Divide-and-conquer topological isolation minimizes coupling.`
              }
            }
          ],
          learningModules: [
            {
              id: 'mod-c-1',
              conceptId: 'c-custom-1',
              conceptName: `${topicInput.trim()} Foundations`,
              title: `Foundations of ${topicInput.trim()}`,
              estimatedMinutes: 8,
              isRemediation: true,
              summary: `An intuitive deconstruction of fundamental definitions and common misconceptions in ${topicInput.trim()}.`,
              keyTakeaways: [
                'Always verify the underlying invariant before optimizing.',
                'Identify boundary conditions and edge cases early.',
                'Connect each new concept to its immediate prerequisite.'
              ],
              analogy: `Laying a flat concrete foundation before raising a skyscraper.`,
              commonPitfalls: [
                'Memorizing formulas without understanding their causal derivation.',
                'Skipping prerequisite definitions.'
              ],
              practiceChallenge: {
                prompt: `Identify the three primary constraints governing ${topicInput.trim()}.`,
                answerGuide: `Input validity, invariant preservation, and terminating output conditions.`
              },
              completed: false
            }
          ]
        };

        onCurriculumGenerated(fallbackCurriculum);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">Create Custom AI Learning Domain</h3>
              <p className="text-xs text-slate-500">Powered by Gemini 3.8 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 font-serif">
              Enter any academic subject or skill:
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="e.g. Quantum Computing, High-School Calculus, Bioinformatics, Rust..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="text-[11px] text-slate-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
            <span className="font-semibold text-slate-800 block">Gemini will automatically:</span>
            <p>• Extract the prerequisite knowledge dependency graph</p>
            <p>• Craft diagnostic questions with tagged misconception anchors</p>
            <p>• Build adaptive calibration question tiers and micro-lessons</p>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topicInput.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Build Curriculum</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
