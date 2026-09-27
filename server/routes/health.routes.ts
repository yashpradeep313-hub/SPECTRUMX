/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { getGeminiClient } from '../config';
import { dbStore } from '../db/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const ai = getGeminiClient();
  const currentSyllabus = dbStore.getCurrentSyllabus();
  const pyqs = dbStore.getPyqs();
  const users = dbStore.getUsers();
  const courses = dbStore.getCourses();

  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    geminiConfigured: Boolean(ai),
    activeSyllabus: currentSyllabus.courseTitle,
    syllabusLoaded: Boolean(currentSyllabus),
    pyqCount: pyqs.length,
    usersCount: users.length,
    coursesCount: courses.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
