/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ConceptNode,
  PythonQuestion,
  QuestionDistractor,
  ConfidenceLevel,
  ExplainabilityContext,
  MicroLesson,
  DemoPersona,
  StudentProfile,
  LearningPathItem,
  UserProfile,
  CourseMetadata,
  PresetCurriculum,
  AdaptiveQuestion,
  Concept,
  KnowledgeGap,
  BloomsTaxonomy
} from './types';

import {
  INITIAL_PYTHON_NODES,
  PYTHON_QUESTION_BANK,
  MICRO_LESSONS,
  DEMO_PERSONAS
} from './data/pythonKnowledgeGraph';

import { AVAILABLE_COURSES } from './data/courses';
import { PRESET_CURRICULUMS } from './data/curriculums';

import {
  calculateUpdatedBKT,
  evaluateQuadrant,
  findRootCausePrerequisite,
  generateDynamicLearningPath,
  buildExplainabilityReason
} from './services/bktEngine';

import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { ExplainabilityCard } from './components/ExplainabilityCard';
import { ActiveQuestionCard } from './components/ActiveQuestionCard';
import { MicroLessonDrawer } from './components/MicroLessonDrawer';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';
import { StudentDashboard } from './components/StudentDashboard';
import { AiTutorDrawer } from './components/AiTutorDrawer';
import { HackathonPitchModal } from './components/HackathonPitchModal';
import { AuthModal, PRESET_USERS } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { CourseSelectModal } from './components/CourseSelectModal';
import { CustomTopicModal } from './components/CustomTopicModal';
import { ProfilePageView } from './components/ProfilePageView';
import { CourseCatalogView } from './components/CourseCatalogView';
import { DocumentScannerView } from './components/DocumentScannerView';
import { SyllabusPyqView } from './components/SyllabusPyqView';
import { AdaptiveQuizView } from './components/AdaptiveQuizView';
import { SplitScreenLogin } from './components/SplitScreenLogin';
import { AiLoadingOverlay } from './components/AiLoadingOverlay';
import {
  InitialPlacementAssessment,
  DiagnosticResult,
  DeterminedLevel
} from './components/InitialPlacementAssessment';

import {
  Brain,
  Layers,
  Award,
  Sparkles,
  RefreshCw,
  Bot,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  User,
  ChevronDown,
  Terminal,
  LogIn,
  GraduationCap,
  FileText,
  LayoutDashboard,
  HelpCircle,
  Network,
  ScanLine,
  Sliders,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  initAnonymousAuth,
  saveUserToFirebase,
  saveCourseDomainToFirebase,
  saveAssessmentToFirebase
} from './services/firebase';

