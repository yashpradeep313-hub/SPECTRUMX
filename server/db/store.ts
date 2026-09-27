/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../config';
import {
  SyllabusDocument,
  PyqDocument,
  AssessmentRecord,
  ScannedDocumentRecord,
  BktStateRecord,
  DiagnosticTestQuestion,
} from '../types';
import { UserProfile, CourseMetadata, ConceptNode } from '../../types';

// Helper for atomic disk writes
function writeJsonAtomic(filePath: string, data: any) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.warn(`[Store] Error reading JSON from ${filePath}, using fallback:`, err);
  }
  return fallback;
}

// Default Diagnostic Questions
export const DEFAULT_DIAGNOSTIC_QUESTIONS: DiagnosticTestQuestion[] = [
  {
    id: 'diag-1',
    conceptId: 'variables_primitives',
    conceptName: 'Variables, Bindings & Value Mutation',
    level: 'Beginner',
    question: 'What is the output of the following Python snippet?',
    codeSnippet: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))',
    options: [
      '3 (Because only b was modified)',
      '4 (Both names refer to the same mutable list in memory)',
      'Error: Cannot assign list to another variable',
      'None',
    ],
    correctIndex: 1,
    explanation: 'Variables in Python are object references. "b = a" does not create a copy; both reference the exact same list instance on the heap.',
    misconceptionIfWrong: 'Believing assignment creates an independent copy for mutable objects.',
    difficulty: 'foundational',
    bloomsLevel: 'understand',
  },
  {
    id: 'diag-2',
    conceptId: 'loops_intervals',
    conceptName: 'Loop Bounds & range() Half-Open Intervals',
    level: 'Beginner',
    question: 'How many iterations does the loop execute and what is the last value printed?',
    codeSnippet: 'total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)',
    options: [
      '15 (i goes 1, 2, 3, 4, 5)',
      '10 (range is half-open [1, 5), so i takes values 1, 2, 3, 4)',
      '4',
      'SyntaxError: range requires 3 arguments',
    ],
    correctIndex: 1,
    explanation: 'Python range(start, stop) follows mathematical half-open intervals [1, 5): 1 + 2 + 3 + 4 = 10. The upper bound 5 is strictly excluded.',
    misconceptionIfWrong: 'Assuming range(start, stop) includes the upper stop value.',
    difficulty: 'foundational',
    bloomsLevel: 'apply',
  },
  {
    id: 'diag-3',
    conceptId: 'functions_returns',
    conceptName: 'Function Return Value vs stdout Contracts',
    level: 'Intermediate',
    question: 'What is the final value and type of result after calling this function?',
    codeSnippet: 'def compute_tax(income):\n    tax = income * 0.2\n    print(tax)\n\nresult = compute_tax(1000)',
    options: [
      'result is 200.0 (float)',
      'result is None (NoneType)',
      'result is undefined (Variable not assigned)',
      'result is "200.0" (string)',
    ],
    correctIndex: 1,
    explanation: 'print() writes characters to standard output stream and evaluates to None. Without an explicit return statement, Python functions implicitly return None.',
    misconceptionIfWrong: 'Equating terminal print statements with function return value contracts.',
    difficulty: 'intermediate',
    bloomsLevel: 'apply',
  },
  {
    id: 'diag-4',
    conceptId: 'scope_closures',
    conceptName: 'LEGB Variable Scope & Default Arguments',
    level: 'Intermediate',
    question: 'What will be printed when append_item(1) is called twice in succession?',
    codeSnippet: 'def append_item(x, items=[]):\n    items.append(x)\n    return items\n\nprint(append_item(1))\nprint(append_item(2))',
    options: [
      '[1] then [2] (New list created per call)',
      '[1] then [1, 2] (Default argument evaluated once at function definition)',
      '[1] then [] (Default argument resets)',
      'TypeError: Default argument must be immutable',
    ],
    correctIndex: 1,
    explanation: 'Default arguments in Python are evaluated once when the function definition is executed, not at each invocation. Mutable defaults persist state across calls.',
    misconceptionIfWrong: 'Expecting default parameters to be freshly instantiated on each invocation.',
    difficulty: 'intermediate',
    bloomsLevel: 'analyze',
  },
  {
    id: 'diag-5',
    conceptId: 'recursion_callstack',
    conceptName: 'Recursion Call Stack & Base Conditions',
    level: 'Advanced',
    question: 'What happens when f(3) is called?',
    codeSnippet: 'def f(n):\n    if n <= 0:\n        return 1\n    return n * f(n - 1) + f(n - 2)',
    options: [
      'Executes with tree recursion, unwinding stack frames down to base cases',
      'Immediately raises RecursionError: maximum depth exceeded',
      'Returns 0 because f(n-2) becomes negative',
      'Cannot execute due to dual recursive calls in one expression',
    ],
    correctIndex: 0,
    explanation: 'This is branching tree recursion. Each call pushes a stack frame; base cases n<=0 return 1, and the stack unwinds back to the caller.',
    misconceptionIfWrong: 'Confusing branching tree recursion with linear stack overflow.',
    difficulty: 'advanced',
    bloomsLevel: 'analyze',
  },
  {
    id: 'diag-6',
    conceptId: 'dynamic_programming',
    conceptName: 'Memoization, Overlapping Subproblems & Time Complexity',
    level: 'Advanced',
    question: 'How does memoization transform the time complexity of the naive Fibonacci recursive function?',
    codeSnippet: 'memo = {}\ndef fib(n):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]',
    options: [
      'From O(2^n) exponential time down to O(n) linear time with O(n) memory',
      'From O(n^2) polynomial time down to O(log n) logarithmic time',
      'It only saves memory; the number of function calls remains 2^n',
      'No change in time complexity; it only caches the final answer',
    ],
    correctIndex: 0,
    explanation: 'Memoization caches results for each unique subproblem (0 through n), pruning duplicate subtrees and reducing O(2^n) calls to O(n) calls.',
    misconceptionIfWrong: 'Failing to recognize overlapping subproblem caching reducing recursive tree branches.',
    difficulty: 'advanced',
    bloomsLevel: 'evaluate',
  },
];

