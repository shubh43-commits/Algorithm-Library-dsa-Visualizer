/**
 * ============================================================================
 * Algorithm Library - Pathfinding Grid Controller (grid.js)
 * ============================================================================
 * Manages the interactive 2D grid:
 *   - Mouse click-and-drag wall drawing and erasing
 *   - Drag-and-drop Start and Target nodes
 *   - Randomized maze generation (recursive division & dense obstacles)
 *   - Calm, organic Zen ripple animations for visited nodes and gold path
 *   - Step execution, real-time metrics (nodes visited, path length)
 */

class PathfindingGrid {
    constructor(containerSelector, options = {}) {
        this.container = typeof containerSelector === 'string' 
            ? document.querySelector(containerSelector) 
            : containerSelector;

        this.rows = options.rows || 18;
        this.cols = options.cols || 35;
        this.start = { r: Math.floor(this.rows / 2), c: 4 };
        this.target = { r: Math.floor(this.rows / 2), c: this.cols - 5 };
        this.walls = new Set();
        this.visitedNodes = [];
        this.pathNodes = [];

        this.isMouseDown = false;
        this.isDraggingStart = false;
        this.isDraggingTarget = false;
        this.paintMode = 'wall'; // 'wall' or 'erase'
        this.isAnimating = false;
        this.animationTimeouts = [];

        this.onMetricsUpdate = options.onMetricsUpdate || (() => {});
        this.initDOM();
    }

    initDOM() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        const fragment = document.createDocumentFragment();
        this.cellMap = new Map();

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-label', `Row ${r}, Column ${c}`);

                if (r === this.start.r && c === this.start.c) {
                    cell.classList.add('cell-start');
                    cell.innerHTML = '<i class="bi bi-geo-alt-fill"></i>';
                } else if (r === this.target.r && c === this.target.c) {
                    cell.classList.add('cell-target');
                    cell.innerHTML = '<i class="bi bi-flag-fill"></i>';
                }