export const App: React.FC = () => {
  // Navigation Menu View Selection
  // Explicitly covers: Dashboard, Upload Syllabus & PYQ, Initial Placement Test, Adaptive Quiz, Knowledge Graph, Profile
  // plus Scanner, Courses
  const [activeView, setActiveView] = useState<
    'dashboard' | 'syllabus' | 'initial-test' | 'quiz' | 'graph' | 'profile' | 'courses' | 'scanner'
  >('dashboard');

  // Syllabus file state and initial test results
  const [uploadedSyllabusName, setUploadedSyllabusName] = useState<string>('Python_University_Syllabus_2026.pdf');
  const [syllabusCustomQuestions, setSyllabusCustomQuestions] = useState<any[] | undefined>(undefined);
  const [customGeneratedQuizQuestions, setCustomGeneratedQuizQuestions] = useState<AdaptiveQuestion[] | null>(null);
  const [initialPlacementResult, setInitialPlacementResult] = useState<DiagnosticResult | null>(null);

  // Split-Screen Login Visibility (Hidden by default after login, easily toggled)
  const [isSplitLoginOpen, setIsSplitLoginOpen] = useState<boolean>(false);

  // Global AI Loading Overlay State
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState<string>('Analyzing PYQ...');
  const [aiLoadingSubMessage, setAiLoadingSubMessage] = useState<string>(
    'Evaluating Bayesian Knowledge dependencies and curriculum weights'
  );

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Global showLoader helper accessible everywhere
  const showLoader = (
    message = 'Analyzing PYQ...',
    duration = 1400,
    subMessage = 'Synthesizing knowledge tracing parameters...'
  ) => {
    setAiLoadingMessage(message);
    setAiLoadingSubMessage(subMessage);
    setIsAiLoading(true);
    if (duration && duration > 0) {
      setTimeout(() => {
        setIsAiLoading(false);
      }, duration);
    }
  };

  // Current logged in student user (Defaults to Maya Lin for hackathon demo)
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS[0]);

  // Current active subject / course track
  const [activeCourse, setActiveCourse] = useState<CourseMetadata>(AVAILABLE_COURSES[0]);

  // Expose showLoader to global window for external triggers
  useEffect(() => {
    (window as any).showLoader = showLoader;
    // Initialize free Firebase authentication & Firestore sync
    initAnonymousAuth().then(fbUser => {
      if (fbUser) {
        saveUserToFirebase(currentUser);
      }
    });
    return () => {
      delete (window as any).showLoader;
    };
  }, []);

  // Sync user state changes to Firebase Firestore
  useEffect(() => {
    saveUserToFirebase(currentUser);
  }, [currentUser]);

  // Knowledge Graph nodes state (dictionary of nodes)
  const [nodes, setNodes] = useState<Record<string, ConceptNode>>(() => {
    const map: Record<string, ConceptNode> = {};
    INITIAL_PYTHON_NODES.forEach(n => {
      map[n.id] = { ...n };
    });
    return map;
  });

  // Current active persona
  const [activePersonaId, setActivePersonaId] = useState<string>(DEMO_PERSONAS[0].id);

  // Active question being assessed in the Adaptive Studio
  const [activeQuestion, setActiveQuestion] = useState<PythonQuestion>(PYTHON_QUESTION_BANK[0]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [lastConfidence, setLastConfidence] = useState<ConfidenceLevel>('high');

  // Root-cause gap & graph highlight states
  const [rootCauseGapNodeId, setRootCauseGapNodeId] = useState<string | null>(null);
  const [surfaceFailedNodeId, setSurfaceFailedNodeId] = useState<string | null>(null);
  const [rewindPathNodeIds, setRewindPathNodeIds] = useState<string[]>([]);

  // Explainability card context
  const [explainabilityContext, setExplainabilityContext] = useState<ExplainabilityContext | null>(null);

  // Micro-lesson drawer state
  const [activeLesson, setActiveLesson] = useState<MicroLesson | null>(null);
  const [isMicroLessonOpen, setIsMicroLessonOpen] = useState<boolean>(false);

  // AI Tutor drawer state
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiTutorTopic, setAiTutorTopic] = useState<string>('Functions & Return Values');
  const [aiTutorMisconception, setAiTutorMisconception] = useState<string | undefined>();

  // Modals state
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCourseSelectOpen, setIsCourseSelectOpen] = useState<boolean>(false);
  const [isCustomTopicModalOpen, setIsCustomTopicModalOpen] = useState<boolean>(false);

  // 1-Click Guided Demo walkthrough step
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  // Active learning path
  const [learningPath, setLearningPath] = useState<LearningPathItem[]>(() => {
    const map: Record<string, ConceptNode> = {};
    INITIAL_PYTHON_NODES.forEach(n => {
      map[n.id] = { ...n };
    });
    return generateDynamicLearningPath(map, []);
  });

  // Student Profile Summary
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const map: Record<string, ConceptNode> = {};
    INITIAL_PYTHON_NODES.forEach(n => {
      map[n.id] = { ...n };
    });
    return {
      studentName: `${currentUser.name} (High Confidence • Latent Gaps)`,
      activePersonaId: DEMO_PERSONAS[0].id,
      overallMastery: 52,
      estimatedMinutesToMastery: 40,
      streak: currentUser.streakDays,
      nodes: map,
      misconceptions: {},
      activeLearningPath: generateDynamicLearningPath(map, []),
      recentEvents: []
    };
  });

  // Keep student profile synchronized
  useEffect(() => {
    const nodeList: ConceptNode[] = Object.values(nodes);
    const avgPL = nodeList.reduce((acc, n) => acc + n.pL, 0) / Math.max(1, nodeList.length);
    const overall = Math.round(avgPL * 100);

    const gapCount = nodeList.filter(n => n.status === 'diagnosed_gap').length;
    const estTime = Math.max(10, Math.round((100 - overall) * 0.9 + gapCount * 8));

    setStudentProfile(prev => ({
      ...prev,
      overallMastery: overall,
      estimatedMinutesToMastery: estTime,
      nodes,
      activeLearningPath: learningPath
    }));
  }, [nodes, learningPath]);

  // Handle Course Selection
  const handleSelectCourse = (course: CourseMetadata) => {
    showLoader(`Switching syllabus track to ${course.title}...`, 1000);
    setActiveCourse(course);
    setRootCauseGapNodeId(null);
    setSurfaceFailedNodeId(null);
    setRewindPathNodeIds([]);
    setExplainabilityContext(null);
    setIsAnswerSubmitted(false);
    setSelectedOptionIndex(null);

    const preset = PRESET_CURRICULUMS.find(p => p.id === course.id);
    if (preset) {
      const convertedNodes: Record<string, ConceptNode> = {};
      preset.concepts.forEach((c, idx) => {
        convertedNodes[c.id] = {
          id: c.id,
          name: c.name,
          shortDesc: c.description,
          category: (c.category as any) || 'Syntax & Primitives',
          tier: Math.min(4, Math.floor(idx / 1.5)),
          prerequisites: c.prerequisites,
          pL: 0.35 + idx * 0.08,
          pT: 0.20,
          pG: 0.20,
          pS: 0.10,
          status: idx === 0 ? 'mastered' : 'in_progress',
          misconceptionsDetected: [],
          attemptsCount: 1,
          correctCount: idx === 0 ? 1 : 0
        };
      });

      setNodes(convertedNodes);
      setLearningPath(generateDynamicLearningPath(convertedNodes, []));

      const diagQ = preset.diagnosticQuestions[0];
      if (diagQ) {
        setActiveQuestion({
          id: diagQ.id,
          conceptId: diagQ.conceptId,
          conceptName: diagQ.conceptName,
          title: `${diagQ.conceptName} Assessment`,
          questionText: diagQ.question,
          codeSnippet: diagQ.codeSnippet,
          difficulty: 3,
          options: diagQ.options.map((opt, i) => ({
            text: opt,
            misconceptionLabel: i !== diagQ.correctIndex ? diagQ.misconceptionIfWrong : undefined,
            rootCausePrereqId: diagQ.conceptId,
            pedagogicalNote: i === diagQ.correctIndex ? diagQ.explanation : diagQ.misconceptionIfWrong
          })),
          correctIndex: diagQ.correctIndex,
          correctExplanation: diagQ.explanation,
          whyThisQuestionAppeared: `Selected from ${course.title} curriculum.`
        });
      }
    } else {
      const map: Record<string, ConceptNode> = {};
      INITIAL_PYTHON_NODES.forEach(n => {
        map[n.id] = { ...n };
      });
      setNodes(map);
      setLearningPath(generateDynamicLearningPath(map, []));
      setActiveQuestion(PYTHON_QUESTION_BANK[0]);
    }
  };

  // Handle Custom AI Generated Curriculum
  const handleCustomCurriculumGenerated = (curriculum: PresetCurriculum) => {
    showLoader(`Generating adaptive graph for "${curriculum.name}"...`, 1600);
    const customCourseMeta: CourseMetadata = {
      id: curriculum.id,
      title: curriculum.name,
      badge: 'AI Generated',
      category: curriculum.category,
      difficulty: 'Intermediate',
      nodeCount: curriculum.concepts.length,
      conceptCount: curriculum.concepts.length,
      estimatedHours: 12,
      tagline: curriculum.tagline,
      description: curriculum.tagline,
      icon: 'BrainCircuit',
      tags: curriculum.concepts.map(c => c.name),
      topics: curriculum.concepts.map(c => c.name)
    };

    AVAILABLE_COURSES.unshift(customCourseMeta);
    handleSelectCourse(customCourseMeta);
    setActiveView('dashboard');
  };

  // Select Demo Persona
  const handleSelectPersona = (persona: DemoPersona) => {
    showLoader(`Loading ${persona.name}'s Bayesian Matrix...`, 1100, persona.description);
    setActivePersonaId(persona.id);
    const updatedNodes: Record<string, ConceptNode> = {};
    INITIAL_PYTHON_NODES.forEach(n => {
      const pL = persona.initialMastery[n.id] ?? n.pL;
      let status = n.status;
      if (pL >= 0.7) status = 'mastered';
      else if (pL <= 0.45 && n.tier <= 2) status = 'in_progress';

      updatedNodes[n.id] = {
        ...n,
        pL,
        status: status as any
      };
    });

    setNodes(updatedNodes);
    setRootCauseGapNodeId(null);
    setSurfaceFailedNodeId(null);
    setRewindPathNodeIds([]);
    setExplainabilityContext(null);
    setIsAnswerSubmitted(false);
    setSelectedOptionIndex(null);

    const initialQ =
      PYTHON_QUESTION_BANK.find(q => q.id === persona.demoScenario.startQuestionId) ||
      PYTHON_QUESTION_BANK[0];
    setActiveQuestion(initialQ);

    setStudentProfile(prev => ({
      ...prev,
      studentName: `${currentUser.name} (${persona.name})`,
      activePersonaId: persona.id,
      nodes: updatedNodes
    }));
  };

  // Answer Submission Handler
  const handleAnswerSubmitted = (
    selectedIndex: number,
    chosenOption: QuestionDistractor,
    isCorrect: boolean,
    confidence: ConfidenceLevel
  ) => {
    setSelectedOptionIndex(selectedIndex);
    setIsAnswerSubmitted(true);
    setLastConfidence(confidence);

    const surfaceConceptId = activeQuestion.conceptId;
    const surfaceNode = nodes[surfaceConceptId];
    if (!surfaceNode) return;

    const updatedPL = calculateUpdatedBKT(surfaceNode, isCorrect, confidence);
    const quadrant = evaluateQuadrant(isCorrect, confidence);
    const updatedNodes: Record<string, ConceptNode> = { ...nodes };

    if (isCorrect) {
      updatedNodes[surfaceConceptId] = {
        ...surfaceNode,
        pL: updatedPL,
        correctCount: surfaceNode.correctCount + 1,
        attemptsCount: surfaceNode.attemptsCount + 1,
        status: updatedPL >= 0.7 ? 'mastered' : 'in_progress'
      };

      setRootCauseGapNodeId(null);
      setSurfaceFailedNodeId(null);
      setRewindPathNodeIds([]);

      setExplainabilityContext({
        triggerQuestionId: activeQuestion.id,
        chosenOptionIndex: selectedIndex,
        surfaceConceptId,
        rootCauseConceptId: surfaceConceptId,
        isRemediationTriggered: false,
        quadrant,
        whyAssignedReason: `Great job! Your answer demonstrated mastery in ${surfaceNode.name}. Mastery increased to ${Math.round(updatedPL * 100)}%.`
      });

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      const rootCausePrereqResult = findRootCausePrerequisite(
        surfaceConceptId,
        chosenOption.rootCausePrereqId,
        updatedNodes
      );
      const rootCausePrereqId = rootCausePrereqResult.rootCauseNode.id;

      updatedNodes[surfaceConceptId] = {
        ...surfaceNode,
        pL: updatedPL,
        attemptsCount: surfaceNode.attemptsCount + 1,
        status: 'in_progress'
      };

      if (rootCausePrereqId && updatedNodes[rootCausePrereqId]) {
        const rootNode = updatedNodes[rootCausePrereqId];
        updatedNodes[rootCausePrereqId] = {
          ...rootNode,
          status: 'diagnosed_gap',
          misconceptionsDetected: [
            ...rootNode.misconceptionsDetected,
            chosenOption.misconceptionLabel || 'Latent Contract Violation'
          ]
        };

        setRootCauseGapNodeId(rootCausePrereqId);
        setSurfaceFailedNodeId(surfaceConceptId);
        setRewindPathNodeIds([surfaceConceptId, rootCausePrereqId]);

        const assignedLesson = MICRO_LESSONS[rootCausePrereqId] || MICRO_LESSONS['functions_returns'];
        setActiveLesson(assignedLesson);

        setExplainabilityContext({
          triggerQuestionId: activeQuestion.id,
          chosenOptionIndex: selectedIndex,
          surfaceConceptId,
          rootCauseConceptId: rootCausePrereqId,
          isRemediationTriggered: true,
          chosenMisconception: chosenOption.misconceptionLabel,
          pedagogicalNote: chosenOption.pedagogicalNote,
          quadrant,
          whyAssignedReason: buildExplainabilityReason(
            activeQuestion,
            chosenOption,
            rootNode,
            surfaceNode,
            quadrant
          )
        });
      }
    }

    setNodes(updatedNodes);
    const newPath = generateDynamicLearningPath(updatedNodes, rewindPathNodeIds);
    setLearningPath(newPath);
  };

  // Open Micro-Lesson
  const handleOpenMicroLesson = (conceptId: string) => {
    const lesson = MICRO_LESSONS[conceptId] || MICRO_LESSONS['functions_returns'];
    setActiveLesson(lesson);
    setIsMicroLessonOpen(true);
  };

  // Complete Micro-Lesson Verification
  const handleCompleteVerification = (conceptId: string) => {
    const targetNode = nodes[conceptId];
    if (!targetNode) return;

    const updatedNodes = {
      ...nodes,
      [conceptId]: {
        ...targetNode,
        pL: 0.85,
        status: 'mastered' as const
      }
    };

    setNodes(updatedNodes);
    setRootCauseGapNodeId(null);
    setSurfaceFailedNodeId(null);
    setRewindPathNodeIds([]);
    setIsMicroLessonOpen(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    const surfaceQ =
      PYTHON_QUESTION_BANK.find(q => q.conceptId === 'recursion_base_cases') ||
      PYTHON_QUESTION_BANK[0];
    setActiveQuestion(surfaceQ);
    setIsAnswerSubmitted(false);
    setSelectedOptionIndex(null);
    setExplainabilityContext(null);
  };

  // AI Tutor Trigger
  const handleOpenAiTutor = (topic: string, misconception?: string) => {
    setAiTutorTopic(topic);
    setAiTutorMisconception(misconception);
    setIsAiTutorOpen(true);
  };

  // 1-Click Guided Demo Step Runner
  const handleRunAutoDemoStep = (stepNumber: number) => {
    setDemoStep(stepNumber);
    setIsAutoRunning(true);

    if (stepNumber === 1) {
      showLoader('Loading Maya Lin (High Confidence, Latent Gaps)...', 1000);
      handleSelectPersona(DEMO_PERSONAS[0]);
      setTimeout(() => setIsAutoRunning(false), 1000);
    } else if (stepNumber === 2) {
      showLoader('Maya answers Fibonacci with High Confidence, picking print() trap...', 1200);
      setTimeout(() => {
        handleAnswerSubmitted(
          1,
          activeQuestion.options[1],
          false,
          'high'
        );
        setIsAutoRunning(false);
      }, 1200);
    } else if (stepNumber === 3) {
      showLoader('BKT rewinds path to root cause: Functions & Return Values...', 1000);
      setTimeout(() => {
        if (rootCauseGapNodeId) {
          handleOpenMicroLesson(rootCauseGapNodeId);
        } else {
          handleOpenMicroLesson('functions_returns');
        }
        setIsAutoRunning(false);
      }, 1000);
    } else if (stepNumber === 4) {
      showLoader('Executing code fix in Python Sandbox...', 1200);
      setTimeout(() => {
        handleCompleteVerification(rootCauseGapNodeId || 'functions_returns');
        setIsAutoRunning(false);
      }, 1200);
    }
  };

  // Adaptive Quiz derived data
  const adaptiveQuestionPool: AdaptiveQuestion[] = useMemo(() => {
    if (customGeneratedQuizQuestions && customGeneratedQuizQuestions.length > 0) {
      return customGeneratedQuizQuestions;
    }
    const preset = PRESET_CURRICULUMS.find(p => p.id === activeCourse.id);
    if (preset && preset.adaptivePool && preset.adaptivePool.length > 0) {
      return preset.adaptivePool;
    }
    return PYTHON_QUESTION_BANK.map((q, idx) => ({
      id: q.id,
      conceptId: q.conceptId,
      conceptName: q.conceptName,
      question: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options.map(o => o.text),
      correctIndex: q.correctIndex,
      explanation: q.correctExplanation,
      difficultyRating: q.difficulty || ((idx % 4) + 1),
      bloomsLevel: ((idx % 2 === 0 ? 'apply' : 'analyze') as BloomsTaxonomy),
      hint: q.options[q.correctIndex]?.pedagogicalNote || 'Focus on tracing parameter scopes and stack frames.',
      analogies: {
        eli5: 'Think of this like passing a tray along a cafeteria line.',
        practical: 'In production, this contract prevents silent NoneType exceptions.',
        academic: 'This formalizes call-stack activation records in language semantics.'
      }
    }));
  }, [activeCourse.id, customGeneratedQuizQuestions]);

  const conceptList: Concept[] = useMemo(() => {
    return (Object.values(nodes) as ConceptNode[]).map(n => ({
      id: n.id,
      name: n.name,
      description: n.shortDesc,
      category: n.category,
      prerequisites: n.prerequisites,
      masteryScore: Math.round(n.pL * 100),
      status: (n.status === 'diagnosed_gap'
        ? 'gap'
        : n.status === 'mastered'
        ? 'mastered'
        : 'learning') as any,
      bloomsLevel: 'apply' as BloomsTaxonomy,
      importance: n.tier <= 1 ? 'foundational' : n.tier <= 3 ? 'core' : 'advanced'
    }));
  }, [nodes]);

  const diagnosedGaps: KnowledgeGap[] = useMemo(() => {
    return (Object.values(nodes) as ConceptNode[])
      .filter(n => n.status === 'diagnosed_gap' || (rootCauseGapNodeId && n.id === rootCauseGapNodeId))
      .map(n => ({
        conceptId: n.id,
        conceptName: n.name,
        severity: 'critical' as const,
        rootCause:
          n.misconceptionsDetected[0] ||
          'Confusion between print() output and return value contracts.',
        blockedConcepts: (Object.values(nodes) as ConceptNode[])
          .filter(other => other.prerequisites.includes(n.id))
          .map(o => o.name),
        resolved: false
      }));
  }, [nodes, rootCauseGapNodeId]);

  // Dynamic Breadcrumb Label computation
  const breadcrumbCurrent = useMemo(() => {
    switch (activeView) {
      case 'dashboard':
        return rootCauseGapNodeId
          ? `${nodes[rootCauseGapNodeId]?.name || 'Gap Diagnosis'}`
          : activeQuestion.conceptName || 'Recursion & Call Stacks';
      case 'syllabus':
        return 'Upload Syllabus & PYQ Pattern';
      case 'initial-test':
        return 'Initial Diagnostic Test (Placement: Beginner / Inter / Adv)';
      case 'quiz':
        return 'Adaptive Diagnostic Quiz';
      case 'graph':
        return 'Interactive Knowledge Graph (DAG)';
      case 'profile':
        return 'Student Profile & Mastery Analytics';
      case 'courses':
        return 'Subject & Course Catalog';
      case 'scanner':
        return 'AI Multimodal Document Scanner';
      default:
        return 'Overview';
    }
  }, [activeView, rootCauseGapNodeId, nodes, activeQuestion.conceptName]);

  // Sidebar navigation handler
  const handleNavClick = (
    view: 'dashboard' | 'syllabus' | 'initial-test' | 'quiz' | 'graph' | 'profile' | 'courses' | 'scanner'
  ) => {
    setActiveView(view);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative antialiased selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* =========================================================
          FEATURE 3: GLOBAL AI LOADING OVERLAY (z-index: 9999, blur: 8px)
          ========================================================= */}
      <AiLoadingOverlay
        isVisible={isAiLoading}
        message={aiLoadingMessage}
        subMessage={aiLoadingSubMessage}
      />

      {/* =========================================================
          FEATURE 1: SPLIT-SCREEN LOGIN INTERFACE
          (Hidden by default after login, easily toggled by state)
          ========================================================= */}
      <SplitScreenLogin
        isOpen={isSplitLoginOpen}
        onClose={() => setIsSplitLoginOpen(false)}
        currentUser={currentUser}
        onLogin={user => {
          setCurrentUser(user);
          setStudentProfile(prev => ({
            ...prev,
            studentName: `${user.name} (${DEMO_PERSONAS.find(p => p.id === activePersonaId)?.name || 'Student'})`
          }));
        }}
        onSelectPersona={handleSelectPersona}
        onPostLoginNavigateToSyllabus={() => {
          showLoader('Directing to Syllabus & Initial Placement Assessment...', 1200);
          setActiveView('syllabus');
        }}
        showLoader={showLoader}
      />

      {/* =========================================================
          FEATURE 2: MODERN DASHBOARD LAYOUT
          (Fixed Left Sidebar Menu + De-congested Main Container)
          ========================================================= */}
      <div className="flex-1 flex min-h-screen">
        {/* Fixed Left Sidebar Menu (Desktop) */}
        <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200/90 shadow-xs z-30 flex-col justify-between">
          {/* Top Brand Header */}
          <div>
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Brain className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-tight text-slate-900 font-serif leading-tight">
                    SpectrumX
                  </div>
                  <div className="text-[10px] font-mono font-bold tracking-wider text-cyan-600 uppercase">
                    Adaptive Study Desk
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation Items (Requested in prompt) */}
            <nav className="p-3 space-y-1">
              <div className="px-3 pt-3 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Core Workspace
              </div>

              {/* 1. Dashboard */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    className={`w-4 h-4 ${
                      activeView === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Dashboard</span>
                </div>
                {activeView === 'dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {/* 2. Upload Syllabus & PYQ */}
              <button
                onClick={() => handleNavClick('syllabus')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'syllabus'
                    ? 'bg-cyan-50/80 text-cyan-900 border border-cyan-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText
                    className={`w-4 h-4 ${
                      activeView === 'syllabus' ? 'text-cyan-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Upload Syllabus & PYQ</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-mono font-bold">
                  Step 2
                </span>
              </button>

              {/* 2b. Initial Test (Placement: Beginner / Inter / Adv) */}
              <button
                onClick={() => handleNavClick('initial-test')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'initial-test'
                    ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Brain
                    className={`w-4 h-4 ${
                      activeView === 'initial-test' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Initial Test (Level)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold">
                  {currentUser.level}
                </span>
              </button>

              {/* 3. Adaptive Quiz */}
              <button
                onClick={() => handleNavClick('quiz')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'quiz'
                    ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles
                    className={`w-4 h-4 ${
                      activeView === 'quiz' ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Adaptive Quiz</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono font-bold">
                  BKT
                </span>
              </button>

              {/* 4. Knowledge Graph */}
              <button
                onClick={() => handleNavClick('graph')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'graph'
                    ? 'bg-amber-50/80 text-amber-900 border border-amber-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Network
                    className={`w-4 h-4 ${
                      activeView === 'graph' ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span>Knowledge Graph</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">DAG</span>
              </button>

              {/* 5. Profile */}
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'profile'
                    ? 'bg-stone-100 text-slate-900 border border-stone-300 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User
                    className={`w-4 h-4 ${
                      activeView === 'profile' ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  />
                  <span>Profile</span>
                </div>
                <span className="text-[10px] text-amber-600 font-mono flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {currentUser.streakDays}d
                </span>
              </button>

              <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tools & Intake
              </div>

              {/* 6. AI Doc Scanner */}
              <button
                onClick={() => handleNavClick('scanner')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'scanner'
                    ? 'bg-rose-50/80 text-rose-900 border border-rose-200/80 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ScanLine
                    className={`w-4 h-4 ${
                      activeView === 'scanner' ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <span>AI Doc Scanner</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono">
                  PDF/TXT
                </span>
              </button>

              {/* 7. Courses Catalog */}
              <button
                onClick={() => handleNavClick('courses')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'courses'
                    ? 'bg-slate-100 text-slate-900 border border-slate-300 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Subject Catalog</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar: Current Persona & Switch Student Button */}
          <div className="p-3 border-t border-stone-200/90 bg-stone-50/70 space-y-2">
            {/* Judge Pitch Kit Pill */}
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>3-Min Judge Pitch Kit</span>
            </button>

            {/* Standalone Pure HTML template link */}
            <a
              href="/standalone-demo.html"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-600 text-[11px] font-medium transition-colors"
            >
              <span>Pure Vanilla HTML/CSS/JS Template</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Active User Card with Switch / Sign In Button */}
            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between shadow-xs">
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-sm shrink-0">
                  {currentUser.avatar}
                </div>
                <div className="overflow-hidden text-left">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {currentUser.level}
                  </div>
                </div>
              </div>

              {/* 1-Click Split-Screen Login Button */}
              <button
                onClick={() => setIsSplitLoginOpen(true)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                title="Switch Student Persona or Sign In"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 shadow-2xl transition-transform duration-300 transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
                <Brain className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-slate-900 font-serif">SpectrumX</span>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleNavClick('syllabus')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Upload Syllabus & PYQ</span>
            </button>
            <button
              onClick={() => handleNavClick('initial-test')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <Brain className="w-4 h-4 text-emerald-600" />
              <span>Initial Diagnostic Test ({currentUser.level})</span>
            </button>
            <button
              onClick={() => handleNavClick('quiz')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Adaptive Quiz</span>
            </button>
            <button
              onClick={() => handleNavClick('graph')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <Network className="w-4 h-4 text-amber-600" />
              <span>Knowledge Graph</span>
            </button>
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <User className="w-4 h-4 text-slate-700" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => handleNavClick('scanner')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <ScanLine className="w-4 h-4 text-rose-600" />
              <span>AI Doc Scanner</span>
            </button>
            <button
              onClick={() => handleNavClick('courses')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-stone-100"
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Course Catalog</span>
            </button>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  setIsSplitLoginOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Switch Student Persona</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area: Margin-left for fixed desktop sidebar */}
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          {/* Top Sticky Bar with Breadcrumbs & Action Tools */}
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger + Breadcrumb Trail */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-stone-100 text-slate-700 hover:bg-stone-200"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb trail: e.g. Computer Science > Python Core > Recursion */}
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 overflow-hidden font-medium"
              >
                <span className="hidden sm:inline hover:text-slate-900 cursor-pointer">
                  {activeCourse.category || 'Computer Science'}
                </span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-stone-300 shrink-0" />
                <button
                  onClick={() => setIsCourseSelectOpen(true)}
                  className="hover:text-slate-900 truncate font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                  title="Click to change active subject"
                >
                  <span>{activeCourse.title}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                <span className="font-bold text-slate-900 truncate">
                  {breadcrumbCurrent}
                </span>
              </nav>
            </div>

            {/* Right: Quick Action Tools */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Global AI Loading test trigger */}
              <button
                onClick={() =>
                  showLoader(
                    'Analyzing University Paper Pattern & BKT Graph...',
                    1500,
                    'Evaluating prerequisite dependencies & error distractors'
                  )
                }
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                title="Test Global AI Loading Overlay"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Test AI Loader</span>
              </button>

              {/* AI Tutor Drawer button */}
              <button
                onClick={() =>
                  handleOpenAiTutor(
                    rootCauseGapNodeId
                      ? nodes[rootCauseGapNodeId]?.name
                      : activeQuestion.conceptName,
                    explainabilityContext?.chosenMisconception
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">AI Tutor</span>
              </button>

              {/* Switch Student / Split-Screen Login Button */}
              <button
                onClick={() => setIsSplitLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="text-sm">{currentUser.avatar}</span>
                <span className="hidden sm:inline">Switch Student</span>
              </button>
            </div>
          </header>

          {/* Generous Padding Main Content Area with Light Gray Background */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* VIEW 1: DASHBOARD (Adaptive Studio, Walkthrough bar, Active Question, Explainability, Evolving Profile) */}
            {activeView === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 1. Demo Persona & 3-Minute Walkthrough Controller */}
                <DemoWalkthroughBar
                  activePersonaId={activePersonaId}
                  onSelectPersona={handleSelectPersona}
                  onRunAutoDemoStep={handleRunAutoDemoStep}
                  currentDemoStep={demoStep}
                  isAutoRunning={isAutoRunning}
                  onResetDemo={() => handleSelectPersona(DEMO_PERSONAS[0])}
                />

                {/* 2. Explainable Personalization Card ("Why Am I Seeing This?") */}
                {explainabilityContext && (
                  <ExplainabilityCard
                    context={explainabilityContext}
                    onInspectRootCause={conceptId => {
                      const node = nodes[conceptId];
                      if (node) handleOpenMicroLesson(node.id);
                    }}
                  />
                )}

                {/* 3. Visual Heart of the Demo: Live Knowledge Graph (DAG) */}
                <KnowledgeGraphView
                  nodes={nodes}
                  selectedNodeId={rootCauseGapNodeId || activeQuestion.conceptId}
                  onSelectNode={node => {
                    handleOpenMicroLesson(node.id);
                  }}
                  rootCauseGapNodeId={rootCauseGapNodeId}
                  surfaceFailedNodeId={surfaceFailedNodeId}
                  rewindPathNodeIds={rewindPathNodeIds}
                />

                {/* 4. Two-Column Live Interactive Zone: Active Question + Student Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Active Question Card (7 cols) */}
                  <div className="lg:col-span-7">
                    <ActiveQuestionCard
                      question={activeQuestion}
                      onAnswerSubmitted={handleAnswerSubmitted}
                      onOpenMicroLesson={handleOpenMicroLesson}
                      isAnswerSubmitted={isAnswerSubmitted}
                      selectedOptionIndex={selectedOptionIndex}
                      lastConfidence={lastConfidence}
                    />
                  </div>

                  {/* Evolving Student Profile & Dynamic Path (5 cols) */}
                  <div className="lg:col-span-5">
                    <StudentDashboard
                      profile={studentProfile}
                      onSelectConceptFromPath={conceptId => {
                        const node = nodes[conceptId];
                        if (node) handleOpenMicroLesson(node.id);
                      }}
                      lastQuadrant={explainabilityContext?.quadrant}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: UPLOAD SYLLABUS & PYQ (Requested in Left Sidebar) */}
            {activeView === 'syllabus' && (
              <SyllabusPyqView
                onNavigateToAdaptiveQuiz={() => setActiveView('quiz')}
                onNavigateToKnowledgeGraph={() => setActiveView('graph')}
                activeCourseTitle={activeCourse.title}
                onCreateCourseDomain={(courseMeta, docNodes) => {
                  AVAILABLE_COURSES.unshift(courseMeta);
                  setActiveCourse(courseMeta);
                  saveCourseDomainToFirebase(courseMeta);
                  if (docNodes && Object.keys(docNodes).length > 0) {
                    setNodes(docNodes);
                    setLearningPath(generateDynamicLearningPath(docNodes, []));
                  }
                  showLoader(`Established Course Domain: "${courseMeta.title}"!`, 1500, `Loaded ${courseMeta.nodeCount} concept nodes into the Knowledge Graph DAG & synced to Firebase`);
                }}
                onStartAdaptiveQuizWithQuestions={(questions, subjectName) => {
                  const mapped: AdaptiveQuestion[] = questions.map((q: any, qIdx: number) => ({
                    id: q.id || `adaptive-${qIdx + 1}`,
                    conceptId: q.conceptId || `concept-${qIdx + 1}`,
                    conceptName: q.conceptName || subjectName,
                    question: q.questionText || q.question,
                    codeSnippet: q.codeSnippet,
                    options: Array.isArray(q.options)
                      ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text)
                      : ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctIndex: q.correctIndex ?? 0,
                    explanation: q.explanation || 'Verified solution derived from curriculum materials.',
                    difficultyRating: q.difficulty === 'advanced' ? 4 : q.difficulty === 'intermediate' ? 3 : 1,
                    bloomsLevel: 'apply' as BloomsTaxonomy,
                    hint: q.misconceptionTarget || 'Review foundational definitions and boundary conditions.',
                    analogies: {
                      eli5: `Think of ${q.conceptName || subjectName} like a verified physical protocol.`,
                      practical: `Enforcing this contract prevents defects identified in previous year exam papers.`,
                      academic: `Formal verification aligns directly with university paper pattern criteria.`
                    }
                  }));
                  setCustomGeneratedQuizQuestions(mapped);
                  showLoader(`Launching Adaptive Quiz for "${subjectName}"...`, 1200, `Loaded ${mapped.length} Gemini-synthesized questions`);
                  setActiveView('quiz');
                }}
                onStartInitialTest={(sName, customQuestions) => {
                  setUploadedSyllabusName(sName);
                  if (customQuestions && customQuestions.length >= 3) {
                    setSyllabusCustomQuestions(customQuestions);
                  }
                  showLoader(`Setting up Initial Diagnostic Test for ${sName}...`, 1000);
                  setActiveView('initial-test');
                }}
                showLoader={showLoader}
                userDeterminedLevel={currentUser.level}
              />
            )}

            {/* VIEW 2b: INITIAL PLACEMENT TEST (Determines Beginner, Intermediate, or Advanced Level) */}
            {activeView === 'initial-test' && (
              <InitialPlacementAssessment
                curriculumName={activeCourse.title}
                syllabusFileName={uploadedSyllabusName}
                currentUser={currentUser}
                customQuestions={syllabusCustomQuestions}
                onCompletePlacement={(result: DiagnosticResult) => {
                  setInitialPlacementResult(result);
                  // Save assessment result to Firebase Firestore
                  saveAssessmentToFirebase({
                    id: `assessment-${Date.now()}`,
                    userId: currentUser.id,
                    syllabusName: uploadedSyllabusName,
                    score: result.score,
                    total: result.total,
                    percentage: result.percentage,
                    level: result.level,
                    suggestedTheta: result.suggestedTheta,
                    recommendedFocus: result.recommendedFocus,
                  });
                  // Update current user's level
                  setCurrentUser(prev => ({
                    ...prev,
                    level: result.level,
                    currentGoal: `Targeting ${result.level} Syllabus Path & Gap Remediation`
                  }));
                  // Show loader and navigate to dashboard with calibrated level
                  showLoader(
                    `Calibrating workspace for ${result.level} Level (${result.score}/${result.total} Correct)...`,
                    1500,
                    `Applying IRT parameter theta=${result.suggestedTheta} & generating personalized path`
                  );
                  setActiveView('dashboard');
                }}
                onSkip={() => {
                  setActiveView('dashboard');
                }}
              />
            )}

            {/* VIEW 3: ADAPTIVE QUIZ (Requested in Left Sidebar) */}
            {activeView === 'quiz' && (
              <AdaptiveQuizView
                questionPool={adaptiveQuestionPool}
                concepts={conceptList}
                gaps={diagnosedGaps}
                onCompleteQuiz={results => {
                  showLoader(
                    `Updating BKT Mastery from ${results.correctCount}/${results.questionsAnswered} correct answers...`,
                    1400
                  );
                  confetti({ particleCount: 50, spread: 60 });
                }}
                onOpenAiTutor={conceptName => handleOpenAiTutor(conceptName)}
              />
            )}

            {/* VIEW 4: KNOWLEDGE GRAPH (Requested in Left Sidebar) */}
            {activeView === 'graph' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
                      <Network className="w-3.5 h-3.5 text-amber-600" />
                      <span>Directed Acyclic Graph (DAG) View</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif">
                      Full-Scale Interactive Knowledge Graph
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Visualizing concept dependencies, prerequisite flows, and Bayesian probability distributions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRunAutoDemoStep(2)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Simulate Maya's Failure
                    </button>
                    <button
                      onClick={() => handleCompleteVerification('functions_returns')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Simulate Fix & Mastery
                    </button>
                  </div>
                </div>

                <KnowledgeGraphView
                  nodes={nodes}
                  selectedNodeId={rootCauseGapNodeId || activeQuestion.conceptId}
                  onSelectNode={node => {
                    handleOpenMicroLesson(node.id);
                  }}
                  rootCauseGapNodeId={rootCauseGapNodeId}
                  surfaceFailedNodeId={surfaceFailedNodeId}
                  rewindPathNodeIds={rewindPathNodeIds}
                />
              </div>
            )}

            {/* VIEW 5: PROFILE (Requested in Left Sidebar) */}
            {activeView === 'profile' && (
              <ProfilePageView
                user={currentUser}
                nodes={nodes}
                onUpdateGoal={newGoal => {
                  setCurrentUser(prev => ({ ...prev, currentGoal: newGoal }));
                }}
                onNavigateToCourses={() => setActiveView('courses')}
                onNavigateToStudio={() => setActiveView('dashboard')}
                onOpenLogin={() => setIsSplitLoginOpen(true)}
              />
            )}

            {/* VIEW 6: MULTIMODAL AI DOC SCANNER */}
            {activeView === 'scanner' && (
              <DocumentScannerView
                onLoadDocumentAsCourse={(courseMeta, docNodes) => {
                  AVAILABLE_COURSES.unshift(courseMeta);
                  setActiveCourse(courseMeta);
                  setNodes(docNodes);
                  setLearningPath(generateDynamicLearningPath(docNodes, []));
                  setActiveView('dashboard');
                }}
                onNavigateToStudio={() => setActiveView('dashboard')}
              />
            )}

            {/* VIEW 7: COURSE CATALOG */}
            {activeView === 'courses' && (
              <CourseCatalogView
                activeCourseId={activeCourse.id}
                onSelectCourse={handleSelectCourse}
                onOpenCustomSubject={() => setIsCustomTopicModalOpen(true)}
                onNavigateToStudio={() => setActiveView('dashboard')}
              />
            )}
          </main>

          {/* Academic Studious Footer */}
          <footer className="border-t border-stone-200 bg-white py-6 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 font-serif">SpectrumX</span>
                <span>•</span>
                <span className="italic text-slate-600">
                  “Diagnosing why you fail, not just what.”
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSplitLoginOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Switch Student</span>
                </button>
                <button
                  onClick={() => setActiveView('syllabus')}
                  className="text-cyan-700 hover:text-cyan-900 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Syllabus & PYQ</span>
                </button>
                <button
                  onClick={() => setIsPitchModalOpen(true)}
                  className="text-amber-700 hover:text-amber-900 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Pitch Kit</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Interactive Micro-Lesson Drawer with In-Browser Python Sandbox */}
      {activeLesson && (
        <MicroLessonDrawer
          lesson={activeLesson}
          isOpen={isMicroLessonOpen}
          onClose={() => setIsMicroLessonOpen(false)}
          onCompleteVerification={handleCompleteVerification}
          onOpenAiTutor={handleOpenAiTutor}
        />
      )}

      {/* Context-Aware AI Tutor Drawer */}
      <AiTutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        conceptName={aiTutorTopic}
        initialMisconception={aiTutorMisconception}
      />

      {/* 3-Minute Hackathon Judge Pitch Kit */}
      <HackathonPitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />

      {/* Course / Subject Selection Modal */}
      <CourseSelectModal
        isOpen={isCourseSelectOpen}
        onClose={() => setIsCourseSelectOpen(false)}
        activeCourseId={activeCourse.id}
        onSelectCourse={handleSelectCourse}
        onOpenCustomSubject={() => setIsCustomTopicModalOpen(true)}
      />

      {/* Custom AI Course Synthesizer Modal */}
      <CustomTopicModal
        isOpen={isCustomTopicModalOpen}
        onClose={() => setIsCustomTopicModalOpen(false)}
        onCurriculumGenerated={handleCustomCurriculumGenerated}
      />
    </div>
  );
};

export default App;
