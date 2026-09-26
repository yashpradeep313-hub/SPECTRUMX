/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConceptNode, NodeStatus } from '../types';
import { CheckCircle2, AlertTriangle, Lock, Sparkles, ZoomIn, ZoomOut, RotateCcw, ArrowRight, Brain, Target, ShieldAlert } from 'lucide-react';

interface KnowledgeGraphViewProps {
  nodes: Record<string, ConceptNode>;
  selectedNodeId?: string | null;
  onSelectNode: (node: ConceptNode) => void;
  rootCauseGapNodeId?: string | null;
  surfaceFailedNodeId?: string | null;
  rewindPathNodeIds?: string[];
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  rootCauseGapNodeId,
  surfaceFailedNodeId,
  rewindPathNodeIds = []
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodeList: ConceptNode[] = Object.values(nodes);

  // Layout concepts across 5 tiers (Tier 0 to 4)
  const tiers: ConceptNode[][] = [[], [], [], [], []];
  nodeList.forEach(node => {
    const t = Math.min(4, Math.max(0, node.tier));
    tiers[t].push(node);
  });

  const svgWidth = 1050;
  const svgHeight = 520;
  const layerWidth = svgWidth / (tiers.length + 0.6);

  // Calculate coordinates: X by tier, Y distributed evenly
  const nodePositions = new Map<string, { x: number; y: number }>();
  tiers.forEach((tierNodes, tierIdx) => {
    const x = (tierIdx + 0.75) * layerWidth;
    const count = tierNodes.length;
    const spacingY = (svgHeight - 70) / (count + 1);

    tierNodes.forEach((node, nodeIdx) => {
      const y = 45 + (nodeIdx + 1) * spacingY;
      nodePositions.set(node.id, { x, y });
    });
  });