// Default Initial Syllabus
export const INITIAL_SYLLABUS: SyllabusDocument = {
  id: 'syllabus-default',
  fileName: 'Python_University_Syllabus_2026.pdf',
  fileSizeBytes: 245000,
  uploadedAt: new Date().toISOString(),
  courseTitle: 'CS 101: Principles of Computer Science & Python Programming',
  academicYear: '2025-2026',
  totalMarks: 100,
  paperPattern: 'Section A: 10 Objective MCQs (20 Marks) • Section B: 5 Algorithm Problems (40 Marks) • Section C: System Architecture & Case Studies (40 Marks)',
  summary: 'Comprehensive undergraduate university curriculum covering computational thinking, memory models, functions, data structures, recursion, and algorithm design.',
  chapters: [
    {
      id: 'ch-1',
      title: 'Variables, Memory Bindings & Type Invariants',
      weightage: '10 Marks',
      marks: 10,
      isDone: true,
      status: 'mastered',
      topics: ['Identifier rules', 'Heap object references', 'Primitive vs Reference types', 'Mutability traps'],
      prerequisites: ['Basic Boolean Logic'],
      cognitiveLevel: 'Foundational',
    },
    {
      id: 'ch-2',
      title: 'Conditionals & Boolean Truthiness Evaluation',
      weightage: '12 Marks',
      marks: 12,
      isDone: true,
      status: 'mastered',
      topics: ['Short-circuit evaluation', 'Truthiness of empty containers', 'Compound logic operators'],
      prerequisites: ['Variables, Memory Bindings'],
      cognitiveLevel: 'Foundational',
    },
    {
      id: 'ch-3',
      title: 'For & While Loops with Half-Open Intervals',
      weightage: '15 Marks',
      marks: 15,
      isDone: true,
      status: 'weak',
      topics: ['range() start, stop, step', 'Off-by-one boundary traps', 'Nested iteration', 'Loop invariant verification'],
      prerequisites: ['Conditionals'],
      cognitiveLevel: 'Intermediate',
    },
    {
      id: 'ch-4',
      title: 'Functions, Parameter Scopes & Return Contracts',
      weightage: '20 Marks',
      marks: 20,
      isDone: false,
      status: 'weak',
      topics: ['Positional vs Keyword params', 'Return vs stdout print', 'LEGB scope resolution', 'Mutable default args'],
      prerequisites: ['Loops & Intervals'],
      cognitiveLevel: 'Intermediate',
    },
    {
      id: 'ch-5',
      title: 'Recursion, Call Stacks & Dynamic Programming',
      weightage: '25 Marks',
      marks: 25,
      isDone: false,
      status: 'untested',
      topics: ['Base condition synthesis', 'Stack frame push/pop lifecycle', 'Branching recursion', 'Top-down memoization'],
      prerequisites: ['Functions, Parameter Scopes'],
      cognitiveLevel: 'Advanced',
    },
    {
      id: 'ch-6',
      title: 'Object References, OOP & State Invariants',
      weightage: '18 Marks',
      marks: 18,
      isDone: false,
      status: 'untested',
      topics: ['Classes & __init__', 'Self parameter dispatch', 'Encapsulation & Dunder protocols'],
      prerequisites: ['Recursion & Data Structures'],
      cognitiveLevel: 'Advanced',
    },
  ],
  initialDiagnosticTest: DEFAULT_DIAGNOSTIC_QUESTIONS,
  isAiParsed: true,
};

