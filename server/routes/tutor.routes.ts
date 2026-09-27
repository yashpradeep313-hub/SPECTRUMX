/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { geminiService } from '../services/gemini.service';

const router = Router();

// POST AI Tutor chat proxy
router.post('/tutor', async (req: Request, res: Response) => {
  try {
    const { studentName, focusConceptName, userQuery, mode, activeMisconceptions } = req.body;

    const result = await geminiService.queryTutor({
      studentName,
      focusConceptName,
      userQuery,
      mode,
      activeMisconceptions,
    });

    res.json({
      success: true,
      response: result.response,
      isAi: result.isAi,
    });
  } catch (error: any) {
    console.error('[TutorRoute] Error in tutor endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Generate Real-Time Study Guide based on Syllabus + PYQ + Progress
router.post('/generate-study-guide', async (req: Request, res: Response) => {
  try {
    const { studentLevel, completedChapterIds } = req.body;
    const syllabus = dbStore.getCurrentSyllabus();
    const pyqs = dbStore.getPyqs();

    const result = await geminiService.generateStudyGuide({
      syllabus,
      pyqs,
      studentLevel,
      completedChapterIds,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[TutorRoute] Error generating study guide:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
