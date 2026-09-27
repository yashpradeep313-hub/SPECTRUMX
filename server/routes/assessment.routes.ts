/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { dbStore, DEFAULT_DIAGNOSTIC_QUESTIONS } from '../db/store';
import { geminiService } from '../services/gemini.service';
import { AssessmentRecord } from '../types';

const router = Router();

// 1. GET / POST Generate Initial Diagnostic Placement Test
router.post('/generate-initial-test', (req: Request, res: Response) => {
  const syllabus = dbStore.getCurrentSyllabus();
  const questions =
    syllabus.initialDiagnosticTest && syllabus.initialDiagnosticTest.length >= 3
      ? syllabus.initialDiagnosticTest
      : DEFAULT_DIAGNOSTIC_QUESTIONS;

  res.json({
    success: true,
    syllabusName: syllabus.courseTitle || syllabus.fileName,
    questions,
    totalQuestions: questions.length,
    levelDistribution: {
      Beginner: questions.filter(q => q.level === 'Beginner').length,
      Intermediate: questions.filter(q => q.level === 'Intermediate').length,
      Advanced: questions.filter(q => q.level === 'Advanced').length,
    },
  });
});

// 2. POST Evaluate Initial Placement Test
router.post('/evaluate-initial-test', (req: Request, res: Response) => {
  const { answers, userId = 'user-alex' } = req.body;
  const syllabus = dbStore.getCurrentSyllabus();
  const questions = syllabus.initialDiagnosticTest || DEFAULT_DIAGNOSTIC_QUESTIONS;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: 'Expected answers array' });
  }

  let correctCount = 0;
  let beginnerCorrect = 0;
  let intermediateCorrect = 0;
  let advancedCorrect = 0;

  const questionBreakdown = questions.map(q => {
    const given = answers.find((a: any) => a.questionId === q.id);
    const isCorrect = given && given.selectedIndex === q.correctIndex;
    if (isCorrect) {
      correctCount++;
      if (q.level === 'Beginner') beginnerCorrect++;
      else if (q.level === 'Intermediate') intermediateCorrect++;
      else if (q.level === 'Advanced') advancedCorrect++;
    }
    return {
      id: q.id,
      conceptName: q.conceptName,
      level: q.level,
      isCorrect: Boolean(isCorrect),
      explanation: q.explanation,
      misconception: !isCorrect ? q.misconceptionIfWrong : undefined,
    };
  });

  const total = questions.length || 1;
  const percentage = Math.round((correctCount / total) * 100);

  let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  let suggestedTheta = '-1.2';
  let levelDescription = '';
  let recommendedFocus: string[] = [];

  if (percentage >= 80) {
    level = 'Advanced';
    suggestedTheta = '+1.4';
    levelDescription =
      'High baseline competence across fundamental and algorithmic concepts. Ready for deep recursive reasoning, dynamic programming, and high-weightage PYQ synthesis.';
    recommendedFocus = [
      'Call Stack Optimization & Memoization (Chapter 5)',
      'Object-Oriented Invariants & Dunder Protocols (Chapter 6)',
      'University PYQ 20-Mark Architectural Problems',
    ];
  } else if (percentage >= 50) {
    level = 'Intermediate';
    suggestedTheta = '+0.2';
    levelDescription =
      'Strong foundational understanding of syntax and control flow. Needs reinforcement on function return contracts, mutable default scopes, and off-by-one intervals.';
    recommendedFocus = [
      'Function Return Contracts vs stdout side-effects (Chapter 4)',
      'range(start, stop) Half-Open Boundary Invariants (Chapter 3)',
      'PYQ Section B Algorithm Problems (10-15 Mark Weightage)',
    ];
  } else {
    level = 'Beginner';
    suggestedTheta = '-1.5';
    levelDescription =
      'Foundational concept gaps identified in object references and mutable variable bindings. We recommend mastering memory models before proceeding to loops and recursion.';
    recommendedFocus = [
      'Memory References & Value Mutation (Chapter 1)',
      'Boolean Truthiness & Short-Circuit Evaluation (Chapter 2)',
      'Syllabus Core Foundations (Section A 20-Mark MCQs)',
    ];
  }

  // Persist assessment result to database
  const assessmentRecord: AssessmentRecord = {
    id: `assess-${Date.now()}`,
    userId,
    type: 'initial_placement',
    title: `Initial Placement Test: ${syllabus.courseTitle}`,
    subjectName: syllabus.courseTitle,
    score: correctCount,
    totalQuestions: total,
    percentage,
    determinedLevel: level,
    theta: suggestedTheta,
    answers: answers.map((a: any) => {
      const q = questions.find(item => item.id === a.questionId);
      return {
        questionId: a.questionId,
        conceptName: q?.conceptName,
        selectedIndex: a.selectedIndex,
        isCorrect: q ? a.selectedIndex === q.correctIndex : false,
      };
    }),
    submittedAt: new Date().toISOString(),
  };
  dbStore.saveAssessment(assessmentRecord);

  // Update user profile level
  const user = dbStore.getUserById(userId);
  if (user) {
    user.level = level;
    dbStore.saveUser(user);
  }

  res.json({
    success: true,
    score: correctCount,
    total,
    percentage,
    level,
    levelDescription,
    suggestedTheta,
    recommendedFocus,
    questionBreakdown,
    assessmentId: assessmentRecord.id,
  });
});

