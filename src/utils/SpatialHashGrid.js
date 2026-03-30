export default class SpatialHashGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    _getKey(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx}_${cy}`;
    }

    clear() {
        // Reuse arrays to completely eliminate GC (Garbage Collection) spiking
        for (let cell of this.cells.values()) {
            cell.length = 0;
        }
    }

    insert(entity) {
        const key = this._getKey(entity.x, entity.y);
        let cell = this.cells.get(key);
        if (!cell) {
            cell = [];
            this.cells.set(key, cell);
        }
        cell.push(entity);
    }

    getNeighbors(entity, checkRadiusCells = 1) {
        const cx = Math.floor(entity.x / this.cellSize);
        const cy = Math.floor(entity.y / this.cellSize);
        
        // Use a Set to avoid duplicates if floating point errors force weird overlapping
        const neighbors = new Set();

        for (let dx = -checkRadiusCells; dx <= checkRadiusCells; dx++) {
            for (let dy = -checkRadiusCells; dy <= checkRadiusCells; dy++) {
                const key = `${cx + dx}_${cy + dy}`;
                const cell = this.cells.get(key);
                if (cell && cell.length > 0) {
                    for (let i = 0; i < cell.length; i++) {
                        neighbors.add(cell[i]);
                    }
                }
            }
        }
        return Array.from(neighbors);
    }
}
