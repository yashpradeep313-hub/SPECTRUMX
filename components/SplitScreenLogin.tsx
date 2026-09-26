/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, DemoPersona } from '../types';
import { PRESET_USERS } from './AuthModal';
import { DEMO_PERSONAS } from '../data/pythonKnowledgeGraph';
import {
  Brain,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Award,
  BookOpen,
  Layers,
  GraduationCap,
  X,
  FileText,
  Target
} from 'lucide-react';

interface SplitScreenLoginProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onSelectPersona?: (persona: DemoPersona) => void;
  onPostLoginNavigateToSyllabus?: () => void;
  showLoader?: (message: string, duration?: number) => void;
}

export const SplitScreenLogin: React.FC<SplitScreenLoginProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onSelectPersona,
  onPostLoginNavigateToSyllabus,
  showLoader
}) => {
  const [emailInput, setEmailInput] = useState(currentUser.email || 'alex.chen@adaptive.edu');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    if (showLoader) {
      showLoader('Authenticating Institutional Credentials & Initializing Syllabus...', 1200);
    }

    const matchedUser = PRESET_USERS.find(
      u => u.email.toLowerCase() === emailInput.toLowerCase()
    );

    if (matchedUser) {
      onLogin(matchedUser);
      const persona = DEMO_PERSONAS.find(p => p.name.includes(matchedUser.name.split(' ')[0]));
      if (persona && onSelectPersona) {
        onSelectPersona(persona);
      }
    } else {
      const newUser: UserProfile = {
        ...currentUser,
        id: `user-${Date.now()}`,
        name: nameInput.trim() || emailInput.split('@')[0],
        email: emailInput.trim()
      };
      onLogin(newUser);
    }

    setFeedback('Authentication Successful! Redirecting to Upload Syllabus & Initial Test...');
    setTimeout(() => {
      onClose();
      if (onPostLoginNavigateToSyllabus) {
        onPostLoginNavigateToSyllabus();
      }
    }, 800);
  };

  const handleQuickPersona = (user: UserProfile) => {
    if (showLoader) {
      showLoader(`Loading ${user.name}'s Profile & Redirecting to Syllabus...`, 1000);
    }
    onLogin(user);
    const persona = DEMO_PERSONAS.find(p => p.name.includes(user.name.split(' ')[0])) || DEMO_PERSONAS[0];
    if (onSelectPersona) {
      onSelectPersona(persona);
    }
    setFeedback(`Signed in as ${user.name} (${user.level})!`);
    setTimeout(() => {
      onClose();
      if (onPostLoginNavigateToSyllabus) {
        onPostLoginNavigateToSyllabus();
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12 min-h-[580px] relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Return to Dashboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. LEFT SIDE (VISUAL): Dark Navy Background (#0f172a), subtle grid, glowing neon logo & tagline */}
        <div className="lg:col-span-5 navy-grid-bg p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle neon glowing ambient blobs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Brain className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white font-serif">
                  Synapse AI
                </h1>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  Adaptive Learning Platform
                </span>
              </div>
            </div>

            {/* Glowing Tagline */}
            <div className="pt-4 space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight font-serif">
                “Diagnosing <span className="text-cyan-400 underline decoration-emerald-400/50">why</span> you fail, not just <span className="text-emerald-400">what</span>.”
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect your institutional account, upload your course syllabus PDF, and complete the initial test to determine your placement tier.
              </p>
            </div>
          </div>

          {/* Workflow Steps Preview */}
          <div className="relative z-10 my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md space-y-3">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">
              Onboarding Journey:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Sign in with Institutional Email</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Upload Syllabus PDF & PYQ Paper Pattern</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Initial Test Calibrates Beginner / Inter / Adv</span>
              </div>
            </div>
          </div>

          {/* Bottom Security / Accreditations */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Bayesian Knowledge Traced
            </span>
            <span>v2.4 Production</span>
          </div>
        </div>

        {/* 2. RIGHT SIDE (FORM): Clean White Container + 1-Click Persona Access */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div className="space-y-6">
            {/* Form Title */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">
                  {isRegistering ? 'Create Student Account' : 'Student & Faculty Sign In'}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-stone-100 text-slate-700">
                  SSO Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isRegistering
                  ? 'Register with your university domain to sync your academic syllabus.'
                  : 'Enter your institutional email or select a pre-calibrated persona below.'}
              </p>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Email + Password Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {isRegistering && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); }} className="text-cyan-600 hover:underline text-[11px]">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isRegistering ? 'Register & Ingest Syllabus' : 'Sign In & Open Syllabus Setup'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </form>

            {/* Toggle Register / Sign In */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium cursor-pointer"
              >
                {isRegistering
                  ? 'Already have an institutional account? Sign In'
                  : 'New student? Create account with university email'}
              </button>
            </div>

            {/* QUICK STUDENT PERSONAS SECTION */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  Quick Student Profile Access
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Fast Login
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {PRESET_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickPersona(user)}
                    className="p-3 rounded-xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{user.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user.role} • {user.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 italic">
                      "{user.currentGoal.split(' ')[0]} {user.currentGoal.split(' ')[1]}..."
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Adaptive Bayesian Engine</span>
            <span>University Syllabus Calibration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
