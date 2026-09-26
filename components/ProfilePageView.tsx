/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, ConceptNode } from '../types';
import { AVAILABLE_COURSES } from '../data/courses';
import {
  User,
  Flame,
  Award,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Calendar,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

interface ProfilePageViewProps {
  user: UserProfile;
  nodes: Record<string, ConceptNode>;
  onUpdateGoal: (newGoal: string) => void;
  onNavigateToCourses: () => void;
  onNavigateToStudio: () => void;
  onOpenLogin: () => void;
}

export const ProfilePageView: React.FC<ProfilePageViewProps> = ({
  user,
  nodes,
  onUpdateGoal,
  onNavigateToCourses,
  onNavigateToStudio,
  onOpenLogin
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(user.currentGoal);

  const nodeList = Object.values(nodes) as ConceptNode[];
  const masteredList = nodeList.filter(n => n.status === 'mastered');
  const gapList = nodeList.filter(n => n.status === 'diagnosed_gap');
  const inProgressList = nodeList.filter(n => n.status === 'in_progress');

  const avgPL = nodeList.length > 0
    ? Math.round((nodeList.reduce((acc, n) => acc + n.pL, 0) / nodeList.length) * 100)
    : 50;

  const handleSaveGoal = () => {
    if (goalText.trim()) {
      onUpdateGoal(goalText.trim());
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-3xl shadow-sm">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 font-serif">{user.name}</h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {user.level} Level
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.email} • Enrolled {user.joinedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition-colors"
            >
              Switch Student
            </button>
            <button
              onClick={onNavigateToStudio}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all"
            >
              <span>Resume Study</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Big Academic Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Curriculum Mastery
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-indigo-700 font-mono">{avgPL}%</span>
              <span className="text-[11px] text-emerald-600 font-medium">Bayesian P(L)</span>
            </div>
            <span className="text-[11px] text-slate-500 block">Across {nodeList.length} prerequisite nodes</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide block">
              Study Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-amber-700 font-mono flex items-center gap-1">
                <Flame className="w-6 h-6 fill-amber-500 text-amber-500 inline" />
                {user.streakDays}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">days active</span>
            </div>
            <span className="text-[11px] text-amber-700 block">Consistency multiplier: 1.4x</span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Time on Task
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">{user.totalStudyMinutes}</span>
              <span className="text-[11px] text-slate-600 font-medium">mins</span>
            </div>
            <span className="text-[11px] text-slate-500 block">Velocity: {user.learningVelocity}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide block">
              Concepts Mastered
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-emerald-700 font-mono">
                {masteredList.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">/ {nodeList.length}</span>
            </div>
            <span className="text-[11px] text-emerald-700 block">{gapList.length} active remediation gaps</span>
          </div>
        </div>

        {/* Learning Goal Section */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Active Academic Focus & Target Exam
            </span>
            {isEditingGoal ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-1.5 bg-stone-200 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-800 font-serif">
                "{user.currentGoal}"
              </p>
            )}
          </div>

          {!isEditingGoal && (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Target</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Concept Mastery & Enrolled Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Concept Mastery Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Knowledge Concept Mastery (BKT Distribution)
              </h2>
              <p className="text-xs text-slate-500">
                Live Bayesian mastery probability calculated from every quiz answer.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {masteredList.length} Mastered • {gapList.length} Gaps
            </span>
          </div>

          <div className="space-y-3">
            {nodeList.map(node => {
              const pct = Math.round(node.pL * 100);
              const isGap = node.status === 'diagnosed_gap';
              const isMastered = node.status === 'mastered';
              const isProgress = node.status === 'in_progress';

              return (
                <div
                  key={node.id}
                  className="p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isMastered ? 'bg-emerald-500' : isGap ? 'bg-rose-500' : isProgress ? 'bg-amber-500' : 'bg-stone-300'
                      }`} />
                      <span className="font-semibold text-slate-900">{node.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Tier {node.tier}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-700">{pct}%</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        isMastered ? 'bg-emerald-100 text-emerald-800' : isGap ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {node.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered ? 'bg-emerald-500' : isGap ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {node.misconceptionsDetected.length > 0 && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded-md border border-rose-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>Diagnosed Misconceptions: {node.misconceptionsDetected.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Enrolled Subjects & Pedagogical Preferences (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enrolled Courses Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Enrolled Subjects & Courses
              </h2>
              <button
                onClick={onNavigateToCourses}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Browse All
              </button>
            </div>

            <div className="space-y-3">
              {AVAILABLE_COURSES.map(course => {
                const isEnrolled = user.enrolledCourseIds.includes(course.id) || course.id === 'python-core';
                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{course.title}</span>
                        {isEnrolled && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {course.nodeCount} Concepts • {course.estimatedHours}h
                      </span>
                    </div>

                    <button
                      onClick={onNavigateToCourses}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 transition-colors shrink-0"
                    >
                      {isEnrolled ? 'Open Course' : 'Enroll'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Style & Pedagogy Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 font-serif">
              Adaptive Tutor Calibration
            </h2>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="font-semibold text-slate-800 block">Socratic Inquiry Mode:</span>
                <span className="text-slate-500">Guides with leading hints rather than blurting answers immediately.</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="font-semibold text-slate-800 block">Misconception Traps Detection:</span>
                <span className="text-slate-500">Every distractor choice is tagged to update the prerequisite graph.</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                <span className="font-semibold text-slate-800 block">Confidence Calibration:</span>
                <span className="text-slate-500">Flags high-confidence errors as critical blind spots.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
