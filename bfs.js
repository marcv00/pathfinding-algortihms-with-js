const bfs = async (cells, startCellPosition, endCellPosition, gridSize, paintCell) => {
    // Mapa para llevar un registro de las celdas visitadas
    const visited = new Set();
    const queue = [];
    const parentMap = new Map(); // Para hacer backtracking del camino

    // Función para obtener una celda desde las posiciones (fila, columna)
    const getCell = (row, col) => {
        // Verifica si la celda está dentro de los límites del grid
        if (row < 1 || row > gridSize || col < 1 || col > gridSize) return null;
        const index = (row - 1) * gridSize + (col - 1);
        return cells[index];
    };

    // Obtener las celdas de inicio y fin
    const startCell = getCell(startCellPosition.row, startCellPosition.col);
    const endCell = getCell(endCellPosition.row, endCellPosition.col);
    
    // Si no se encuentran las celdas de inicio o fin, se sale
    if (!startCell || !endCell) return;

    // Agregar la celda de inicio a la cola y marcarla como visitada
    queue.push(startCell);
    visited.add(startCell);

    // Pintar la celda de inicio de color azul
    paintCell(startCell.row, startCell.col, "blue");

    // Direcciones posibles para las celdas vecinas (arriba, abajo, izquierda, derecha y diagonales)
    const neighborsOffsets = [
        [-1,  0], [1,  0], [0, -1], [0,  1],
        [-1, -1], [-1,  1], [1, -1], [1,  1]
    ];

    // Mientras haya celdas en la cola
    while (queue.length > 0) {
        const currentCell = queue.shift();

        // Si se llega a la celda de destino
        if (currentCell.row === endCellPosition.row && currentCell.col === endCellPosition.col) {
            // Realizar el backtracking para pintar el camino encontrado
            await backtrackPath(currentCell, startCell, endCell, parentMap, paintCell);
            return true;
        }

        // Espera un poco para visualizar el proceso
        await new Promise(resolve => setTimeout(resolve, 25)); 

        // Explorar todas las celdas vecinas
        for (const [rowOffset, colOffset] of neighborsOffsets) {
            const neighbor = getCell(currentCell.row + rowOffset, currentCell.col + colOffset);
            
            // Si la celda vecina es válida y no ha sido visitada ni es un obstáculo
            if (isValidNeighbor(neighbor, visited)) {
                queue.push(neighbor);
                visited.add(neighbor);
                parentMap.set(neighbor, currentCell); // Registrar el padre de la celda vecina
                
                // Pintar la celda vecina de amarillo, evitando la celda de inicio y fin
                if (neighbor !== startCell && neighbor !== endCell) {
                    paintCell(neighbor.row, neighbor.col, "yellow");
                }
            }
        }

        // Pintar la celda actual de color naranja, excepto si es la celda de inicio o fin
        if (currentCell !== startCell && currentCell !== endCell) {
            paintCell(currentCell.row, currentCell.col, "orange");
        }
    }

    // Si no se encuentra un camino, mostrar una alerta
    alert("No path found");
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