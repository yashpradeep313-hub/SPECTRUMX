/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConceptNode, ConfidenceLevel, QuadrantType, LearningPathItem } from '../../types';

export class BktService {
  /**
   * Standard Bayesian Knowledge Tracing (Corbett & Anderson)
   * Calculates updated P(L) after an assessment event.
   */
  calculateUpdatedBKT(
    node: ConceptNode,
    isCorrect: boolean,
    confidence: ConfidenceLevel = 'medium'
  ): number {
    const pL = node.pL;
    let pS = node.pS;
    let pG = node.pG;
    const pT = node.pT;

    // Adjust slip and guess based on metacognitive confidence rating
    if (confidence === 'high') {
      pG = pG * 0.4;
      pS = pS * 0.5;
    } else if (confidence === 'low') {
      pG = Math.min(0.6, pG * 1.8);
      pS = Math.min(0.4, pS * 1.5);
    }

    let pLEvidence: number;
    if (isCorrect) {
      const num = pL * (1 - pS);
      const den = num + (1 - pL) * pG;
      pLEvidence = num / Math.max(den, 0.001);
    } else {
      const num = pL * pS;
      const den = num + (1 - pL) * (1 - pG);
      pLEvidence = num / Math.max(den, 0.001);
    }

    // P(L_next) = P(L|obs) + (1 - P(L|obs)) * P(T)
    const pLNext = pLEvidence + (1 - pLEvidence) * pT;
    return Math.min(0.99, Math.max(0.05, Number(pLNext.toFixed(3))));
  }

  /**
   * Evaluates quadrant based on correctness and confidence
   */
  evaluateQuadrant(isCorrect: boolean, confidence: ConfidenceLevel): QuadrantType {
    if (isCorrect) {
      return confidence === 'low' ? 'lucky_guess' : 'true_mastery';
    } else {
      return confidence === 'high' ? 'dangerous_misconception' : 'known_gap';
    }
  }

  /**
   * Traverses upstream in DAG to pinpoint root-cause unmastered prerequisite
   */
  findRootCausePrerequisite(
    surfaceConceptId: string,
    taggedRootCauseId: string | undefined,
    nodes: Record<string, ConceptNode>
  ): {
    rootCauseNode: ConceptNode;
    pathTraversed: string[];
    isSurfaceSameAsRoot: boolean;
  } {
    const MASTERY_THRESHOLD = 0.65;

    if (taggedRootCauseId && nodes[taggedRootCauseId]) {
      const candidate = nodes[taggedRootCauseId];
      if (candidate.pL < MASTERY_THRESHOLD) {
        return {
          rootCauseNode: candidate,
          pathTraversed: [surfaceConceptId, taggedRootCauseId],
          isSurfaceSameAsRoot: surfaceConceptId === taggedRootCauseId,
        };
      }
    }

    const visited = new Set<string>();
    const queue: string[] = [surfaceConceptId];
    let weakestNode: ConceptNode = nodes[surfaceConceptId] || Object.values(nodes)[0];
    let lowestScore = weakestNode?.pL ?? 0.5;
    const path: string[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      path.push(currentId);

      const currentNode = nodes[currentId];
      if (!currentNode) continue;

      if (currentNode.pL < lowestScore) {
        lowestScore = currentNode.pL;
        weakestNode = currentNode;
      }

      for (const prereqId of currentNode.prerequisites || []) {
        if (!visited.has(prereqId)) {
          queue.push(prereqId);
        }
      }
    }

    return {
      rootCauseNode: weakestNode,
      pathTraversed: path,
      isSurfaceSameAsRoot: surfaceConceptId === weakestNode?.id,
    };
  }

  /**
   * Generates dynamic learning path prioritizing unmastered prerequisites
   */
  generateLearningPath(nodes: Record<string, ConceptNode>): LearningPathItem[] {
    const nodeList = Object.values(nodes);
    const unmastered = nodeList.filter(n => n.pL < 0.7);

    // Topological sorting by tier and prerequisites
    const sorted = [...unmastered].sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.pL - b.pL;
    });

    return sorted.map((node, idx) => ({
      conceptId: node.id,
      conceptName: node.name,
      order: idx + 1,
      isRemediation: node.pL < 0.5,
      priority: node.pL < 0.4 ? 'critical' : node.pL < 0.65 ? 'high' : 'normal',
      reason:
        node.pL < 0.4
          ? `Urgent: Foundational prerequisite gap detected (P(L) = ${Math.round(node.pL * 100)}%)`
          : `Recommended: Solidify mastery to unlock downstream concepts (P(L) = ${Math.round(node.pL * 100)}%)`,
      status: idx === 0 ? 'active' : 'queued',
    }));
  }
}

export const bktService = new BktService();
