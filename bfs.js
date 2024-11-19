const bfs = async (cells, startCellPosition, endCellPosition, gridSize, paintCell) => {
    // // Start timing
    // // Descomentar para medir tiempo de ejecucion, comentar setTimeouts de visualizacion
    // const startTime = performance.now();
    // console.log(`Execution started at: ${startTime.toFixed(3)} ms`);

    // Mapa para llevar un registro de las celdas visitadas
    const visited = new Set();
    const queue = [];
    const parentMap = new Map(); // Para hacer backtracking del camino

    // Función para obtener una celda desde las posiciones (fila, columna)
    const getCell = (row, col) => {
        if (row < 1 || row > gridSize || col < 1 || col > gridSize) return null;
        const index = (row - 1) * gridSize + (col - 1);
        return cells[index];
    };

    const startCell = getCell(startCellPosition.row, startCellPosition.col);
    const endCell = getCell(endCellPosition.row, endCellPosition.col);
    if (!startCell || !endCell) return;

    queue.push(startCell);
    visited.add(startCell);
    paintCell(startCell.row, startCell.col, "blue");

    const neighborsOffsets = [
        [-1,  0], [1,  0], [0, -1], [0,  1],
        [-1, -1], [-1,  1], [1, -1], [1,  1]
    ];

    while (queue.length > 0) {
        const currentCell = queue.shift();
        if (currentCell.row === endCellPosition.row && currentCell.col === endCellPosition.col) {
            await backtrackPath(currentCell, startCell, endCell, parentMap, paintCell);
            // End timing
            const endTime = performance.now();
            console.log(`Execution ended at: ${endTime.toFixed(3)} ms`);
            console.log(`Total execution time: ${(endTime - startTime).toFixed(3)} ms`);
            return true;
        }

        // await new Promise(resolve => setTimeout(resolve, 25)); 

        for (const [rowOffset, colOffset] of neighborsOffsets) {
            const neighbor = getCell(currentCell.row + rowOffset, currentCell.col + colOffset);
            if (isValidNeighbor(neighbor, visited)) {
                queue.push(neighbor);
                visited.add(neighbor);
                parentMap.set(neighbor, currentCell); 
                if (neighbor !== startCell && neighbor !== endCell) {
                    paintCell(neighbor.row, neighbor.col, "yellow");
                }
            }
        }

        if (currentCell !== startCell && currentCell !== endCell) {
            paintCell(currentCell.row, currentCell.col, "orange");
        }
    }

    alert("No path found");
    // // End timing
    // // // Descomentar para medir tiempo de ejecucion, comentar setTimeouts de visualizacion
    // const endTime = performance.now();
    // console.log(`Execution ended at: ${endTime.toFixed(3)} ms`);
    // console.log(`Total execution time: ${(endTime - startTime).toFixed(3)} ms`);
    return false;
};

// Función para verificar si una celda vecina es válida
const isValidNeighbor = (neighbor, visited) => {
    return neighbor && !visited.has(neighbor) && neighbor.type !== "obstacle";
};

// Función para hacer el backtracking y pintar el camino
const backtrackPath = async (currentCell, startCell, endCell, parentMap, paintCell) => {
    let backtrackCell = currentCell;

    while (backtrackCell) {
        // No pintar las celdas de inicio o fin en verde
        if (backtrackCell !== startCell && backtrackCell !== endCell) {
            paintCell(backtrackCell.row, backtrackCell.col, "green");
        }

        // Mover a la celda anterior en el camino
        backtrackCell = parentMap.get(backtrackCell);

        await new Promise(resolve => setTimeout(resolve, 10)); // Espera para visualizar
    }
};

export default bfs;