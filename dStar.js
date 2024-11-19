const dStar = async (cells, startCellPosition, endCellPosition, gridSize, paintCell) => {
    // Descomentar para medir tiempo
    // const startTime = performance.now();
    // console.log(`Execution started at: ${startTime.toFixed(3)} ms`);

    const visited = new Set();
    const openList = [];
    const parentMap = new Map();

    const getCell = (row, col) => {
        if (row < 1 || row > gridSize || col < 1 || col > gridSize) return null;
        const index = (row - 1) * gridSize + (col - 1);
        return cells[index];
    };

    const calculateHeuristic = (cell1, cell2) => {
        const dx = Math.abs(cell1.row - cell2.row);
        const dy = Math.abs(cell1.col - cell2.col);
        return Math.sqrt(dx * dx + dy * dy);
    };

    const startCell = getCell(startCellPosition.row, startCellPosition.col);
    const endCell = getCell(endCellPosition.row, endCellPosition.col);
    if (!startCell || !endCell) return;

    startCell.gCost = 0;
    startCell.hCost = calculateHeuristic(startCell, endCell);
    startCell.fCost = startCell.gCost + startCell.hCost;

    openList.push(startCell);

    while (openList.length > 0) {
        openList.sort((a, b) => a.fCost - b.fCost);
        const currentCell = openList.shift();

        if (currentCell === endCell) {
            const path = await reconstructPath(endCell, startCell, parentMap, paintCell);
            let pathDisrupted = false;
            // Try to animate the path
            pathDisrupted = await animatePath(path, paintCell, startCell);
            
            if (pathDisrupted) {
                alert("Path was disrupted by an obstacle. Finding new path...");
                // Attempt to find a new path and animate again
                return dStar(cells, pathDisrupted, endCellPosition, gridSize, paintCell);
            }
            
            // Descomentar para medir tiempo
            // const endTime = performance.now();
            // console.log(`Execution ended at: ${endTime.toFixed(3)} ms`);
            // console.log(`Total execution time: ${(endTime - startTime).toFixed(3)} ms`);

            return; // Path found and animation complete.
        }

        visited.add(currentCell);

        const neighbors = getNeighbors(currentCell, gridSize, cells);
        for (const neighbor of neighbors) {
            if (visited.has(neighbor) || neighbor.type === "obstacle") continue;

            const tentativeGCost = currentCell.gCost + 1;
            if (!openList.includes(neighbor) || tentativeGCost < neighbor.gCost) {
                neighbor.gCost = tentativeGCost;
                neighbor.hCost = calculateHeuristic(neighbor, endCell);
                neighbor.fCost = neighbor.gCost + neighbor.hCost;
                parentMap.set(neighbor, currentCell);

                if (!openList.includes(neighbor)) openList.push(neighbor);
            }
        }
    }

    alert("No se encontró un camino");
};

// Función para reconstruir el camino desde la celda final hasta la celda inicial
const reconstructPath = async (endCell, startCell, parentMap, paintCell) => {
    const path = [];
    let currentCell = endCell;
    while (currentCell) {
        if (currentCell !== startCell && currentCell !== endCell) {
            paintCell(currentCell.row, currentCell.col, "green");
        }
        path.unshift(currentCell);
        currentCell = parentMap.get(currentCell);
        // Descomentar para medición de tiempo precisa
        await new Promise(resolve => setTimeout(resolve, 50));  // Comentarlo para medición más objetiva
    }
    return path;
};

// Función para animar el recorrido del camino
const animatePath = async (path, paintCell, startCell) => {
    for (let i = 0; i < path.length; i++) {
        const currentCell = path[i];
        const previousCell = path[i - 1];
        
        paintCell(currentCell.row, currentCell.col, "blue");

        if (previousCell) {
            paintCell(previousCell.row, previousCell.col, "white");
            previousCell.type = "none";
            currentCell.type = "start";
        }

        // Check if the next cell is an obstacle
        if (path[i + 1] && path[i + 1].type === "obstacle") {
            return currentCell; // Path is disrupted due to obstacle
        }

        // Descomentar para medición de tiempo precisa
        await new Promise(resolve => setTimeout(resolve, 1000)); // Comentarlo para medición más objetiva
    }

    alert("¡Se llegó al destino!");
    return false; // Path is complete, no disruption.
};

// Función para obtener los vecinos de una celda
const getNeighbors = (cell, gridSize, cells) => {
    const neighbors = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dx, dy] of directions) {
        const newRow = cell.row + dx;
        const newCol = cell.col + dy;
        if (newRow > 0 && newRow <= gridSize && newCol > 0 && newCol <= gridSize) {
            neighbors.push(cells[(newRow - 1) * gridSize + (newCol - 1)]);
        }
    }

    return neighbors;
};

export default dStar;



