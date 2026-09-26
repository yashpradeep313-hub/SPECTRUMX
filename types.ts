/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Root-Cause Python Adaptive Platform Types ---

export type NodeStatus = 'mastered' | 'in_progress' | 'diagnosed_gap' | 'locked';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type QuadrantType = 
  | 'dangerous_misconception' // High confidence + Wrong
  | 'lucky_guess'             // Low confidence + Correct
  | 'true_mastery'            // High confidence + Correct
  | 'known_gap';              // Low confidence + Wrong

export interface ConceptNode {
  id: string;
  name: string;
  shortDesc: string;
  category: 'Syntax & Primitives' | 'Control Flow' | 'Functions & Scope' | 'Data Structures' | 'Advanced Algorithms';
  tier: number; // Layer depth in DAG (0 = root)
  prerequisites: string[]; // Concept IDs
  
  // BKT parameters
  pL: number; // Probability of mastery P(L), 0.0 to 1.0
  pT: number; // Transition probability (learning rate)
  pG: number; // Guess probability
  pS: number; // Slip probability
  
  status: NodeStatus;
  misconceptionsDetected: string[];
  lastAssessed?: string;
  attemptsCount: number;
  correctCount: number;
}

export interface QuestionDistractor {
  text: string;
  misconceptionId?: string;
  misconceptionLabel?: string;
  rootCausePrereqId?: string; // Prerequisite concept to blame if chosen!
  pedagogicalNote: string;
}

export interface PythonQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  codeSnippet?: string;
  questionText: string;
  difficulty: number; // 1 to 5 (1 = elementary, 5 = edge-case expert)
  options: QuestionDistractor[];
  correctIndex: number;
  correctExplanation: string;
  whyThisQuestionAppeared: string;
}

export interface MisconceptionRecord {
  id: string;
  label: string;
  rootConceptId: string;
  count: number;
  lastEncounteredAt: string;
}

export interface ExplainabilityContext {
  triggerQuestionId: string;
  chosenOptionIndex: number;
  chosenMisconception?: string;
  surfaceConceptId: string;
  rootCauseConceptId: string;
  rootCauseConceptName: string;
  confidence: ConfidenceLevel;
  quadrant: QuadrantType;
  priorMasteryPL: number;
  updatedMasteryPL: number;
  reasonText: string;
}

export interface MicroLesson {
  id: string;
  conceptId: string;
  conceptName: string;
  targetMisconception: string;
  title: string;
  whyAssigned: string;
  explanation: string;
  brokenCode: string;
  fixedCode: string;
  codeExplanation: string;
  interactiveExercise: {
    prompt: string;
    starterCode: string;
    expectedSolutionSnippet: string;
    hint: string;
  };
  verificationQuestion: PythonQuestion;
}

export interface DemoPersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  initialMastery: Record<string, number>;
  demoScenario: {
    startQuestionId: string;
    deliberateWrongChoice: number;
    expectedRootCauseConceptId: string;
    storyboard: string;
  };
}

export interface LearningPathItem {
  conceptId: string;
  conceptName: string;
  order: number;
  isRemediation: boolean;
  priority: 'critical' | 'high' | 'normal';
  reason: string;
  status: 'active' | 'queued' | 'completed';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Student' | 'Instructor' | 'Admin';
  enrolledCourseIds: string[];
  currentGoal: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  streakDays: number;
  totalStudyMinutes: number;
  learningVelocity: 'Accelerated' | 'Steady' | 'Needs Remediation';
  joinedDate: string;
}

export interface CourseMetadata {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description?: string;
  icon: string;
  badge: string;
  nodeCount: number;
  conceptCount?: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | number;
  tags: string[];
  topics?: string[];
  isFlagship?: boolean;
}

export interface StudentProfile {
  studentName: string;
  activePersonaId?: string;
  overallMastery: number; // 0 - 100
  estimatedMinutesToMastery: number;
  streak: number;
  nodes: Record<string, ConceptNode>;
  misconceptions: Record<string, MisconceptionRecord>;
  activeLearningPath: LearningPathItem[];
  recentEvents: Array<{
    timestamp: string;
    action: string;
    details: string;
    type: 'gap_diagnosed' | 'mastery_increased' | 'path_rewound' | 'lesson_completed';
  }>;
}

// --- Multi-domain and Diagnostic Types ---

export type StageId = 
  | 'diagnostic'
  | 'analysis'
  | 'learning_path'
  | 'adaptive_quiz'
  | 'recommendations';

export type BloomsTaxonomy = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';

export type ConceptStatus = 'mastered' | 'learning' | 'gap' | 'blocked' | 'untested';

export interface Concept {
  id: string;
  name: string;
  description: string;
  category: string;
  prerequisites: string[];
  masteryScore: number;
  status: ConceptStatus;
  bloomsLevel: BloomsTaxonomy;
  misconception?: string;
  remediationTip?: string;
  importance: 'foundational' | 'core' | 'advanced';
}

export interface DiagnosticQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionIfWrong: string;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
  bloomsLevel: BloomsTaxonomy;
}

export interface AdaptiveQuestion {
  id: string;
  conceptId: string;
  conceptName: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficultyRating: number;
  bloomsLevel: BloomsTaxonomy;
  hint: string;
  analogies: {
    eli5: string;
    practical: string;
    academic: string;
  };
}

export interface LearningModule {
  id: string;
  conceptId: string;
  conceptName: string;
  title: string;
  estimatedMinutes: number;
  isRemediation: boolean;
  prerequisiteReason?: string;
  summary: string;
  keyTakeaways: string[];
  interactiveExample?: {
    language: string;
    code: string;
    outputExplanation: string;
  };
  analogy: string;
  commonPitfalls: string[];
  practiceChallenge: {
    prompt: string;
    answerGuide: string;
  };
  completed: boolean;
}

export interface KnowledgeGap {
  conceptId: string;
  conceptName: string;
  severity: 'critical' | 'moderate' | 'minor';
  rootCause: string;
  blockedConcepts: string[];
  detectedAtQuestionId?: string;
  resolved: boolean;
}

export interface PresetCurriculum {
  id: string;
  name: string;
  category: string;
  icon: string;
  tagline: string;
  concepts: Concept[];
  diagnosticQuestions: DiagnosticQuestion[];
  adaptivePool: AdaptiveQuestion[];
  learningModules: LearningModule[];
}