// 3. POST Generate Adaptive Quiz
router.post('/generate-adaptive-quiz', async (req: Request, res: Response) => {
  try {
    const { studentLevel = 'Intermediate', requestedCount = 6, subjectName } = req.body;
    const syllabus = dbStore.getCurrentSyllabus();
    const pyqs = dbStore.getPyqs();
    const domainTitle = subjectName || syllabus.courseTitle;

    const result = await geminiService.generateAdaptiveQuiz({
      domainTitle,
      syllabus,
      pyqs,
      studentLevel,
      requestedCount,
    });

    res.json({
      success: true,
      ...result,
      chaptersCovered: syllabus.chapters.length,
      pyqPapersAnalyzed: pyqs.length,
    });
  } catch (error: any) {
    console.error('[AssessmentRoute] Error generating adaptive quiz:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST Submit Assessment / Quiz Results
router.post('/assessments/submit', (req: Request, res: Response) => {
  try {
    const {
      userId = 'user-alex',
      type = 'adaptive_quiz',
      title,
      subjectName,
      score,
      totalQuestions,
      percentage,
      determinedLevel,
      theta,
      answers = [],
      resolvedGaps = [],
    } = req.body;

    const record: AssessmentRecord = {
      id: `assess-${Date.now()}`,
      userId,
      type,
      title: title || `${type === 'adaptive_quiz' ? 'Adaptive Quiz' : 'Diagnostic Assessment'}: ${subjectName || 'Knowledge Check'}`,
      subjectName: subjectName || 'Python Programming & Internals',
      score: Number(score) || 0,
      totalQuestions: Number(totalQuestions) || 1,
      percentage: Number(percentage) || Math.round(((Number(score) || 0) / (Number(totalQuestions) || 1)) * 100),
      determinedLevel,
      theta,
      answers,
      resolvedGaps,
      submittedAt: new Date().toISOString(),
    };

    dbStore.saveAssessment(record);

    // Update user stats
    const user = dbStore.getUserById(userId);
    if (user) {
      user.totalStudyMinutes += Math.round((Number(totalQuestions) || 5) * 2.5);
      user.streakDays = Math.max(1, user.streakDays + 1);
      if (determinedLevel) user.level = determinedLevel;
      dbStore.saveUser(user);
    }

    res.json({
      success: true,
      message: 'Assessment recorded successfully.',
      assessment: record,
    });
  } catch (error: any) {
    console.error('[AssessmentRoute] Error submitting assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET Assessment History for a User
router.get('/assessments/history/:userId', (req: Request, res: Response) => {
  const userId = String(req.params.userId);
  const history = dbStore.getAssessments(userId);
  res.json({
    success: true,
    total: history.length,
    history,
  });
});

// 6. GET Single Assessment by ID
router.get('/assessments/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const record = dbStore.getAssessmentById(id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Assessment record not found' });
  }
  res.json({ success: true, assessment: record });
});

export default router;
