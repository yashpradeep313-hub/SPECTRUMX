/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { bktService } from '../services/bkt.service';
import { ConceptNode, ConfidenceLevel } from '../../types';

const router = Router();

// POST update BKT for a concept
router.post('/update', (req: Request, res: Response) => {
  try {
    const {
      userId = 'user-alex',
      courseId = 'python-core',
      node,
      isCorrect,
      confidence = 'medium',
      taggedRootCauseId,
      allNodes = {},
    } = req.body;

    if (!node) {
      return res.status(400).json({ success: false, error: 'Concept node is required.' });
    }

    const priorMastery = node.pL;
    const updatedMastery = bktService.calculateUpdatedBKT(node, Boolean(isCorrect), confidence as ConfidenceLevel);
    const quadrant = bktService.evaluateQuadrant(Boolean(isCorrect), confidence as ConfidenceLevel);

    const rootCauseAnalysis = bktService.findRootCausePrerequisite(
      node.id,
      taggedRootCauseId,
      allNodes
    );

    // Update node in allNodes map
    const updatedNode: ConceptNode = {
      ...node,
      pL: updatedMastery,
      attemptsCount: (node.attemptsCount || 0) + 1,
      correctCount: isCorrect ? (node.correctCount || 0) + 1 : (node.correctCount || 0),
      status: updatedMastery >= 0.85 ? 'mastered' : updatedMastery < 0.5 ? 'diagnosed_gap' : 'in_progress',
      lastAssessed: new Date().toISOString(),
    };

    const newNodes = {
      ...allNodes,
      [node.id]: updatedNode,
    };

    // Save BKT state to database
    dbStore.saveBktState(userId, courseId, newNodes);

    res.json({
      success: true,
      priorMastery,
      updatedMastery,
      quadrant,
      rootCauseAnalysis,
      updatedNode,
    });
  } catch (error: any) {
    console.error('[BktRoute] Error updating BKT:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET BKT State for user and course
router.get('/state/:userId/:courseId', (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const courseId = String(req.params.courseId);
  const state = dbStore.getBktState(userId, courseId);
  res.json({
    success: true,
    state: state || null,
  });
});

// POST save entire BKT node state
router.post('/state', (req: Request, res: Response) => {
  try {
    const { userId = 'user-alex', courseId = 'python-core', nodes } = req.body;
    if (!nodes) {
      return res.status(400).json({ success: false, error: 'Nodes map is required.' });
    }

    const saved = dbStore.saveBktState(userId, courseId, nodes);
    res.json({
      success: true,
      state: saved,
    });
  } catch (error: any) {
    console.error('[BktRoute] Error saving BKT state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST generate learning path from current nodes
router.post('/learning-path', (req: Request, res: Response) => {
  try {
    const { nodes } = req.body;
    if (!nodes || typeof nodes !== 'object') {
      return res.status(400).json({ success: false, error: 'Nodes map is required.' });
    }

    const path = bktService.generateLearningPath(nodes);
    res.json({
      success: true,
      learningPath: path,
    });
  } catch (error: any) {
    console.error('[BktRoute] Error generating learning path:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
