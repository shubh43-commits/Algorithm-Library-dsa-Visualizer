/**
 * ============================================================================
 * Algorithm Library - Pathfinding Algorithms (pathfinding.js)
 * ============================================================================
 * Implements Breadth-First Search (BFS), Depth-First Search (DFS),
 * Dijkstra's Algorithm, and A* Search on a 2D grid.
 * 
 * Each algorithm records:
 *   - visitedOrder: array of { r, c } nodes visited in exact sequence
 *   - finalPath: reconstructed array of { r, c } nodes from start to target
 *   - found: whether target was reachable
 *   - steps: sequence of discrete steps for the scrubbable player
 */

window.AlgoLib = window.AlgoLib || {};

window.AlgoLib.Pathfinding = {
    registry: {
        bfs: {
            name: "Breadth-First Search (BFS)",
            category: "Pathfinding",
            bestTime: "O(V + E)",
            avgTime: "O(V + E)",
            worstTime: "O(V + E)",
            space: "O(V)",
            guaranteesShortest: "Yes (Unweighted)",
            paradigm: "FIFO Queue / Level-order Traversal",
            description: "Explores all neighbor nodes at current depth before moving deeper. Guarantees shortest path on unweighted graphs.",
            vivaTip: "BFS is optimal for unweighted graphs because it discovers nodes in order of their edge distance from start.",
            pseudocode: [
                "procedure BFS(start, target, grid)",
                "    queue := [start]",
                "    visited := {start}",
                "    while queue is not empty do",
                "        current := queue.dequeue()",
                "        if current == target then return reconstructPath()",
                "        for neighbor in getValidNeighbors(current) do",
                "            if neighbor not in visited then",
                "                visited.add(neighbor)",
                "                parent[neighbor] := current",
                "                queue.enqueue(neighbor)",
                "end procedure"
            ]
        },
        dfs: {
            name: "Depth-First Search (DFS)",
            category: "Pathfinding",
            bestTime: "O(V + E)",
            avgTime: "O(V + E)",
            worstTime: "O(V + E)",
            space: "O(V)",
            guaranteesShortest: "No",
            paradigm: "LIFO Stack / Backtracking",
            description: "Explores as far as possible along each branch before backtracking. Does not guarantee shortest path.",
            vivaTip: "DFS has low memory overhead when target is deep, but often produces heavily sub-optimal zig-zag paths.",
            pseudocode: [
                "procedure DFS(start, target, grid)",
                "    stack := [start]",
                "    visited := {start}",
                "    while stack is not empty do",
                "        current := stack.pop()",
                "        if current == target then return reconstructPath()",
                "        for neighbor in getValidNeighbors(current) do",
                "            if neighbor not in visited then",
                "                visited.add(neighbor)",
                "                parent[neighbor] := current",
                "                stack.push(neighbor)",
                "end procedure"
            ]
        },
        dijkstra: {
            name: "Dijkstra's Algorithm",
            category: "Pathfinding",
            bestTime: "O(E + V log V)",
            avgTime: "O(E + V log V)",
            worstTime: "O(E + V log V)",
            space: "O(V)",
            guaranteesShortest: "Yes (Non-negative weights)",
            paradigm: "Greedy / Priority Queue",
            description: "Finds shortest path between nodes in a graph by always expanding the unvisited node with lowest accumulated cost.",
            vivaTip: "Dijkstra can be viewed as BFS generalized for weighted graphs. Cannot handle negative edge cycles.",
            pseudocode: [
                "procedure Dijkstra(start, target, grid)",
                "    dist[v] := infinity for all v, dist[start] := 0",
                "    pq := MinPriorityQueue({start: 0})",
                "    while pq is not empty do",
                "        u := pq.extractMin()",
                "        if u == target then return reconstructPath()",
                "        for v in neighbors(u) do",
                "            alt := dist[u] + weight(u, v)",
                "            if alt < dist[v] then",
                "                dist[v] := alt; parent[v] := u",
                "                pq.decreaseKey(v, alt)",
                "end procedure"
            ]
        },
        astar: {
            name: "A* Search Algorithm",
            category: "Pathfinding",
            bestTime: "O(E)",
            avgTime: "O(E log V)",
            worstTime: "O(V²)",
            space: "O(V)",
            guaranteesShortest: "Yes (with Admissible Heuristic)",
            paradigm: "Heuristic Informed / Best-First",
            description: "Uses evaluation function f(n) = g(n) + h(n), combining known cost g(n) and estimated distance h(n) to target.",
            vivaTip: "Using Manhattan distance h(n) = |r1 - r2| + |c1 - c2| guarantees optimality on 4-directional grid graphs.",
            pseudocode: [
                "procedure AStar(start, target, grid)",
                "    openSet := MinPriorityQueue({start: f(start)})",
                "    gScore[start] := 0",
                "    fScore[start] := heuristic(start, target)",
                "    while openSet is not empty do",
                "        current := openSet.extractMin()",
                "        if current == target then return reconstructPath()",
                "        for neighbor in neighbors(current) do",
                "            tentativeG := gScore[current] + 1",
                "            if tentativeG < gScore[neighbor] then",
                "                parent[neighbor] := current",
                "                gScore[neighbor] := tentativeG",
                "                fScore[neighbor] := tentativeG + heuristic(neighbor, target)",
                "                openSet.insertOrUpdate(neighbor, fScore[neighbor])",
                "end procedure"
            ]
        }
    },

    // ------------------------------------------------------------------------
    // Grid Helper Methods
    // ------------------------------------------------------------------------
    getNeighbors(r, c, rows, cols, walls) {
        // Standard 4-directional cardinal neighbors: Up, Right, Down, Left
        const deltas = [
            [-1, 0], // Up
            [0, 1],  // Right
            [1, 0],  // Down
            [0, -1]  // Left
        ];
        const neighbors = [];

        for (const [dr, dc] of deltas) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (!walls.has(`${nr},${nc}`)) {
                    neighbors.push({ r: nr, c: nc });
                }
            }
        }
        return neighbors;
    },

    reconstructPath(parentMap, targetKey, startKey) {
        const path = [];
        let curr = targetKey;
        while (curr && curr !== startKey) {
            const [r, c] = curr.split(',').map(Number);
            path.unshift({ r, c });
            curr = parentMap.get(curr);
        }
        if (curr === startKey) {
            const [sr, sc] = startKey.split(',').map(Number);
            path.unshift({ r: sr, c: sc });
        }
        return path;
    },

    // ------------------------------------------------------------------------
    // BFS Algorithm
    // ------------------------------------------------------------------------
    solveBFS(rows, cols, start, target, walls) {
        const startKey = `${start.r},${start.c}`;
        const targetKey = `${target.r},${target.c}`;
        const visitedOrder = [];
        const parentMap = new Map();
        const visited = new Set([startKey]);
        const queue = [{ r: start.r, c: start.c }];

        let found = false;

        while (queue.length > 0) {
            const current = queue.shift();
            const currKey = `${current.r},${current.c}`;

            if (currKey !== startKey && currKey !== targetKey) {
                visitedOrder.push(current);
            }

            if (current.r === target.r && current.c === target.c) {
                found = true;
                break;
            }

            const neighbors = this.getNeighbors(current.r, current.c, rows, cols, walls);
            for (const nbr of neighbors) {
                const nbrKey = `${nbr.r},${nbr.c}`;
                if (!visited.has(nbrKey)) {
                    visited.add(nbrKey);
                    parentMap.set(nbrKey, currKey);
                    queue.push(nbr);
                }
            }
        }

        const finalPath = found ? this.reconstructPath(parentMap, targetKey, startKey) : [];
        return { visitedOrder, finalPath, found };
    },

    // ------------------------------------------------------------------------
    // DFS Algorithm
    // ------------------------------------------------------------------------
    solveDFS(rows, cols, start, target, walls) {
        const startKey = `${start.r},${start.c}`;
        const targetKey = `${target.r},${target.c}`;
        const visitedOrder = [];
        const parentMap = new Map();
        const visited = new Set([startKey]);
        const stack = [{ r: start.r, c: start.c }];

        let found = false;

        while (stack.length > 0) {
            const current = stack.pop();
            const currKey = `${current.r},${current.c}`;

            if (currKey !== startKey && currKey !== targetKey) {
                visitedOrder.push(current);
            }

            if (current.r === target.r && current.c === target.c) {
                found = true;
                break;
            }

            const neighbors = this.getNeighbors(current.r, current.c, rows, cols, walls);
            // Reverse so we explore in natural cardinal direction order when popped from stack
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const nbr = neighbors[i];
                const nbrKey = `${nbr.r},${nbr.c}`;
                if (!visited.has(nbrKey)) {
                    visited.add(nbrKey);
                    parentMap.set(nbrKey, currKey);
                    stack.push(nbr);
                }
            }
        }

        const finalPath = found ? this.reconstructPath(parentMap, targetKey, startKey) : [];
        return { visitedOrder, finalPath, found };
    },

    // ------------------------------------------------------------------------
    // Dijkstra's Algorithm
    // ------------------------------------------------------------------------
    solveDijkstra(rows, cols, start, target, walls) {
        const startKey = `${start.r},${start.c}`;
        const targetKey = `${target.r},${target.c}`;
        const visitedOrder = [];
        const parentMap = new Map();
        const distances = new Map();
        const unvisited = new Map();

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${r},${c}`;
                if (!walls.has(key)) {
                    distances.set(key, Infinity);
                    unvisited.set(key, { r, c });
                }
            }
        }

        distances.set(startKey, 0);
        let found = false;

        while (unvisited.size > 0) {
            // Find unvisited node with lowest distance
            let closestKey = null;
            let lowestDist = Infinity;

            for (const [key] of unvisited) {
                const d = distances.get(key);
                if (d < lowestDist) {
                    lowestDist = d;
                    closestKey = key;
                }
            }

            if (!closestKey || lowestDist === Infinity) {
                break; // Remaining nodes are unreachable
            }

            const current = unvisited.get(closestKey);
            unvisited.delete(closestKey);

            if (closestKey !== startKey && closestKey !== targetKey) {
                visitedOrder.push(current);
            }

            if (current.r === target.r && current.c === target.c) {
                found = true;
                break;
            }

            const neighbors = this.getNeighbors(current.r, current.c, rows, cols, walls);
            for (const nbr of neighbors) {
                const nbrKey = `${nbr.r},${nbr.c}`;
                if (unvisited.has(nbrKey)) {
                    const altDist = lowestDist + 1; // Uniform weight = 1
                    if (altDist < distances.get(nbrKey)) {
                        distances.set(nbrKey, altDist);
                        parentMap.set(nbrKey, closestKey);
                    }
                }
            }
        }

        const finalPath = found ? this.reconstructPath(parentMap, targetKey, startKey) : [];
        return { visitedOrder, finalPath, found };
    },

    // ------------------------------------------------------------------------
    // A* Search Algorithm (Manhattan Distance Heuristic)
    // ------------------------------------------------------------------------
    solveAStar(rows, cols, start, target, walls) {
        const startKey = `${start.r},${start.c}`;
        const targetKey = `${target.r},${target.c}`;
        const visitedOrder = [];
        const parentMap = new Map();

        const heuristic = (r, c) => Math.abs(r - target.r) + Math.abs(c - target.c);

        const gScore = new Map();
        const fScore = new Map();
        const openSet = new Map(); // key -> { r, c }
        const closedSet = new Set();

        gScore.set(startKey, 0);
        fScore.set(startKey, heuristic(start.r, start.c));
        openSet.set(startKey, { r: start.r, c: start.c });

        let found = false;

        while (openSet.size > 0) {
            // Find node in openSet with lowest fScore
            let currentKey = null;
            let lowestF = Infinity;

            for (const [key] of openSet) {
                const f = fScore.get(key);
                if (f < lowestF) {
                    lowestF = f;
                    currentKey = key;
                }
            }

            const current = openSet.get(currentKey);
            openSet.delete(currentKey);
            closedSet.add(currentKey);

            if (currentKey !== startKey && currentKey !== targetKey) {
                visitedOrder.push(current);
            }

            if (current.r === target.r && current.c === target.c) {
                found = true;
                break;
            }

            const neighbors = this.getNeighbors(current.r, current.c, rows, cols, walls);
            for (const nbr of neighbors) {
                const nbrKey = `${nbr.r},${nbr.c}`;
                if (closedSet.has(nbrKey)) continue;

                const tentativeG = gScore.get(currentKey) + 1;
                const existingG = gScore.has(nbrKey) ? gScore.get(nbrKey) : Infinity;

                if (tentativeG < existingG) {
                    parentMap.set(nbrKey, currentKey);
                    gScore.set(nbrKey, tentativeG);
                    fScore.set(nbrKey, tentativeG + heuristic(nbr.r, nbr.c));

                    if (!openSet.has(nbrKey)) {
                        openSet.set(nbrKey, nbr);
                    }
                }
            }
        }

        const finalPath = found ? this.reconstructPath(parentMap, targetKey, startKey) : [];
        return { visitedOrder, finalPath, found };
    },

    solve(algoKey, rows, cols, start, target, walls) {
        switch (algoKey) {
            case 'bfs': return this.solveBFS(rows, cols, start, target, walls);
            case 'dfs': return this.solveDFS(rows, cols, start, target, walls);
            case 'dijkstra': return this.solveDijkstra(rows, cols, start, target, walls);
            case 'astar': return this.solveAStar(rows, cols, start, target, walls);
            default: return this.solveBFS(rows, cols, start, target, walls);
        }
    }
};
