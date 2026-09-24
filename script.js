/**
 * ============================================================================
 * Algorithm Library - Main Orchestrator & Controller (script.js)
 * ============================================================================
 * Coordinates the entire SPA:
 *   - Tab & Hash routing (Home, Sorting, Searching, Pathfinding, Compare, Quiz)
 *   - Dark/Light Zen Theme & Books-as-Bars style switching
 *   - Audio synthesizer control & Mute toggle
 *   - Home hero live mini-animation
 *   - Sorting Visualizer (Single Mode & Race Mode)
 *   - Searching Visualizer (Linear & Binary search with pointers)
 *   - Pathfinding Visualizer (Grid interaction & maze generator)
 *   - Interactive Algorithm Comparison Matrix
 *   - Interactive DSA Quiz with immediate viva feedback
 *   - Universal keyboard shortcuts (Space, Arrows, R, M)
 */

function safeGet(key, defVal) {
    try {
        const val = localStorage.getItem(key);
        return val !== null ? val : defVal;
    } catch (e) {
        return defVal;
    }
}

function safeSet(key, val) {
    try {
        localStorage.setItem(key, val);
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // 1. STATE & GLOBAL INSTANCES
    // ========================================================================
    const AppState = {
        currentSection: 'home',
        theme: safeGet('algolib_theme', 'dark'),
        barStyle: safeGet('algolib_bar_style', 'minimal'), // 'minimal' or 'books'
        
        // Sorting State
        sorting: {
            algo: 'bubble',
            array: [],
            size: 25,
            speedMs: 50,
            player: null,
            renderer: null,
            // Race mode support
            isRaceMode: false,
            raceAlgo2: 'quick',
            player2: null,
            renderer2: null
        },

        // Searching State
        searching: {
            algo: 'binary',
            array: [],
            target: 42,
            size: 20,
            speedMs: 250,
            player: null,
            renderer: null
        },

        // Pathfinding State
        pathfinding: {
            algo: 'bfs',
            grid: null,
            speedMs: 20
        },

        // Quiz State
        quiz: {
            currentIndex: 0,
            score: 0,
            answered: false,
            selectedOption: null
        },

        // Hero Mini Animation State
        hero: {
            player: null,
            renderer: null
        }
    };

    // ========================================================================
    // 2. THEME & DISPLAY INITIALIZATION
    // ========================================================================
    function applyTheme(theme) {
        AppState.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-bs-theme', theme);
        safeSet('algolib_theme', theme);

        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark' 
                ? '<i class="bi bi-sun-fill me-1"></i> <span class="d-none d-sm-inline">Light</span>' 
                : '<i class="bi bi-moon-stars-fill me-1"></i> <span class="d-none d-sm-inline">Dark</span>';
            themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
        }
    }

    function toggleTheme() {
        const next = AppState.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    }

    function applyBarStyle(style) {
        AppState.barStyle = style;
        safeSet('algolib_bar_style', style);

        if (AppState.sorting.renderer) AppState.sorting.renderer.setTheme(style);
        if (AppState.sorting.renderer2) AppState.sorting.renderer2.setTheme(style);
        if (AppState.searching.renderer) AppState.searching.renderer.setTheme(style);
        if (AppState.hero.renderer) AppState.hero.renderer.setTheme(style);

        // Re-render current steps
        if (AppState.sorting.player) {
            const step = AppState.sorting.player.getCurrentStep();
            if (step && AppState.sorting.renderer) AppState.sorting.renderer.render(step);
        }
        if (AppState.sorting.player2 && AppState.sorting.renderer2) {
            const step2 = AppState.sorting.player2.getCurrentStep();
            if (step2) AppState.sorting.renderer2.render(step2);
        }
        if (AppState.searching.player && AppState.searching.renderer) {
            const sStep = AppState.searching.player.getCurrentStep();
            if (sStep) AppState.searching.renderer.render(sStep);
        }

        const barStyleBtn = document.getElementById('bar-style-toggle-btn');
        if (barStyleBtn) {
            barStyleBtn.innerHTML = style === 'books'
                ? '<i class="bi bi-bar-chart-fill me-1"></i> Minimal'
                : '<i class="bi bi-book-half me-1"></i> Library Books';
        }
    }

    function toggleBarStyle() {
        const next = AppState.barStyle === 'books' ? 'minimal' : 'books';
        applyBarStyle(next);
    }

    // Sound toggle
    function updateAudioIcon() {
        const muteBtn = document.getElementById('mute-toggle-btn');
        if (muteBtn && window.soundSynth) {
            muteBtn.innerHTML = window.soundSynth.isMuted
                ? '<i class="bi bi-volume-mute-fill"></i>'
                : '<i class="bi bi-volume-up-fill"></i>';
            muteBtn.title = window.soundSynth.isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)';
            muteBtn.setAttribute('aria-label', muteBtn.title);
        }
    }

    // ========================================================================
    // 3. SPA ROUTING & SECTION SWITCHING
    // ========================================================================
    function navigateTo(sectionId, optionalParam = null) {
        AppState.currentSection = sectionId;

        // Pause any active players
        if (AppState.sorting.player) AppState.sorting.player.pause();
        if (AppState.sorting.player2) AppState.sorting.player2.pause();
        if (AppState.searching.player) AppState.searching.player.pause();

        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            const target = link.getAttribute('data-target');
            if (target === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });

        // Hide all views, display requested view
        document.querySelectorAll('.spa-view').forEach(view => {
            view.classList.remove('active');
        });
        const activeView = document.getElementById(`view-${sectionId}`);
        if (activeView) {
            activeView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // URL hash sync
        if (window.location.hash !== `#${sectionId}`) {
            window.location.hash = sectionId;
        }

        // Section-specific setup
        if (sectionId === 'sorting') {
            if (optionalParam) {
                const select = document.getElementById('sorting-algo-select');
                if (select) {
                    select.value = optionalParam;
                    AppState.sorting.algo = optionalParam;
                }
            }
            initSortingVisualizer();
        } else if (sectionId === 'searching') {
            if (optionalParam) {
                const select = document.getElementById('searching-algo-select');
                if (select) {
                    select.value = optionalParam;
                    AppState.searching.algo = optionalParam;
                }
            }
            initSearchingVisualizer();
        } else if (sectionId === 'pathfinding') {
            if (optionalParam) {
                const select = document.getElementById('pathfinding-algo-select');
                if (select) {
                    select.value = optionalParam;
                    AppState.pathfinding.algo = optionalParam;
                }
            }
            initPathfindingVisualizer();
        } else if (sectionId === 'compare') {
            renderCompareTable();
        } else if (sectionId === 'quiz') {
            initQuiz();
        } else if (sectionId === 'home') {
            initHeroMiniVisualizer();
        }
    }
    window.navigateTo = navigateTo;

    // ========================================================================
    // 4. RANDOM ARRAY GENERATORS
    // ========================================================================
    function generateArray(type = 'random', size = 25, minVal = 10, maxVal = 95) {
        let arr = [];
        if (type === 'random') {
            for (let i = 0; i < size; i++) {
                arr.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
            }
        } else if (type === 'reversed') {
            const step = (maxVal - minVal) / (size - 1 || 1);
            for (let i = 0; i < size; i++) {
                arr.push(Math.round(maxVal - i * step));
            }
        } else if (type === 'nearly_sorted') {
            const step = (maxVal - minVal) / (size - 1 || 1);
            for (let i = 0; i < size; i++) {
                arr.push(Math.round(minVal + i * step));
            }
            // Swap a few random pairs
            const swaps = Math.max(1, Math.floor(size * 0.1));
            for (let k = 0; k < swaps; k++) {
                const i = Math.floor(Math.random() * size);
                const j = Math.floor(Math.random() * size);
                const temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        } else if (type === 'few_unique') {
            const pool = [15, 35, 55, 75, 95];
            for (let i = 0; i < size; i++) {
                arr.push(pool[Math.floor(Math.random() * pool.length)]);
            }
        }
        return arr;
    }

    // ========================================================================
    // 5. SORTING VISUALIZER LOGIC (SINGLE & RACE MODE)
    // ========================================================================
    function initSortingVisualizer() {
        const container = document.getElementById('sorting-canvas');
        if (!container) return;

        if (!AppState.sorting.renderer) {
            AppState.sorting.renderer = new ArrayRenderer(container, {
                theme: AppState.barStyle,
                showValues: true
            });
        }

        // Initialize Race Mode Secondary Renderer
        const container2 = document.getElementById('sorting-canvas-race');
        if (container2 && !AppState.sorting.renderer2) {
            AppState.sorting.renderer2 = new ArrayRenderer(container2, {
                theme: AppState.barStyle,
                showValues: true
            });
        }

        if (AppState.sorting.array.length === 0) {
            resetSortingArray('random');
        } else {
            loadSortingSteps();
        }

        updateSortingInfoPanel();
    }

    function resetSortingArray(type = 'random') {
        const sizeInput = document.getElementById('sorting-size-slider');
        const size = sizeInput ? parseInt(sizeInput.value, 10) : AppState.sorting.size;
        AppState.sorting.size = size;
        AppState.sorting.array = generateArray(type, size);
        loadSortingSteps();
    }

    function loadSortingSteps() {
        const algoKey = AppState.sorting.algo;
        const steps = window.AlgoLib.Sorting.getSteps(algoKey, AppState.sorting.array);

        // Player 1 Setup
        if (!AppState.sorting.player) {
            AppState.sorting.player = new AlgorithmPlayer({
                speed: AppState.sorting.speedMs,
                onStep: (step, index, total) => {
                    if (AppState.sorting.renderer) AppState.sorting.renderer.render(step);
                    updateSortingStats(step, index, total);
                    highlightPseudocode('sorting-code-list', step.codeLine);
                    updateNarrative('sorting-narrative', step.description);
                },
                onStateChange: (isPlaying) => {
                    updatePlayButton('sorting-play-btn', isPlaying);
                    if (AppState.sorting.isRaceMode && AppState.sorting.player2) {
                        if (isPlaying && !AppState.sorting.player2.isPlaying) AppState.sorting.player2.play();
                        else if (!isPlaying && AppState.sorting.player2.isPlaying) AppState.sorting.player2.pause();
                    }
                },
                onComplete: () => {
                    checkRaceFinish();
                }
            });
        }

        AppState.sorting.player.loadSteps(steps, false);

        // If in Race Mode, setup Player 2 with same array
        if (AppState.sorting.isRaceMode) {
            const algo2Key = AppState.sorting.raceAlgo2;
            const steps2 = window.AlgoLib.Sorting.getSteps(algo2Key, AppState.sorting.array);

            if (!AppState.sorting.player2) {
                AppState.sorting.player2 = new AlgorithmPlayer({
                    speed: AppState.sorting.speedMs,
                    onStep: (step, index, total) => {
                        if (AppState.sorting.renderer2) AppState.sorting.renderer2.render(step);
                        updateRace2Stats(step, index, total);
                    },
                    onStateChange: (isPlaying) => {
                        // Synced with master button
                    },
                    onComplete: () => {
                        checkRaceFinish();
                    }
                });
            }
            AppState.sorting.player2.loadSteps(steps2, false);
            const raceBanner = document.getElementById('race-status-banner');
            if (raceBanner) raceBanner.classList.add('d-none');
        }

        // Update timeline scrub max
        const scrubber = document.getElementById('sorting-scrubber');
        if (scrubber) {
            scrubber.max = steps.length - 1;
            scrubber.value = 0;
        }
    }

    function updateSortingStats(step, index, total) {
        const compEl = document.getElementById('sorting-counter-comps');
        const swapEl = document.getElementById('sorting-counter-swaps');
        const stepEl = document.getElementById('sorting-counter-steps');
        const scrubber = document.getElementById('sorting-scrubber');

        if (compEl && step.counters) compEl.textContent = step.counters.comparisons;
        if (swapEl && step.counters) swapEl.textContent = step.counters.swaps;
        if (stepEl) stepEl.textContent = `${index + 1} / ${total}`;
        if (scrubber && !scrubber.matches(':active')) scrubber.value = index;
    }

    function updateRace2Stats(step, index, total) {
        const compEl = document.getElementById('race2-counter-comps');
        const swapEl = document.getElementById('race2-counter-swaps');
        const stepEl = document.getElementById('race2-counter-steps');

        if (compEl && step.counters) compEl.textContent = step.counters.comparisons;
        if (swapEl && step.counters) swapEl.textContent = step.counters.swaps;
        if (stepEl) stepEl.textContent = `${index + 1} / ${total}`;
    }

    function checkRaceFinish() {
        if (!AppState.sorting.isRaceMode) return;
        const p1 = AppState.sorting.player;
        const p2 = AppState.sorting.player2;
        if (!p1 || !p2) return;

        const p1Done = p1.currentStepIndex >= p1.steps.length - 1;
        const p2Done = p2.currentStepIndex >= p2.steps.length - 1;

        if (p1Done || p2Done) {
            const banner = document.getElementById('race-status-banner');
            if (banner) {
                banner.classList.remove('d-none');
                const info1 = window.AlgoLib.Sorting.registry[AppState.sorting.algo];
                const info2 = window.AlgoLib.Sorting.registry[AppState.sorting.raceAlgo2];

                if (p1Done && !p2Done) {
                    banner.innerHTML = `<i class="bi bi-trophy-fill text-gold me-2"></i> <strong>${info1.name}</strong> finished first in ${p1.steps.length} steps! (${info2.name} still working: ${p2.currentStepIndex + 1}/${p2.steps.length})`;
                } else if (p2Done && !p1Done) {
                    banner.innerHTML = `<i class="bi bi-trophy-fill text-gold me-2"></i> <strong>${info2.name}</strong> finished first in ${p2.steps.length} steps! (${info1.name} still working: ${p1.currentStepIndex + 1}/${p1.steps.length})`;
                } else {
                    banner.innerHTML = `<i class="bi bi-flag-fill text-gold me-2"></i> Both algorithms completed! <strong>${info1.name}</strong>: ${p1.steps.length} steps vs <strong>${info2.name}</strong>: ${p2.steps.length} steps.`;
                }
            }
        }
    }

    function updateSortingInfoPanel() {
        const info = window.AlgoLib.Sorting.registry[AppState.sorting.algo];
        if (!info) return;

        const nameEl = document.getElementById('sorting-title');
        const descEl = document.getElementById('sorting-desc');
        const bestEl = document.getElementById('complexity-best');
        const avgEl = document.getElementById('complexity-avg');
        const worstEl = document.getElementById('complexity-worst');
        const spaceEl = document.getElementById('complexity-space');
        const stableEl = document.getElementById('complexity-stable');
        const vivaEl = document.getElementById('sorting-viva-tip');

        if (nameEl) nameEl.textContent = info.name;
        if (descEl) descEl.textContent = info.description;
        if (bestEl) bestEl.textContent = info.bestTime;
        if (avgEl) avgEl.textContent = info.avgTime;
        if (worstEl) worstEl.textContent = info.worstTime;
        if (spaceEl) spaceEl.textContent = info.space;
        if (stableEl) stableEl.textContent = info.stable;
        if (vivaEl) vivaEl.textContent = info.vivaTip;

        renderPseudocode('sorting-code-list', info.pseudocode);
    }

    // ========================================================================
    // 6. SEARCHING VISUALIZER LOGIC
    // ========================================================================
    function initSearchingVisualizer() {
        const container = document.getElementById('searching-canvas');
        if (!container) return;

        if (!AppState.searching.renderer) {
            AppState.searching.renderer = new ArrayRenderer(container, {
                theme: AppState.barStyle,
                showValues: true
            });
        }

        if (AppState.searching.array.length === 0) {
            resetSearchingArray();
        } else {
            loadSearchingSteps();
        }

        updateSearchingInfoPanel();
    }

    function resetSearchingArray() {
        const sizeInput = document.getElementById('searching-size-slider');
        const size = sizeInput ? parseInt(sizeInput.value, 10) : AppState.searching.size;
        AppState.searching.size = size;

        let arr = generateArray('random', size, 10, 95);
        if (AppState.searching.algo === 'binary') {
            arr.sort((a, b) => a - b);
        }
        AppState.searching.array = arr;

        // Choose random target from array or nearby
        if (Math.random() < 0.8) {
            AppState.searching.target = arr[Math.floor(Math.random() * arr.length)];
        } else {
            AppState.searching.target = Math.floor(Math.random() * 90) + 10;
        }

        const targetInput = document.getElementById('searching-target-input');
        if (targetInput) targetInput.value = AppState.searching.target;

        loadSearchingSteps();
    }

    function loadSearchingSteps() {
        const targetInput = document.getElementById('searching-target-input');
        if (targetInput && targetInput.value !== '') {
            AppState.searching.target = parseInt(targetInput.value, 10) || AppState.searching.target;
        }

        const algoKey = AppState.searching.algo;
        const steps = window.AlgoLib.Searching.getSteps(
            algoKey,
            AppState.searching.array,
            AppState.searching.target
        );

        if (!AppState.searching.player) {
            AppState.searching.player = new AlgorithmPlayer({
                speed: AppState.searching.speedMs,
                onStep: (step, index, total) => {
                    if (AppState.searching.renderer) AppState.searching.renderer.render(step);
                    updateSearchingStats(step, index, total);
                    highlightPseudocode('searching-code-list', step.codeLine);
                    updateNarrative('searching-narrative', step.description);
                },
                onStateChange: (isPlaying) => {
                    updatePlayButton('searching-play-btn', isPlaying);
                }
            });
        }

        AppState.searching.player.loadSteps(steps, false);

        const scrubber = document.getElementById('searching-scrubber');
        if (scrubber) {
            scrubber.max = steps.length - 1;
            scrubber.value = 0;
        }
    }

    function updateSearchingStats(step, index, total) {
        const compEl = document.getElementById('searching-counter-comps');
        const statusEl = document.getElementById('searching-counter-status');
        const stepEl = document.getElementById('searching-counter-steps');
        const scrubber = document.getElementById('searching-scrubber');

        if (compEl && step.counters) compEl.textContent = step.counters.comparisons;
        if (statusEl) {
            if (step.type === 'found') {
                statusEl.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Found!</span>';
            } else if (step.type === 'not_found') {
                statusEl.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Not Found</span>';
            } else {
                statusEl.innerHTML = '<span class="text-primary"><i class="bi bi-search"></i> Searching...</span>';
            }
        }
        if (stepEl) stepEl.textContent = `${index + 1} / ${total}`;
        if (scrubber && !scrubber.matches(':active')) scrubber.value = index;
    }

    function updateSearchingInfoPanel() {
        const info = window.AlgoLib.Searching.registry[AppState.searching.algo];
        if (!info) return;

        const nameEl = document.getElementById('searching-title');
        const descEl = document.getElementById('searching-desc');
        const bestEl = document.getElementById('searching-complexity-best');
        const avgEl = document.getElementById('searching-complexity-avg');
        const worstEl = document.getElementById('searching-complexity-worst');
        const spaceEl = document.getElementById('searching-complexity-space');
        const vivaEl = document.getElementById('searching-viva-tip');

        if (nameEl) nameEl.textContent = info.name;
        if (descEl) descEl.textContent = info.description;
        if (bestEl) bestEl.textContent = info.bestTime;
        if (avgEl) avgEl.textContent = info.avgTime;
        if (worstEl) worstEl.textContent = info.worstTime;
        if (spaceEl) spaceEl.textContent = info.space;
        if (vivaEl) vivaEl.textContent = info.vivaTip;

        renderPseudocode('searching-code-list', info.pseudocode);
    }

    // ========================================================================
    // 7. PATHFINDING VISUALIZER LOGIC
    // ========================================================================
    function initPathfindingVisualizer() {
        const container = document.getElementById('grid-canvas');
        if (!container) return;

        if (!AppState.pathfinding.grid) {
            AppState.pathfinding.grid = new PathfindingGrid(container, {
                rows: 18,
                cols: 35,
                onMetricsUpdate: (metrics) => {
                    const visitedEl = document.getElementById('path-counter-visited');
                    const lengthEl = document.getElementById('path-counter-length');
                    const timeEl = document.getElementById('path-counter-time');

                    if (visitedEl) visitedEl.textContent = metrics.visited;
                    if (lengthEl) lengthEl.textContent = metrics.length;
                    if (timeEl) timeEl.textContent = `${metrics.time} ms`;
                }
            });
        }

        updatePathfindingInfoPanel();
    }

    function updatePathfindingInfoPanel() {
        const info = window.AlgoLib.Pathfinding.registry[AppState.pathfinding.algo];
        if (!info) return;

        const nameEl = document.getElementById('pathfinding-title');
        const descEl = document.getElementById('pathfinding-desc');
        const timeEl = document.getElementById('path-complexity-time');
        const spaceEl = document.getElementById('path-complexity-space');
        const shortestEl = document.getElementById('path-complexity-shortest');
        const vivaEl = document.getElementById('pathfinding-viva-tip');

        if (nameEl) nameEl.textContent = info.name;
        if (descEl) descEl.textContent = info.description;
        if (timeEl) timeEl.textContent = info.worstTime;
        if (spaceEl) spaceEl.textContent = info.space;
        if (shortestEl) shortestEl.textContent = info.guaranteesShortest;
        if (vivaEl) vivaEl.textContent = info.vivaTip;

        renderPseudocode('pathfinding-code-list', info.pseudocode);
    }

    // ========================================================================
    // 8. COMPARE MATRIX TABLE
    // ========================================================================
    function renderCompareTable(categoryFilter = 'all', searchQuery = '') {
        const tbody = document.getElementById('compare-table-body');
        if (!tbody) return;

        const allAlgos = [
            // Sorting
            ...Object.entries(window.AlgoLib.Sorting.registry).map(([key, item]) => ({ ...item, key, type: 'sorting' })),
            // Searching
            ...Object.entries(window.AlgoLib.Searching.registry).map(([key, item]) => ({ ...item, key, type: 'searching' })),
            // Pathfinding
            ...Object.entries(window.AlgoLib.Pathfinding.registry).map(([key, item]) => ({ ...item, key, type: 'pathfinding' }))
        ];

        const query = searchQuery.trim().toLowerCase();
        const filtered = allAlgos.filter(algo => {
            const matchesCat = categoryFilter === 'all' || algo.type === categoryFilter;
            const matchesSearch = query === '' || 
                algo.name.toLowerCase().includes(query) ||
                algo.description.toLowerCase().includes(query) ||
                algo.paradigm.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No algorithms match your search criteria.</td></tr>`;
            return;
        }

        filtered.forEach(algo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-bold">${algo.name}</div>
                    <small class="text-muted">${algo.paradigm}</small>
                </td>
                <td><span class="badge badge-cat-${algo.type}">${algo.category}</span></td>
                <td><code class="text-gold">${algo.bestTime || 'N/A'}</code></td>
                <td><code>${algo.avgTime || 'N/A'}</code></td>
                <td><code>${algo.worstTime || 'N/A'}</code></td>
                <td><code>${algo.space || 'O(1)'}</code></td>
                <td>${algo.stable ? (algo.stable === 'Yes' ? '<span class="badge bg-success-subtle text-success">Yes</span>' : '<span class="badge bg-secondary-subtle text-secondary">No</span>') : (algo.guaranteesShortest ? '<span class="badge bg-info-subtle text-info">Optimal</span>' : 'N/A')}</td>
                <td><small class="text-muted d-block" style="max-width: 260px;">${algo.vivaTip}</small></td>
                <td>
                    <button class="btn btn-sm btn-outline-gold action-viz-btn" data-type="${algo.type}" data-key="${algo.key}">
                        <i class="bi bi-play-circle me-1"></i> Visualize
                    </button>
                </td>
            `;

            tr.querySelector('.action-viz-btn').addEventListener('click', () => {
                navigateTo(algo.type, algo.key);
            });

            tbody.appendChild(tr);
        });
    }

    // ========================================================================
    // 9. INTERACTIVE DSA QUIZ
    // ========================================================================
    function initQuiz() {
        AppState.quiz.currentIndex = 0;
        AppState.quiz.score = 0;
        AppState.quiz.answered = false;
        AppState.quiz.selectedOption = null;

        const resultsCard = document.getElementById('quiz-results-card');
        const questionCard = document.getElementById('quiz-question-card');
        if (resultsCard) resultsCard.classList.add('d-none');
        if (questionCard) questionCard.classList.remove('d-none');

        renderCurrentQuestion();
    }

    function renderCurrentQuestion() {
        const questions = window.AlgoLib.QuizData;
        const qIndex = AppState.quiz.currentIndex;
        if (qIndex >= questions.length) {
            showQuizResults();
            return;
        }

        const q = questions[qIndex];
        AppState.quiz.answered = false;
        AppState.quiz.selectedOption = null;

        // Progress bar
        const progressEl = document.getElementById('quiz-progress-bar');
        const trackerEl = document.getElementById('quiz-question-tracker');
        const scoreTracker = document.getElementById('quiz-score-tracker');

        const pct = Math.round((qIndex / questions.length) * 100);
        if (progressEl) progressEl.style.width = `${pct}%`;
        if (trackerEl) trackerEl.textContent = `Question ${qIndex + 1} of ${questions.length}`;
        if (scoreTracker) scoreTracker.textContent = `Score: ${AppState.quiz.score}`;

        // Question Details
        const catBadge = document.getElementById('quiz-category-badge');
        const questionText = document.getElementById('quiz-question-text');
        const optionsContainer = document.getElementById('quiz-options-container');
        const explanationBox = document.getElementById('quiz-explanation-box');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (catBadge) catBadge.textContent = q.category;
        if (questionText) questionText.textContent = q.question;
        if (explanationBox) explanationBox.classList.add('d-none');
        if (nextBtn) nextBtn.classList.add('d-none');

        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            q.options.forEach((optText, idx) => {
                const optBtn = document.createElement('button');
                optBtn.className = 'quiz-option-btn list-group-item list-group-item-action';
                optBtn.setAttribute('data-idx', idx);
                optBtn.innerHTML = `
                    <span class="quiz-option-letter me-3">${String.fromCharCode(65 + idx)}</span>
                    <span class="quiz-option-text">${optText}</span>
                `;

                optBtn.addEventListener('click', () => handleOptionSelect(idx));
                optionsContainer.appendChild(optBtn);
            });
        }
    }

    function handleOptionSelect(selectedIdx) {
        if (AppState.quiz.answered) return;
        AppState.quiz.answered = true;
        AppState.quiz.selectedOption = selectedIdx;

        const q = window.AlgoLib.QuizData[AppState.quiz.currentIndex];
        const isCorrect = selectedIdx === q.correctIndex;
        if (isCorrect) AppState.quiz.score++;

        // Update option button styles
        const optionBtns = document.querySelectorAll('.quiz-option-btn');
        optionBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === q.correctIndex) {
                btn.classList.add('option-correct');
            } else if (idx === selectedIdx) {
                btn.classList.add('option-incorrect');
            }
        });

        // Show Explanation
        const explanationBox = document.getElementById('quiz-explanation-box');
        const explanationText = document.getElementById('quiz-explanation-text');
        const explanationVerdict = document.getElementById('quiz-verdict-tag');

        if (explanationBox && explanationText && explanationVerdict) {
            explanationBox.classList.remove('d-none');
            if (isCorrect) {
                explanationVerdict.className = 'badge bg-success me-2';
                explanationVerdict.innerHTML = '<i class="bi bi-check-circle-fill"></i> Correct!';
                if (window.soundSynth) window.soundSynth.playTone(80, 0, 100, 'sorted');
            } else {
                explanationVerdict.className = 'badge bg-danger me-2';
                explanationVerdict.innerHTML = '<i class="bi bi-x-circle-fill"></i> Incorrect';
                if (window.soundSynth) window.soundSynth.playTone(20, 0, 100, 'swap');
            }
            explanationText.textContent = q.explanation;
        }

        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) nextBtn.classList.remove('d-none');

        const scoreTracker = document.getElementById('quiz-score-tracker');
        if (scoreTracker) scoreTracker.textContent = `Score: ${AppState.quiz.score}`;
    }

    function showQuizResults() {
        const questions = window.AlgoLib.QuizData;
        const total = questions.length;
        const score = AppState.quiz.score;
        const pct = Math.round((score / total) * 100);

        const questionCard = document.getElementById('quiz-question-card');
        const resultsCard = document.getElementById('quiz-results-card');
        if (questionCard) questionCard.classList.add('d-none');
        if (resultsCard) resultsCard.classList.remove('d-none');

        const finalScoreEl = document.getElementById('quiz-final-score');
        const titleEl = document.getElementById('quiz-rank-title');
        const descEl = document.getElementById('quiz-rank-desc');

        if (finalScoreEl) finalScoreEl.textContent = `${score} / ${total} (${pct}%)`;

        let rankTitle = "Apprentice Scholar";
        let rankDesc = "Solid foundation! Review the complexity tables and step-by-step traces to master subtle edge cases.";
        if (pct >= 90) {
            rankTitle = "Grand Archivist of Algorithms 🏆";
            rankDesc = "Exceptional mastery! You understand algorithmic invariants, worst-case degradations, and graph optimalities thoroughly.";
        } else if (pct >= 70) {
            rankTitle = "Senior Algorithm Fellow";
            rankDesc = "Great performance! You possess a clear understanding of core DSA paradigms and search behaviors.";
        }

        if (titleEl) titleEl.textContent = rankTitle;
        if (descEl) descEl.textContent = rankDesc;
    }

    // ========================================================================
    // 10. HOME HERO LIVE MINI-VISUALIZER
    // ========================================================================
    function initHeroMiniVisualizer() {
        const heroContainer = document.getElementById('hero-mini-canvas');
        if (!heroContainer) return;

        if (!AppState.hero.renderer) {
            AppState.hero.renderer = new ArrayRenderer(heroContainer, {
                theme: AppState.barStyle,
                showValues: true
            });
        }

        const miniArray = [68, 24, 85, 42, 16, 95, 33, 72, 12, 53, 90, 38];
        const steps = window.AlgoLib.Sorting.recordBubbleSort(miniArray);

        if (!AppState.hero.player) {
            AppState.hero.player = new AlgorithmPlayer({
                speed: 120,
                enableSound: false, // Hero animation is purely visual / silent
                onStep: (step) => {
                    if (AppState.hero.renderer) AppState.hero.renderer.render(step);
                },
                onComplete: () => {
                    // Loop hero animation calmly after a pause
                    setTimeout(() => {
                        if (AppState.currentSection === 'home' && AppState.hero.player) {
                            AppState.hero.player.reset();
                            AppState.hero.player.play();
                        }
                    }, 2400);
                }
            });
        }

        AppState.hero.player.loadSteps(steps, true);
    }

    // ========================================================================
    // 11. UI HELPER UTILITIES
    // ========================================================================
    function renderPseudocode(containerId, lines) {
        const list = document.getElementById(containerId);
        if (!list || !lines) return;
        list.innerHTML = '';
        lines.forEach((lineText, idx) => {
            const li = document.createElement('li');
            li.id = `${containerId}-line-${idx + 1}`;
            li.textContent = lineText;
            list.appendChild(li);
        });
    }

    function highlightPseudocode(containerId, activeLine) {
        const list = document.getElementById(containerId);
        if (!list) return;
        list.querySelectorAll('li').forEach(li => li.classList.remove('active-code-line'));
        if (activeLine) {
            const targetLi = document.getElementById(`${containerId}-line-${activeLine}`);
            if (targetLi) {
                targetLi.classList.add('active-code-line');
            }
        }
    }

    function updateNarrative(containerId, text) {
        const el = document.getElementById(containerId);
        if (el && text) {
            el.textContent = text;
        }
    }

    function updatePlayButton(btnId, isPlaying) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.innerHTML = isPlaying 
                ? '<i class="bi bi-pause-fill"></i> Pause' 
                : '<i class="bi bi-play-fill"></i> Play';
            btn.setAttribute('aria-label', isPlaying ? 'Pause visualization' : 'Play visualization');
        }
    }

    // ========================================================================
    // 12. EVENT LISTENERS & DOM HOOKS
    // ========================================================================

    // Navigation Links
    document.querySelectorAll('.spa-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            if (target) navigateTo(target);
        });
    });

    // Theme & Audio Toggles
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const barStyleBtn = document.getElementById('bar-style-toggle-btn');
    if (barStyleBtn) barStyleBtn.addEventListener('click', toggleBarStyle);

    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (window.soundSynth) {
                window.soundSynth.toggleMute();
                updateAudioIcon();
            }
        });
    }

    // ------------------------------------------------------------------------
    // Sorting Visualizer Controls
    // ------------------------------------------------------------------------
    const sortAlgoSelect = document.getElementById('sorting-algo-select');
    if (sortAlgoSelect) {
        sortAlgoSelect.addEventListener('change', (e) => {
            AppState.sorting.algo = e.target.value;
            loadSortingSteps();
            updateSortingInfoPanel();
        });
    }

    const sortPlayBtn = document.getElementById('sorting-play-btn');
    if (sortPlayBtn) {
        sortPlayBtn.addEventListener('click', () => {
            if (AppState.sorting.player) AppState.sorting.player.togglePlayPause();
        });
    }

    const sortNextBtn = document.getElementById('sorting-next-btn');
    if (sortNextBtn) {
        sortNextBtn.addEventListener('click', () => {
            if (AppState.sorting.player) AppState.sorting.player.nextStep(true);
            if (AppState.sorting.isRaceMode && AppState.sorting.player2) {
                AppState.sorting.player2.nextStep(true);
            }
        });
    }

    const sortPrevBtn = document.getElementById('sorting-prev-btn');
    if (sortPrevBtn) {
        sortPrevBtn.addEventListener('click', () => {
            if (AppState.sorting.player) AppState.sorting.player.prevStep();
            if (AppState.sorting.isRaceMode && AppState.sorting.player2) {
                AppState.sorting.player2.prevStep();
            }
        });
    }

    const sortResetBtn = document.getElementById('sorting-reset-btn');
    if (sortResetBtn) {
        sortResetBtn.addEventListener('click', () => {
            if (AppState.sorting.player) AppState.sorting.player.reset();
            if (AppState.sorting.isRaceMode && AppState.sorting.player2) {
                AppState.sorting.player2.reset();
            }
        });
    }

    const sortScrubber = document.getElementById('sorting-scrubber');
    if (sortScrubber) {
        sortScrubber.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (AppState.sorting.player) AppState.sorting.player.seek(val);
        });
    }

    const sortSpeedSlider = document.getElementById('sorting-speed-slider');
    if (sortSpeedSlider) {
        sortSpeedSlider.addEventListener('input', (e) => {
            // Slider value 1 (slow, 350ms) to 100 (fast, 8ms)
            const val = parseInt(e.target.value, 10);
            const ms = Math.max(8, Math.round(350 - (val / 100) * 330));
            AppState.sorting.speedMs = ms;
            if (AppState.sorting.player) AppState.sorting.player.setSpeed(ms);
            if (AppState.sorting.player2) AppState.sorting.player2.setSpeed(ms);
        });
    }

    const sortSizeSlider = document.getElementById('sorting-size-slider');
    if (sortSizeSlider) {
        sortSizeSlider.addEventListener('change', () => {
            resetSortingArray('random');
        });
    }

    // Array Generation Preset Buttons
    document.querySelectorAll('.btn-array-gen').forEach(btn => {
        btn.addEventListener('click', () => {
            const genType = btn.getAttribute('data-gen');
            resetSortingArray(genType);
        });
    });

    // Custom Input Form
    const customArrayBtn = document.getElementById('custom-array-btn');
    const customArrayInput = document.getElementById('custom-array-input');
    if (customArrayBtn && customArrayInput) {
        customArrayBtn.addEventListener('click', () => {
            const raw = customArrayInput.value.trim();
            if (!raw) return;
            const parsed = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && n > 0 && n <= 100);
            if (parsed.length >= 4) {
                AppState.sorting.array = parsed;
                AppState.sorting.size = parsed.length;
                loadSortingSteps();
            } else {
                alert('Please enter at least 4 comma-separated numbers between 1 and 100.');
            }
        });
    }

    // Race Mode Toggle
    const raceModeToggle = document.getElementById('race-mode-toggle');
    const raceContainer = document.getElementById('sorting-race-container');
    const raceSelect = document.getElementById('race-algo2-select');

    if (raceModeToggle && raceContainer) {
        raceModeToggle.addEventListener('change', (e) => {
            AppState.sorting.isRaceMode = e.target.checked;
            if (AppState.sorting.isRaceMode) {
                raceContainer.classList.remove('d-none');
                loadSortingSteps();
            } else {
                raceContainer.classList.add('d-none');
                if (AppState.sorting.player2) AppState.sorting.player2.pause();
                const banner = document.getElementById('race-status-banner');
                if (banner) banner.classList.add('d-none');
            }
        });
    }

    if (raceSelect) {
        raceSelect.addEventListener('change', (e) => {
            AppState.sorting.raceAlgo2 = e.target.value;
            loadSortingSteps();
        });
    }

    // ------------------------------------------------------------------------
    // Searching Visualizer Controls
    // ------------------------------------------------------------------------
    const searchAlgoSelect = document.getElementById('searching-algo-select');
    if (searchAlgoSelect) {
        searchAlgoSelect.addEventListener('change', (e) => {
            AppState.searching.algo = e.target.value;
            if (AppState.searching.algo === 'binary') {
                AppState.searching.array.sort((a, b) => a - b);
            }
            loadSearchingSteps();
            updateSearchingInfoPanel();
        });
    }

    const searchPlayBtn = document.getElementById('searching-play-btn');
    if (searchPlayBtn) {
        searchPlayBtn.addEventListener('click', () => {
            if (AppState.searching.player) AppState.searching.player.togglePlayPause();
        });
    }

    const searchNextBtn = document.getElementById('searching-next-btn');
    if (searchNextBtn) {
        searchNextBtn.addEventListener('click', () => {
            if (AppState.searching.player) AppState.searching.player.nextStep(true);
        });
    }

    const searchPrevBtn = document.getElementById('searching-prev-btn');
    if (searchPrevBtn) {
        searchPrevBtn.addEventListener('click', () => {
            if (AppState.searching.player) AppState.searching.player.prevStep();
        });
    }

    const searchResetBtn = document.getElementById('searching-reset-btn');
    if (searchResetBtn) {
        searchResetBtn.addEventListener('click', () => {
            if (AppState.searching.player) AppState.searching.player.reset();
        });
    }

    const searchNewArrayBtn = document.getElementById('searching-new-array-btn');
    if (searchNewArrayBtn) {
        searchNewArrayBtn.addEventListener('click', () => {
            resetSearchingArray();
        });
    }

    const searchTargetInput = document.getElementById('searching-target-input');
    if (searchTargetInput) {
        searchTargetInput.addEventListener('change', () => {
            loadSearchingSteps();
        });
    }

    const searchSpeedSlider = document.getElementById('searching-speed-slider');
    if (searchSpeedSlider) {
        searchSpeedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            const ms = Math.max(40, Math.round(600 - (val / 100) * 550));
            AppState.searching.speedMs = ms;
            if (AppState.searching.player) AppState.searching.player.setSpeed(ms);
        });
    }

    const searchScrubber = document.getElementById('searching-scrubber');
    if (searchScrubber) {
        searchScrubber.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (AppState.searching.player) AppState.searching.player.seek(val);
        });
    }

    // ------------------------------------------------------------------------
    // Pathfinding Visualizer Controls
    // ------------------------------------------------------------------------
    const pathAlgoSelect = document.getElementById('pathfinding-algo-select');
    if (pathAlgoSelect) {
        pathAlgoSelect.addEventListener('change', (e) => {
            AppState.pathfinding.algo = e.target.value;
            updatePathfindingInfoPanel();
            if (AppState.pathfinding.grid) AppState.pathfinding.grid.clearPath();
        });
    }

    const pathStartBtn = document.getElementById('pathfinding-start-btn');
    if (pathStartBtn) {
        pathStartBtn.addEventListener('click', () => {
            if (AppState.pathfinding.grid) {
                AppState.pathfinding.grid.visualize(AppState.pathfinding.algo, AppState.pathfinding.speedMs);
            }
        });
    }

    const pathClearPathBtn = document.getElementById('pathfinding-clear-path-btn');
    if (pathClearPathBtn) {
        pathClearPathBtn.addEventListener('click', () => {
            if (AppState.pathfinding.grid) AppState.pathfinding.grid.clearPath();
        });
    }

    const pathClearWallsBtn = document.getElementById('pathfinding-clear-walls-btn');
    if (pathClearWallsBtn) {
        pathClearWallsBtn.addEventListener('click', () => {
            if (AppState.pathfinding.grid) AppState.pathfinding.grid.clearWalls();
        });
    }

    const pathMazeBtn = document.getElementById('pathfinding-maze-btn');
    if (pathMazeBtn) {
        pathMazeBtn.addEventListener('click', () => {
            if (AppState.pathfinding.grid) AppState.pathfinding.grid.generateRandomMaze();
        });
    }

    const pathSpeedSlider = document.getElementById('pathfinding-speed-slider');
    if (pathSpeedSlider) {
        pathSpeedSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            AppState.pathfinding.speedMs = Math.max(5, Math.round(50 - (val / 100) * 45));
        });
    }

    // ------------------------------------------------------------------------
    // Compare Matrix Filters
    // ------------------------------------------------------------------------
    const compareSearch = document.getElementById('compare-search-input');
    let currentCompareCat = 'all';

    if (compareSearch) {
        compareSearch.addEventListener('input', (e) => {
            renderCompareTable(currentCompareCat, e.target.value);
        });
    }

    document.querySelectorAll('.compare-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.compare-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCompareCat = btn.getAttribute('data-cat');
            renderCompareTable(currentCompareCat, compareSearch ? compareSearch.value : '');
        });
    });

    // ------------------------------------------------------------------------
    // Quiz Controls
    // ------------------------------------------------------------------------
    const quizNextBtn = document.getElementById('quiz-next-btn');
    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', () => {
            AppState.quiz.currentIndex++;
            renderCurrentQuestion();
        });
    }

    const quizRestartBtn = document.getElementById('quiz-restart-btn');
    if (quizRestartBtn) {
        quizRestartBtn.addEventListener('click', () => {
            initQuiz();
        });
    }

    // ------------------------------------------------------------------------
    // 13. KEYBOARD SHORTCUTS
    // ------------------------------------------------------------------------
    window.addEventListener('keydown', (e) => {
        // Do not intercept keystrokes when typing into input fields
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
            return;
        }

        const sec = AppState.currentSection;

        // Space: Toggle Play/Pause
        if (e.code === 'Space') {
            e.preventDefault();
            if (sec === 'sorting' && AppState.sorting.player) {
                AppState.sorting.player.togglePlayPause();
            } else if (sec === 'searching' && AppState.searching.player) {
                AppState.searching.player.togglePlayPause();
            } else if (sec === 'pathfinding' && AppState.pathfinding.grid) {
                AppState.pathfinding.grid.visualize(AppState.pathfinding.algo, AppState.pathfinding.speedMs);
            }
        }

        // ArrowRight: Step Forward
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            if (sec === 'sorting' && AppState.sorting.player) {
                AppState.sorting.player.nextStep(true);
            } else if (sec === 'searching' && AppState.searching.player) {
                AppState.searching.player.nextStep(true);
            }
        }

        // ArrowLeft: Step Backward
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            if (sec === 'sorting' && AppState.sorting.player) {
                AppState.sorting.player.prevStep();
            } else if (sec === 'searching' && AppState.searching.player) {
                AppState.searching.player.prevStep();
            }
        }

        // Key R: Reset
        if (e.code === 'KeyR') {
            e.preventDefault();
            if (sec === 'sorting' && AppState.sorting.player) {
                AppState.sorting.player.reset();
            } else if (sec === 'searching' && AppState.searching.player) {
                AppState.searching.player.reset();
            } else if (sec === 'pathfinding' && AppState.pathfinding.grid) {
                AppState.pathfinding.grid.clearPath();
            }
        }

        // Key M: Toggle Audio Mute
        if (e.code === 'KeyM') {
            e.preventDefault();
            if (window.soundSynth) {
                window.soundSynth.toggleMute();
                updateAudioIcon();
            }
        }
    });

    // ------------------------------------------------------------------------
    // 14. INITIAL BOOTSTRAP
    // ------------------------------------------------------------------------
    applyTheme(AppState.theme);
    applyBarStyle(AppState.barStyle);
    updateAudioIcon();

    // Check URL hash for direct deep-linking
    const initialHash = window.location.hash.replace('#', '');
    const validSections = ['home', 'sorting', 'searching', 'pathfinding', 'compare', 'quiz'];
    if (validSections.includes(initialHash)) {
        navigateTo(initialHash);
    } else {
        navigateTo('home');
    }
});
