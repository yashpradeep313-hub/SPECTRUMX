/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PresetCurriculum } from '../types';

export const PRESET_CURRICULUMS: PresetCurriculum[] = [
  {
    id: 'dsa-python',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science',
    icon: 'Binary',
    tagline: 'Master recursion, trees, dynamic programming, and complexity through adaptive mastery.',
    concepts: [
      {
        id: 'c-big-o',
        name: 'Time & Space Complexity (Big-O)',
        description: 'Analyzing algorithmic efficiency, upper bound asymptotic notation, and call-stack space overhead.',
        category: 'Foundations',
        prerequisites: [],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'understand',
        importance: 'foundational'
      },
      {
        id: 'c-recursion',
        name: 'Recursion & The Call Stack',
        description: 'Base cases, recursive transitions, call-stack frames, and tail-call behavior.',
        category: 'Foundations',
        prerequisites: ['c-big-o'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'apply',
        importance: 'foundational'
      },
      {
        id: 'c-binary-trees',
        name: 'Binary Trees & Traversals',
        description: 'Hierarchical node pointer traversal: In-order, Pre-order, Post-order, and Level-order (BFS/DFS).',
        category: 'Data Structures',
        prerequisites: ['c-recursion'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'apply',
        importance: 'core'
      },
      {
        id: 'c-bst-validation',
        name: 'Binary Search Tree (BST) Invariants',
        description: 'Validation invariants (left < root < right), balanced trees, and lookup efficiency.',
        category: 'Data Structures',
        prerequisites: ['c-binary-trees'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'analyze',
        importance: 'core'
      },
      {
        id: 'c-dp-memo',
        name: 'Dynamic Programming: Memoization',
        description: 'Overlapping subproblems, top-down caching of recursive states, and DAG state spaces.',
        category: 'Algorithms',
        prerequisites: ['c-recursion'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'analyze',
        importance: 'core'
      },
      {
        id: 'c-dp-tabulation',
        name: 'DP: Bottom-Up Tabulation & Space Optimization',
        description: 'Iterative state tables, topological evaluation order, and rolling space reduction.',
        category: 'Algorithms',
        prerequisites: ['c-dp-memo'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'evaluate',
        importance: 'advanced'
      },
      {
        id: 'c-graphs-shortest-path',
        name: 'Graph Traversal & Shortest Path (Dijkstra)',
        description: 'Weighted edge priority queues, relaxation invariants, and cycle handling.',
        category: 'Advanced Algorithms',
        prerequisites: ['c-binary-trees', 'c-dp-memo'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'evaluate',
        importance: 'advanced'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'diag-dsa-1',
        conceptId: 'c-big-o',
        conceptName: 'Time & Space Complexity (Big-O)',
        question: 'What is the tightest time and auxiliary space complexity of binary search on an array of N sorted elements implemented recursively?',
        codeSnippet: `def binary_search(arr, low, high, target):
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, low, mid - 1, target)
    else:
        return binary_search(arr, mid + 1, high, target)`,
        options: [
          'Time: O(log N), Auxiliary Space: O(1)',
          'Time: O(log N), Auxiliary Space: O(log N) due to recursive call stack frames',
          'Time: O(N), Auxiliary Space: O(log N)',
          'Time: O(1), Auxiliary Space: O(N)'
        ],
        correctIndex: 1,
        explanation: 'Each recursive step halves the search space (O(log N) time). Without compiler tail-call elimination, each activation frame remains on the call stack, yielding O(log N) auxiliary space.',
        misconceptionIfWrong: 'Neglecting call stack memory overhead when calculating space complexity of recursive solutions.',
        difficulty: 'intermediate',
        bloomsLevel: 'understand'
      },
      {
        id: 'diag-dsa-2',
        conceptId: 'c-recursion',
        conceptName: 'Recursion & The Call Stack',
        question: 'A student writes a recursive function to compute Fibonacci numbers, but for N=50 it hangs indefinitely. What is the fundamental root cause?',
        codeSnippet: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
        options: [
          'The base case is incorrect and causes infinite recursion loop',
          'The call stack overflows because Python has a recursion limit of 10',
          'Exponential time O(2^N) due to redundant recalculation of overlapping subproblems without caching',
          'Python integers cannot represent numbers as large as Fibonacci(50)'
        ],
        correctIndex: 2,
        explanation: 'The naive recursion branches into 2 calls per node creating an execution tree with ~2^50 operations. It has massive overlapping subproblems that require memoization or dynamic programming.',
        misconceptionIfWrong: 'Failing to identify exponential subproblem duplication in tree recursion.',
        difficulty: 'foundational',
        bloomsLevel: 'analyze'
      },
      {
        id: 'diag-dsa-3',
        conceptId: 'c-binary-trees',
        conceptName: 'Binary Trees & Traversals',
        question: 'Which traversal of a Binary Search Tree (BST) visits nodes in strictly monotonically non-decreasing order?',
        options: [
          'Pre-order (Root -> Left -> Right)',
          'In-order (Left -> Root -> Right)',
          'Post-order (Left -> Right -> Root)',
          'Level-order (Breadth-First Queue traversal)'
        ],
        correctIndex: 1,
        explanation: 'Because a BST preserves the property that all keys in the left subtree are smaller than the root, which in turn is smaller than keys in the right subtree, an In-Order traversal (Left -> Root -> Right) processes elements in sorted ascending order.',
        misconceptionIfWrong: 'Confusing tree traversal order sequences and BST ordering invariants.',
        difficulty: 'foundational',
        bloomsLevel: 'understand'
      },
      {
        id: 'diag-dsa-4',
        conceptId: 'c-bst-validation',
        conceptName: 'Binary Search Tree (BST) Invariants',
        question: 'Why is checking only `node.left.val < node.val < node.right.val` insufficient to validate if a binary tree is a valid BST?',
        codeSnippet: `    10
   /  \\
  5    15
      /  \\
     6    20   <-- Notice node 6 is < 15, but violates ancestor 10!`,
        options: [
          'Because duplicate keys are strictly forbidden in all binary trees',
          'Because every node must satisfy upper and lower bounds inherited from all ancestral nodes, not just its direct parent',
          'Because balanced AVL rotations automatically invalidate local node values',
          'Because BST validation requires Breadth-First Search instead of DFS'
        ],
        correctIndex: 1,
        explanation: 'A node must satisfy all bounds from its ancestry. In the diagram, 6 is in the right subtree of 10, so it must be > 10. Checking only the immediate parent (6 < 15) misses this ancestral invariant violation.',
        misconceptionIfWrong: 'Assuming BST property is purely local rather than globally bounded across the ancestral path.',
        difficulty: 'intermediate',
        bloomsLevel: 'analyze'
      },
      {
        id: 'diag-dsa-5',
        conceptId: 'c-dp-memo',
        conceptName: 'Dynamic Programming: Memoization',
        question: 'What are the two necessary and sufficient structural properties a problem must possess to be solvable via Dynamic Programming?',
        options: [
          'Sorted input arrays and binary decision choices',
          'Optimal Substructure and Overlapping Subproblems',
          'Linear recurrence relations and constant space bounds',
          'Greedy choice property and balanced tree representations'
        ],
        correctIndex: 1,
        explanation: 'Dynamic Programming requires (1) Optimal Substructure: an optimal solution can be constructed from optimal solutions of subproblems; and (2) Overlapping Subproblems: recursive algorithms revisit the same subproblems repeatedly rather than generating new ones.',
        misconceptionIfWrong: 'Confusing Greedy strategy prerequisites with Dynamic Programming structural requirements.',
        difficulty: 'intermediate',
        bloomsLevel: 'understand'
      },
      {
        id: 'diag-dsa-6',
        conceptId: 'c-dp-tabulation',
        conceptName: 'DP: Bottom-Up Tabulation & Space Optimization',
        question: 'In the classic 0/1 Knapsack problem with capacity W and N items, what is the space complexity if we optimize the bottom-up table to store only the previous row/state?',
        options: [
          'O(N * W)',
          'O(W) by iterating capacity backwards in a 1D array',
          'O(1) using pointers',
          'O(2^N)'
        ],
        correctIndex: 1,
        explanation: 'Since calculating row `i` only depends on values from row `i-1` at or below capacity `w`, we can compress the 2D matrix into a 1D array of size O(W) traversed backwards to prevent using newly computed values from the current step.',
        misconceptionIfWrong: 'Believing 2D DP problems always strictly require O(N * W) memory allocations.',
        difficulty: 'advanced',
        bloomsLevel: 'evaluate'
      }
    ],
    adaptivePool: [
      {
        id: 'ad-dsa-1',
        conceptId: 'c-recursion',
        conceptName: 'Recursion & The Call Stack',
        difficultyRating: 1,
        question: 'What will happen if a recursive function is called without a valid base case in Python?',
        options: [
          'The function returns None immediately',
          'It continues indefinitely until RecursionError (maximum recursion depth exceeded) is raised',
          'The operating system restarts the Python process',
          'Python automatically converts it into an iterative loop'
        ],
        correctIndex: 1,
        explanation: 'Without a base case to terminate execution, successive stack frames exhaust Python\'s call stack limit (default 1000), raising `RecursionError`.',
        bloomsLevel: 'remember',
        hint: 'Think about how memory is allocated for each function call.',
        analogies: {
          eli5: 'Like a stack of dinner plates piled so high they hit the ceiling and topple over.',
          practical: 'In production, an unanchored recursive search crashes the worker with a stack overflow.',
          academic: 'Activation record frames allocate bounded stack memory; lack of termination condition guarantees unbounded stack allocation.'
        }
      },
      {
        id: 'ad-dsa-2',
        conceptId: 'c-recursion',
        conceptName: 'Recursion & The Call Stack',
        difficultyRating: 2,
        question: 'Consider the recursive countdown function. In what exact order will the numbers be printed?',
        codeSnippet: `def print_nums(n):
    if n == 0:
        return
    print(n, end=' ')
    print_nums(n - 1)
    print(n, end=' ')

print_nums(2)`,
        options: [
          '2 1 1 2',
          '2 1 0 1 2',
          '2 1 2 1',
          '1 2 2 1'
        ],
        correctIndex: 0,
        explanation: 'Before the recursive call: prints 2, then prints 1. Reaching base case returns. As stack frames unwind: prints 1, then prints 2. Output is "2 1 1 2".',
        bloomsLevel: 'apply',
        hint: 'Trace the pre-recursive statements, the base case hit, and the post-recursive unwinding.',
        analogies: {
          eli5: 'Walking down into a cave writing your step number on the way down, then touching the bottom and writing the step number again on your way back up.',
          practical: 'Pre-order and post-order logic in tree traversals rely on this exact before-and-after call mechanic.',
          academic: 'The execution trajectory follows the Euler tour of the activation tree.'
        }
      },
      {
        id: 'ad-dsa-3',
        conceptId: 'c-dp-memo',
        conceptName: 'Dynamic Programming: Memoization',
        difficultyRating: 3,
        question: 'When implementing top-down memoization in Python, why should recursive parameters passed into a memo dictionary key be immutable (like tuples instead of lists)?',
        options: [
          'Lists take up more RAM than tuples in Python 3',
          'Dict keys in Python must be hashable; mutable objects like lists cannot be hashed because their contents can mutate',
          'Tuples execute recursive calls 10x faster due to CPython bytecode optimization',
          'Python dicts only accept strings and integers as keys'
        ],
        correctIndex: 1,
        explanation: 'Python hash tables require that dictionary keys implement `__hash__` and maintain immutability so their bucket hash never changes. Mutable types like lists raise `TypeError: unhashable type: list`.',
        bloomsLevel: 'understand',
        hint: 'What property does Python require of any object used as a dictionary key or set element?',
        analogies: {
          eli5: 'If you label a locker with an ID tag that keeps changing every 5 minutes, nobody will ever be able to find the locker again.',
          practical: 'When caching grid paths `(row, col)`, passing a tuple `(r, c)` works, but passing `[r, c]` immediately crashes with unhashable error.',
          academic: 'Hash invariants dictate that equal objects must have identical, invariant hash codes across their lifecycle.'
        }
      },
      {
        id: 'ad-dsa-4',
        conceptId: 'c-dp-tabulation',
        conceptName: 'DP: Bottom-Up Tabulation & Space Optimization',
        difficultyRating: 4,
        question: 'You are solving the "House Robber" problem (cannot rob two adjacent houses). Given nums = [2, 7, 9, 3, 1], what is the optimal DP recurrence and max robbery profit?',
        codeSnippet: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`,
        options: [
          'Max: 11 (houses 2, 9)',
          'Max: 12 (houses 2, 9, 1)',
          'Max: 10 (houses 7, 3)',
          'Max: 14 (all houses)'
        ],
        correctIndex: 1,
        explanation: 'For each house i, we choose either not to rob it (dp[i-1]) or rob it plus optimal at i-2 (dp[i-2] + nums[i]). For [2, 7, 9, 3, 1]: dp values are [2, 7, 11, 11, 12]. Optimal set: indices 0 (val 2) + 2 (val 9) + 4 (val 1) = 12.',
        bloomsLevel: 'analyze',
        hint: 'Evaluate the state transition step-by-step: compare skipping house i vs taking house i.',
        analogies: {
          eli5: 'Deciding whether to skip a day of sweet treats to get a double-sized treat tomorrow.',
          practical: 'Scheduling non-conflicting jobs or maximizing yield under discrete spacing constraints.',
          academic: 'A maximum independent set problem on an interval path graph solvable in O(N) time and O(1) space.'
        }
      },
      {
        id: 'ad-dsa-5',
        conceptId: 'c-graphs-shortest-path',
        conceptName: 'Graph Traversal & Shortest Path (Dijkstra)',
        difficultyRating: 5,
        question: 'Why does standard Dijkstra\'s algorithm with a Min-Heap fail or produce suboptimal results on graphs with negative edge weights?',
        options: [
          'Because heaps cannot store negative floating-point numbers',
          'Because Dijkstra assumes that once a vertex is extracted from the priority queue, its computed shortest distance is final (greedy invariant violated by negative edges)',
          'Because Dijkstra only works on directed trees, not general graphs',
          'Because negative edges create infinite recursion in BFS queues'
        ],
        correctIndex: 1,
        explanation: 'Dijkstra relies on the monotone subpath property: adding edges can only increase path distance. Once a vertex is settled, its distance is never relaxed again. A negative edge can retroactively make an earlier visited path shorter, breaking the greedy invariant. Bellman-Ford or SPFA is required instead.',
        bloomsLevel: 'evaluate',
        hint: 'Consider the greedy assumption: once a node is marked "visited", does Dijkstra ever reconsider it?',
        analogies: {
          eli5: 'Like locking in the cheapest toll road assuming every highway charges money, but later discovering a highway that actually gives you free cash for driving on it.',
          practical: 'In network routing with transmission costs, negative delays cause routing loops or incorrect pathing in Dijkstra.',
          academic: 'The triangle inequality d(u, v) <= d(u, w) + w(w, v) fails when weights can be negative, destroying the optimality of the priority queue greedy selection.'
        }
      }
    ],
    learningModules: [
      {
        id: 'mod-dsa-recursion',
        conceptId: 'c-recursion',
        conceptName: 'Recursion & The Call Stack',
        title: 'Mastering The Recursive Call Stack & Subproblem Decomposition',
        estimatedMinutes: 8,
        isRemediation: true,
        prerequisiteReason: 'Required before Dynamic Programming and Binary Trees can be understood.',
        summary: 'Recursion is the engine of divide-and-conquer algorithms. Every recursive call pushes an activation record onto the call stack containing local variables and return pointers.',
        keyTakeaways: [
          'Every recursive function requires: (1) Base Case, (2) Work/Convergence Step, (3) Subproblem Recurrence.',
          'State is preserved on the call stack until the base case returns, then stack unwinding executes post-call statements.',
          'Memory complexity O(Depth) is determined by the maximum depth of the recursive call stack tree.'
        ],
        interactiveExample: {
          language: 'python',
          code: `def reverse_linked_list(head):
    # Base Case: Empty or single node
    if not head or not head.next:
        return head
    
    # Recursive step: reverse the rest of the list
    new_head = reverse_linked_list(head.next)
    
    # Re-wire pointers during stack unwinding
    head.next.next = head
    head.next = None
    
    return new_head`,
          outputExplanation: 'During unwinding, each node points its neighbor back to itself, cleanly reversing the list in O(N) time.'
        },
        analogy: 'Russian Matryoshka nesting dolls: to reach the tiny prize at the center, you must open each layer. Once opened, you close them back up in reverse order.',
        commonPitfalls: [
          'Forgetting to return the recursive call result (`return func(...)` vs just `func(...)`).',
          'Modifying shared mutable state across branches without backtracking.',
          'Missing a base case or creating conditions that bypass the base case.'
        ],
        practiceChallenge: {
          prompt: 'Write a recursive function `sum_digits(n)` that takes positive integer n and returns sum of its digits without using strings.',
          answerGuide: 'Base case: `if n < 10: return n`. Recursive step: `return (n % 10) + sum_digits(n // 10)`.'
        },
        completed: false
      },
      {
        id: 'mod-dsa-dp',
        conceptId: 'c-dp-memo',
        conceptName: 'Dynamic Programming: Memoization',
        title: 'From Naive Recursion to O(N) Top-Down Memoization',
        estimatedMinutes: 10,
        isRemediation: false,
        summary: 'Dynamic programming eliminates exponential duplicate recalculations by caching previously computed subproblem solutions in a hash table or array.',
        keyTakeaways: [
          'Identify the minimal state variables (e.g. index i, remaining capacity w).',
          'Use a hash table or @lru_cache decorator to check if (i, w) has already been solved.',
          'Reduces time complexity from O(Branching^Depth) to O(Number of Unique Subproblem States * Transition Time).'
        ],
        interactiveExample: {
          language: 'python',
          code: `def coin_change(coins, amount):
    memo = {}
    
    def dfs(rem):
        if rem == 0: return 0
        if rem < 0: return float('inf')
        if rem in memo: return memo[rem]
        
        res = float('inf')
        for c in coins:
            res = min(res, 1 + dfs(rem - c))
            
        memo[rem] = res
        return res
        
    ans = dfs(amount)
    return ans if ans != float('inf') else -1`,
          outputExplanation: 'Memoization caches results for each remainder, pruning thousands of duplicate recursive branches.'
        },
        analogy: 'Writing down math answers on scrap paper: when asked 13 * 17, you calculate it once (221) and write it down. Next time someone asks 13 * 17, you look at your scrap paper instantly instead of redoing the math.',
        commonPitfalls: [
          'Including unnecessary parameters in the memoization state key.',
          'Mutating the cache key across calls.',
          'Not handling default unachievable states (e.g. returning infinity vs -1).'
        ],
        practiceChallenge: {
          prompt: 'How many distinct states exist in the Coin Change problem for amount A and C coin denominations?',
          answerGuide: 'Exactly A unique states (from 0 to A), each taking O(C) work to transition, yielding O(A * C) total runtime.'
        },
        completed: false
      },
      {
        id: 'mod-dsa-bst',
        conceptId: 'c-bst-validation',
        conceptName: 'Binary Search Tree (BST) Invariants',
        title: 'Global Ancestral Bounds in Binary Search Trees',
        estimatedMinutes: 7,
        isRemediation: false,
        summary: 'Every node in a BST must satisfy both a lower bound and an upper bound passed down through all parent nodes in the search path.',
        keyTakeaways: [
          'Local checks (`left < root < right`) are a classic bug in interviews.',
          'Pass `(low_bound, high_bound)` through DFS recursion.',
          'When traversing left, update high bound to current node value. When traversing right, update low bound.'
        ],
        interactiveExample: {
          language: 'python',
          code: `def isValidBST(root):
    def validate(node, low=float('-inf'), high=float('inf')):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return (validate(node.left, low, node.val) and 
                validate(node.right, node.val, high))
                
    return validate(root)`,
          outputExplanation: 'Enforces strict ancestral boundaries so no rogue deep descendants violate higher-level tree invariants.'
        },
        analogy: 'Security checkpoints at an airport: passing the gate agent requires satisfying both the country-level visa limit AND the local terminal boarding gate rule.',
        commonPitfalls: [
          'Assuming strict inequalities (`<` vs `<=`) without checking whether duplicate values are permitted.',
          'Failing to initialize bounds with negative and positive infinity.'
        ],
        practiceChallenge: {
          prompt: 'What happens if a node has value equal to its parent in a strict BST?',
          answerGuide: 'It violates the strict definition (left < root < right) and fails validation unless duplicate-equality is explicitly permitted.'
        },
        completed: false
      }
    ]
  },
  {
    id: 'fullstack-web',
    name: 'Modern Full-Stack & Async JS',
    category: 'Web Engineering',
    icon: 'Layers',
    tagline: 'Deep dive into event loop queues, React rendering pipelines, hooks reconciliation, and async concurrency.',
    concepts: [
      {
        id: 'js-event-loop',
        name: 'The JavaScript Event Loop & Microtasks',
        description: 'Call stack, Macro-task queue, Micro-task queue (Promises), and rendering frame orchestration.',
        category: 'Foundations',
        prerequisites: [],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'understand',
        importance: 'foundational'
      },
      {
        id: 'js-async-concurrency',
        name: 'Async/Await & Concurrency Patterns',
        description: 'Promise chaining, Promise.all vs Promise.allSettled, race conditions, and unhandled rejection semantics.',
        category: 'Foundations',
        prerequisites: ['js-event-loop'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'apply',
        importance: 'core'
      },
      {
        id: 'react-reconciliation',
        name: 'React Fiber & Reconciliation Engine',
        description: 'Virtual DOM diffing, key stability, render phases vs commit phases, and reconciliation trees.',
        category: 'Frontend Architecture',
        prerequisites: ['js-event-loop'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'analyze',
        importance: 'core'
      },
      {
        id: 'react-hooks-closures',
        name: 'React Hooks & Stale Closure Mechanics',
        description: 'useEffect dependency arrays, closures over state, memoization (useMemo/useCallback), and ref mutations.',
        category: 'Frontend Architecture',
        prerequisites: ['react-reconciliation'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'analyze',
        importance: 'core'
      },
      {
        id: 'api-state-cache',
        name: 'Server State Caching & SWR Revalidation',
        description: 'Optimistic UI updates, cache invalidation strategies, network deduplication, and stale-while-revalidate.',
        category: 'Full-Stack Systems',
        prerequisites: ['js-async-concurrency', 'react-hooks-closures'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'evaluate',
        importance: 'advanced'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'diag-web-1',
        conceptId: 'js-event-loop',
        conceptName: 'The JavaScript Event Loop & Microtasks',
        question: 'What is the exact execution output order of the following JavaScript snippet?',
        codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');`,
        options: [
          '1, 5, 2, 3, 4',
          '1, 5, 3, 4, 2',
          '1, 2, 3, 4, 5',
          '1, 3, 4, 5, 2'
        ],
        correctIndex: 1,
        explanation: 'Synchronous statements run first (1, 5). When the call stack clears, the Microtask Queue is completely drained before any Macrotask: Promise.then (3) and queueMicrotask (4). Finally, the timer macrotask callback (2) runs from the macrotask queue.',
        misconceptionIfWrong: 'Believing setTimeout(..., 0) runs before Promise microtasks or inline sync code.',
        difficulty: 'intermediate',
        bloomsLevel: 'analyze'
      },
      {
        id: 'diag-web-2',
        conceptId: 'js-async-concurrency',
        conceptName: 'Async/Await & Concurrency Patterns',
        question: 'If you want to fetch user profiles for 10 user IDs simultaneously and ensure one failing request does not abort the remaining successful responses, which API should you use?',
        options: [
          'Promise.all(ids.map(fetchUser))',
          'Promise.allSettled(ids.map(fetchUser))',
          'Promise.race(ids.map(fetchUser))',
          'ids.forEach(async id => await fetchUser(id))'
        ],
        correctIndex: 1,
        explanation: 'Promise.all rejects immediately upon the first rejected promise (fail-fast). Promise.allSettled waits for all promises to settle regardless of rejection, returning an array of status objects with either { status: "fulfilled", value } or { status: "rejected", reason }.',
        misconceptionIfWrong: 'Confusing the fail-fast behavior of Promise.all with resilient settlement via Promise.allSettled.',
        difficulty: 'foundational',
        bloomsLevel: 'apply'
      },
      {
        id: 'diag-web-3',
        conceptId: 'react-reconciliation',
        conceptName: 'React Fiber & Reconciliation Engine',
        question: 'Why does using array indices as React `key` props (`key={index}`) cause severe rendering and input state bugs when items in the list are inserted, reordered, or deleted?',
        options: [
          'React throws a runtime SyntaxError when keys are numeric',
          'React pairs existing DOM nodes by key across renders; index keys bind component state to the position rather than the underlying data identity',
          'Using numbers as keys reduces CSS animation performance by 60%',
          'Index keys disable HTML5 form validations'
        ],
        correctIndex: 1,
        explanation: 'Keys provide identity across renders. When an item at index 0 is deleted, the item previously at index 1 now receives key 0. React assumes the identity is unchanged and reuses the old DOM node and uncontrolled input state, creating subtle UI corruption.',
        misconceptionIfWrong: 'Thinking keys are just arbitrary requirements to suppress console warnings rather than identity anchors for diffing.',
        difficulty: 'intermediate',
        bloomsLevel: 'understand'
      },
      {
        id: 'diag-web-4',
        conceptId: 'react-hooks-closures',
        conceptName: 'React Hooks & Stale Closure Mechanics',
        question: 'In this React component, clicking the button after 3 seconds logs an outdated count. What is this phenomenon called and how is it resolved?',
        codeSnippet: `const [count, setCount] = useState(0);
useEffect(() => {
  const timer = setInterval(() => {
    console.log("Count is:", count); // Always prints 0!
  }, 1000);
  return () => clearInterval(timer);
}, []); // Empty dependencies!`,
        options: [
          'Memory Leak; fixed by removing clearInterval',
          'Stale Closure; the timer closure captured `count` from the initial render because count was omitted from the dependency array or needs a functional state updater / ref',
          'Fiber thread collision; fixed by using window.setTimeout',
          'Garbage collector preemption; fixed by declaring count outside the component'
        ],
        correctIndex: 1,
        explanation: 'Functions in JavaScript close over variables in lexical scope. The callback registered in `useEffect` was created during mount when `count` was 0. Because dependencies `[]` never re-triggered the effect, it perpetually references the stale initial render count.',
        misconceptionIfWrong: 'Assuming JavaScript closures dynamically look up the latest state without dependency triggers or functional updates.',
        difficulty: 'advanced',
        bloomsLevel: 'analyze'
      }
    ],
    adaptivePool: [
      {
        id: 'ad-web-1',
        conceptId: 'js-event-loop',
        conceptName: 'The JavaScript Event Loop & Microtasks',
        difficultyRating: 1,
        question: 'Where does JavaScript execute synchronous code?',
        options: [
          'The GPU thread pool',
          'The single-threaded Call Stack',
          'The Web Workers daemon',
          'The Microtask queue'
        ],
        correctIndex: 1,
        explanation: 'JavaScript has a single call stack where execution contexts are pushed and popped in LIFO order.',
        bloomsLevel: 'remember',
        hint: 'JavaScript is single-threaded in its main execution model.',
        analogies: {
          eli5: 'A single chef in a kitchen doing one recipe step at a time.',
          practical: 'Infinite while loops freeze your entire browser tab because the call stack is blocked.',
          academic: 'The execution stack maintains activation records sequentially with Run-To-Completion semantics.'
        }
      },
      {
        id: 'ad-web-2',
        conceptId: 'react-hooks-closures',
        conceptName: 'React Hooks & Stale Closure Mechanics',
        difficultyRating: 3,
        question: 'How should you safely update state when the new state depends on the previous state inside a callback?',
        options: [
          'setCount(count + 1)',
          'setCount(prev => prev + 1)',
          'count = count + 1; forceUpdate()',
          'useMemo(() => count + 1)'
        ],
        correctIndex: 1,
        explanation: 'Functional state updates `setCount(prev => prev + 1)` receive the guaranteed latest committed state directly from React internal queue, immune to stale closures.',
        bloomsLevel: 'apply',
        hint: 'Use the functional updater overload.',
        analogies: {
          eli5: 'Instead of telling the cashier "I want 5 apples" based on what you thought was in your cart, you tell them "add 1 more to whatever is currently in my cart".',
          practical: 'Rapid button double-clicks with `setCount(count + 1)` will drop clicks, whereas `setCount(c => c + 1)` increments faithfully.',
          academic: 'Atomic reducer transition over state monad.'
        }
      },
      {
        id: 'ad-web-3',
        conceptId: 'api-state-cache',
        conceptName: 'Server State Caching & SWR Revalidation',
        difficultyRating: 4,
        question: 'In an optimistic UI update, what critical action must occur if the subsequent network mutation request fails on the backend?',
        options: [
          'Reload the entire browser window',
          'Roll back the client state to the snapshot taken immediately before the optimistic mutation and alert the user',
          'Send 10 retry requests automatically without timeout',
          'Delete the cached local database'
        ],
        correctIndex: 1,
        explanation: 'Optimistic UI immediately shows the desired state to provide instant tactile feedback. If the server rejects the request (e.g. 500 error or validation failure), the application must rollback to the snapshot captured prior to the mutation to maintain consistency.',
        bloomsLevel: 'evaluate',
        hint: 'What happens to the user\'s screen if a "Like" button optimistically toggles on, but the network request fails?',
        analogies: {
          eli5: 'Writing down an appointment in pencil in your diary; if the doctor calls saying they have no slots, you erase your pencil mark.',
          practical: 'React Query / SWR / Apollo all implement `onMutate` rollback snapshots.',
          academic: 'Compensating transactions in distributed eventually-consistent architectures.'
        }
      }
    ],
    learningModules: [
      {
        id: 'mod-web-event-loop',
        conceptId: 'js-event-loop',
        conceptName: 'The JavaScript Event Loop & Microtasks',
        title: 'Deconstructing The JavaScript Event Loop & Macrotask vs Microtask Priority',
        estimatedMinutes: 8,
        isRemediation: true,
        summary: 'Understand why promises resolve before setTimeout and how browser paint frames interact with JavaScript execution.',
        keyTakeaways: [
          'Synchronous code has absolute priority on the single Call Stack.',
          'Microtask queue (Promise.then, MutationObserver, queueMicrotask) empties entirely between every single macrotask.',
          'Macrotask queue (setTimeout, setInterval, I/O, UI events) takes only 1 task per tick.'
        ],
        interactiveExample: {
          language: 'javascript',
          code: `// Microtask starvation example:
function floodMicrotasks() {
  Promise.resolve().then(floodMicrotasks);
}
// This will starve the event loop and freeze UI rendering completely!`,
          outputExplanation: 'Because the microtask queue must be completely emptied before rendering or next macrotask, an infinite microtask chain halts UI painting.'
        },
        analogy: 'VIP express lane at an airport: the gate agent clears EVERY SINGLE passenger in the VIP line (microtasks) before calling even ONE regular ticket holder (macrotask).',
        commonPitfalls: [
          'Assuming `setTimeout(fn, 0)` executes immediately before pending promise resolutions.',
          'Starving browser rendering with recursive microtasks.'
        ],
        practiceChallenge: {
          prompt: 'Predict the order: console.log("A"), Promise.resolve().then(() => console.log("B")), setTimeout(() => console.log("C"), 0).',
          answerGuide: 'Output: A -> B -> C.'
        },
        completed: false
      },
      {
        id: 'mod-web-stale-closures',
        conceptId: 'react-hooks-closures',
        conceptName: 'React Hooks & Stale Closure Mechanics',
        title: 'Conquering Stale Closures and Dependency Arrays in React',
        estimatedMinutes: 9,
        isRemediation: false,
        summary: 'Learn how JavaScript closures interact with React render lifecycles and how to write airtight hooks.',
        keyTakeaways: [
          'React components run as pure functions on every render; every render produces new closures.',
          'Omitted dependencies freeze values to previous render snapshots.',
          'Use functional updates `setVal(v => v + 1)` or `useRef` for mutable values that should not trigger re-renders.'
        ],
        interactiveExample: {
          language: 'typescript',
          code: `function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  
  // Keep ref up to date on each render without triggering timer reset
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}`,
          outputExplanation: 'Dan Abramov\'s classic useInterval hook leverages useRef to bypass stale closures without restarting the timer on state changes.'
        },
        analogy: 'Taking a photograph of your friend in a red shirt: no matter how many times your friend changes their shirt in real life, the photo printed on paper still shows the red shirt.',
        commonPitfalls: [
          'Disabling the eslint-plugin-react-hooks exhaustive-deps rule with comments instead of solving the dependency flow.',
          'Re-creating object references inside component body causing infinite effect loops.'
        ],
        practiceChallenge: {
          prompt: 'Why does passing an empty object `{}` as a prop cause memoized child components to re-render?',
          answerGuide: 'In JavaScript `{} !== {}`. A new object reference is instantiated in memory on every render, failing shallow equality check `Object.is`.'
        },
        completed: false
      }
    ]
  },
  {
    id: 'deep-learning-math',
    name: 'Neural Networks & Deep Learning Math',
    category: 'Artificial Intelligence',
    icon: 'BrainCircuit',
    tagline: 'Connect linear algebra, partial derivatives, gradient descent, and backpropagation mechanics.',
    concepts: [
      {
        id: 'dl-linear-algebra',
        name: 'Matrix Operations & Tensor Dimensions',
        description: 'Dot products, matrix multiplication dimension matching (M x K * K x N), and batch broadcasting.',
        category: 'Foundations',
        prerequisites: [],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'understand',
        importance: 'foundational'
      },
      {
        id: 'dl-calculus',
        name: 'Multivariate Calculus & The Chain Rule',
        description: 'Partial derivatives, gradient vectors (nabla), Jacobian matrices, and composite function differentials.',
        category: 'Foundations',
        prerequisites: ['dl-linear-algebra'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'apply',
        importance: 'foundational'
      },
      {
        id: 'dl-loss-landscape',
        name: 'Loss Functions & Gradient Descent Dynamics',
        description: 'Cross-Entropy loss, MSE, learning rate schedules, local minima, saddle points, and momentum.',
        category: 'Optimization',
        prerequisites: ['dl-calculus'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'analyze',
        importance: 'core'
      },
      {
        id: 'dl-backprop',
        name: 'Backpropagation & Computational Graphs',
        description: 'Forward pass activations, backward pass adjoints, vanishing/exploding gradients, and weight delta updates.',
        category: 'Core Neural Networks',
        prerequisites: ['dl-calculus', 'dl-loss-landscape'],
        masteryScore: 0,
        status: 'untested',
        bloomsLevel: 'evaluate',
        importance: 'advanced'
      }
    ],
    diagnosticQuestions: [
      {
        id: 'diag-dl-1',
        conceptId: 'dl-linear-algebra',
        conceptName: 'Matrix Operations & Tensor Dimensions',
        question: 'Given an input batch matrix X of shape (32, 128) and a linear layer weight matrix W of shape (128, 64) with bias b of shape (64), what is the shape of the linear transformation output Y = XW + b?',
        options: [
          '(32, 128)',
          '(32, 64)',
          '(128, 64)',
          '(32, 32)'
        ],
        correctIndex: 1,
        explanation: 'Matrix multiplication of (32, 128) by (128, 64) produces (32, 64). The bias vector (64) is broadcast across the batch dimension 32, preserving output shape (32, 64).',
        misconceptionIfWrong: 'Mismatching inner dot product dimensions in linear algebraic transformations.',
        difficulty: 'foundational',
        bloomsLevel: 'understand'
      },
      {
        id: 'diag-dl-2',
        conceptId: 'dl-calculus',
        conceptName: 'Multivariate Calculus & The Chain Rule',
        question: 'If z = f(y) and y = g(x), what is the scalar chain rule formula for calculating the derivative of z with respect to x (dz/dx)?',
        options: [
          'dz/dx = dz/dy + dy/dx',
          'dz/dx = (dz/dy) * (dy/dx)',
          'dz/dx = (dz/dy) / (dy/dx)',
          'dz/dx = max(dz/dy, dy/dx)'
        ],
        correctIndex: 1,
        explanation: 'The chain rule multiplies rates of change: the sensitivity of output z with respect to intermediate y times the sensitivity of y with respect to input x.',
        misconceptionIfWrong: 'Adding derivatives instead of multiplying composite differential sensitivity ratios.',
        difficulty: 'foundational',
        bloomsLevel: 'apply'
      },
      {
        id: 'diag-dl-3',
        conceptId: 'dl-backprop',
        conceptName: 'Backpropagation & Computational Graphs',
        question: 'Why does using the sigmoid activation function (sigma(z) = 1 / (1 + e^-z)) across deep 10-layer neural networks trigger the catastrophic Vanishing Gradient problem during backpropagation?',
        options: [
          'Because the derivative of sigmoid is always greater than 10',
          'Because the maximum value of sigmoid\'s derivative is 0.25; repeatedly multiplying fractions < 0.25 through 10 layers causes the gradient to decay exponentially toward zero',
          'Because sigmoid is discontinuous at z = 0',
          'Because sigmoid requires complex imaginary numbers'
        ],
        correctIndex: 1,
        explanation: 'd/dz sigmoid(z) = sigmoid(z) * (1 - sigmoid(z)). The peak value occurs at z=0 where 0.5 * 0.5 = 0.25. When chain rule multiplies numbers <= 0.25 across 10 layers (0.25^10 ~ 10^-6), the backpropagated gradients to early layers diminish to near zero, freezing weight learning.',
        misconceptionIfWrong: 'Failing to connect activation function derivative magnitude with chain rule product decay across depth.',
        difficulty: 'advanced',
        bloomsLevel: 'evaluate'
      }
    ],
    adaptivePool: [
      {
        id: 'ad-dl-1',
        conceptId: 'dl-loss-landscape',
        conceptName: 'Loss Functions & Gradient Descent Dynamics',
        difficultyRating: 2,
        question: 'What occurs if the learning rate in Gradient Descent is set excessively high (e.g., eta = 100.0)?',
        options: [
          'The model converges to the global minimum in a single step',
          'The loss oscillates wildy, overshoots the minimum, and diverges toward infinity (NaN)',
          'The gradient becomes exactly 0',
          'The weights freeze completely'
        ],
        correctIndex: 1,
        explanation: 'Large step sizes cause parameters to overshoot the valley of the loss landscape, landing on even steeper terrain on the opposite side, triggering catastrophic divergence.',
        bloomsLevel: 'understand',
        hint: 'Imagine taking giant leaps down a narrow canyon.',
        analogies: {
          eli5: 'Trying to park a car in a tight garage by flooring the gas pedal at 100 mph.',
          practical: 'Your training log prints `Loss: NaN` after 3 epochs.',
          academic: 'The update step violates the Lipschitz continuity assumption of the gradient vector field.'
        }
      }
    ],
    learningModules: [
      {
        id: 'mod-dl-chain-rule',
        conceptId: 'dl-calculus',
        conceptName: 'Multivariate Calculus & The Chain Rule',
        title: 'Mastering The Chain Rule: The Heart of Backpropagation',
        estimatedMinutes: 8,
        isRemediation: true,
        summary: 'Backpropagation is simply the recursive application of the calculus chain rule over a directed acyclic computational graph.',
        keyTakeaways: [
          'Derivatives measure sensitivity: if x changes by a tiny epsilon, how much does the loss change?',
          'Multiply local gradients together backwards along the computational path.',
          'Residual connections (ResNets) add identity gradients (+1) that safeguard against vanishing gradients.'
        ],
        interactiveExample: {
          language: 'python',
          code: `# Manual backward pass for z = (w * x + b)
# Loss L = 0.5 * (z - y)^2
dL_dz = (z - y)        # Loss derivative
dz_dw = x              # Local gradient
dL_dw = dL_dz * dz_dw  # Chain rule!
w = w - learning_rate * dL_dw`,
          outputExplanation: 'The chain rule multiplies downstream loss error by local input feature magnitude to update the weight.'
        },
        analogy: 'A bucket brigade fighting a fire: if the last person drops 20% of the water and the middle person drops 50%, only 10% of the original water reaches the target.',
        commonPitfalls: [
          'Summing derivatives instead of taking the matrix dot product.',
          'Transposing weight matrices in the wrong orientation during backward matrix multiplication.'
        ],
        practiceChallenge: {
          prompt: 'If y = 3x^2 and z = 2y, what is dz/dx at x = 2?',
          answerGuide: 'dy/dx = 6x = 12. dz/dy = 2. dz/dx = 2 * 12 = 24.'
        },
        completed: false
      }
    ]
  }
];
