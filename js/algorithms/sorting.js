/**
 * ============================================================================
 * Algorithm Library - Sorting Algorithms (sorting.js)
 * ============================================================================
 * Implements Bubble, Selection, Insertion, Merge, Quick, and Heap Sort.
 * 
 * ARCHITECTURE PRINCIPLE:
 * Rather than mixing UI animation with algorithm code, each algorithm is a pure
 * generator function that RECORDS its complete trajectory of steps into an array.
 * 
 * Each Step record includes:
 *   - type: 'compare' | 'swap' | 'write' | 'pivot' | 'mark_sorted' | 'done'
 *   - indices: array of active element indices being examined
 *   - sortedIndices: array of indices already in their final sorted positions
 *   - arrayState: complete immutable snapshot of array at this precise step
 *   - codeLine: 1-indexed line number in the algorithm's pseudocode
 *   - description: clear, viva-ready explanation for educational narrative
 *   - counters: { comparisons, swaps }
 */

window.AlgoLib = window.AlgoLib || {};

window.AlgoLib.Sorting = {
    // ------------------------------------------------------------------------
    // Metadata, Pseudocode & Complexity Registry for UI and Viva Exam Prep
    // ------------------------------------------------------------------------
    registry: {
        bubble: {
            name: "Bubble Sort",
            category: "Sorting",
            bestTime: "Ω(n)",
            avgTime: "θ(n²)",
            worstTime: "O(n²)",
            space: "O(1)",
            stable: "Yes",
            inPlace: "Yes",
            paradigm: "Comparison / Incremental",
            description: "Repeatedly steps through the list, compares adjacent elements, and swaps them if in the wrong order.",
            vivaTip: "Optimized version has Ω(n) best-case time by terminating early if no swaps occur during a pass.",
            pseudocode: [
                "procedure bubbleSort(A : list of sortable items)",
                "    n := length(A)",
                "    repeat",
                "        swapped := false",
                "        for i := 1 to n - 1 inclusive do",
                "            if A[i - 1] > A[i] then",
                "                swap(A[i - 1], A[i])",
                "                swapped := true",
                "        n := n - 1",
                "    until not swapped",
                "end procedure"
            ]
        },
        selection: {
            name: "Selection Sort",
            category: "Sorting",
            bestTime: "Ω(n²)",
            avgTime: "θ(n²)",
            worstTime: "O(n²)",
            space: "O(1)",
            stable: "No",
            inPlace: "Yes",
            paradigm: "Selection / In-Place",
            description: "Divides the array into sorted and unsorted regions; continuously picks the minimum element from unsorted.",
            vivaTip: "Always makes O(n²) comparisons regardless of initial array ordering, but performs at most O(n) swaps.",
            pseudocode: [
                "procedure selectionSort(A : list of sortable items)",
                "    n := length(A)",
                "    for i := 0 to n - 2 do",
                "        minIdx := i",
                "        for j := i + 1 to n - 1 do",
                "            if A[j] < A[minIdx] then",
                "                minIdx := j",
                "        if minIdx != i then",
                "            swap(A[i], A[minIdx])",
                "end procedure"
            ]
        },
        insertion: {
            name: "Insertion Sort",
            category: "Sorting",
            bestTime: "Ω(n)",
            avgTime: "θ(n²)",
            worstTime: "O(n²)",
            space: "O(1)",
            stable: "Yes",
            inPlace: "Yes",
            paradigm: "Incremental Insertion",
            description: "Builds sorted array one element at a time by inserting each element into its proper position.",
            vivaTip: "Exceptional for small datasets (n <= 20) and nearly-sorted arrays. Often used as base-case in Timsort.",
            pseudocode: [
                "procedure insertionSort(A : list of sortable items)",
                "    n := length(A)",
                "    for i := 1 to n - 1 do",
                "        key := A[i]",
                "        j := i - 1",
                "        while j >= 0 and A[j] > key do",
                "            A[j + 1] := A[j]",
                "            j := j - 1",
                "        A[j + 1] := key",
                "end procedure"
            ]
        },
        merge: {
            name: "Merge Sort",
            category: "Sorting",
            bestTime: "Ω(n log n)",
            avgTime: "θ(n log n)",
            worstTime: "O(n log n)",
            space: "O(n)",
            stable: "Yes",
            inPlace: "No",
            paradigm: "Divide and Conquer",
            description: "Divides array into halves, recursively sorts them, and merges the sorted halves back together.",
            vivaTip: "Guaranteed O(n log n) even in worst case; stable, but requires auxiliary O(n) memory.",
            pseudocode: [
                "procedure mergeSort(A, left, right)",
                "    if left < right then",
                "        mid := floor((left + right) / 2)",
                "        mergeSort(A, left, mid)",
                "        mergeSort(A, mid + 1, right)",
                "        merge(A, left, mid, right)",
                "end procedure",
                "procedure merge(A, left, mid, right)",
                "    copy to temp arrays L and R",
                "    merge back to A comparing L[i] and R[j]",
                "end procedure"
            ]
        },
        quick: {
            name: "Quick Sort",
            category: "Sorting",
            bestTime: "Ω(n log n)",
            avgTime: "θ(n log n)",
            worstTime: "O(n²)",
            space: "O(log n)",
            stable: "No",
            inPlace: "Yes",
            paradigm: "Divide and Conquer / Partition",
            description: "Selects a pivot element and partitions array so elements smaller are left, larger are right.",
            vivaTip: "Worst case O(n²) occurs when pivot chosen is consistently the extreme element (e.g. sorted array with last element pivot).",
            pseudocode: [
                "procedure quickSort(A, low, high)",
                "    if low < high then",
                "        pIndex := partition(A, low, high)",
                "        quickSort(A, low, pIndex - 1)",
                "        quickSort(A, pIndex + 1, high)",
                "end procedure",
                "procedure partition(A, low, high)",
                "    pivot := A[high], i := low - 1",
                "    for j := low to high - 1 do",
                "        if A[j] < pivot then i++, swap(A[i], A[j])",
                "    swap(A[i + 1], A[high]), return i + 1"
            ]
        },
        heap: {
            name: "Heap Sort",
            category: "Sorting",
            bestTime: "Ω(n log n)",
            avgTime: "θ(n log n)",
            worstTime: "O(n log n)",
            space: "O(1)",
            stable: "No",
            inPlace: "Yes",
            paradigm: "Complete Binary Tree / Selection",
            description: "Constructs a Max-Heap from the array, repeatedly extracts the maximum element to the end.",
            vivaTip: "In-place O(1) space with guaranteed O(n log n) time, but lacks cache locality compared to Quick Sort.",
            pseudocode: [
                "procedure heapSort(A)",
                "    n := length(A)",
                "    for i := floor(n / 2) - 1 down to 0 do",
                "        heapify(A, n, i)",
                "    for i := n - 1 down to 1 do",
                "        swap(A[0], A[i])",
                "        heapify(A, i, 0)",
                "end procedure",
                "procedure heapify(A, n, i)",
                "    largest := i, left := 2*i + 1, right := 2*i + 2",
                "    if left < n and A[left] > A[largest] then largest := left",
                "    if right < n and A[right] > A[largest] then largest := right",
                "    if largest != i then swap(A[i], A[largest]); heapify(A, n, largest)"
            ]
        }
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Bubble Sort
    // ------------------------------------------------------------------------
    recordBubbleSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        const sortedIndices = [];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Bubble Sort on array of ${n} elements.`,
            counters: { comparisons, swaps }
        });

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            steps.push({
                type: 'highlight',
                indices: [],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 4,
                description: `Pass ${i + 1}: checking adjacent pairs up to index ${n - 1 - i}.`,
                counters: { comparisons, swaps }
            });

            for (let j = 0; j < n - 1 - i; j++) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [j, j + 1],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 6,
                    description: `Comparing A[${j}] (${a[j]}) and A[${j + 1}] (${a[j + 1]}).`,
                    counters: { comparisons, swaps }
                });

                if (a[j] > a[j + 1]) {
                    // Swap elements
                    const temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                    swaps++;
                    swapped = true;

                    steps.push({
                        type: 'swap',
                        indices: [j, j + 1],
                        sortedIndices: [...sortedIndices],
                        arrayState: [...a],
                        codeLine: 7,
                        description: `Swapped ${a[j + 1]} and ${a[j]} because ${a[j + 1]} > ${a[j]}.`,
                        counters: { comparisons, swaps }
                    });
                }
            }

            // The largest element of this pass has bubbled to the end
            sortedIndices.push(n - 1 - i);
            steps.push({
                type: 'mark_sorted',
                indices: [n - 1 - i],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 9,
                description: `Element ${a[n - 1 - i]} at index ${n - 1 - i} is now in its sorted position.`,
                counters: { comparisons, swaps }
            });

            if (!swapped) {
                steps.push({
                    type: 'highlight',
                    indices: [],
                    sortedIndices: Array.from({ length: n }, (_, k) => k),
                    arrayState: [...a],
                    codeLine: 10,
                    description: "No swaps made in this pass! Early termination condition met.",
                    counters: { comparisons, swaps }
                });
                break;
            }
        }

        // Mark all remaining elements sorted
        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 11,
            description: `Bubble Sort complete! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Selection Sort
    // ------------------------------------------------------------------------
    recordSelectionSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        const sortedIndices = [];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Selection Sort on array of ${n} elements.`,
            counters: { comparisons, swaps }
        });

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            steps.push({
                type: 'highlight',
                indices: [i],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 4,
                description: `Finding minimum element in unsorted range [${i} .. ${n - 1}]. Initial min: A[${i}] = ${a[i]}.`,
                counters: { comparisons, swaps }
            });

            for (let j = i + 1; j < n; j++) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [minIdx, j],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 6,
                    description: `Comparing candidate A[${j}] (${a[j]}) with current min A[${minIdx}] (${a[minIdx]}).`,
                    counters: { comparisons, swaps }
                });

                if (a[j] < a[minIdx]) {
                    minIdx = j;
                    steps.push({
                        type: 'pivot',
                        indices: [minIdx],
                        sortedIndices: [...sortedIndices],
                        arrayState: [...a],
                        codeLine: 7,
                        description: `New minimum found: A[${minIdx}] = ${a[minIdx]}.`,
                        counters: { comparisons, swaps }
                    });
                }
            }

            if (minIdx !== i) {
                const temp = a[i];
                a[i] = a[minIdx];
                a[minIdx] = temp;
                swaps++;

                steps.push({
                    type: 'swap',
                    indices: [i, minIdx],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Swapped A[${i}] (${a[i]}) with minimum A[${minIdx}] (${a[minIdx]}).`,
                    counters: { comparisons, swaps }
                });
            }

            sortedIndices.push(i);
            steps.push({
                type: 'mark_sorted',
                indices: [i],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 9,
                description: `Element ${a[i]} is now in its final sorted position at index ${i}.`,
                counters: { comparisons, swaps }
            });
        }

        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 10,
            description: `Selection Sort complete! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Insertion Sort
    // ------------------------------------------------------------------------
    recordInsertionSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        const sortedIndices = [0];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [0],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Insertion Sort. First element A[0] (${a[0]}) is trivially sorted.`,
            counters: { comparisons, swaps }
        });

        for (let i = 1; i < n; i++) {
            const key = a[i];
            let j = i - 1;

            steps.push({
                type: 'pivot',
                indices: [i],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 4,
                description: `Inspecting key element A[${i}] (${key}) to insert into sorted prefix [0 .. ${i - 1}].`,
                counters: { comparisons, swaps }
            });

            while (j >= 0) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [j, j + 1],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 6,
                    description: `Comparing key (${key}) with A[${j}] (${a[j]}).`,
                    counters: { comparisons, swaps }
                });

                if (a[j] > key) {
                    a[j + 1] = a[j];
                    swaps++;
                    steps.push({
                        type: 'write',
                        indices: [j + 1],
                        sortedIndices: [...sortedIndices],
                        arrayState: [...a],
                        codeLine: 7,
                        description: `Shifted A[${j}] (${a[j]}) rightwards to index ${j + 1}.`,
                        counters: { comparisons, swaps }
                    });
                    j--;
                } else {
                    break;
                }
            }

            a[j + 1] = key;
            if (j + 1 !== i) {
                steps.push({
                    type: 'write',
                    indices: [j + 1],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Inserted key (${key}) into position ${j + 1}.`,
                    counters: { comparisons, swaps }
                });
            }

            sortedIndices.push(i);
        }

        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 10,
            description: `Insertion Sort complete! Total comparisons: ${comparisons}, shifts/writes: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Merge Sort
    // ------------------------------------------------------------------------
    recordMergeSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            sortedIndices: [],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Merge Sort (Divide & Conquer) on ${n} elements.`,
            counters: { comparisons, swaps }
        });

        const merge = (left, mid, right) => {
            const leftArr = a.slice(left, mid + 1);
            const rightArr = a.slice(mid + 1, right + 1);

            let i = 0, j = 0, k = left;

            steps.push({
                type: 'highlight',
                indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
                sortedIndices: [],
                arrayState: [...a],
                codeLine: 8,
                description: `Merging sorted subarrays [${left}..${mid}] and [${mid + 1}..${right}].`,
                counters: { comparisons, swaps }
            });

            while (i < leftArr.length && j < rightArr.length) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [left + i, mid + 1 + j],
                    sortedIndices: [],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Comparing left element (${leftArr[i]}) with right element (${rightArr[j]}).`,
                    counters: { comparisons, swaps }
                });

                if (leftArr[i] <= rightArr[j]) {
                    a[k] = leftArr[i];
                    swaps++;
                    steps.push({
                        type: 'write',
                        indices: [k],
                        sortedIndices: [],
                        arrayState: [...a],
                        codeLine: 9,
                        description: `Placed smaller element ${leftArr[i]} into merged array at index ${k}.`,
                        counters: { comparisons, swaps }
                    });
                    i++;
                } else {
                    a[k] = rightArr[j];
                    swaps++;
                    steps.push({
                        type: 'write',
                        indices: [k],
                        sortedIndices: [],
                        arrayState: [...a],
                        codeLine: 9,
                        description: `Placed smaller element ${rightArr[j]} into merged array at index ${k}.`,
                        counters: { comparisons, swaps }
                    });
                    j++;
                }
                k++;
            }

            while (i < leftArr.length) {
                a[k] = leftArr[i];
                swaps++;
                steps.push({
                    type: 'write',
                    indices: [k],
                    sortedIndices: [],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Flushed remaining left element ${leftArr[i]} into index ${k}.`,
                    counters: { comparisons, swaps }
                });
                i++;
                k++;
            }

            while (j < rightArr.length) {
                a[k] = rightArr[j];
                swaps++;
                steps.push({
                    type: 'write',
                    indices: [k],
                    sortedIndices: [],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Flushed remaining right element ${rightArr[j]} into index ${k}.`,
                    counters: { comparisons, swaps }
                });
                j++;
                k++;
            }
        };

        const sort = (left, right) => {
            if (left >= right) return;
            const mid = Math.floor((left + right) / 2);
            steps.push({
                type: 'pivot',
                indices: [mid],
                sortedIndices: [],
                arrayState: [...a],
                codeLine: 3,
                description: `Dividing range [${left}..${right}] at midpoint ${mid}.`,
                counters: { comparisons, swaps }
            });
            sort(left, mid);
            sort(mid + 1, right);
            merge(left, mid, right);
        };

        sort(0, n - 1);

        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 10,
            description: `Merge Sort complete! Total comparisons: ${comparisons}, writes: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Quick Sort
    // ------------------------------------------------------------------------
    recordQuickSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        const sortedIndices = [];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Quick Sort (Lomuto Partition) on ${n} elements.`,
            counters: { comparisons, swaps }
        });

        const partition = (low, high) => {
            const pivot = a[high];
            let i = low - 1;

            steps.push({
                type: 'pivot',
                indices: [high],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 8,
                description: `Chosen pivot A[${high}] = ${pivot}. Partitioning range [${low} .. ${high - 1}].`,
                counters: { comparisons, swaps }
            });

            for (let j = low; j < high; j++) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [j, high],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 9,
                    description: `Comparing element A[${j}] (${a[j]}) with pivot (${pivot}).`,
                    counters: { comparisons, swaps }
                });

                if (a[j] < pivot) {
                    i++;
                    if (i !== j) {
                        const temp = a[i];
                        a[i] = a[j];
                        a[j] = temp;
                        swaps++;
                        steps.push({
                            type: 'swap',
                            indices: [i, j],
                            sortedIndices: [...sortedIndices],
                            arrayState: [...a],
                            codeLine: 10,
                            description: `Swapped A[${i}] and A[${j}] to place smaller element to the left.`,
                            counters: { comparisons, swaps }
                        });
                    }
                }
            }

            // Swap pivot into correct slot
            const temp = a[i + 1];
            a[i + 1] = a[high];
            a[high] = temp;
            swaps++;

            sortedIndices.push(i + 1);
            steps.push({
                type: 'mark_sorted',
                indices: [i + 1],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 11,
                description: `Placed pivot ${pivot} into its sorted position at index ${i + 1}.`,
                counters: { comparisons, swaps }
            });

            return i + 1;
        };

        const sort = (low, high) => {
            if (low < high) {
                const pi = partition(low, high);
                sort(low, pi - 1);
                sort(pi + 1, high);
            } else if (low === high && !sortedIndices.includes(low)) {
                sortedIndices.push(low);
            }
        };

        sort(0, n - 1);

        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 6,
            description: `Quick Sort complete! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Heap Sort
    // ------------------------------------------------------------------------
    recordHeapSort(inputArray) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        const sortedIndices = [];
        let comparisons = 0;
        let swaps = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Heap Sort: Building Max-Heap from ${n} elements.`,
            counters: { comparisons, swaps }
        });

        const heapify = (size, root) => {
            let largest = root;
            const left = 2 * root + 1;
            const right = 2 * root + 2;

            if (left < size) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [left, largest],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 10,
                    description: `Heapify: Comparing left child A[${left}] (${a[left]}) with largest A[${largest}] (${a[largest]}).`,
                    counters: { comparisons, swaps }
                });
                if (a[left] > a[largest]) {
                    largest = left;
                }
            }

            if (right < size) {
                comparisons++;
                steps.push({
                    type: 'compare',
                    indices: [right, largest],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 11,
                    description: `Heapify: Comparing right child A[${right}] (${a[right]}) with largest A[${largest}] (${a[largest]}).`,
                    counters: { comparisons, swaps }
                });
                if (a[right] > a[largest]) {
                    largest = right;
                }
            }

            if (largest !== root) {
                const temp = a[root];
                a[root] = a[largest];
                a[largest] = temp;
                swaps++;

                steps.push({
                    type: 'swap',
                    indices: [root, largest],
                    sortedIndices: [...sortedIndices],
                    arrayState: [...a],
                    codeLine: 12,
                    description: `Heapify: Swapped parent A[${root}] with larger child A[${largest}].`,
                    counters: { comparisons, swaps }
                });

                heapify(size, largest);
            }
        };

        // Phase 1: Build Max-Heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(n, i);
        }

        steps.push({
            type: 'highlight',
            indices: [0],
            sortedIndices: [...sortedIndices],
            arrayState: [...a],
            codeLine: 4,
            description: "Max-Heap successfully built! Maximum element is at the root (index 0).",
            counters: { comparisons, swaps }
        });

        // Phase 2: Extract elements one by one
        for (let i = n - 1; i > 0; i--) {
            // Swap root with end
            const temp = a[0];
            a[0] = a[i];
            a[i] = temp;
            swaps++;

            sortedIndices.push(i);
            steps.push({
                type: 'swap',
                indices: [0, i],
                sortedIndices: [...sortedIndices],
                arrayState: [...a],
                codeLine: 6,
                description: `Moved maximum element ${a[i]} from root to index ${i}.`,
                counters: { comparisons, swaps }
            });

            // Restore heap property
            heapify(i, 0);
        }

        const allSorted = Array.from({ length: n }, (_, k) => k);
        steps.push({
            type: 'done',
            indices: [],
            sortedIndices: allSorted,
            arrayState: [...a],
            codeLine: 7,
            description: `Heap Sort complete! Total comparisons: ${comparisons}, swaps: ${swaps}.`,
            counters: { comparisons, swaps }
        });

        return steps;
    },

    /**
     * Helper to get steps by algorithm key
     */
    getSteps(algoKey, array) {
        switch (algoKey) {
            case 'bubble': return this.recordBubbleSort(array);
            case 'selection': return this.recordSelectionSort(array);
            case 'insertion': return this.recordInsertionSort(array);
            case 'merge': return this.recordMergeSort(array);
            case 'quick': return this.recordQuickSort(array);
            case 'heap': return this.recordHeapSort(array);
            default: return this.recordBubbleSort(array);
        }
    }
};
