/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, CourseMetadata, ConceptNode, ConfidenceLevel, QuadrantType } from '../types';

export interface ChapterItem {
  id: string;
  title: string;
  weightage: string;
  marks: number;
  isDone: boolean;
  status: 'mastered' | 'weak' | 'untested';
  topics: string[];
  prerequisites: string[];
  cognitiveLevel: 'Foundational' | 'Intermediate' | 'Advanced';
}

export interface DiagnosticTestQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionIfWrong: string;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';
}

export interface SyllabusDocument {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  courseTitle: string;
  academicYear: string;
  totalMarks: number;
  paperPattern: string;
  summary: string;
  chapters: ChapterItem[];
  initialDiagnosticTest: DiagnosticTestQuestion[];
  isAiParsed: boolean;
}

export interface PyqQuestion {
  qNum: string;
  topic: string;
  marks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  markingCriteria: string;
  commonTraps: string;
}

export interface PyqDocument {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  examTitle: string;
  year: string;
  totalMarks: number;
  markingScheme: string;
  highWeightageTopics: string[];
  questions: PyqQuestion[];
  isAiParsed: boolean;
}

export interface AssessmentRecord {
  id: string;
  userId: string;
  type: 'initial_placement' | 'adaptive_quiz' | 'diagnostic';
  title: string;
  subjectName?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  determinedLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  theta?: string;
  answers: Array<{
    questionId: string;
    conceptName?: string;
    selectedIndex: number;
    isCorrect: boolean;
    confidence?: ConfidenceLevel;
    quadrant?: QuadrantType;
  }>;
  resolvedGaps?: string[];
  submittedAt: string;
}

export interface ScannedDocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  scannedAt: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  extractedConcepts: Array<{
    id: string;
    name: string;
    description: string;
    prerequisites: string[];
    difficulty: string;
  }>;
  diagnosedMisconceptions: Array<{
    topic: string;
    misconception: string;
    remedy: string;
  }>;
  generatedQuestions: Array<{
    id: string;
    conceptName: string;
    title: string;
    questionText: string;
    codeSnippet?: string;
    options: Array<{
      text: string;
      misconceptionLabel?: string;
      pedagogicalNote: string;
    }>;
    correctIndex: number;
    correctExplanation: string;
  }>;
}

export interface BktStateRecord {
  userId: string;
  courseId: string;
  nodes: Record<string, ConceptNode>;
  updatedAt: string;
}
