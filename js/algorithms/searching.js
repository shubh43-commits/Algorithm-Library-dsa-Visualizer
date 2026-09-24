/**
 * ============================================================================
 * Algorithm Library - Searching Algorithms (searching.js)
 * ============================================================================
 * Implements Linear Search and Binary Search with step recording.
 * 
 * Includes explicit pointer tracking (low, mid, high) and elimination masks
 * to give students crystal-clear visual intuition during viva presentations.
 */

window.AlgoLib = window.AlgoLib || {};

window.AlgoLib.Searching = {
    registry: {
        linear: {
            name: "Linear Search",
            category: "Searching",
            bestTime: "Ω(1)",
            avgTime: "θ(n)",
            worstTime: "O(n)",
            space: "O(1)",
            stable: "N/A",
            inPlace: "Yes",
            paradigm: "Sequential Scan",
            description: "Sequentially checks each element of the list until a match is found or the whole list has been searched.",
            vivaTip: "Works on unsorted arrays and linked lists where random access O(1) is unavailable.",
            pseudocode: [
                "procedure linearSearch(A, target)",
                "    n := length(A)",
                "    for i := 0 to n - 1 do",
                "        if A[i] == target then",
                "            return i  // Match found!",
                "    return -1         // Target not present",
                "end procedure"
            ]
        },
        binary: {
            name: "Binary Search",
            category: "Searching",
            bestTime: "Ω(1)",
            avgTime: "θ(log n)",
            worstTime: "O(log n)",
            space: "O(1)",
            stable: "N/A",
            inPlace: "Yes",
            paradigm: "Divide and Conquer / Interval Halving",
            description: "Repeatedly divides the sorted search interval in half by comparing target to the middle element.",
            vivaTip: "Strict requirement: Input array MUST be sorted. Offers logarithmic time O(log n).",
            pseudocode: [
                "procedure binarySearch(A, target)",
                "    low := 0, high := length(A) - 1",
                "    while low <= high do",
                "        mid := floor((low + high) / 2)",
                "        if A[mid] == target then return mid",
                "        else if A[mid] < target then low := mid + 1",
                "        else high := mid - 1",
                "    return -1 // Not found",
                "end procedure"
            ]
        }
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Linear Search
    // ------------------------------------------------------------------------
    recordLinearSearch(inputArray, target) {
        const a = [...inputArray];
        const n = a.length;
        const steps = [];
        let comparisons = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            pointers: {},
            arrayState: [...a],
            codeLine: 1,
            description: `Starting Linear Search for target: ${target} in ${n} elements.`,
            counters: { comparisons, swaps: 0 }
        });

        let found = false;
        for (let i = 0; i < n; i++) {
            comparisons++;
            steps.push({
                type: 'compare',
                indices: [i],
                pointers: { current: i },
                arrayState: [...a],
                codeLine: 4,
                description: `Checking index ${i}: Is A[${i}] (${a[i]}) == target (${target})?`,
                counters: { comparisons, swaps: 0 }
            });

            if (a[i] === target) {
                steps.push({
                    type: 'found',
                    indices: [i],
                    pointers: { found: i },
                    arrayState: [...a],
                    codeLine: 5,
                    description: `Success! Target ${target} found at index ${i} after ${comparisons} comparison(s).`,
                    counters: { comparisons, swaps: 0 }
                });
                found = true;
                break;
            }
        }

        if (!found) {
            steps.push({
                type: 'not_found',
                indices: [],
                pointers: {},
                arrayState: [...a],
                codeLine: 6,
                description: `Target ${target} was not found in the array after checking all ${n} elements.`,
                counters: { comparisons, swaps: 0 }
            });
        }

        return steps;
    },

    // ------------------------------------------------------------------------
    // Step Recorder: Binary Search
    // ------------------------------------------------------------------------
    recordBinarySearch(inputArray, target) {
        // Binary search requires a sorted array. We sort a copy and track it.
        const a = [...inputArray].sort((x, y) => x - y);
        const n = a.length;
        const steps = [];
        let comparisons = 0;

        steps.push({
            type: 'highlight',
            indices: [],
            pointers: { low: 0, high: n - 1 },
            eliminated: [],
            arrayState: [...a],
            codeLine: 2,
            description: `Array sorted for Binary Search. Target: ${target}. Search range: [0 .. ${n - 1}].`,
            counters: { comparisons, swaps: 0 }
        });

        let low = 0;
        let high = n - 1;
        let found = false;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            comparisons++;

            // Create list of out-of-bounds / eliminated indices
            const eliminated = [];
            for (let k = 0; k < low; k++) eliminated.push(k);
            for (let k = high + 1; k < n; k++) eliminated.push(k);

            steps.push({
                type: 'pivot',
                indices: [mid],
                pointers: { low, mid, high },
                eliminated: [...eliminated],
                arrayState: [...a],
                codeLine: 4,
                description: `Midpoint calculated: mid = floor((${low} + ${high}) / 2) = ${mid}. A[mid] = ${a[mid]}.`,
                counters: { comparisons, swaps: 0 }
            });

            steps.push({
                type: 'compare',
                indices: [mid],
                pointers: { low, mid, high },
                eliminated: [...eliminated],
                arrayState: [...a],
                codeLine: 5,
                description: `Comparing A[mid] (${a[mid]}) with target (${target}).`,
                counters: { comparisons, swaps: 0 }
            });

            if (a[mid] === target) {
                steps.push({
                    type: 'found',
                    indices: [mid],
                    pointers: { found: mid },
                    eliminated: [...eliminated],
                    arrayState: [...a],
                    codeLine: 5,
                    description: `Target ${target} located at index ${mid}! Comparisons: ${comparisons}.`,
                    counters: { comparisons, swaps: 0 }
                });
                found = true;
                break;
            } else if (a[mid] < target) {
                steps.push({
                    type: 'highlight',
                    indices: [mid],
                    pointers: { low, mid, high },
                    eliminated: [...eliminated],
                    arrayState: [...a],
                    codeLine: 6,
                    description: `A[mid] (${a[mid]}) < ${target}. Target lies in right half. Adjusting low = ${mid + 1}.`,
                    counters: { comparisons, swaps: 0 }
                });
                low = mid + 1;
            } else {
                steps.push({
                    type: 'highlight',
                    indices: [mid],
                    pointers: { low, mid, high },
                    eliminated: [...eliminated],
                    arrayState: [...a],
                    codeLine: 7,
                    description: `A[mid] (${a[mid]}) > ${target}. Target lies in left half. Adjusting high = ${mid - 1}.`,
                    counters: { comparisons, swaps: 0 }
                });
                high = mid - 1;
            }
        }

        if (!found) {
            const allEliminated = Array.from({ length: n }, (_, k) => k);
            steps.push({
                type: 'not_found',
                indices: [],
                pointers: {},
                eliminated: allEliminated,
                arrayState: [...a],
                codeLine: 8,
                description: `Search interval exhausted (low > high). Target ${target} does not exist in array.`,
                counters: { comparisons, swaps: 0 }
            });
        }

        return steps;
    },

    getSteps(algoKey, array, target) {
        if (algoKey === 'binary') {
            return this.recordBinarySearch(array, target);
        }
        return this.recordLinearSearch(array, target);
    }
};