// Default PYQs
export const INITIAL_PYQS: PyqDocument[] = [
  {
    id: 'pyq-2025',
    fileName: 'Previous_Year_Question_Paper_2025_Marking_Scheme.pdf',
    fileSizeBytes: 310000,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    examTitle: 'Annual University Python Final Examination 2025',
    year: '2025',
    totalMarks: 100,
    markingScheme: '+4 for algorithm correctness, -1 for boundary/stack overflow errors, step-marking enabled for partial proof',
    highWeightageTopics: ['Recursion Call Stacks (25M)', 'Functions & Scope (20M)', 'Loop Invariants (15M)'],
    questions: [
      {
        qNum: 'Q1',
        topic: 'Variables & Mutable Assignment',
        marks: 5,
        difficulty: 'Easy',
        questionText: 'Demonstrate list aliasing with memory diagrams when assigning list b to list a.',
        markingCriteria: '2 marks for memory diagram showing single heap object, 3 marks for code explanation.',
        commonTraps: 'Confusing deep copy with shallow reference assignment.',
      },
      {
        qNum: 'Q2',
        topic: 'Loop Bounds & range()',
        marks: 10,
        difficulty: 'Medium',
        questionText: 'Implement a binary search loop with strict boundary interval invariants.',
        markingCriteria: '5 marks for loop termination condition (low <= high), 5 marks for mid calculation.',
        commonTraps: 'Integer overflow in mid calculation, off-by-one in mid - 1.',
      },
      {
        qNum: 'Q3b',
        topic: 'Function Return Values',
        marks: 15,
        difficulty: 'Medium',
        questionText: 'Explain why passing the output of a function that uses print() to another calculation causes TypeError.',
        markingCriteria: '7 marks for explaining NoneType return value, 8 marks for code trace.',
        commonTraps: 'Assuming print() assigns value to result variable.',
      },
      {
        qNum: 'Q4',
        topic: 'Tree Recursion & Call Stacks',
        marks: 20,
        difficulty: 'Hard',
        questionText: 'Trace the activation records for recursive merge sort on array of size 8.',
        markingCriteria: '10 marks for call tree diagram, 10 marks for stack frame base cases.',
        commonTraps: 'Omitting base case when left index >= right index.',
      },
    ],
    isAiParsed: true,
  },
];

// Default Initial Courses
export const INITIAL_COURSES: CourseMetadata[] = [
  {
    id: 'python-core',
    title: 'Python Programming & Internals',
    category: 'Computer Science',
    tagline: 'Visible, explainable root-cause diagnosis across 14 prerequisite concepts.',
    icon: 'Terminal',
    badge: 'Flagship DAG',
    nodeCount: 14,
    estimatedHours: 12,
    difficulty: 'Intermediate',
    tags: ['BKT Engine', 'Root-Cause DAG', 'Python Sandbox', 'Interactive Traversal'],
    isFlagship: true,
  },
  {
    id: 'dsa-python',
    title: 'Data Structures & Algorithms',
    category: 'Computer Science',
    tagline: 'Deconstruct recursion stacks, binary search trees, and dynamic programming memoization.',
    icon: 'Binary',
    badge: 'Algorithms',
    nodeCount: 7,
    estimatedHours: 16,
    difficulty: 'Advanced',
    tags: ['Big-O', 'Recursion', 'BST Invariants', 'DP Memoization'],
  },
  {
    id: 'fullstack-web',
    title: 'Modern Full-Stack & Async JS',
    category: 'Web Engineering',
    tagline: 'Deep dive into event loop microtasks, React fiber reconciliation, and stale closures.',
    icon: 'Layers',
    badge: 'Web Systems',
    nodeCount: 5,
    estimatedHours: 10,
    difficulty: 'Intermediate',
    tags: ['Event Loop', 'Microtasks', 'React Hooks', 'SWR Caching'],
  },
  {
    id: 'deep-learning-math',
    title: 'Neural Networks & Deep Learning Math',
    category: 'Artificial Intelligence',
    tagline: 'Connect linear algebra, partial derivatives, loss landscapes, and backpropagation.',
    icon: 'BrainCircuit',
    badge: 'AI & Math',
    nodeCount: 4,
    estimatedHours: 14,
    difficulty: 'Advanced',
    tags: ['Matrix Ops', 'Chain Rule', 'Gradient Descent', 'Backprop'],
  },
];

