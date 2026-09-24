# Algorithm Library

A small front-end project for visualizing common data structures and algorithms in a clean, interactive browser UI. The app includes sorting, searching, and pathfinding visualizers, plus a quick DSA quiz and comparison table.

## Overview

This project is built with plain HTML, CSS, and JavaScript, using Bootstrap for layout and styling. It is a static website with no backend or package install required.

The app is designed to help students understand how algorithms behave step by step by showing:

- current comparisons and swaps
- highlighted active indices
- pseudocode or explanation panels
- a timeline-style replay/player flow
- theme and audio controls

## Features

### Sorting visualizer
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Optional side-by-side race mode for comparing two algorithms

### Searching visualizer
- Linear Search
- Binary Search
- Pointer tracking for low/mid/high values

### Pathfinding visualizer
- BFS
- DFS
- Dijkstra
- A*
- Draw walls, move start and target nodes, and generate random mazes

### Additional tools
- Comparison matrix for algorithm complexity
- Viva-style quiz with feedback
- Dark/light theme toggle
- Audio mute toggle
- Library/book-style bar rendering option

## Tech stack

- HTML5
- CSS3
- JavaScript (vanilla)
- Bootstrap 5
- Web Audio API

## Project structure

```text
DsaProject/
├── index.html
├── style.css
├── script.js
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── audio.js
│   ├── grid.js
│   ├── player.js
│   ├── quiz-data.js
│   ├── renderer.js
│   └── algorithms/
│       ├── pathfinding.js
│       ├── searching.js
│       └── sorting.js
└── .gitignore
```

## How to run

### Option 1: Open directly in a browser
Simply open `index.html` in your browser.

### Option 2: Run a local web server
From the project folder:

```bash
cd DsaProject
python -m http.server 3000
```

Then open:

```text
http://localhost:3000
```

## Notes

- This is a client-side app; no build step is required.
- Assets are loaded from the same project folder, so the app works as a static website.
- The visualizers use recorded algorithm steps, which makes replaying and scrubbing through execution easy.

## Typical use cases

- learning sorting/searching/pathfinding algorithms
- explaining algorithm behavior in class or interviews
- comparing complexity visually
- preparing for DSA viva questions

## License

This project is provided for educational use. If you plan to publish or redistribute it, check whether your local usage requires a project license or attribution.
# Algorithm-Library-dsa-Visualizer
