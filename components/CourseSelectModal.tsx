/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CourseMetadata } from '../types';
import { AVAILABLE_COURSES } from '../data/courses';
import { BookOpen, CheckCircle2, Sparkles, ArrowRight, X, Layers, Terminal, Binary, BrainCircuit, Plus } from 'lucide-react';

interface CourseSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCourseId: string;
  onSelectCourse: (course: CourseMetadata) => void;
  onOpenCustomSubject: () => void;
}

export const CourseSelectModal: React.FC<CourseSelectModalProps> = ({
  isOpen,
  onClose,
  activeCourseId,
  onSelectCourse,
  onOpenCustomSubject
}) => {
  if (!isOpen) return null;

  const getCourseIcon = (icon: string) => {
    switch (icon) {
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-indigo-600" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-teal-600" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5 text-rose-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">Select Academic Subject / Course Track</h2>
              <p className="text-xs text-slate-500">Choose a domain to calibrate your adaptive knowledge graph</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_COURSES.map(course => {
              const isSelected = course.id === activeCourseId;
              return (
                <div
                  key={course.id}
                  onClick={() => {
                    onSelectCourse(course);
                    onClose();
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-xs">
                        {getCourseIcon(course.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-serif">{course.title}</h3>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold">
                          {course.badge}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.description || course.tagline}
                  </p>

                  <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{course.conceptCount || course.nodeCount} Concepts</span>
                    <span>~{course.estimatedHours}h Mastery</span>
                    <span className="text-indigo-700 font-bold">{course.difficulty}</span>
                  </div>

                  {/* Topic Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(course.topics || course.tags).slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                    {(course.topics || course.tags).length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{(course.topics || course.tags).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Subject Generator Card */}
          <div
            onClick={() => {
              onClose();
              onOpenCustomSubject();
            }}
            className="p-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Generate Any Custom Subject with Gemini AI
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Type any custom domain (e.g., Quantum Computing, Cell Biology, Rust Programming) to generate an adaptive syllabus on the fly.
                </p>
              </div>
            </div>

            <button className="px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Domain</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF9F6] flex items-center justify-between text-xs text-slate-500">
          <span>Clicking any course resets the Bayesian Knowledge Graph to that subject.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