// Default Initial Users
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-alex',
    name: 'Alex Chen',
    email: 'alex.chen@adaptive.edu',
    avatar: '👨‍💻',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'dsa-python'],
    currentGoal: 'Master Python Internals & FAANG Technical Interviews',
    level: 'Intermediate',
    streakDays: 14,
    totalStudyMinutes: 340,
    learningVelocity: 'Accelerated',
    joinedDate: 'September 2026',
  },
  {
    id: 'user-maya',
    name: 'Maya Patel',
    email: 'maya.patel@techacademy.io',
    avatar: '👩‍🔬',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'deep-learning-math'],
    currentGoal: 'Neural Network Math Foundations & Backpropagation',
    level: 'Advanced',
    streakDays: 21,
    totalStudyMinutes: 520,
    learningVelocity: 'Accelerated',
    joinedDate: 'August 2026',
  },
  {
    id: 'user-liam',
    name: 'Liam Wright',
    email: 'liam.wright@devbootcamp.com',
    avatar: '🌱',
    role: 'Student',
    enrolledCourseIds: ['python-core', 'fullstack-web'],
    currentGoal: 'Overcome Recursion & Mutable Default Blindspots',
    level: 'Beginner',
    streakDays: 5,
    totalStudyMinutes: 120,
    learningVelocity: 'Steady',
    joinedDate: 'September 2026',
  },
];

class DatabaseStore {
  private files = {
    users: path.join(DATA_DIR, 'users.json'),
    syllabi: path.join(DATA_DIR, 'syllabi.json'),
    pyqs: path.join(DATA_DIR, 'pyqs.json'),
    courses: path.join(DATA_DIR, 'courses.json'),
    assessments: path.join(DATA_DIR, 'assessments.json'),
    documents: path.join(DATA_DIR, 'documents.json'),
    bktStates: path.join(DATA_DIR, 'bkt_states.json'),
  };

  private users: UserProfile[] = [];
  private syllabi: SyllabusDocument[] = [];
  private pyqs: PyqDocument[] = [];
  private courses: CourseMetadata[] = [];
  private assessments: AssessmentRecord[] = [];
  private documents: ScannedDocumentRecord[] = [];
  private bktStates: BktStateRecord[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.users = readJsonSafe(this.files.users, INITIAL_USERS);
    this.syllabi = readJsonSafe(this.files.syllabi, [INITIAL_SYLLABUS]);
    this.pyqs = readJsonSafe(this.files.pyqs, INITIAL_PYQS);
    this.courses = readJsonSafe(this.files.courses, INITIAL_COURSES);
    this.assessments = readJsonSafe(this.files.assessments, []);
    this.documents = readJsonSafe(this.files.documents, []);
    this.bktStates = readJsonSafe(this.files.bktStates, []);

    // Ensure initial disk files exist
    this.persistAll();
  }

  private persistAll() {
    writeJsonAtomic(this.files.users, this.users);
    writeJsonAtomic(this.files.syllabi, this.syllabi);
    writeJsonAtomic(this.files.pyqs, this.pyqs);
    writeJsonAtomic(this.files.courses, this.courses);
    writeJsonAtomic(this.files.assessments, this.assessments);
    writeJsonAtomic(this.files.documents, this.documents);
    writeJsonAtomic(this.files.bktStates, this.bktStates);
  }

  // Users
  getUsers(): UserProfile[] {
    return [...this.users];
  }

