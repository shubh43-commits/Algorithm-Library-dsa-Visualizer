/**
 * ============================================================================
 * Algorithm Library - DSA Interactive Quiz Dataset (quiz-data.js)
 * ============================================================================
 * Comprehensive viva-oriented quiz questions covering sorting, searching,
 * pathfinding, time/space complexity, stability, and step prediction.
 */

window.AlgoLib = window.AlgoLib || {};

window.AlgoLib.QuizData = [
    {
        id: 1,
        category: "Sorting",
        question: "In Bubble Sort, after the first complete pass over an unsorted array of size N, which element is guaranteed to be in its final sorted position?",
        options: [
            "The smallest element at index 0",
            "The largest element at index N - 1",
            "The median element at index floor(N / 2)",
            "No element is guaranteed until all passes finish"
        ],
        correctIndex: 1,
        explanation: "During each pass of Bubble Sort, the largest remaining unsorted value repeatedly swaps with adjacent smaller elements, effectively 'bubbling up' to the very end of the array (index N - 1)."
    },
    {
        id: 2,
        category: "Complexity",
        question: "When does Quick Sort (with Lomuto partition choosing the last element as pivot) degrade to its worst-case O(n²) time complexity?",
        options: [
            "When the input array contains random unique values",
            "When the input array is already sorted or reverse sorted",
            "When the input array size is an exact power of 2",
            "Quick Sort never degrades to O(n²); it is strictly O(n log n)"
        ],
        correctIndex: 1,
        explanation: "If the array is already sorted or reverse sorted, choosing the last element yields maximally unbalanced partitions of sizes 0 and n - 1 at every recursion level, producing n recursion levels and total O(n²) work."
    },
    {
        id: 3,
        category: "Searching",
        question: "You have a sorted array A = [4, 9, 15, 23, 38, 42, 57, 88]. Searching for target = 42 using Binary Search, what is the sequence of midpoint indices examined?",
        options: [
            "mid = 3 (23), then mid = 5 (42)",
            "mid = 0 (4), then mid = 1 (9), then mid = 2 (15)",
            "mid = 4 (38), then mid = 6 (57), then mid = 5 (42)",
            "mid = 7 (88), then mid = 3 (23)"
        ],
        correctIndex: 0,
        explanation: "Initially low = 0, high = 7. Mid = floor((0 + 7) / 2) = 3 (value 23). Since 23 < 42, search interval becomes [4 .. 7]. Next mid = floor((4 + 7) / 2) = 5 (value 42). Found in 2 comparisons!"
    },
    {
        id: 4,
        category: "Stability",
        question: "Which of the following sorting algorithms is STABLE by standard implementation?",
        options: [
            "Quick Sort",
            "Selection Sort",
            "Merge Sort",
            "Heap Sort"
        ],
        correctIndex: 2,
        explanation: "Merge Sort preserves the relative order of duplicate elements because when merging, ties (L[i] <= R[j]) favor the left subarray. Quick Sort, Selection Sort, and Heap Sort can swap duplicate items across long distances, disrupting initial ordering."
    },
    {
        id: 5,
        category: "Pathfinding",
        question: "Why does Breadth-First Search (BFS) guarantee the shortest path on an unweighted grid, whereas Depth-First Search (DFS) does not?",
        options: [
            "BFS evaluates Manhattan distances to the target using a heuristic",
            "BFS explores nodes in order of increasing depth (distance from start) using a FIFO queue",
            "BFS uses a LIFO stack to backtrack only when hitting walls",
            "BFS skips obstacle verification while DFS checks walls"
        ],
        correctIndex: 1,
        explanation: "Because edges have uniform weight, BFS's FIFO queue ensures every node at distance k is visited before any node at distance k + 1. The first time the target node is popped, it is along the shortest path."
    },
    {
        id: 6,
        category: "Pathfinding",
        question: "In A* pathfinding, the evaluation function is f(n) = g(n) + h(n). What do g(n) and h(n) represent?",
        options: [
            "g(n) is heuristic estimate, h(n) is actual cost from start",
            "g(n) is actual cost from start, h(n) is heuristic estimate to target",
            "g(n) is grid width, h(n) is grid height",
            "g(n) is wall count, h(n) is step count"
        ],
        correctIndex: 1,
        explanation: "g(n) is the exact accumulated path cost from the start node to node n. h(n) is the heuristic estimated cost from node n to the target goal (e.g., Manhattan or Euclidean distance)."
    },
    {
        id: 7,
        category: "Sorting",
        question: "In Selection Sort on array of size N, what is the total number of element SWAPS performed in the worst case?",
        options: [
            "O(n²)",
            "O(n log n)",
            "At most N - 1 swaps",
            "0 swaps"
        ],
        correctIndex: 2,
        explanation: "Unlike Bubble or Insertion Sort which perform up to O(n²) swaps, Selection Sort only performs at most ONE swap per outer loop iteration, making it at most N - 1 swaps total. However, its comparisons remain O(n²)."
    },
    {
        id: 8,
        category: "Pathfinding",
        question: "What happens if Dijkstra's algorithm is executed on a graph with negative edge weights?",
        options: [
            "It runs faster because negative numbers decrease distances",
            "It may produce incorrect shortest paths because it assumes visited nodes have finalized distances",
            "It automatically converts negative edges to positive",
            "It transforms into Bellman-Ford algorithm automatically"
        ],
        correctIndex: 1,
        explanation: "Dijkstra's greedy choice assumes that once a node is extracted from the priority queue, its shortest distance is finalized. Negative weights invalidate this assumption. For negative edges, Bellman-Ford must be used."
    },
    {
        id: 9,
        category: "Memory",
        question: "What is the auxiliary space complexity of standard top-down Merge Sort on an array of size N?",
        options: [
            "O(1)",
            "O(log N)",
            "O(N)",
            "O(N²)"
        ],
        correctIndex: 2,
        explanation: "Standard Merge Sort requires an auxiliary array of size O(N) to hold and merge the split subarrays before writing back into the original array."
    },
    {
        id: 10,
        category: "Data Structures",
        question: "In an array-based Max-Heap where root is at index 0, what are the indices of the left and right children of node i?",
        options: [
            "Left: i + 1, Right: i + 2",
            "Left: 2*i + 1, Right: 2*i + 2",
            "Left: 2*i, Right: 2*i + 1",
            "Left: i / 2, Right: (i / 2) + 1"
        ],
        correctIndex: 1,
        explanation: "In zero-indexed binary heaps, for any element at index i: the parent is floor((i - 1) / 2), the left child is 2*i + 1, and the right child is 2*i + 2."
    }
];
