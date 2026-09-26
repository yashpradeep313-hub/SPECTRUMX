/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Concept } from '../types';
import { CheckCircle2, AlertTriangle, Lock, BookOpen, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface ConceptGraphProps {
  concepts: Concept[];
  onSelectConcept?: (concept: Concept) => void;
  selectedConceptId?: string | null;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  concepts,
  onSelectConcept,
  selectedConceptId
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Position concepts in an organized DAG layout across layers
  const layers: Concept[][] = [];
  const conceptMap = new Map<string, Concept>(concepts.map(c => [c.id, c]));

  // Calculate depth for each concept based on prerequisite chain
  const getDepth = (id: string, visited = new Set<string>()): number => {
    if (visited.has(id)) return 0;
    visited.add(id);
    const concept = conceptMap.get(id);
    if (!concept || concept.prerequisites.length === 0) return 0;
    const prereqDepths = concept.prerequisites.map(p => getDepth(p, new Set(visited)));
    return 1 + Math.max(...prereqDepths, 0);
  };

  const depthMap = new Map<string, number>();
  concepts.forEach(c => {
    depthMap.set(c.id, getDepth(c.id));
  });

  const maxDepth = Math.max(...Array.from(depthMap.values()), 0);
  for (let d = 0; d <= maxDepth; d++) {
    layers[d] = concepts.filter(c => depthMap.get(c.id) === d);
  }

  // Coordinates
  const svgWidth = 840;
  const svgHeight = Math.max(340, (maxDepth + 1) * 95);
  const layerHeight = svgHeight / (maxDepth + 1);

  const nodeCoords = new Map<string, { x: number; y: number }>();
  layers.forEach((layer, layerIdx) => {
    const layerY = (layerIdx + 0.5) * layerHeight;
    const spacing = svgWidth / (layer.length + 1);
    layer.forEach((c, idx) => {
      nodeCoords.set(c.id, {
        x: (idx + 1) * spacing,
        y: layerY
      });
    });
  });

  const getStatusColor = (status: Concept['status']) => {
    switch (status) {
      case 'mastered':
        return {
          bg: 'fill-emerald-950/80 stroke-emerald-500',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          text: 'text-emerald-300',
          glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
        };
      case 'gap':
        return {
          bg: 'fill-rose-950/80 stroke-rose-500',
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          text: 'text-rose-300',
          glow: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
        };
      case 'blocked':
        return {
          bg: 'fill-slate-900/90 stroke-slate-700',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          text: 'text-slate-400',
          glow: ''
        };
      case 'learning':
        return {
          bg: 'fill-indigo-950/80 stroke-indigo-500',
          badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          text: 'text-indigo-300',
          glow: 'drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]'
        };
      default:
        return {
          bg: 'fill-slate-900/60 stroke-slate-700',
          badge: 'bg-slate-800/60 text-slate-400 border-slate-700',
          text: 'text-slate-300',
          glow: ''
        };
    }
  };

  const getStatusIcon = (status: Concept['status']) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'gap':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'blocked':
        return <Lock className="w-3.5 h-3.5 text-slate-500" />;
      case 'learning':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 overflow-hidden">
      {/* Top Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Prerequisite Knowledge Dependency Map</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px]">
            Directed Acyclic Graph
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Root Knowledge Gap
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Blocked Prerequisite
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[700px] h-auto select-none"
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gapEdgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
            </linearGradient>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="gapArrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render Connection Edges */}
          {concepts.map(concept => {
            const targetCoord = nodeCoords.get(concept.id);
            if (!targetCoord) return null;

            return concept.prerequisites.map(prereqId => {
              const sourceCoord = nodeCoords.get(prereqId);
              if (!sourceCoord) return null;

              const isGapPath = concept.status === 'gap' || conceptMap.get(prereqId)?.status === 'gap';
              const isHighlight = hoveredId === concept.id || hoveredId === prereqId;

              // Cubic bezier curve for smooth organic flowchart aesthetics
              const deltaY = targetCoord.y - sourceCoord.y;
              const controlY1 = sourceCoord.y + deltaY * 0.5;
              const controlY2 = targetCoord.y - deltaY * 0.5;
              const pathD = `M ${sourceCoord.x} ${sourceCoord.y + 24} C ${sourceCoord.x} ${controlY1}, ${targetCoord.x} ${controlY2}, ${targetCoord.x} ${targetCoord.y - 24}`;

              return (
                <g key={`${prereqId}->${concept.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isGapPath ? '#f43f5e' : isHighlight ? '#818cf8' : '#334155'}
                    strokeWidth={isHighlight ? 2.5 : isGapPath ? 2 : 1.5}
                    strokeDasharray={isGapPath ? '4 3' : 'none'}
                    markerEnd={isGapPath ? 'url(#gapArrow)' : 'url(#arrow)'}
                    className="transition-colors duration-200"
                  />
                </g>
              );
            });
          })}

          {/* Render Concept Nodes */}
          {concepts.map(concept => {
            const coord = nodeCoords.get(concept.id);
            if (!coord) return null;

            const style = getStatusColor(concept.status);
            const isSelected = selectedConceptId === concept.id;
            const isHovered = hoveredId === concept.id;
            const width = 170;
            const height = 54;

            return (
              <g
                key={concept.id}
                transform={`translate(${coord.x - width / 2}, ${coord.y - height / 2})`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectConcept && onSelectConcept(concept)}
                onMouseEnter={() => setHoveredId(concept.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Outer Glow on hover or selection */}
                {(isSelected || isHovered) && (
                  <rect
                    width={width + 8}
                    height={height + 8}
                    x={-4}
                    y={-4}
                    rx={14}
                    className="fill-indigo-500/20 stroke-indigo-400 stroke-2"
                  />
                )}

                {/* Node Box */}
                <rect
                  width={width}
                  height={height}
                  rx={12}
                  className={`${style.bg} stroke-[1.5] ${style.glow} transition-colors`}
                />

                {/* Progress bar inside node bottom */}
                <rect
                  x={1}
                  y={height - 4}
                  width={Math.max(0, (width - 2) * (concept.masteryScore / 100))}
                  height={3}
                  rx={1.5}
                  className={concept.status === 'gap' ? 'fill-rose-500' : 'fill-emerald-400'}
                />

                {/* Status Indicator Icon */}
                <foreignObject x={8} y={8} width={20} height={20}>
                  <div className="flex items-center justify-center">
                    {getStatusIcon(concept.status)}
                  </div>
                </foreignObject>

                {/* Concept Title */}
                <text
                  x={32}
                  y={22}
                  fontSize={11.5}
                  fontWeight={600}
                  fill="#f1f5f9"
                  className="font-medium"
                >
                  {concept.name.length > 18 ? `${concept.name.slice(0, 17)}…` : concept.name}
                </text>

                {/* Category & Mastery subtext */}
                <text
                  x={32}
                  y={38}
                  fontSize={9.5}
                  fill="#94a3b8"
                >
                  {concept.category} • {concept.masteryScore}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>💡 Click any concept node to inspect prerequisite blockers and mastery metrics</span>
        <span className="text-slate-500">Auto-calibrated via Bayesian Knowledge Tracing</span>
      </div>
    </div>
  );
};
