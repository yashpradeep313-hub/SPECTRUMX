/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConceptNode, PythonQuestion, MicroLesson, DemoPersona } from '../types';

export const INITIAL_PYTHON_NODES: ConceptNode[] = [
  // Tier 0: Root Foundations
  {
    id: 'variables_types',
    name: 'Variables & Assignment',
    shortDesc: 'Object references, memory binding, and dynamic typing.',
    category: 'Syntax & Primitives',
    tier: 0,
    prerequisites: [],
    pL: 0.85,
    pT: 0.15,
    pG: 0.20,
    pS: 0.05,
    status: 'mastered',
    misconceptionsDetected: [],
    attemptsCount: 3,
    correctCount: 3
  },
  {
    id: 'booleans_conditionals',
    name: 'Conditionals & Truthiness',
    shortDesc: 'Boolean evaluation, truthy/falsy values, and branch flow.',
    category: 'Syntax & Primitives',
    tier: 0,
    prerequisites: [],
    pL: 0.80,
    pT: 0.15,
    pG: 0.20,
    pS: 0.05,
    status: 'mastered',
    misconceptionsDetected: [],
    attemptsCount: 2,
    correctCount: 2
  },

  // Tier 1: Core Iteration & Sequences
  {
    id: 'while_loops',
    name: 'While Loops & Termination',
    shortDesc: 'Conditional iterations, sentinel variables, and infinite loop prevention.',
    category: 'Control Flow',
    tier: 1,
    prerequisites: ['booleans_conditionals'],
    pL: 0.70,
    pT: 0.20,
    pG: 0.15,
    pS: 0.10,
    status: 'mastered',
    misconceptionsDetected: [],
    attemptsCount: 2,
    correctCount: 2
  },
  {
    id: 'for_loops_range',
    name: 'For Loops & range()',
    shortDesc: 'Iterating over iterables and half-open intervals [start, stop).',
    category: 'Control Flow',
    tier: 1,
    prerequisites: ['variables_types'],
    pL: 0.65,
    pT: 0.20,
    pG: 0.20,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 1,
    correctCount: 1
  },
  {
    id: 'lists_indexing',
    name: 'Lists & Zero-Indexing',
    shortDesc: 'Ordered sequences, 0-based offset indexing, and negative indices.',
    category: 'Data Structures',
    tier: 1,
    prerequisites: ['variables_types'],
    pL: 0.75,
    pT: 0.20,
    pG: 0.15,
    pS: 0.08,
    status: 'mastered',
    misconceptionsDetected: [],
    attemptsCount: 2,
    correctCount: 2
  },

  // Tier 2: Functions, Slicing & Mappings
  {
    id: 'loop_bounds_slicing',
    name: 'List Slicing & Boundary Bounds',
    shortDesc: 'Sub-sequence extraction [start:stop:step] and off-by-one edge handling.',
    category: 'Data Structures',
    tier: 2,
    prerequisites: ['for_loops_range', 'lists_indexing'],
    pL: 0.50,
    pT: 0.25,
    pG: 0.15,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 1,
    correctCount: 0
  },
  {
    id: 'functions_returns',
    name: 'Functions & Return Values',
    shortDesc: 'Call semantics, parameter passing, and the crucial distinction between return vs print().',
    category: 'Functions & Scope',
    tier: 2,
    prerequisites: ['variables_types'],
    pL: 0.42, // Deliberately lower in initial state for demonstration!
    pT: 0.20,
    pG: 0.25,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 2,
    correctCount: 1
  },
  {
    id: 'dictionaries_hashing',
    name: 'Dictionaries & Hash Maps',
    shortDesc: 'Key-value associative pairs, hashing invariants, and O(1) lookups.',
    category: 'Data Structures',
    tier: 2,
    prerequisites: ['lists_indexing'],
    pL: 0.35,
    pT: 0.20,
    pG: 0.20,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  },

  // Tier 3: Scope, Mutability & Traps
  {
    id: 'scope_namespaces',
    name: 'Variable Scope & Shadowing (LEGB)',
    shortDesc: 'Local, Enclosing, Global, Built-in namespace resolution and UnboundLocalError.',
    category: 'Functions & Scope',
    tier: 3,
    prerequisites: ['functions_returns'],
    pL: 0.30,
    pT: 0.25,
    pG: 0.15,
    pS: 0.12,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  },
  {
    id: 'mutable_defaults',
    name: 'Mutable Default Arguments Trap',
    shortDesc: 'Default argument evaluation at function definition time vs execution call time.',
    category: 'Functions & Scope',
    tier: 3,
    prerequisites: ['functions_returns', 'lists_indexing'],
    pL: 0.25,
    pT: 0.30,
    pG: 0.15,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  },
  {
    id: 'list_mutability',
    name: 'Aliasing & In-Place Mutation',
    shortDesc: 'Reference sharing (a = b) vs shallow/deep copying and mutating while iterating.',
    category: 'Data Structures',
    tier: 3,
    prerequisites: ['lists_indexing'],
    pL: 0.40,
    pT: 0.25,
    pG: 0.20,
    pS: 0.10,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 1,
    correctCount: 0
  },

  // Tier 4: Advanced Synthesis & Recursion
  {
    id: 'recursion_base_cases',
    name: 'Recursion & Base Case Invariants',
    shortDesc: 'Recursive problem breakdown, self-referential calls, and base case convergence.',
    category: 'Advanced Algorithms',
    tier: 4,
    prerequisites: ['functions_returns', 'booleans_conditionals'],
    pL: 0.20,
    pT: 0.25,
    pG: 0.15,
    pS: 0.15,
    status: 'in_progress',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  },
  {
    id: 'call_stack_frames',
    name: 'Recursive Call Stack & Memory',
    shortDesc: 'Activation records, unwinding return values, and RecursionError limits.',
    category: 'Advanced Algorithms',
    tier: 4,
    prerequisites: ['recursion_base_cases', 'scope_namespaces'],
    pL: 0.10,
    pT: 0.25,
    pG: 0.10,
    pS: 0.15,
    status: 'locked',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  },
  {
    id: 'comprehensions_lambdas',
    name: 'List Comprehensions & Mapping',
    shortDesc: 'Concise functional syntax for transforming sequences and filtering elements.',
    category: 'Advanced Algorithms',
    tier: 4,
    prerequisites: ['for_loops_range', 'functions_returns'],
    pL: 0.15,
    pT: 0.30,
    pG: 0.20,
    pS: 0.10,
    status: 'locked',
    misconceptionsDetected: [],
    attemptsCount: 0,
    correctCount: 0
  }
];