  getUserById(id: string): UserProfile | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  saveUser(user: UserProfile): UserProfile {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], ...user };
    } else {
      this.users.unshift(user);
    }
    writeJsonAtomic(this.files.users, this.users);
    return user;
  }

  // Syllabi
  getCurrentSyllabus(): SyllabusDocument {
    return this.syllabi[0] || INITIAL_SYLLABUS;
  }

  getAllSyllabi(): SyllabusDocument[] {
    return [...this.syllabi];
  }

  getSyllabusById(id: string): SyllabusDocument | undefined {
    return this.syllabi.find(s => s.id === id);
  }

  saveSyllabus(syllabus: SyllabusDocument): SyllabusDocument {
    // Put newest as current syllabus at index 0
    this.syllabi = [syllabus, ...this.syllabi.filter(s => s.id !== syllabus.id)];
    writeJsonAtomic(this.files.syllabi, this.syllabi);
    return syllabus;
  }

  deleteSyllabus(id: string): boolean {
    const len = this.syllabi.length;
    this.syllabi = this.syllabi.filter(s => s.id !== id);
    if (this.syllabi.length !== len) {
      writeJsonAtomic(this.files.syllabi, this.syllabi);
      return true;
    }
    return false;
  }

  // PYQs
  getPyqs(): PyqDocument[] {
    return [...this.pyqs];
  }

  getPyqById(id: string): PyqDocument | undefined {
    return this.pyqs.find(p => p.id === id);
  }

  savePyq(pyq: PyqDocument): PyqDocument {
    this.pyqs = [pyq, ...this.pyqs.filter(p => p.id !== pyq.id)];
    writeJsonAtomic(this.files.pyqs, this.pyqs);
    return pyq;
  }

  deletePyq(id: string): boolean {
    const len = this.pyqs.length;
    this.pyqs = this.pyqs.filter(p => p.id !== id);
    if (this.pyqs.length !== len) {
      writeJsonAtomic(this.files.pyqs, this.pyqs);
      return true;
    }
    return false;
  }

  // Courses
  getCourses(): CourseMetadata[] {
    return [...this.courses];
  }

  getCourseById(id: string): CourseMetadata | undefined {
    return this.courses.find(c => c.id === id);
  }

  saveCourse(course: CourseMetadata): CourseMetadata {
    const idx = this.courses.findIndex(c => c.id === course.id);
    if (idx >= 0) {
      this.courses[idx] = { ...this.courses[idx], ...course };
    } else {
      this.courses.unshift(course);
    }
    writeJsonAtomic(this.files.courses, this.courses);
    return course;
  }

  deleteCourse(id: string): boolean {
    const len = this.courses.length;
    this.courses = this.courses.filter(c => c.id !== id);
    if (this.courses.length !== len) {
      writeJsonAtomic(this.files.courses, this.courses);
      return true;
    }
    return false;
  }

  // Assessments
  getAssessments(userId?: string): AssessmentRecord[] {
    if (userId) {
      return this.assessments.filter(a => a.userId === userId);
    }
    return [...this.assessments];
  }

  getAssessmentById(id: string): AssessmentRecord | undefined {
    return this.assessments.find(a => a.id === id);
  }

  saveAssessment(record: AssessmentRecord): AssessmentRecord {
    this.assessments.unshift(record);
    writeJsonAtomic(this.files.assessments, this.assessments);
    return record;
  }

  // Documents
  getDocuments(): ScannedDocumentRecord[] {
    return [...this.documents];
  }

  getDocumentById(id: string): ScannedDocumentRecord | undefined {
    return this.documents.find(d => d.id === id);
  }

  saveDocument(doc: ScannedDocumentRecord): ScannedDocumentRecord {
    this.documents = [doc, ...this.documents.filter(d => d.id !== doc.id)];
    writeJsonAtomic(this.files.documents, this.documents);
    return doc;
  }

  // BKT States
  getBktState(userId: string, courseId: string): BktStateRecord | undefined {
    return this.bktStates.find(s => s.userId === userId && s.courseId === courseId);
  }

  saveBktState(userId: string, courseId: string, nodes: Record<string, ConceptNode>): BktStateRecord {
    const record: BktStateRecord = {
      userId,
      courseId,
      nodes,
      updatedAt: new Date().toISOString(),
    };
    const idx = this.bktStates.findIndex(s => s.userId === userId && s.courseId === courseId);
    if (idx >= 0) {
      this.bktStates[idx] = record;
    } else {
      this.bktStates.push(record);
    }
    writeJsonAtomic(this.files.bktStates, this.bktStates);
    return record;
  }
}

export const dbStore = new DatabaseStore();
