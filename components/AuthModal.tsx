/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, User, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, X, Flame } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    name: 'Alex Chen',
    email: 'alex.chen@adaptive.edu',
    avatar: '👨‍💻',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'dsa-python'],
    currentGoal: 'Master Python Internals & FAANG Technical Interviews',
    level: 'Intermediate',
    streakDays: 14,
    totalStudyMinutes: 340,
    learningVelocity: 'Accelerated',
    joinedDate: 'September 2026'
  },
  {
    id: 'user-maya',
    name: 'Maya Patel',
    email: 'maya.patel@techacademy.io',
    avatar: '👩‍🔬',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'deep-learning-math'],
    currentGoal: 'Neural Network Math Foundations & Backpropagation',
    level: 'Advanced',
    streakDays: 21,
    totalStudyMinutes: 520,
    learningVelocity: 'Accelerated',
    joinedDate: 'August 2026'
  },
  {
    id: 'user-liam',
    name: 'Liam Wright',
    email: 'liam.wright@devbootcamp.com',
    avatar: '🌱',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'fullstack-web'],
    currentGoal: 'Overcome Recursion & Mutable Default Blindspots',
    level: 'Beginner',
    streakDays: 5,
    totalStudyMinutes: 120,
    learningVelocity: 'Steady',
    joinedDate: 'September 2026'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin
}) => {
  const [tab, setTab] = useState<'quick_switch' | 'login' | 'signup'>('quick_switch');
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const customUser: UserProfile = {
      ...currentUser,
      name: nameInput.trim() || emailInput.split('@')[0],
      email: emailInput.trim(),
      id: `user-${Date.now()}`
    };
    onLogin(customUser);
    onClose();
  };

  const handleSelectPreset = (user: UserProfile) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">Student Authentication</h3>
              <p className="text-[11px] text-slate-500">Access your adaptive knowledge profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setTab('quick_switch')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'quick_switch'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Demo Profiles
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Custom Sign In
          </button>
        </div>

        {/* Tab 1: 1-Click Persona Quick Switch */}
        {tab === 'quick_switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select a pre-calibrated student profile to test adaptive Bayesian updates:
            </p>

            <div className="space-y-2">
              {PRESET_USERS.map(user => {
                const isCurrent = currentUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectPreset(user)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1 rounded-lg bg-white border border-stone-200 shadow-xs">
                        {user.avatar}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{user.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-slate-700">
                            {user.level}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                          {user.currentGoal}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5 justify-end">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> {user.streakDays}d
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-indigo-700 font-semibold block">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Sign In Form */}
        {tab === 'login' && (
          <form onSubmit={handleSubmitCustom} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Student Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="student@university.edu"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Passcode / PIN</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Sign In & Restore Knowledge Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Encrypted Session • BKT Profile</span>
          <span className="text-indigo-600 font-medium">Synapse v2.4</span>
        </div>
      </div>
    </div>
  );
};