export const PYTHON_QUESTION_BANK: PythonQuestion[] = [
  // 1. RECURSION QUESTION (The Star Demo Trigger!)
  {
    id: 'q-rec-1',
    conceptId: 'recursion_base_cases',
    conceptName: 'Recursion & Base Case Invariants',
    title: 'Recursive Countdown with Subproblem Return',
    questionText: 'What does this recursive function return when called with `mystery(3)`?',
    codeSnippet: `def mystery(n):
    if n <= 0:
        return 0
    return n + mystery(n - 1)

result = mystery(3)`,
    difficulty: 3,
    whyThisQuestionAppeared: 'Validating recursive composition and return value propagation across stack unwinding.',
    options: [
      {
        text: '6',
        pedagogicalNote: 'Correct! mystery(3) = 3 + mystery(2) = 3 + 2 + 1 + 0 = 6.'
      },
      {
        text: 'None',
        misconceptionId: 'misc-print-vs-return',
        misconceptionLabel: 'Confusing print() side-effect with return value',
        rootCausePrereqId: 'functions_returns',
        pedagogicalNote: 'Student believes functions without print() return None or that recursive calls do not pass return values up.'
      },
      {
        text: '3 (it stops after the first step without combining)',
        misconceptionId: 'misc-recursion-no-unwind',
        misconceptionLabel: 'Failing to unwind recursive calls (ignoring stack accumulation)',
        rootCausePrereqId: 'functions_returns',
        pedagogicalNote: 'Root cause: Does not realize return expressions wait for inner function evaluation to finish.'
      },
      {
        text: 'RecursionError: maximum recursion depth exceeded',
        misconceptionId: 'misc-missing-base-case-awareness',
        misconceptionLabel: 'Assuming base case n <= 0 is never reached',
        rootCausePrereqId: 'booleans_conditionals',
        pedagogicalNote: 'Overlooked the base case termination condition.'
      }
    ],
    correctIndex: 0,
    correctExplanation: '3 + mystery(2) -> 3 + (2 + mystery(1)) -> 3 + 2 + (1 + mystery(0)) -> 3 + 2 + 1 + 0 = 6.'
  },

  // 2. ROOT-CAUSE VERIFICATION QUESTION FOR FUNCTIONS & RETURN VALUES
  {
    id: 'q-func-verify-1',
    conceptId: 'functions_returns',
    conceptName: 'Functions & Return Values',
    title: 'Understanding the return Contract',
    questionText: 'What is stored in variable `ans` after executing this code snippet?',
    codeSnippet: `def compute_tax(amount):
    total = amount * 0.1
    print(total)

ans = compute_tax(100)`,
    difficulty: 1,
    whyThisQuestionAppeared: 'Remediation question: Diagnosing whether you distinguish printing to terminal from returning a value to the caller.',
    options: [
      {
        text: 'None',
        pedagogicalNote: 'Correct! Because compute_tax has no return statement, Python implicitly returns None.'
      },
      {
        text: '10.0',
        misconceptionId: 'misc-print-as-return',
        misconceptionLabel: 'Believing print() outputs are assigned to variables',
        rootCausePrereqId: 'functions_returns',
        pedagogicalNote: 'print() is an I/O side-effect that displays text on the screen; only return hands back a value to the calling expression.'
      },
      {
        text: 'Error: Cannot assign print to variable',
        misconceptionId: 'misc-syntax-misunderstanding',
        misconceptionLabel: 'Believing assignment from a void function is a syntax error',
        rootCausePrereqId: 'variables_types',
        pedagogicalNote: 'In Python, all functions return None by default if no return statement is executed.'
      },
      {
        text: '100',
        misconceptionId: 'misc-default-echo',
        misconceptionLabel: 'Assuming function returns input parameter by default',
        rootCausePrereqId: 'functions_returns',
        pedagogicalNote: 'Functions do not return their arguments unless explicitly coded with `return amount`.'
      }
    ],
    correctIndex: 0,
    correctExplanation: 'In Python, `print()` only outputs characters to stdout; without an explicit `return total`, the function evaluates to `None`!'
  },

  // 3. MUTABLE DEFAULT ARGUMENT (Classic Trap)
  {
    id: 'q-mut-1',
    conceptId: 'mutable_defaults',
    conceptName: 'Mutable Default Arguments Trap',
    title: 'The Default List Accumulation Trap',
    questionText: 'What will be printed when running the following Python code?',
    codeSnippet: `def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item('apple'))
print(add_item('banana'))`,
    difficulty: 3,
    whyThisQuestionAppeared: 'Testing function parameter initialization lifecycle and persistent object references.',
    options: [
      {
        text: "['apple'] and then ['apple', 'banana']",
        pedagogicalNote: 'Correct! The default list [] is created ONCE at function definition time, so mutations persist across all invocations.'
      },
      {
        text: "['apple'] and then ['banana']",
        misconceptionId: 'misc-fresh-default-myth',
        misconceptionLabel: 'Assuming default arguments are re-instantiated on every call',
        rootCausePrereqId: 'mutable_defaults',
        pedagogicalNote: 'Classic Python trap: Default expressions are evaluated only ONCE when `def` is parsed, not on each call.'
      },
      {
        text: "['banana'] and then ['banana']",
        misconceptionId: 'misc-overwriting-state',
        misconceptionLabel: 'Believing second call overwrites first element',
        rootCausePrereqId: 'list_mutability',
        pedagogicalNote: 'list.append() adds to the end of the existing list in-place.'
      },
      {
        text: "TypeError: cannot use mutable type in default parameter",
        misconceptionId: 'misc-compiler-restriction',
        misconceptionLabel: 'Assuming Python compiler forbids mutable defaults',
        rootCausePrereqId: 'functions_returns',
        pedagogicalNote: 'Python permits mutable defaults, though it is widely considered an antipattern.'
      }
    ],
    correctIndex: 0,
    correctExplanation: 'Python evaluates default parameter expressions once at definition time. The list `basket` points to the same object across calls.'
  },

  // 4. FOR LOOPS & RANGE OFF-BY-ONE
  {
    id: 'q-loop-1',
    conceptId: 'for_loops_range',
    conceptName: 'For Loops & range()',
    title: 'Loop Range Boundary Exploration',
    questionText: 'How many times does the print statement execute in this loop?',
    codeSnippet: `count = 0
for i in range(1, 5):
    count += 1
print(count)`,
    difficulty: 2,
    whyThisQuestionAppeared: 'Testing upper-bound half-open interval semantics in range(start, stop).',
    options: [
      {
        text: '4 times (values: 1, 2, 3, 4)',
        pedagogicalNote: 'Correct! range(start, stop) generates values up to but NOT including stop.'
      },
      {
        text: '5 times (values: 1, 2, 3, 4, 5)',
        misconceptionId: 'misc-range-inclusive-stop',
        misconceptionLabel: 'Assuming range(a, b) includes the upper bound b',
        rootCausePrereqId: 'for_loops_range',
        pedagogicalNote: 'Common off-by-one misconception: range(1, 5) stops at 4.'
      },
      {
        text: '3 times',
        misconceptionId: 'misc-range-double-exclusive',
        misconceptionLabel: 'Assuming both start and stop are exclusive',
        rootCausePrereqId: 'for_loops_range',
        pedagogicalNote: 'The start index is inclusive.'
      },
      {
        text: 'Infinite loop',
        misconceptionId: 'misc-loop-confusion',
        misconceptionLabel: 'Confusing for loop with unbounded while loop',
        rootCausePrereqId: 'while_loops',
        pedagogicalNote: 'For loops over range() always terminate after finite sequence steps.'
      }
    ],
    correctIndex: 0,
    correctExplanation: 'range(1, 5) produces [1, 2, 3, 4] — exactly 4 iterations because the upper bound 5 is non-inclusive.'
  },

  // 5. LIST SLICING BOUNDS
  {
    id: 'q-slice-1',
    conceptId: 'loop_bounds_slicing',
    conceptName: 'List Slicing & Boundary Bounds',
    title: 'List Slicing Invariant',
    questionText: 'Given `letters = ["a", "b", "c", "d", "e"]`, what is the output of `letters[1:4]`?',
    difficulty: 2,
    whyThisQuestionAppeared: 'Validating slice boundary notation [start:stop].',
    options: [
      {
        text: "['b', 'c', 'd']",
        pedagogicalNote: 'Correct! Indices 1 ("b"), 2 ("c"), 3 ("d"). Index 4 ("e") is excluded.'
      },
      {
        text: "['b', 'c', 'd', 'e']",
        misconceptionId: 'misc-slice-inclusive-stop',
        misconceptionLabel: 'Believing list slicing upper bound is inclusive',
        rootCausePrereqId: 'for_loops_range',
        pedagogicalNote: 'Slices follow the exact same half-open interval rule as range().'
      },
      {
        text: "['a', 'b', 'c', 'd']",
        misconceptionId: 'misc-one-based-indexing',
        misconceptionLabel: 'Using 1-based indexing instead of 0-based indexing',
        rootCausePrereqId: 'lists_indexing',
        pedagogicalNote: 'letters[0] is "a", so letters[1] starts at "b".'
      },
      {
        text: "['c', 'd']",
        misconceptionId: 'misc-step-confusion',
        misconceptionLabel: 'Confusing index with length',
        rootCausePrereqId: 'lists_indexing',
        pedagogicalNote: 'The slice length is stop - start = 4 - 1 = 3 elements.'
      }
    ],
    correctIndex: 0,
    correctExplanation: 'Slice `[1:4]` takes elements at index 1, 2, and 3: ["b", "c", "d"].'
  }
];

