/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store';
import { geminiService } from '../services/gemini.service';
import { CourseMetadata } from '../../types';

const router = Router();

// GET all courses
router.get('/courses', (req: Request, res: Response) => {
  const courses = dbStore.getCourses();
  res.json({
    success: true,
    total: courses.length,
    courses,
  });
});

// GET single course
router.get('/courses/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const course = dbStore.getCourseById(id);
  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }
  res.json({ success: true, course });
});

// POST register student course domain
router.post('/courses', (req: Request, res: Response) => {
  try {
    const { title, category, tagline, chapters, difficulty } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'A course domain title is required.' });
    }

    const cleanTitle = title.trim();
    const courseId = `domain-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newDomain: CourseMetadata = {
      id: courseId,
      title: cleanTitle,
      category: category || 'Student Domain',
      tagline: tagline || `Student-curated course domain for ${cleanTitle}`,
      icon: 'BookOpen',
      badge: 'Student Domain',
      nodeCount: Array.isArray(chapters) ? chapters.length : 6,
      estimatedHours: 12,
      difficulty: difficulty || 'Intermediate',
      tags: ['Student Created', 'Syllabus Aligned', 'PYQ Grounded', 'Adaptive BKT'],
    };

    dbStore.saveCourse(newDomain);

    res.json({
      success: true,
      message: `Course domain "${cleanTitle}" registered successfully.`,
      courseDomain: newDomain,
      totalDomains: dbStore.getCourses().length,
    });
  } catch (error: any) {
    console.error('[CourseRoute] Error creating course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST generate curriculum for ANY topic with AI
router.post('/generate-curriculum', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return res.status(400).json({ success: false, error: 'Topic string is required.' });
    }

    const curriculum = await geminiService.generateCustomCurriculum(topic.trim());

    // Also register this newly generated topic as a course domain
    const courseMetadata: CourseMetadata = {
      id: curriculum.id,
      title: curriculum.name,
      category: curriculum.category,
      tagline: curriculum.tagline,
      icon: curriculum.icon,
      badge: 'AI Generated',
      nodeCount: curriculum.concepts.length,
      estimatedHours: 14,
      difficulty: 'Intermediate',
      tags: ['AI Curriculum', 'Adaptive DAG', 'BKT Enabled', topic.trim()],
    };
    dbStore.saveCourse(courseMetadata);

    res.json({
      success: true,
      message: `Successfully synthesized adaptive curriculum for "${topic}" with ${curriculum.concepts.length} concept nodes.`,
      curriculum,
      courseMetadata,
    });
  } catch (error: any) {
    console.error('[CourseRoute] Error generating curriculum:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE course
router.delete('/courses/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = dbStore.deleteCourse(id);
  res.json({
    success: deleted,
    message: deleted ? `Course ${id} deleted.` : `Course ${id} not found.`,
    remaining: dbStore.getCourses().length,
  });
});

export default router;
