/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { dbStore } from '../db/store';
import { geminiService } from '../services/gemini.service';
import { CourseMetadata } from '../../types';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 },
});

// GET current active syllabus
router.get('/syllabus', (req: Request, res: Response) => {
  const syllabus = dbStore.getCurrentSyllabus();
  res.json({
    success: true,
    syllabus,
  });
});

// GET all uploaded syllabi
router.get('/syllabi', (req: Request, res: Response) => {
  const syllabi = dbStore.getAllSyllabi();
  res.json({
    success: true,
    total: syllabi.length,
    syllabi,
  });
});

// POST upload syllabus PDF (supports multipart or base64)
router.post('/upload/syllabus', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'Uploaded_Syllabus.pdf';

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else if (req.body.base64Data) {
      fileBuffer = Buffer.from(req.body.base64Data, 'base64');
      fileName = req.body.fileName || 'Uploaded_Syllabus.pdf';
    } else {
      return res.status(400).json({
        success: false,
        error: 'No file provided. Send multipart form-data with key "file" or JSON with "base64Data".',
      });
    }

    const studentGivenName =
      req.body?.customCourseName ||
      (req.query?.customCourseName as string) ||
      (req.headers['x-custom-course-name'] as string);

    // Parse syllabus using 3-tier Gemini architecture
    const parsedSyllabus = await geminiService.parseSyllabus(fileBuffer, fileName, studentGivenName);

    // Save to persistent database
    dbStore.saveSyllabus(parsedSyllabus);

    // Automatically register or update corresponding course domain
    const courseDomain: CourseMetadata = {
      id: `domain-${Date.now()}`,
      title: parsedSyllabus.courseTitle,
      category: 'Student Domain',
      tagline: `Student-curated curriculum domain from "${fileName}" with ${parsedSyllabus.chapters.length} learning modules.`,
      icon: 'BookOpen',
      badge: 'Syllabus Domain',
      nodeCount: parsedSyllabus.chapters.length,
      estimatedHours: Math.max(8, parsedSyllabus.chapters.length * 2),
      difficulty: 'Intermediate',
      tags: ['Syllabus Ingested', 'PYQ Aligned', 'Adaptive BKT', 'Student Domain'],
    };
    dbStore.saveCourse(courseDomain);

    res.json({
      success: true,
      message: `Successfully parsed Syllabus "${fileName}" (${(fileBuffer.length / 1024).toFixed(1)} KB) and established course domain "${parsedSyllabus.courseTitle}" with ${parsedSyllabus.chapters.length} modules.`,
      syllabus: parsedSyllabus,
      courseDomain,
    });
  } catch (error: any) {
    console.error('[SyllabusRoute] Error handling syllabus upload:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process Syllabus PDF.',
    });
  }
});

// DELETE syllabus
router.delete('/syllabi/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = dbStore.deleteSyllabus(id);
  res.json({
    success: deleted,
    message: deleted ? `Syllabus ${id} deleted.` : `Syllabus ${id} not found.`,
    remaining: dbStore.getAllSyllabi().length,
  });
});

export default router;
