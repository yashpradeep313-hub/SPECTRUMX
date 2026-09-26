/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConceptNode, ConfidenceLevel, QuadrantType, ExplainabilityContext, QuestionDistractor, PythonQuestion, LearningPathItem } from '../types';

/**
 * Standard Bayesian Knowledge Tracing (Corbett & Anderson)
 * Calculates updated P(L) after an assessment event.
 */
export const calculateUpdatedBKT = (
  node: ConceptNode,
  isCorrect: boolean,
  confidence: ConfidenceLevel
): number => {
  const pL = node.pL;
  let pS = node.pS;
  let pG = node.pG;
  const pT = node.pT;

  // Adjust slip and guess based on metacognitive confidence rating!
  if (confidence === 'high') {
    pG = pG * 0.4; // If student said "high confidence" and got it right, guess probability is very low
    pS = pS * 0.5; // If high confidence and wrong, it's a deep misconception, not a casual slip!
  } else if (confidence === 'low') {
    pG = Math.min(0.60, pG * 1.8); // High chance of lucky guess
    pS = Math.min(0.40, pS * 1.5);
  }

  let pLEvidence: number;
  if (isCorrect) {
    // P(L | correct) = (P(L) * (1 - P(S))) / (P(L) * (1 - P(S)) + (1 - P(L)) * P(G))
    const num = pL * (1 - pS);
    const den = num + (1 - pL) * pG;
    pLEvidence = num / Math.max(den, 0.001);
  } else {
    // P(L | incorrect) = (P(L) * P(S)) / (P(L) * P(S)) + (1 - P(L)) * (1 - P(G)))
    const num = pL * pS;
    const den = num + (1 - pL) * (1 - pG);
    pLEvidence = num / Math.max(den, 0.001);
  }

  // Update with transition probability: P(L_next) = P(L|obs) + (1 - P(L|obs)) * P(T)
  const pLNext = pLEvidence + (1 - pLEvidence) * pT;

  return Math.min(0.99, Math.max(0.05, Number(pLNext.toFixed(3))));
};

/**
 * Classifies answer into the 2x2 Confidence vs Competence quadrant
 */
export const evaluateQuadrant = (
  isCorrect: boolean,
  confidence: ConfidenceLevel
): QuadrantType => {
  if (isCorrect) {
    return confidence === 'low' ? 'lucky_guess' : 'true_mastery';
  } else {
    return confidence === 'high' ? 'dangerous_misconception' : 'known_gap';
  }
};

/**
 * Root-Cause Prerequisite Discovery:
 * Traverses upstream in the DAG to locate the deepest unmastered prerequisite.
 */
export const findRootCausePrerequisite = (
  surfaceConceptId: string,
  taggedRootCauseId: string | undefined,
  nodes: Record<string, ConceptNode>
): {
  rootCauseNode: ConceptNode;
  pathTraversed: string[];
  isSurfaceSameAsRoot: boolean;
} => {
  const MASTERY_THRESHOLD = 0.65;

  // If distractor explicitly tagged a root cause, check it first
  if (taggedRootCauseId && nodes[taggedRootCauseId]) {
    const candidate = nodes[taggedRootCauseId];
    if (candidate.pL < MASTERY_THRESHOLD) {
      return {
        rootCauseNode: candidate,
        pathTraversed: [surfaceConceptId, taggedRootCauseId],
        isSurfaceSameAsRoot: surfaceConceptId === taggedRootCauseId
      };
    }
  }

  // Otherwise, traverse all upstream prerequisites to find the weakest link
  const visited = new Set<string>();
  const queue: string[] = [surfaceConceptId];
  let weakestNode: ConceptNode = nodes[surfaceConceptId] || Object.values(nodes)[0];
  let lowestScore = weakestNode.pL;
  const path: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    path.push(currentId);

    const currentNode = nodes[currentId];
    if (!currentNode) continue;

    // Check if this prerequisite has lower mastery
    if (currentNode.pL < lowestScore) {
      lowestScore = currentNode.pL;
      weakestNode = currentNode;
    }

    // Add immediate prerequisites
    for (const prereqId of currentNode.prerequisites) {
      if (!visited.has(prereqId)) {
        queue.push(prereqId);
      }
    }
  }

  return {
    rootCauseNode: weakestNode,
    pathTraversed: path,
    isSurfaceSameAsRoot: surfaceConceptId === weakestNode.id
  };
};

