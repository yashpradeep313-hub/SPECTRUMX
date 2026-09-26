/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { queryAiTutor } from '../services/geminiService';
import { Sparkles, MessageSquare, BookOpen, Lightbulb, Code2, HelpCircle, X, Send, Loader2, Bot } from 'lucide-react';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conceptName: string;
  initialMisconception?: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  conceptName,
  initialMisconception
}) => {
  const [mode, setMode] = useState<'eli5' | 'practical' | 'academic' | 'socratic'>('eli5');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string; mode?: string }>>([
    {
      sender: 'tutor',
      text: initialMisconception
        ? `Hello! I noticed you might be wrestling with: "${initialMisconception}". Let's unpack "${conceptName}". Choose a teaching style above or ask me anything!`
        : `Hello! I'm your Synapse Adaptive AI Tutor for "${conceptName}". Pick an explanation modality or ask any specific question.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend: string, requestedMode = mode) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const tutorResponse = await queryAiTutor(conceptName, userMsg, requestedMode);
      setMessages(prev => [...prev, { sender: 'tutor', text: tutorResponse, mode: requestedMode }]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: `Here is a foundational hint: Focus on the base contract of ${conceptName} and trace the execution step-by-step.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    handleSendPrompt(`Explain ${conceptName} using this style`, newMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-l border-stone-200 w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-serif">
                Synapse Socratic AI Tutor
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                Focus Concept: <span className="text-slate-800 font-semibold">{conceptName}</span>
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

        {/* 4 Modality Toggles */}
        <div className="p-3 bg-stone-50 border-b border-stone-200">
          <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider font-mono">
            Teaching Modality:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleModeChange('eli5')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'eli5'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-stone-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Intuitive Analogy (ELI5)</span>
            </button>

            <button
              onClick={() => handleModeChange('practical')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'practical'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-stone-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Practical Code Example</span>
            </button>

            <button
              onClick={() => handleModeChange('academic')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'academic'
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-sm font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic & Formal</span>
            </button>

            <button
              onClick={() => handleModeChange('socratic')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === 'socratic'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-sm font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-stone-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>Socratic Hint Guided</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-stone-50 border border-stone-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.mode && (
                  <span className="text-[10px] font-mono block opacity-70 uppercase font-semibold">
                    Style: {msg.mode}
                  </span>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Tutor is formulating pedagogical response...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-stone-50/70 border-t border-stone-200 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-slate-400 font-mono text-[10px] uppercase">Quick Hints:</span>
          {[
            'Why does my code return None?',
            'Give a real-world memory analogy',
            'How is this tested in interviews?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(prompt)}
              className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPrompt(inputValue)}
            placeholder={`Ask about ${conceptName}...`}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendPrompt(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
