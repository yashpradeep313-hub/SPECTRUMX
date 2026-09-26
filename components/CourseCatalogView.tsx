/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CourseMetadata } from '../types';
import { AVAILABLE_COURSES } from '../data/courses';
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Clock,
  Layers,
  GraduationCap,
  Brain,
  Code2,
  Cpu,
  Search,
  PlusCircle,
  ShieldCheck,
  Flame
} from 'lucide-react';

interface CourseCatalogViewProps {
  activeCourseId: string;
  onSelectCourse: (course: CourseMetadata) => void;
  onOpenCustomSubject: () => void;
  onNavigateToStudio: () => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({
  activeCourseId,
  onSelectCourse,
  onOpenCustomSubject,
  onNavigateToStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Subjects' },
    { id: 'Computer Science', label: 'Computer Science & Python' },
    { id: 'AI & Data Science', label: 'AI, Math & Deep Learning' },
    { id: 'Web & Systems', label: 'Web & Systems Architecture' }
  ];

  const filteredCourses = AVAILABLE_COURSES.filter(c => {
    const desc = c.description || c.tagline;
    const topicList = c.topics || c.tags;
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topicList.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleChooseCourse = (course: CourseMetadata) => {
    onSelectCourse(course);
    onNavigateToStudio();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Academic Subject Registry & Adaptive Curriculums</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          Select Subject & Course Track
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Choose a subject to initialize its interactive Directed Acyclic Graph (DAG),
          diagnostic assessments, and Bayesian knowledge tracing model.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-stone-50 text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Custom Course Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, topics..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            onClick={onOpenCustomSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map(course => {
          const isActive = course.id === activeCourseId;
          return (
            <div
              key={course.id}
              className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md space-y-4 relative flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-stone-200/90 hover:border-indigo-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {course.category}
                  </span>
                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ACTIVE COURSE
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Level {course.difficulty} of 5
                    </span>
                  )}
                </div>

                {/* Course Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {course.description || course.tagline}
                  </p>
                </div>

                {/* Specs Pill row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <strong>{course.conceptCount || course.nodeCount}</strong> Concept Nodes
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <strong>~{course.estimatedHours}h</strong> Mastery Time
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Brain className="w-3.5 h-3.5 text-emerald-600" />
                    BKT Enabled
                  </span>
                </div>

                {/* Syllabus Topic Tags */}
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Syllabus Topics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(course.topics || course.tags).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-[11px] text-slate-700 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {course.id === 'python-core' ? '⭐ Recommended for Hackathon Demo' : 'Full Adaptive Curriculum'}
                </span>

                <button
                  onClick={() => handleChooseCourse(course)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                      : 'bg-stone-100 hover:bg-indigo-600 hover:text-white text-slate-800'
                  }`}
                >
                  <span>{isActive ? 'Continue In Studio' : 'Select & Launch Track'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Custom Subject Generator Box */}
      <div className="bg-gradient-to-r from-amber-50/70 via-stone-50 to-indigo-50/70 border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Need a Custom Subject for Your University or Hackathon Domain?
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Generate an instant concept dependency graph, diagnostic questions, and adaptive questions for
            any topic (e.g. "Quantum Computing", "High-School Calculus", "Bioinformatics", "Microeconomics")
            using the Gemini AI engine.
          </p>
        </div>

        <button
          onClick={onOpenCustomSubject}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Synthesize Custom Curriculum</span>
        </button>
      </div>
    </div>
  );
};