export const MICRO_LESSONS: Record<string, MicroLesson> = {
  functions_returns: {
    id: 'ml-functions-returns',
    conceptId: 'functions_returns',
    conceptName: 'Functions & Return Values',
    targetMisconception: 'Confusing print() with return value',
    title: 'Why `return` Is the Engine of Python (and print is just noise)',
    whyAssigned: 'You answered a Recursion problem, but the real root cause is a fundamental misconception in Functions: expecting return values to behave like print() statements.',
    explanation: `When a function finishes running, it can either hand a value back to whoever called it (using \`return\`), or it hands back \`None\`.\n\n\`print()\` is purely a cosmetic side-effect: it writes text to your monitor terminal screen, but it disappears into thin air! Other parts of your program cannot calculate with what you printed.\n\nIn recursive algorithms, each level of the call stack relies on the return value of the level beneath it. If you forget to return, the chain breaks!`,
    brokenCode: `# ❌ BROKEN: print() does NOT give data to caller!
def calculate_double(x):
    print(x * 2) # prints 8 to console

result = calculate_double(4)
print("Result + 1 =", result + 1)
# 💥 TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`,
    fixedCode: `# ✅ FIXED: return gives the data back to the caller!
def calculate_double(x):
    return x * 2

result = calculate_double(4)
print("Result + 1 =", result + 1) # Output: 9!`,
    codeExplanation: 'Notice that without `return`, `result` is assigned `None`. With `return`, `result` holds the actual integer `8` and can be passed into other functions or recursive calls.',
    interactiveExercise: {
      prompt: 'Modify the function so it returns the square of n instead of printing it:',
      starterCode: `def square(n):\n    # Fix this line:\n    print(n * n)\n\nval = square(5)\nprint("Squared:", val)`,
      expectedSolutionSnippet: 'return n * n',
      hint: 'Replace "print(n * n)" with "return n * n"'
    },
    verificationQuestion: PYTHON_QUESTION_BANK[1] // q-func-verify-1
  },

  mutable_defaults: {
    id: 'ml-mutable-defaults',
    conceptId: 'mutable_defaults',
    conceptName: 'Mutable Default Arguments Trap',
    targetMisconception: 'Assuming default arguments are re-instantiated on every call',
    title: 'The Infamous Python Mutable Default Argument Trap',
    whyAssigned: 'Diagnosed high-confidence blindspot: Assuming `def foo(items=[])` creates a fresh list on every invocation.',
    explanation: `In Python, function default arguments are evaluated **ONCE** when the function definition is executed, NOT each time the function is called!\n\nIf you use a mutable object like a list \`[]\` or dict \`{}\` as a default, every single function call shares the EXACT same instance in memory. Any modification (\`append\`, \`pop\`) mutates the shared instance for all future callers!`,
    brokenCode: `# ❌ TRAP: Shared list persists across calls!
def add_player(name, team=[]):
    team.append(name)
    return team

print(add_player("Alice")) # ['Alice']
print(add_player("Bob"))   # ['Alice', 'Bob'] <- SURPRISE!`,
    fixedCode: `# ✅ IDIOMATIC FIX: Use None as default sentinel!
def add_player(name, team=None):
    if team is None:
        team = [] # Fresh list instantiated per call!
    team.append(name)
    return team

print(add_player("Alice")) # ['Alice']
print(add_player("Bob"))   # ['Bob'] <- Clean & isolated!`,
    codeExplanation: 'By setting the default parameter to immutable `None`, you dynamically allocate a fresh list only inside the function call scope when needed.',
    interactiveExercise: {
      prompt: 'Fix this function using the `item=None` sentinel pattern:',
      starterCode: `def record_log(msg, log_list=[]):\n    # Fix this function:\n    log_list.append(msg)\n    return log_list`,
      expectedSolutionSnippet: 'if log_list is None:',
      hint: 'Set parameter log_list=None, then check if log_list is None: log_list = []'
    },
    verificationQuestion: {
      id: 'q-mut-verify',
      conceptId: 'mutable_defaults',
      conceptName: 'Mutable Default Arguments Trap',
      title: 'Verifying the None Sentinel Pattern',
      questionText: 'What is the Pythonic way to prevent shared state when a function needs an empty list default?',
      difficulty: 2,
      whyThisQuestionAppeared: 'Verifying mastery of the None sentinel pattern.',
      options: [
        {
          text: 'Set `param=None` and initialize `param = []` inside the body if `param is None`',
          pedagogicalNote: 'Correct! This guarantees a new list is allocated per call.'
        },
        {
          text: 'Set `param=copy([])` in the def line',
          misconceptionId: 'misc-def-time-copy',
          misconceptionLabel: 'Believing copy in signature runs per-call',
          pedagogicalNote: 'Still evaluates only once at def-time.'
        },
        {
          text: 'Declare the parameter as `const list param = []`',
          misconceptionId: 'misc-c-syntax-bleed',
          misconceptionLabel: 'Using C/C++ const keywords in Python',
          pedagogicalNote: 'Python has no const parameter keyword.'
        },
        {
          text: 'Never use functions with optional arguments',
          misconceptionId: 'misc-avoidance',
          misconceptionLabel: 'Avoiding optional parameters completely',
          pedagogicalNote: 'Optional parameters are fundamental; simply use immutable sentinels.'
        }
      ],
      correctIndex: 0,
      correctExplanation: 'Setting the default to `None` and conditionally reassigning inside the function ensures fresh allocation on every invocation.'
    }
  }
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'persona-rote-memorizer',
    name: 'The Rote Memorizer',
    tagline: 'Knows syntax, but falls into subtle semantic misconceptions with high confidence.',
    description: 'Understands basic syntax, but conflates print() with return values and believes default arguments are re-created fresh on each call.',
    avatar: '🎓',
    initialMastery: {
      variables_types: 0.90,
      booleans_conditionals: 0.85,
      for_loops_range: 0.75,
      lists_indexing: 0.70,
      functions_returns: 0.45, // Weak foundation!
      recursion_base_cases: 0.30
    },
    demoScenario: {
      startQuestionId: 'q-rec-1',
      deliberateWrongChoice: 1, // Selects 'None' (Confusing print with return)
      expectedRootCauseConceptId: 'functions_returns',
      storyboard: 'Answers Recursion question -> picks "None" with High Confidence -> System rewinds graph to Functions & Return Values (42% mastery) -> Serves targeted micro-lesson on return vs print -> Student solves verification question -> Functions node turns Green -> Recursion unblocks!'
    }
  },
  {
    id: 'persona-skimmer',
    name: 'The Syntax Skimmer',
    tagline: 'Jumped straight to advanced recursion without mastering stack returns.',
    description: 'Skimmed through early chapters, thinks recursion just "repeats" like a while loop without needing return unwinding.',
    avatar: '⚡',
    initialMastery: {
      variables_types: 0.70,
      booleans_conditionals: 0.65,
      while_loops: 0.75,
      for_loops_range: 0.60,
      functions_returns: 0.38,
      recursion_base_cases: 0.15
    },
    demoScenario: {
      startQuestionId: 'q-rec-1',
      deliberateWrongChoice: 2, // Selects '3' (ignoring stack accumulation)
      expectedRootCauseConceptId: 'functions_returns',
      storyboard: 'Answers Recursion with loop intuition -> System detects missing call-stack return contract -> Graph pulses Functions node in red -> Rewrites path to prioritize Functions first.'
    }
  },
  {
    id: 'persona-beginner',
    name: 'Complete Beginner',
    tagline: 'Struggles with off-by-one errors and zero-indexing boundaries.',
    description: 'Just starting Python; prone to off-by-one errors in range() and list slicing.',
    avatar: '🌱',
    initialMastery: {
      variables_types: 0.60,
      booleans_conditionals: 0.50,
      for_loops_range: 0.35,
      lists_indexing: 0.40,
      loop_bounds_slicing: 0.20
    },
    demoScenario: {
      startQuestionId: 'q-loop-1',
      deliberateWrongChoice: 1, // Selects '5 times' (inclusive upper bound)
      expectedRootCauseConceptId: 'for_loops_range',
      storyboard: 'Takes loop question -> picks 5 times -> System tags "range inclusive upper bound" misconception -> Graph highlights range bounds -> Serves half-open interval explanation.'
    }
  }
];
