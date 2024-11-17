import bfs from "./bfs.js";
import dStar from "./dStar.js";

document.addEventListener("DOMContentLoaded", () => {
    // Variables del DOM necesarias
    const canvas = document.getElementById("grid-canvas");
    const gridSizeInput = document.getElementById("grid-size");
    const startCellBtn = document.getElementById("celdainicio-btn");
    const endCellBtn = document.getElementById("celdafin-btn");
    const obstaculoBtn = document.getElementById("obstaculo-btn");
    const playBtn = document.getElementById("play-btn");
    const stopBtn = document.getElementById("stop-btn");
    const algorithmSelect = document.getElementById("selected-algorithm");

    if (!canvas || !gridSizeInput || !startCellBtn || !endCellBtn || !obstaculoBtn || !playBtn || !stopBtn) {
        console.error("Required elements not found");
        return;
    }

    // Configuración inicial del canvas y modos de celdas
    const ctx = canvas.getContext("2d");
    const CANVAS_SIZE = 670;
    const CELL_MODES = { NONE: "none", OBSTACLE: "obstacle", START: "start", END: "end" };
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Estado inicial del grid y la interacción del usuario
    let cells = [];
    let gridSize = 3;
    let activeMode = CELL_MODES.NONE;
    let isPathFindingActive = false;
    let startCellPosition = null;
    let endCellPosition = null;
    let previousCell = null;
    let isMouseDown = false;
    let currentAlgorithm = bfs; // Default algorithm is BFS

    // Clase que representa una celda en el grid
    class Cell {
        constructor(row, col) {
            this.row = row;
            this.col = col;
            this.type = CELL_MODES.NONE;
        }

        toggleType(newType) {
            if (newType === CELL_MODES.OBSTACLE) {
                this.type = this.type === CELL_MODES.OBSTACLE ? CELL_MODES.NONE : CELL_MODES.OBSTACLE;
            } else {
                this.type = newType;
            }
        }

        get color() {
            return { obstacle: "black", start: "blue", end: "red" }[this.type] || "white";
        }
    }

    class DStarCell extends Cell {
        constructor(row, col) {
            super(row, col);
            this.hCost = 0;  // Heuristic cost (for A* or D*)
            this.gCost = Infinity;  // Cost from the start cell, initially infinity (unreachable)
            this.fCost = Infinity;  // Total cost (f = g + h), initially infinity
            this.parent = null;  // To track the previous cell in the path
        }
    
        // Method to calculate and set the heuristic (e.g., Euclidean or Manhattan)
        calculateHeuristic(endCell) {
            const dx = this.row - endCell.row;
            const dy = this.col - endCell.col;
            return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
            // Or for Manhattan distance: return Math.abs(dx) + Math.abs(dy);
        }
    
        // Method to set the costs (gCost, hCost) and calculate fCost
        setCosts(gCost, endCell) {
            this.gCost = gCost; // Cost from start
            this.hCost = this.calculateHeuristic(endCell); // Heuristic from current cell to end
            this.fCost = this.gCost + this.hCost; // Total cost (f = g + h)
        }
    }
    

    const initializeGrid = () => {
        // Get the selected algorithm from the dropdown
        const selectedAlgorithm = document.getElementById("selected-algorithm").value;
    
        // Decide which cell class to use based on the selected algorithm
        const cellClass = selectedAlgorithm === "d*" ? DStarCell : Cell;
    
        // Generate the grid with the correct cell type
        cells = Array.from({ length: gridSize }, (_, row) =>
            Array.from({ length: gridSize }, (_, col) => new cellClass(row + 1, col + 1))
        ).flat();
    
        startCellPosition = endCellPosition = null;
        drawGrid();
    };

    const drawGrid = () => {
        // Dibuja todas las celdas y líneas de la cuadrícula
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const cellSize = CANVAS_SIZE / gridSize;

        cells.forEach(cell => {
            const x = (cell.col - 1) * cellSize;
            const y = (gridSize - cell.row) * cellSize;
            ctx.fillStyle = cell.color;
            ctx.fillRect(x, y, cellSize, cellSize);
        });

        // Dibuja las líneas de separación entre celdas
        ctx.strokeStyle = "#292929";
        Array.from({ length: gridSize + 1 }).forEach((_, i) => {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, CANVAS_SIZE);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(CANVAS_SIZE, i * cellSize);
            ctx.stroke();
        });
    };

    const setMode = (mode, button) => {
        // Cambia el modo de interacción con el grid
        activeMode = activeMode === mode ? CELL_MODES.NONE : mode;
        [startCellBtn, endCellBtn, obstaculoBtn].forEach(btn => btn.classList.remove("active-mode"));
        if (activeMode === mode) button.classList.add("active-mode");
    };

    const handleAlgorithmChange = () => {
        // Check if start or end positions are set
        if (startCellPosition || endCellPosition) {
            const userConfirmed = confirm("¿Está seguro de que quiere cambiar de algoritmo? Los datos de las celdas se perderán.");
            if (!userConfirmed) {
                // Reset the algorithm selection to the previous one if the user cancels
                algorithmSelect.value = currentAlgorithm.name;
                return;
            }
        }

        // Update the current selected algorithm
        currentAlgorithm = algorithmSelect.value === "d*" ? dStar : bfs;

        // Reinitialize the grid with the correct cells based on the new algorithm
        initializeGrid();
    };

    const handleCellInteraction = (event, previousCell = null) => {
        // Detecta la celda en la que el usuario hace clic y la actualiza según el modo activo
        const rect = canvas.getBoundingClientRect();
        const cellSize = CANVAS_SIZE / gridSize;
        const col = Math.floor((event.clientX - rect.left) / cellSize) + 1;
        const row = gridSize - Math.floor((event.clientY - rect.top) / cellSize);
        const cell = cells.find(c => c.row === row && c.col === col);
    
        if (cell && cell !== previousCell) {
           
            if (activeMode === CELL_MODES.START) {
                // Actualiza la celda de inicio
                if (startCellPosition) {
                    const prevStartCell = cells.find(c => c.row === startCellPosition.row && c.col === startCellPosition.col);
                    if (prevStartCell) prevStartCell.type = CELL_MODES.NONE;
                }
                cell.type = CELL_MODES.START;
                startCellPosition = { row, col };
                drawGrid();
    
            } else if (activeMode === CELL_MODES.END) {
                // Actualiza la celda de fin
                if (endCellPosition) {
                    const prevEndCell = cells.find(c => c.row === endCellPosition.row && c.col === endCellPosition.col);
                    if (prevEndCell) prevEndCell.type = CELL_MODES.NONE;
                }
                cell.type = CELL_MODES.END;
                endCellPosition = { row, col };
                drawGrid();
    
            } else if (activeMode === CELL_MODES.OBSTACLE) {
                // Activa/desactiva el obstáculo si no es celda de inicio o fin
                if (cell.type !== CELL_MODES.START && cell.type !== CELL_MODES.END) {
                    cell.toggleType(CELL_MODES.OBSTACLE);
                    drawGrid();
                }
            }
        }
        return cell;
    };

    gridSizeInput.addEventListener("input", () => {
        // Cambia el tamaño del grid y lo reinicia
        gridSize = Math.max(3, Math.min(70, parseInt(gridSizeInput.value)));
        initializeGrid();
    });

    startCellBtn.addEventListener("click", () => setMode(CELL_MODES.START, startCellBtn));
    endCellBtn.addEventListener("click", () => setMode(CELL_MODES.END, endCellBtn));
    obstaculoBtn.addEventListener("click", () => setMode(CELL_MODES.OBSTACLE, obstaculoBtn));

    playBtn.addEventListener("click", () => {
        // Inicia el proceso de pathfinding
        isPathFindingActive = true;
        [gridSizeInput, startCellBtn, endCellBtn, obstaculoBtn].forEach(btn => btn.disabled = true);
        currentAlgorithm(cells, startCellPosition, endCellPosition, gridSize, paintCell).then(() => {
            isPathFindingActive = false;
            [gridSizeInput, startCellBtn, endCellBtn, obstaculoBtn].forEach(btn => btn.disabled = false);
        });
    });

    stopBtn.addEventListener("click", () => {
        // Detiene el pathfinding y reinicia el grid
        isPathFindingActive = false;
        gridSize = 3;
        gridSizeInput.value = gridSize;
        [gridSizeInput, startCellBtn, endCellBtn, obstaculoBtn].forEach(btn => btn.disabled = false);
        initializeGrid();
    });

    const paintCell = (row, col, color) => {
        // Pinta una celda específica durante el pathfinding
        const cellSize = CANVAS_SIZE / gridSize;
        const x = (col - 1) * cellSize;
        const y = (gridSize - row) * cellSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = "#292929";
        ctx.strokeRect(x, y, cellSize, cellSize);
    };

    algorithmSelect.addEventListener("change", handleAlgorithmChange);

    canvas.addEventListener("mousedown", (event) => {
        isMouseDown = true;
        previousCell = handleCellInteraction(event, previousCell);
    });

    canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
        previousCell = null;
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isMouseDown && activeMode === CELL_MODES.OBSTACLE) {
            previousCell = handleCellInteraction(event, previousCell);
        }
    });

    initializeGrid();
});