                this.attachCellEvents(cell, r, c);
                this.cellMap.set(`${r},${c}`, cell);
                fragment.appendChild(cell);
            }
        }

        this.container.appendChild(fragment);

        // Global mouseup to release drawing
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.isDraggingStart = false;
            this.isDraggingTarget = false;
        });
    }

    attachCellEvents(cell, r, c) {
        cell.addEventListener('mousedown', (e) => {
            if (this.isAnimating) return;
            e.preventDefault();
            this.isMouseDown = true;

            if (r === this.start.r && c === this.start.c) {
                this.isDraggingStart = true;
            } else if (r === this.target.r && c === this.target.c) {
                this.isDraggingTarget = true;
            } else {
                const key = `${r},${c}`;
                if (this.walls.has(key)) {
                    this.paintMode = 'erase';
                    this.removeWall(r, c);
                } else {
                    this.paintMode = 'wall';
                    this.addWall(r, c);
                }
            }
        });

        cell.addEventListener('mouseenter', () => {
            if (this.isAnimating || !this.isMouseDown) return;

            if (this.isDraggingStart) {
                if (!this.isTarget(r, c) && !this.walls.has(`${r},${c}`)) {
                    this.moveStart(r, c);
                }
            } else if (this.isDraggingTarget) {
                if (!this.isStart(r, c) && !this.walls.has(`${r},${c}`)) {
                    this.moveTarget(r, c);
                }
            } else {
                if (!this.isStart(r, c) && !this.targetIs(r, c)) {
                    if (this.paintMode === 'wall') this.addWall(r, c);
                    else this.removeWall(r, c);
                }
            }
        });
    }

    isStart(r, c) {
        return this.start.r === r && this.start.c === c;
    }

    isTarget(r, c) {
        return this.target.r === r && this.target.c === c;
    }

    targetIs(r, c) {
        return this.isTarget(r, c);
    }

    moveStart(r, c) {
        const oldCell = this.cellMap.get(`${this.start.r},${this.start.c}`);
        if (oldCell) {
            oldCell.classList.remove('cell-start');
            oldCell.innerHTML = '';
        }
        this.start = { r, c };
        const newCell = this.cellMap.get(`${r},${c}`);
        if (newCell) {
            newCell.classList.add('cell-start');
            newCell.innerHTML = '<i class="bi bi-geo-alt-fill"></i>';
        }
    }

    moveTarget(r, c) {
        const oldCell = this.cellMap.get(`${this.target.r},${this.target.c}`);
        if (oldCell) {
            oldCell.classList.remove('cell-target');
            oldCell.innerHTML = '';
        }
        this.target = { r, c };
        const newCell = this.cellMap.get(`${r},${c}`);
        if (newCell) {
            newCell.classList.add('cell-target');
            newCell.innerHTML = '<i class="bi bi-flag-fill"></i>';
        }
    }

    addWall(r, c) {
        const key = `${r},${c}`;
        if (!this.isStart(r, c) && !this.isTarget(r, c)) {
            this.walls.add(key);
            const cell = this.cellMap.get(key);
            if (cell) cell.classList.add('cell-wall');
        }
    }

    removeWall(r, c) {
        const key = `${r},${c}`;
        this.walls.delete(key);
        const cell = this.cellMap.get(key);
        if (cell) cell.classList.remove('cell-wall');
    }

    clearWalls() {
        this.stopAnimation();
        this.walls.forEach(key => {
            const cell = this.cellMap.get(key);
            if (cell) cell.classList.remove('cell-wall');
        });
        this.walls.clear();
        this.clearPath();
    }

    clearPath() {
        this.stopAnimation();
        this.cellMap.forEach(cell => {
            cell.classList.remove('cell-visited', 'cell-path');
        });
        this.visitedNodes = [];
        this.pathNodes = [];
        this.onMetricsUpdate({ visited: 0, length: 0, time: 0 });
    }

    resetAll() {
        this.clearWalls();
        this.start = { r: Math.floor(this.rows / 2), c: 4 };
        this.target = { r: Math.floor(this.rows / 2), c: this.cols - 5 };
        this.initDOM();
        this.onMetricsUpdate({ visited: 0, length: 0, time: 0 });
    }

    generateRandomMaze() {
        this.clearWalls();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.isStart(r, c) || this.isTarget(r, c)) continue;
                // Leave buffer around start and target
                if (Math.abs(r - this.start.r) + Math.abs(c - this.start.c) <= 1) continue;
                if (Math.abs(r - this.target.r) + Math.abs(c - this.target.c) <= 1) continue;

                if (Math.random() < 0.28) {
                    this.addWall(r, c);
                }
            }
        }
    }

    stopAnimation() {
        this.isAnimating = false;
        this.animationTimeouts.forEach(t => clearTimeout(t));
        this.animationTimeouts = [];
    }

    /**
     * Executes and animates pathfinding algorithm
     * @param {string} algoKey - 'bfs', 'dfs', 'dijkstra', or 'astar'
     * @param {number} speedMs - Delay between node visits
     */
    visualize(algoKey, speedMs = 15) {
        this.clearPath();
        this.isAnimating = true;

        const startTime = performance.now();
        const result = window.AlgoLib.Pathfinding.solve(
            algoKey,
            this.rows,
            this.cols,
            this.start,
            this.target,
            this.walls
        );
        const searchDurationMs = Math.round(performance.now() - startTime);

        const { visitedOrder, finalPath, found } = result;

        // Animate visited nodes
        visitedOrder.forEach((node, index) => {
            const timeout = setTimeout(() => {
                if (!this.isAnimating) return;
                const cell = this.cellMap.get(`${node.r},${node.c}`);
                if (cell && !this.isStart(node.r, node.c) && !this.isTarget(node.r, node.c)) {
                    cell.classList.add('cell-visited');
                }

                this.onMetricsUpdate({
                    visited: index + 1,
                    length: 0,
                    time: searchDurationMs
                });

                // If visited sequence is finished, animate final shortest path
                if (index === visitedOrder.length - 1) {
                    if (found && finalPath.length > 0) {
                        this.animatePath(finalPath, searchDurationMs);
                    } else {
                        this.isAnimating = false;
                    }
                }
            }, index * speedMs);

            this.animationTimeouts.push(timeout);
        });

        // Edge case: target reached immediately or no visited nodes
        if (visitedOrder.length === 0) {
            if (found && finalPath.length > 0) {
                this.animatePath(finalPath, searchDurationMs);
            } else {
                this.isAnimating = false;
            }
        }
    }

    animatePath(path, searchDurationMs) {
        path.forEach((node, idx) => {
            const timeout = setTimeout(() => {
                if (!this.isAnimating) return;
                const cell = this.cellMap.get(`${node.r},${node.c}`);
                if (cell && !this.isStart(node.r, node.c) && !this.isTarget(node.r, node.c)) {
                    cell.classList.remove('cell-visited');
                    cell.classList.add('cell-path');
                }

                // Play soft chime along path
                if (window.soundSynth) {
                    const norm = (idx / path.length) * 100;
                    window.soundSynth.playTone(norm, 0, 100, 'sorted');
                }

                this.onMetricsUpdate({
                    visited: this.cellMap.size, // updated above
                    length: idx + 1,
                    time: searchDurationMs
                });

                if (idx === path.length - 1) {
                    this.isAnimating = false;
                }
            }, idx * 30);

            this.animationTimeouts.push(timeout);
        });
    }
}

window.PathfindingGrid = PathfindingGrid;
