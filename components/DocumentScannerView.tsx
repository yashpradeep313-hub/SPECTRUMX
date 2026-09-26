/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  analyzeDocumentWithAI,
  askDocumentQuestionWithAI,
  DocumentAnalysisResult
} from '../services/geminiService';
import { ConceptNode, PythonQuestion, CourseMetadata } from '../types';
import {
  FileText,
  Upload,
  Sparkles,
  Bot,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  BookOpen,
  Image as ImageIcon,
  FileCode,
  HelpCircle,
  Brain,
  X,
  FileCheck,
  RefreshCw,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DocumentScannerViewProps {
  onLoadDocumentAsCourse: (courseMeta: CourseMetadata, nodes: Record<string, ConceptNode>) => void;
  onNavigateToStudio: () => void;
}

interface UploadedFileState {
  file: File | null;
  fileName: string;
  fileType: string;
  fileSize: string;
  previewUrl?: string;
  base64Data?: string;
  textContent?: string;
}

// Sample Preset Documents for 1-Click Evaluation
const PRESET_SAMPLE_DOCS = [
  {
    name: 'Lecture_Notes_Recursion_and_Stack.pdf',
    type: 'application/pdf',
    size: '142 KB',
    description: 'University lecture notes discussing call-stack execution frames, return values, and recursion base cases.',
    sampleText: `LECTURE 04: RECURSIVE DECOMPOSITION & STACK FRAMES
1. The Core Contract: A recursive function must establish a base condition before recursing.
2. The Stack Frame: Each recursive invocation allocates a new PyFrameObject on the call stack.
3. Common Misconception: Confusing return with print. When a function executes print(), it outputs characters to stdout, but the evaluation stack registers None.
4. Accumulator Pattern: To propagate state across unwind phases, values must be returned through each frame.`
  },
  {
    name: 'CPython_Memory_Bindings.txt',
    type: 'text/plain',
    size: '18 KB',
    description: 'Textbook excerpt analyzing mutable default arguments, object ids, and name binding mechanics in Python.',
    sampleText: `CHAPTER 7: NAME BINDING & MUTABLE DEFAULTS
In Python, function default parameter values are evaluated ONCE at function definition time (def statement), not at invocation time.
Example:
def append_to(element, target=[]):
    target.append(element)
    return target
Here, target points to a single list object created at module import. Subsequent calls without passing a list mutate this identical instance.
Remedy:
def append_to(element, target=None):
    if target is None:
        target = []
    target.append(element)
    return target`
  },
  {
    name: 'Neural_Network_Backpropagation_Notes.jpg',
    type: 'image/jpeg',
    size: '320 KB',
    description: 'Whiteboard diagram notes breaking down Chain Rule calculus, computational graphs, and loss gradient propagation.',
    sampleText: `BACKPROPAGATION & COMPUTATIONAL GRAPHS
Formula: dL/dw = dL/dy * dy/dz * dz/dw
Invariant: Loss gradients flow backwards from scalar loss output to weight tensors via vector-Jacobian products.
Pitfall: Vanishing gradients in deep sigmoid networks where derivative saturates at extremes (max 0.25).
Solution: ReLU activation or residual skip connections.`
  }
];

export const DocumentScannerView: React.FC<DocumentScannerViewProps> = ({
  onLoadDocumentAsCourse,
  onNavigateToStudio
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active uploaded file
  const [activeDoc, setActiveDoc] = useState<UploadedFileState | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);

  // Interactive Document Q&A Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Active Practice Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<Record<string, boolean>>({});

  // Read file as Base64 or Text
  const processUploadedFile = (file: File) => {
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.py');
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const docState: UploadedFileState = {
          file,
          fileName: file.name,
          fileType: file.type || 'text/plain',
          fileSize: sizeStr,
          textContent: text
        };
        setActiveDoc(docState);
        triggerAnalysis(docState);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(',')[1];
        const docState: UploadedFileState = {
          file,
          fileName: file.name,
          fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          fileSize: sizeStr,
          previewUrl: isImage ? dataUrl : undefined,
          base64Data: base64
        };
        setActiveDoc(docState);
        triggerAnalysis(docState);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Load a 1-Click Sample Document
  const handleLoadSample = (sample: typeof PRESET_SAMPLE_DOCS[0]) => {
    const docState: UploadedFileState = {
      file: null,
      fileName: sample.name,
      fileType: sample.type,
      fileSize: sample.size,
      textContent: sample.sampleText
    };
    setActiveDoc(docState);
    triggerAnalysis(docState);
  };

  // Run AI Analysis
  const triggerAnalysis = async (doc: UploadedFileState) => {
    setIsScanning(true);
    setAnalysisResult(null);
    setChatMessages([]);
    setQuizAnswers({});
    setSubmittedQuiz({});

    try {
      const result = await analyzeDocumentWithAI({
        fileName: doc.fileName,
        fileType: doc.fileType,
        base64Data: doc.base64Data,
        textContent: doc.textContent
      });

      setAnalysisResult(result);
      setChatMessages([
        {
          sender: 'ai',
          text: `I've finished scanning "${doc.fileName}". I extracted ${result.extractedConcepts.length} core concepts and flagged ${result.diagnosedMisconceptions.length} common pitfalls. Ask me any question about this document below!`
        }
      ]);
    } catch (e) {
      console.error("Scanning error", e);
    } finally {
      setIsScanning(false);
    }
  };

  // Ask Question to Document
  const handleAskQuestion = async (textToSend: string) => {
    if (!textToSend.trim() || isAnswering || !activeDoc || !analysisResult) return;

    const userText = textToSend.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setQuestionInput('');
    setIsAnswering(true);

    try {
      const answer = await askDocumentQuestionWithAI({
        fileName: activeDoc.fileName,
        fileType: activeDoc.fileType,
        base64Data: activeDoc.base64Data,
        textContent: activeDoc.textContent,
        documentSummary: analysisResult.summary,
        question: userText
      });

      setChatMessages(prev => [...prev, { sender: 'ai', text: answer }]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Based on "${activeDoc.fileName}": Key mental model requires breaking down the problem into base cases and recursive return contracts.`
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  // Convert Document Concepts into a live DAG course track
  const handleLoadAsDAGTrack = () => {
    if (!analysisResult) return;

    const courseId = `doc-${Date.now()}`;
    const newCourse: CourseMetadata = {
      id: courseId,
      title: analysisResult.title,
      badge: 'Scanned Document',
      category: 'User Documents',
      difficulty: 'Intermediate',
      nodeCount: analysisResult.extractedConcepts.length,
      estimatedHours: 8,
      tagline: analysisResult.summary,
      description: analysisResult.summary,
      icon: 'BookOpen',
      tags: analysisResult.extractedConcepts.map(c => c.name),
      topics: analysisResult.extractedConcepts.map(c => c.name)
    };

    const newNodes: Record<string, ConceptNode> = {};
    analysisResult.extractedConcepts.forEach((c, idx) => {
      newNodes[c.id] = {
        id: c.id,
        name: c.name,
        shortDesc: c.description,
        category: 'Syntax & Primitives',
        tier: idx,
        prerequisites: c.prerequisites,
        pL: 0.35 + idx * 0.1,
        pT: 0.20,
        pG: 0.20,
        pS: 0.10,
        status: idx === 0 ? 'mastered' : 'in_progress',
        misconceptionsDetected: [],
        attemptsCount: 1,
        correctCount: idx === 0 ? 1 : 0
      };
    });

    confetti({ particleCount: 50, spread: 60 });
    onLoadDocumentAsCourse(newCourse, newNodes);
    onNavigateToStudio();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Multimodal Academic Document Scanner (PDF • TXT • JPG / PNG)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
          AI Document Scanner & Tutor
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Upload any lecture note, textbook page, whiteboard photo, or code snippet.
          Gemini extracts the prerequisite dependency graph, identifies student pitfalls, and answers questions.
        </p>
      </div>

      {/* Upload Zone & Sample Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Drag & Drop Upload Card (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Upload Document to Scan
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                PDF, TXT, MD, PY, JPG, PNG
              </span>
            </div>

            {/* Dropzone Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-indigo-400 bg-stone-50/60 hover:bg-indigo-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.py,.js,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                <FileText className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 font-serif">
                  Click to browse or drag & drop document
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PDF textbooks, text lecture notes, Python code, or whiteboard photos (up to 20MB)
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-white border border-stone-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs hover:border-indigo-500 transition-colors"
              >
                Select Local File
              </button>
            </div>
          </div>

          {/* Active File Banner */}
          {activeDoc && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  {activeDoc.fileType.includes('pdf') ? (
                    <FileText className="w-4 h-4" />
                  ) : activeDoc.fileType.includes('image') ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileCode className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <span className="font-bold text-slate-900 block truncate">{activeDoc.fileName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{activeDoc.fileType} • {activeDoc.fileSize}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isScanning ? (
                  <span className="flex items-center gap-1.5 font-bold text-indigo-700 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with Gemini...</span>
                  </span>
                ) : (
                  <button
                    onClick={() => triggerAnalysis(activeDoc)}
                    className="p-1.5 rounded-lg bg-white border border-stone-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    title="Re-scan document"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: 1-Click Preset Sample Documents (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-base font-bold text-slate-900 font-serif">
                1-Click Sample Documents
              </h2>
              <span className="text-xs text-amber-700 font-semibold font-mono">Demo Ready</span>
            </div>
            <p className="text-xs text-slate-500">
              Don't have a document on hand? Click any sample academic document below for instant analysis:
            </p>

            <div className="space-y-2.5">
              {PRESET_SAMPLE_DOCS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-xs space-y-1 ${
                    activeDoc?.fileName === sample.name
                      ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500'
                      : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[200px] flex items-center gap-1.5">
                      {sample.type.includes('pdf') ? '📑' : sample.type.includes('image') ? '🖼️' : '📝'}
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200/70 text-slate-600">
                      {sample.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {sample.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
            <span className="font-bold block font-serif">Multimodal Engine Support:</span>
            <span>Gemini 3.8 Flash parses text, visual geometry, formulas, and code structure simultaneously.</span>
          </div>
        </div>
      </div>

      {/* Loading Scanning State */}
      {isScanning && (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Analyzing Document & Extracting Cognitive Prerequisite Graph...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Extracting foundational axioms, identifying student misconception traps, and structuring adaptive questions.
            </p>
          </div>
        </div>
      )}

      {/* Scanned Document Intelligence Analysis */}
      {analysisResult && !isScanning && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Synthesized Curriculum
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-serif mt-1">
                  {analysisResult.title}
                </h2>
              </div>

              <button
                onClick={handleLoadAsDAGTrack}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>Load as Live Subject on DAG Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Document Summary */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Document Overview & Thesis:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {analysisResult.summary}
              </p>
            </div>

            {/* Key Takeaways & Misconceptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Key Takeaways */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Key Document Insights & Principles:
                </h3>
                <div className="space-y-2">
                  {analysisResult.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identified Misconceptions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Common Student Pitfalls in this Material:
                </h3>
                <div className="space-y-2">
                  {analysisResult.diagnosedMisconceptions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">{item.topic}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold">
                          Trap
                        </span>
                      </div>
                      <p className="text-rose-800">❌ {item.misconception}</p>
                      <p className="text-slate-600 pt-1 border-t border-rose-100/70">
                        💡 <strong>Remedy:</strong> {item.remedy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Extracted Concept Hierarchy (Prerequisite Graph) */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-serif flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Extracted Prerequisite Knowledge Nodes:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysisResult.extractedConcepts.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs font-serif">{c.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-slate-700 font-semibold">
                        {c.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {c.description}
                    </p>
                    {c.prerequisites.length > 0 && (
                      <span className="text-[10px] text-indigo-700 font-mono block">
                        Requires: {c.prerequisites.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Two-Column Section: Document Q&A + Practice Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Chat with Document (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-serif">
                      Ask Questions About This Document
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Grounded strictly in the scanned text, formulas, and diagrams
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                          : 'bg-stone-50 border border-stone-200 text-slate-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-70 uppercase font-semibold">
                        {msg.sender === 'user' ? 'Student' : 'Document Assistant'}
                      </span>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {isAnswering && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Analyzing document sections to answer...</span>
                  </div>
                )}
              </div>

              {/* Suggested Quick Questions */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Ask:</span>
                {[
                  'What is the core prerequisite?',
                  'Why does the misconception fail?',
                  'Give an intuitive analogy'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(prompt)}
                    className="px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200 text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="pt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={e => setQuestionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskQuestion(questionInput)}
                  placeholder={`Ask anything about "${activeDoc?.fileName || 'document'}"...`}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  onClick={() => handleAskQuestion(questionInput)}
                  disabled={!questionInput.trim() || isAnswering}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Instant Practice Quiz from Document (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                    ?
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-serif">
                      Document Verification Quiz
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Auto-generated from scanned concepts
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {analysisResult.generatedQuestions.map((q, qIdx) => {
                  const selected = quizAnswers[q.id];
                  const isSubmitted = submittedQuiz[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-700 font-mono">
                          Question {qIdx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {q.conceptName}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-900 leading-snug">
                        {q.questionText}
                      </p>

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          const isCorrect = optIdx === q.correctIndex;

                          let style = 'bg-white hover:bg-stone-50 border-stone-200 text-slate-700';
                          if (isSubmitted) {
                            if (isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                            else if (isOptionSelected) style = 'bg-rose-50 border-rose-500 text-rose-950';
                            else style = 'opacity-50 border-stone-200 text-slate-400';
                          } else if (isOptionSelected) {
                            style = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!isSubmitted) {
                                  setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 cursor-pointer ${style}`}
                            >
                              <span className="w-4 h-4 rounded bg-stone-100 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit / Explanation */}
                      {!isSubmitted && selected !== undefined && (
                        <button
                          onClick={() => {
                            setSubmittedQuiz(prev => ({ ...prev, [q.id]: true }));
                            if (selected === q.correctIndex) {
                              confetti({ particleCount: 30, spread: 50 });
                            }
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Check Answer
                        </button>
                      )}

                      {isSubmitted && (
                        <div className="p-2.5 rounded-lg bg-stone-100 text-[11px] text-slate-700 space-y-1">
                          <span className="font-bold block text-slate-900">
                            {selected === q.correctIndex ? '✅ Correct!' : '❌ Missed.'}
                          </span>
                          <p>{q.correctExplanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
