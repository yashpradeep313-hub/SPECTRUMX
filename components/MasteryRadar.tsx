/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Concept, BloomsTaxonomy } from '../types';
import { Award, Zap, Target, BookOpen, Brain, TrendingUp } from 'lucide-react';

interface MasteryRadarProps {
  concepts: Concept[];
  bloomsAffinity: Record<BloomsTaxonomy, number>;
  overallMastery: number;
}

export const MasteryRadar: React.FC<MasteryRadarProps> = ({
  concepts,
  bloomsAffinity,
  overallMastery
}) => {
  const bloomsKeys: Array<{ key: BloomsTaxonomy; label: string; icon: string }> = [
    { key: 'remember', label: 'Remembering', icon: '🧠' },
    { key: 'understand', label: 'Understanding', icon: '💡' },
    { key: 'apply', label: 'Applying', icon: '⚡' },
    { key: 'analyze', label: 'Analyzing', icon: '🔍' },
    { key: 'evaluate', label: 'Evaluating', icon: '⚖️' },
  ];

  // SVG Radar Dimensions
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const totalAxes = bloomsKeys.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate web background polygons (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1];
  const levelPolygons = levels.map(lvl => {
    return bloomsKeys.map((_, i) => {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const r = lvl * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
  });

  // Calculate polygon points for student's blooms values
  const studentPolygon = bloomsKeys.map((item, i) => {
    const val = Math.max(15, bloomsAffinity[item.key] || 20);
    const coords = getCoordinates(i, val);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Bloom's Cognitive Radar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-200">Bloom's Taxonomy Cognitive Profile</h4>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Cognitive Depth
          </span>
        </div>

        <div className="flex items-center justify-center my-2">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background Grid webs */}
            {levelPolygons.map((points, idx) => (
              <polygon
                key={idx}
                points={points}
                fill="none"
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
              />
            ))}

            {/* Radial Axis Lines */}
            {bloomsKeys.map((_, i) => {
              const edgeCoord = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={edgeCoord.x}
                  y2={edgeCoord.y}
                  stroke="#334155"
                  strokeWidth={1}
                />
              );
            })}

            {/* Student Mastery Area */}
            <polygon
              points={studentPolygon}
              fill="rgba(99, 102, 241, 0.35)"
              stroke="#6366f1"
              strokeWidth={2.5}
            />

            {/* Vertex Dots */}
            {bloomsKeys.map((item, i) => {
              const val = Math.max(15, bloomsAffinity[item.key] || 20);
              const coords = getCoordinates(i, val);
              return (
                <circle
                  key={i}
                  cx={coords.x}
                  cy={coords.y}
                  r={4}
                  className="fill-indigo-400 stroke-slate-900 stroke-2"
                />
              );
            })}

            {/* Axis Labels */}
            {bloomsKeys.map((item, i) => {
              const labelCoord = getCoordinates(i, 122);
              return (
                <text
                  key={i}
                  x={labelCoord.x}
                  y={labelCoord.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10.5}
                  fontWeight={500}
                  fill="#94a3b8"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
        </div>

        <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Overall Competency:</span>
          <span className="font-bold text-indigo-300 text-sm">{overallMastery}% Mastery</span>
        </div>
      </div>

      {/* Topic-Level Concept Mastery Bars */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-200">Concept-Level Mastery Breakdown</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {concepts.filter(c => c.status === 'mastered').length}/{concepts.length} Mastered
          </span>
        </div>

        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          {concepts.map(concept => {
            const isGap = concept.status === 'gap';
            const isMastered = concept.status === 'mastered';
            return (
              <div key={concept.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-300">
                    <span className="truncate max-w-[210px]">{concept.name}</span>
                    {isGap && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                        Gap
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-400">
                    {concept.masteryScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGap
                        ? 'bg-rose-500'
                        : isMastered
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(5, concept.masteryScore)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 mt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Dynamic IRT Difficulty Tracking
          </span>
          <span className="text-indigo-400 font-medium">Auto-updated</span>
        </div>
      </div>
    </div>
  );
};