/**
 * Dynamically re-orders and generates the learning path
 * Prioritizes:
 * 1. Diagnosed Root-Cause Gaps (Remediation)
 * 2. Prerequisite concepts ready for progression
 * 3. Downstream blocked concepts queued for later
 */
export const generateDynamicLearningPath = (
  nodes: Record<string, ConceptNode>,
  activeGaps: string[]
): LearningPathItem[] => {
  const nodeList = Object.values(nodes);
  const pathItems: LearningPathItem[] = [];
  const gapSet = new Set(activeGaps);

  // 1. Critical Remediation Gaps first
  const gapNodes = nodeList.filter(n => gapSet.has(n.id) || n.status === 'diagnosed_gap');
  gapNodes.forEach((node, idx) => {
    pathItems.push({
      conceptId: node.id,
      conceptName: node.name,
      order: pathItems.length + 1,
      isRemediation: true,
      priority: 'critical',
      reason: `Diagnosed root-cause knowledge gap (Mastery P(L) = ${Math.round(node.pL * 100)}%). Must remediate before progressing.`,
      status: 'active'
    });
  });

  // 2. In-progress concepts whose prerequisites are fulfilled
  const inProgressNodes = nodeList.filter(
    n => !gapSet.has(n.id) && n.status === 'in_progress'
  );
  inProgressNodes.sort((a, b) => a.tier - b.tier);

  inProgressNodes.forEach(node => {
    const allPrereqsMet = node.prerequisites.every(
      pId => nodes[pId]?.status === 'mastered'
    );
    pathItems.push({
      conceptId: node.id,
      conceptName: node.name,
      order: pathItems.length + 1,
      isRemediation: false,
      priority: allPrereqsMet ? 'high' : 'normal',
      reason: allPrereqsMet
        ? 'Prerequisites satisfied. Optimal next concept in sequence.'
        : 'Prerequisites in progress. Queued for upcoming cycle.',
      status: allPrereqsMet ? 'active' : 'queued'
    });
  });

  // 3. Locked future concepts
  const lockedNodes = nodeList.filter(n => n.status === 'locked');
  lockedNodes.sort((a, b) => a.tier - b.tier);
  lockedNodes.forEach(node => {
    pathItems.push({
      conceptId: node.id,
      conceptName: node.name,
      order: pathItems.length + 1,
      isRemediation: false,
      priority: 'normal',
      reason: 'Advanced synthesis. Blocked until foundational nodes reach >75% mastery.',
      status: 'queued'
    });
  });

  return pathItems;
};

/**
 * Builds the explainability rationale card
 */
export const buildExplainabilityReason = (
  question: PythonQuestion,
  chosenDistractor: QuestionDistractor,
  rootCauseNode: ConceptNode,
  surfaceNode: ConceptNode,
  quadrant: QuadrantType
): string => {
  const misconceptionText = chosenDistractor.misconceptionLabel || 'conceptual misconception';
  
  if (surfaceNode.id === rootCauseNode.id) {
    return `You selected the "${misconceptionText}" distractor. Your mastery in ${surfaceNode.name} dropped to ${Math.round(rootCauseNode.pL * 100)}%. The system flagged this as an immediate gap.`;
  }

  const dangerPrefix = quadrant === 'dangerous_misconception'
    ? '⚠️ High Confidence Warning: '
    : '';

  return `${dangerPrefix}You were tested on ${surfaceNode.name}, but chose the distractor indicating "${misconceptionText}". The system traced this error upstream to its true prerequisite: ${rootCauseNode.name} (current mastery is only ${Math.round(rootCauseNode.pL * 100)}%). We rewound the learning path to remediate this foundational prerequisite first.`;
};
