/**
 * ============================================================================
 * Algorithm Library - Visualizer Renderer (renderer.js)
 * ============================================================================
 * Renders array states with high visual clarity, supporting:
 *   - Standard Zen Minimalist Bars
 *   - "Books-as-Bars" Library Shelf Theme with spine detailing
 *   - Color-coded states: default, comparing, swapping, sorted, pivot, dimmed
 *   - Numeric values directly on/above bars for WCAG accessibility
 *   - Search pointers (Low, Mid, High, Found)
 */

class ArrayRenderer {
    /**
     * @param {HTMLElement|string} container - DOM container element or selector
     * @param {Object} options - Customization options
     */
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.theme = options.theme || 'minimal'; // 'minimal' or 'books'
        this.showValues = options.showValues !== false;
        this.maxBarHeightPx = options.maxHeight || 340;
    }

    setTheme(theme) {
        this.theme = theme;
    }

    /**
     * Renders a given step onto the container DOM.
     * @param {Object} step - Step record from player
     */
    render(step) {
        if (!this.container || !step || !step.arrayState) return;

        const arr = step.arrayState;
        const n = arr.length;
        const maxVal = Math.max(...arr, 1);
        const activeIndices = new Set(step.indices || []);
        const sortedIndices = new Set(step.sortedIndices || []);
        const eliminatedIndices = new Set(step.eliminated || []);
        const pointers = step.pointers || {};

        // Prepare or verify bar elements
        this.container.classList.add('algo-bars-container');
        if (this.theme === 'books') {
            this.container.classList.add('theme-books');
        } else {
            this.container.classList.remove('theme-books');
        }

        // Fast render by innerHTML or reusing nodes
        const fragment = document.createDocumentFragment();

        arr.forEach((val, idx) => {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'bar-wrapper';

            // Determine bar state class
            let stateClass = 'bar-default';
            if (step.type === 'found' && activeIndices.has(idx)) {
                stateClass = 'bar-found';
            } else if (activeIndices.has(idx)) {
                if (step.type === 'compare') stateClass = 'bar-comparing';
                else if (step.type === 'swap' || step.type === 'write') stateClass = 'bar-swapping';
                else if (step.type === 'pivot') stateClass = 'bar-pivot';
                else stateClass = 'bar-active';
            } else if (sortedIndices.has(idx)) {
                stateClass = 'bar-sorted';
            } else if (eliminatedIndices.has(idx)) {
                stateClass = 'bar-dimmed';
            }

            const heightPercent = Math.max(8, (val / maxVal) * 100);

            // Create Bar
            const bar = document.createElement('div');
            bar.className = `algo-bar ${stateClass}`;
            bar.style.height = `${heightPercent}%`;
            bar.setAttribute('role', 'img');
            bar.setAttribute('aria-label', `Index ${idx}, Value ${val}`);

            // Books Theme Decorative Elements
            if (this.theme === 'books') {
                const spineRibs = document.createElement('div');
                spineRibs.className = 'book-spine-ribs';
                bar.appendChild(spineRibs);
            }

            // Numeric Label (visible and accessible)
            if (this.showValues) {
                const label = document.createElement('span');
                label.className = 'bar-label';
                label.textContent = val;
                // If bar is too short, position label above
                if (heightPercent < 22) {
                    label.classList.add('label-above');
                }
                bar.appendChild(label);
            }

            barWrapper.appendChild(bar);

            // Pointer Indicators for Searching (L, M, H)
            const pointerTags = [];
            if (pointers.low === idx) pointerTags.push({ label: 'L', title: 'Low pointer', cls: 'badge-low' });
            if (pointers.mid === idx) pointerTags.push({ label: 'M', title: 'Mid pointer', cls: 'badge-mid' });
            if (pointers.high === idx) pointerTags.push({ label: 'H', title: 'High pointer', cls: 'badge-high' });
            if (pointers.found === idx) pointerTags.push({ label: '✓', title: 'Found target', cls: 'badge-found' });
            if (pointers.current === idx) pointerTags.push({ label: '↑', title: 'Current scan', cls: 'badge-curr' });

            if (pointerTags.length > 0) {
                const tagContainer = document.createElement('div');
                tagContainer.className = 'bar-pointer-tags';
                pointerTags.forEach(p => {
                    const tag = document.createElement('span');
                    tag.className = `pointer-tag ${p.cls}`;
                    tag.textContent = p.label;
                    tag.title = p.title;
                    tagContainer.appendChild(tag);
                });
                barWrapper.appendChild(tagContainer);
            } else {
                // Empty spacer to align bars nicely
                const spacer = document.createElement('div');
                spacer.className = 'bar-pointer-spacer';
                spacer.textContent = n <= 30 ? `${idx}` : '';
                barWrapper.appendChild(spacer);
            }

            fragment.appendChild(barWrapper);
        });

        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }
}

window.ArrayRenderer = ArrayRenderer;
