/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Brain, Cpu, FileSearch } from 'lucide-react';

interface AiLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export const AiLoadingOverlay: React.FC<AiLoadingOverlayProps> = ({
  isVisible,
  message = 'AI Engine is Thinking...',
  subMessage = 'Analyzing knowledge dependencies, paper pattern & BKT parameters'
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{ backdropFilter: 'blur(8px)' }}
      className="fixed inset-0 z-[9999] bg-slate-950/80 flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center space-y-6 text-center max-w-sm">
        {/* Centered Glowing Neon Loader Ring */}
        <div className="relative flex items-center justify-center">
          <div className="neon-loader-ring" />
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Text Messages */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>GEMINI 3.8 FLASH ENGINE</span>
          </div>

          <h3 className="text-lg font-bold text-white font-serif tracking-tight drop-shadow-sm">
            {message}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-sans">
            {subMessage}
          </p>
        </div>

        {/* Floating progress indicator */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
};
