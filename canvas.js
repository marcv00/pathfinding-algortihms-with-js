import bfs from "./bfs.js";

document.addEventListener("DOMContentLoaded", () => {
    // Variables del DOM necesarias
    const canvas = document.getElementById("grid-canvas");
    const gridSizeInput = document.getElementById("grid-size");
    const startCellBtn = document.getElementById("celdainicio-btn");
    const endCellBtn = document.getElementById("celdafin-btn");
    const obstaculoBtn = document.getElementById("obstaculo-btn");
    const playBtn = document.getElementById("play-btn");
    const stopBtn = document.getElementById("stop-btn");

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

    const initializeGrid = () => {
        // Genera y limpia el grid
        cells = Array.from({ length: gridSize }, (_, row) =>
            Array.from({ length: gridSize }, (_, col) => new Cell(row + 1, col + 1))
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
        bfs(cells, startCellPosition, endCellPosition, gridSize, paintCell).then(() => {
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