  const getNodeVisuals = (node: ConceptNode) => {
    const isRootGap = node.id === rootCauseGapNodeId;
    const isSurfaceFailed = node.id === surfaceFailedNodeId;

    if (isRootGap) {
      return {
        bg: 'fill-rose-50 stroke-rose-600',
        ring: 'stroke-rose-500 stroke-2 animate-pulse',
        badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        glow: 'drop-shadow-[0_0_12px_rgba(225,29,72,0.45)]',
        textColor: 'fill-rose-950 font-bold',
        label: 'ROOT CAUSE GAP'
      };
    }

    if (isSurfaceFailed) {
      return {
        bg: 'fill-amber-50 stroke-amber-500',
        ring: 'stroke-amber-400 stroke-2',
        badge: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        glow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.35)]',
        textColor: 'fill-amber-950 font-bold',
        label: 'SURFACE MISS'
      };
    }

    switch (node.status) {
      case 'mastered':
        return {
          bg: 'fill-emerald-50 stroke-emerald-600',
          ring: '',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          glow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]',
          textColor: 'fill-emerald-950 font-bold',
          label: 'MASTERED'
        };
      case 'diagnosed_gap':
        return {
          bg: 'fill-rose-50 stroke-rose-600',
          ring: 'stroke-rose-500 animate-pulse',
          badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          glow: 'drop-shadow-[0_0_10px_rgba(225,29,72,0.4)]',
          textColor: 'fill-rose-950 font-bold',
          label: 'DIAGNOSED GAP'
        };
      case 'in_progress':
        return {
          bg: 'fill-amber-50/80 stroke-amber-500',
          ring: '',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          glow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]',
          textColor: 'fill-amber-950 font-semibold',
          label: 'IN PROGRESS'
        };
      case 'locked':
      default:
        return {
          bg: 'fill-stone-100 stroke-stone-300',
          ring: '',
          badge: 'bg-stone-200 text-stone-600 border-stone-300',
          glow: '',
          textColor: 'fill-stone-500',
          label: 'LOCKED'
        };
    }
  };

  const rewindSet = new Set(rewindPathNodeIds);

  return (
    <div className="relative bg-white border border-stone-200/90 rounded-2xl p-5 shadow-sm overflow-hidden">
      {/* Graph Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-2 border-b border-stone-200/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 font-serif text-sm">
              Live Knowledge Dependency Graph (DAG)
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
                {nodeList.length} Nodes • BKT Engine
              </span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Live Bayesian updates after every answer • Red pulses pinpoint diagnosed prerequisite gaps
            </span>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 shadow-sm" /> Mastered (P&gt;70%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600" /> In Progress
          </span>
          <span className="flex items-center gap-1.5 text-rose-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600 animate-ping" /> Root-Cause Gap
          </span>
          <span className="flex items-center gap-1.5 text-stone-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300 border border-stone-400" /> Locked Prerequisite
          </span>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 pl-2 border-l border-stone-200">
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto rounded-xl bg-[#FAF9F6] border border-stone-200/80 p-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[850px] transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          <defs>
            {/* Studious grid pattern */}
            <pattern id="lightGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
            </pattern>

            {/* Arrowhead markers */}
            <marker id="arrow-default" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94A3B8" />
            </marker>
            <marker id="arrow-mastered" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669" />
            </marker>
            <marker id="arrow-gap-rewind" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#E11D48" />
            </marker>
            <marker id="arrow-highlight" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4F46E5" />
            </marker>
          </defs>

          {/* Grid Background */}
          <rect width={svgWidth} height={svgHeight} fill="url(#lightGrid)" />

          {/* Tier Column Headers */}
          {['Tier 0: Syntax Primitives', 'Tier 1: Control Flow', 'Tier 2: Compound Structures', 'Tier 3: Modular Abstraction', 'Tier 4: Synthesis & Internals'].map((tierName, idx) => {
            const x = (idx + 0.75) * layerWidth;
            return (
              <g key={idx}>
                <line x1={x} y1={20} x2={x} y2={svgHeight - 15} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                <text x={x} y={22} textAnchor="middle" fill="#64748B" fontSize="10.5" fontFamily="monospace" fontWeight="600">
                  {tierName}
                </text>
              </g>
            );
          })}

          {/* Directed Edges (Prerequisite Arrows) */}
          {nodeList.map(targetNode => {
            const targetPos = nodePositions.get(targetNode.id);
            if (!targetPos) return null;

            return targetNode.prerequisites.map(prereqId => {
              const sourcePos = nodePositions.get(prereqId);
              if (!sourcePos) return null;

              const isRewindPath = rewindSet.has(prereqId) && (targetNode.id === surfaceFailedNodeId || rewindSet.has(targetNode.id));
              const isMasteredEdge = targetNode.status === 'mastered' && nodes[prereqId]?.status === 'mastered';
              const isSelectedEdge = hoveredNodeId === targetNode.id || hoveredNodeId === prereqId;

              // Smooth Bezier Curve from Source to Target
              const dx = targetPos.x - sourcePos.x;
              const controlPointOffset = dx * 0.45;
              const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + controlPointOffset} ${sourcePos.y}, ${targetPos.x - controlPointOffset} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;

              let strokeColor = '#CBD5E1';
              let strokeWidth = 1.75;
              let strokeDash = '';
              let marker = 'url(#arrow-default)';

              if (isRewindPath) {
                strokeColor = '#E11D48';
                strokeWidth = 3.5;
                strokeDash = '6 3';
                marker = 'url(#arrow-gap-rewind)';
              } else if (isSelectedEdge) {
                strokeColor = '#4F46E5';
                strokeWidth = 2.5;
                marker = 'url(#arrow-highlight)';
              } else if (isMasteredEdge) {
                strokeColor = '#059669';
                strokeWidth = 2;
                marker = 'url(#arrow-mastered)';
              }

              return (
                <g key={`${prereqId}->${targetNode.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    markerEnd={marker}
                    className="transition-all duration-300"
                  />
                  {isRewindPath && (
                    <text
                      x={(sourcePos.x + targetPos.x) / 2}
                      y={(sourcePos.y + targetPos.y) / 2 - 8}
                      fill="#E11D48"
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="animate-pulse"
                    >
                      REWIND PATH
                    </text>
                  )}
                </g>
              );
            });
          })}

          {/* Concept Nodes */}
          {nodeList.map(node => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const visuals = getNodeVisuals(node);
            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const isRootGap = node.id === rootCauseGapNodeId;
            const isSurfaceMiss = node.id === surfaceFailedNodeId;
            const pct = Math.round(node.pL * 100);

            const cardWidth = 150;
            const cardHeight = 52;
            const rectX = pos.x - cardWidth / 2;
            const rectY = pos.y - cardHeight / 2;

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-all duration-200"
                style={{ filter: visuals.glow }}
              >
                {/* Node Box */}
                <rect
                  x={rectX}
                  y={rectY}
                  width={cardWidth}
                  height={cardHeight}
                  rx="10"
                  className={`${visuals.bg} stroke-[1.5] transition-all duration-200 ${
                    isSelected ? 'stroke-indigo-600 stroke-[2.5]' : ''
                  } ${isHovered ? 'stroke-indigo-500' : ''}`}
                />

                {/* Pulsing Outline for Root Cause Gap */}
                {isRootGap && (
                  <rect
                    x={rectX - 4}
                    y={rectY - 4}
                    width={cardWidth + 8}
                    height={cardHeight + 8}
                    rx="14"
                    fill="none"
                    stroke="#E11D48"
                    strokeWidth="2.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Label: Concept Name */}
                <text
                  x={pos.x}
                  y={pos.y - 6}
                  textAnchor="middle"
                  className={`${visuals.textColor} text-[11.5px] select-none`}
                >
                  {node.name.length > 20 ? node.name.slice(0, 19) + '…' : node.name}
                </text>

                {/* Node Subtitle: Status & Bayesian Probability */}
                <text
                  x={pos.x}
                  y={pos.y + 12}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="select-none"
                >
                  {isRootGap
                    ? '⚠️ ROOT CAUSE'
                    : isSurfaceMiss
                    ? '⚡ SURFACE MISS'
                    : `${visuals.label} · P(L)=${pct}%`}
                </text>

                {/* Small indicator dot on top right */}
                <circle
                  cx={rectX + cardWidth - 10}
                  cy={rectY + 10}
                  r="3.5"
                  fill={
                    isRootGap
                      ? '#E11D48'
                      : node.status === 'mastered'
                      ? '#059669'
                      : node.status === 'in_progress'
                      ? '#D97706'
                      : '#94A3B8'
                  }
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Graph Footer Explanation */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-stone-200/80">
        <span className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-600" />
          <span>Click any concept to open its targeted micro-lesson and interactive verification question.</span>
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Root-Cause Algorithm: BFS Prerequisite DAG Walk + Misconception Matrix
        </span>
      </div>
    </div>
  );
};
