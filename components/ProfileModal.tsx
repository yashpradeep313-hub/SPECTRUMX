/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, CourseMetadata, ConceptNode } from '../types';
import { AVAILABLE_COURSES } from '../data/courses';
import { User, Award, Flame, Clock, Target, CheckCircle2, ShieldCheck, Sparkles, BookOpen, Edit3, X, ArrowRight, Layers } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateGoal: (newGoal: string) => void;
  onOpenCourseSelect: () => void;
  onOpenAuth: () => void;
  nodes: Record<string, ConceptNode>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateGoal,
  onOpenCourseSelect,
  onOpenAuth,
  nodes
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(user.currentGoal);

  if (!isOpen) return null;

  const nodeList: ConceptNode[] = Object.values(nodes);
  const masteredCount = nodeList.filter(n => n.status === 'mastered').length;
  const gapCount = nodeList.filter(n => n.status === 'diagnosed_gap').length;
  const avgPL = nodeList.reduce((acc, n) => acc + n.pL, 0) / Math.max(1, nodeList.length);
  const overallMastery = Math.round(avgPL * 100);

  const handleSaveGoal = () => {
    onUpdateGoal(goalText.trim());
    setIsEditingGoal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl p-2 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
              {user.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-serif">{user.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold uppercase">
                  {user.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
                  {user.level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email} • Enrolled {user.joinedDate}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {/* 4 Stats Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
                Knowledge Mastery
              </span>
              <span className="text-xl font-black text-indigo-700 font-mono block">
                {overallMastery}%
              </span>
              <span className="text-[10px] text-slate-400">Bayesian P(L)</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block font-serif">
                Study Streak
              </span>
              <span className="text-xl font-black text-amber-700 font-mono flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 inline" /> {user.streakDays}d
              </span>
              <span className="text-[10px] text-amber-800">Days active</span>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-serif">
                Total Study Time
              </span>
              <span className="text-xl font-black text-slate-800 font-mono block">
                {user.totalStudyMinutes}m
              </span>
              <span className="text-[10px] text-slate-500">{user.learningVelocity} speed</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block font-serif">
                Mastered Nodes
              </span>
              <span className="text-xl font-black text-emerald-700 font-mono block">
                {masteredCount}/{nodeList.length}
              </span>
              <span className="text-[10px] text-emerald-700">{gapCount} diagnosed gaps</span>
            </div>
          </div>

          {/* Goal Setting Section */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-serif text-xs">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                Current Target & Academic Objective:
              </span>
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingGoal ? 'Cancel' : 'Edit Goal'}</span>
              </button>
            </div>

            {isEditingGoal ? (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={goalText}
                  onChange={e => setGoalText(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-xs font-serif text-slate-700 italic">“{user.currentGoal}”</p>
            )}
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 font-serif text-xs">Enrolled Academic Curriculums:</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenCourseSelect();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                + Add / Change Subject
              </button>
            </div>

            <div className="space-y-2">
              {AVAILABLE_COURSES.map(course => {
                const isEnrolled = user.enrolledCourseIds.includes(course.id) || course.id === 'python-core';
                return (
                  <div
                    key={course.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{course.title}</span>
                        {isEnrolled && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">
                            ENROLLED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{course.nodeCount} Concept Nodes • {course.estimatedHours}h Mastery Time</span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenCourseSelect();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors"
                    >
                      View Syllabus
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-[#FAF9F6] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="text-slate-600 hover:text-slate-900 font-semibold underline"
          >
            Switch to Another Student Profile
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
