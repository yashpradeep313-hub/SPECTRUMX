/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, DemoPersona } from '../types';
import { PRESET_USERS } from './AuthModal';
import { DEMO_PERSONAS } from '../data/pythonKnowledgeGraph';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  GraduationCap,
  Library,
  Compass,
  Lock,
  Mail,
  User,
  School
} from 'lucide-react';

interface LoginPageViewProps {
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onSelectPersona?: (persona: DemoPersona) => void;
  onNavigateToStudio: () => void;
  onNavigateToCourses: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  currentUser,
  onLogin,
  onSelectPersona,
  onNavigateToStudio,
  onNavigateToCourses
}) => {
  const [authMode, setAuthMode] = useState<'personas' | 'signin' | 'register'>('personas');
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [nameInput, setNameInput] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('Master Core Data Structures & Python Internals');
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handlePersonaSelect = (user: UserProfile) => {
    onLogin(user);
    const persona = DEMO_PERSONAS.find(p => p.name.includes(user.name.split(' ')[0]));
    if (persona && onSelectPersona) {
      onSelectPersona(persona);
    }
    setFeedbackMessage(`Signed in as ${user.name} (${user.level})! Redirecting to study desk...`);
    setTimeout(() => {
      onNavigateToStudio();
    }, 800);
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const matchedPreset = PRESET_USERS.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (matchedPreset) {
      handlePersonaSelect(matchedPreset);
      return;
    }

    const newUser: UserProfile = {
      ...currentUser,
      id: `user-${Date.now()}`,
      name: emailInput.split('@')[0],
      email: emailInput.trim(),
      level: selectedLevel,
      currentGoal: selectedGoal
    };
    onLogin(newUser);
    setFeedbackMessage(`Welcome back, ${newUser.name}! Profile loaded.`);
    setTimeout(() => {
      onNavigateToStudio();
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) return;

    const registeredUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: nameInput.trim(),
      email: emailInput.trim(),
      avatar: selectedLevel === 'Beginner' ? '🌱' : selectedLevel === 'Intermediate' ? '👨‍💻' : '🚀',
      role: 'Student',
      enrolledCourseIds: ['python-core', 'dsa-python'],
      currentGoal: selectedGoal,
      level: selectedLevel,
      streakDays: 1,
      totalStudyMinutes: 20,
      learningVelocity: 'Steady',
      joinedDate: 'September 2026'
    };

    onLogin(registeredUser);
    setFeedbackMessage(`Student profile created for ${registeredUser.name}! Initializing diagnostic baseline...`);
    setTimeout(() => {
      onNavigateToStudio();
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
          <span>Synapse Academic Authentication & Student Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          Student Portal & Learning Profile
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Log in with your academic credentials, switch demo personas for the live judging demo,
          or configure your target study syllabus.
        </p>
      </div>

      {/* Active Session Status Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-sm">
            {currentUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{currentUser.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                {currentUser.level}
              </span>
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {currentUser.streakDays}d Streak
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
              Goal: {currentUser.currentGoal}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onNavigateToCourses}
            className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-700 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-200 transition-colors"
          >
            Change Subject
          </button>
          <button
            onClick={onNavigateToStudio}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all"
          >
            <span>Go to Study Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-medium">
          <button
            onClick={() => setAuthMode('personas')}
            className={`px-4 py-2 rounded-lg transition-all ${
              authMode === 'personas'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1-Click Demo Personas
          </button>
          <button
            onClick={() => setAuthMode('signin')}
            className={`px-4 py-2 rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Sign In
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`px-4 py-2 rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Learner Registration
          </button>
        </div>
      </div>

      {/* Mode 1: 1-Click Demo Personas */}
      {authMode === 'personas' && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Select Demo Student Persona (For Instant Evaluation)
            </h2>
            <p className="text-xs text-slate-500">
              Each persona simulates distinct knowledge distributions and prior misconceptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRESET_USERS.map(user => {
              const isCurrent = currentUser.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => handlePersonaSelect(user)}
                  className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md relative space-y-3.5 ${
                    isCurrent
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-stone-200/90 hover:border-indigo-300'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ACTIVE SESSION
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-amber-50 border border-amber-100">
                      {user.avatar}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{user.name}</h3>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-stone-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Academic Level:</span>
                      <span className="font-semibold text-slate-800">{user.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Daily Study Streak:</span>
                      <span className="font-semibold text-amber-700 flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-amber-500" /> {user.streakDays} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Velocity:</span>
                      <span className="font-semibold text-slate-800">{user.learningVelocity}</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-2.5 text-xs text-slate-700 border border-stone-200/70">
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                      Curricular Target
                    </span>
                    <p className="font-medium text-slate-800 line-clamp-2 mt-0.5">
                      {user.currentGoal}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePersonaSelect(user);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-indigo-600 hover:text-white text-slate-800'
                    }`}
                  >
                    <span>{isCurrent ? 'Continue as This Student' : 'Sign In as ' + user.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Student Sign In */}
      {authMode === 'signin' && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 max-w-md mx-auto shadow-sm space-y-5">
          <div className="space-y-1 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <LogIn className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Academic Sign In</h2>
            <p className="text-xs text-slate-500">
              Enter your student institutional email to restore your mastery graph.
            </p>
          </div>

          <form onSubmit={handleCustomSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Student Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="alex.chen@adaptive.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Password / Passkey</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                <span>Remember on this browser</span>
              </label>
              <span className="text-indigo-600 hover:underline cursor-pointer">Reset PIN</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>Sign In & Restore Knowledge Graph</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center">
            <span className="text-xs text-slate-500">
              Need a new student profile?{' '}
              <button
                onClick={() => setAuthMode('register')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Create one in 10 seconds
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Mode 3: New Learner Registration */}
      {authMode === 'register' && (
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto shadow-sm space-y-5">
          <div className="space-y-1 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">Create Student Profile</h2>
            <p className="text-xs text-slate-500">
              Calibrate your diagnostic baseline according to your experience level and focus.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Jordan Lee"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="jordan.lee@university.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Self-Assessed Skill Level</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      selectedLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Primary Learning Goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Master Core Data Structures & Python Internals">Master Core Data Structures & Python Internals</option>
                <option value="Pass Technical FAANG Software Engineering Interviews">Pass Technical FAANG Software Engineering Interviews</option>
                <option value="Deep Learning Math & Backpropagation Mastery">Deep Learning Math & Backpropagation Mastery</option>
                <option value="Full-Stack Web Architecture & Asynchronous JS">Full-Stack Web Architecture & Asynchronous JS</option>
                <option value="Overcome Core Coding Blindspots & Misconceptions">Overcome Core Coding Blindspots & Misconceptions</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <span>Initialize Adaptive Learning Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-stone-100 pt-4 text-center">
            <span className="text-xs text-slate-500">
              Already have a profile?{' '}
              <button
                onClick={() => setAuthMode('signin')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Academic Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 text-xs text-slate-600">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/80">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Bayesian Knowledge Tracing</span>
            <span className="text-slate-500">Continuous P(L) updates based on demonstration of mastery.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/80">
          <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Deep Root-Cause DAG Walk</span>
            <span className="text-slate-500">Pinpoints missing foundational concepts instead of surface errors.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-stone-200/80">
          <Library className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">Adaptive Item Selection</span>
            <span className="text-slate-500">Dynamic difficulty scaling paired with targeted micro-remediation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
