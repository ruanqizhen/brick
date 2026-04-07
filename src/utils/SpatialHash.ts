import { Brick } from '../entities/Brick';

/**
 * Spatial hash grid for O(1) average-case brick lookups during CCD.
 * Divides the game area into uniform cells and maps bricks to cells.
 * Querying only checks cells intersecting the query region.
 */
export class SpatialHash {
    private cellSize: number;
    private grid: Map<string, Brick[]> = new Map();
    private cols: number;
    private rows: number;

    /**
     * @param width - Total width of the game area
     * @param height - Total height of the game area
     * @param cellSize - Size of each grid cell (should match typical brick size)
     */
    constructor(width: number, height: number, cellSize: number = 120) {
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
    }

    /** Clear all entries without destroying the arrays */
    clear(): void {
        this.grid.forEach(cell => {
            cell.length = 0;
        });
    }

    /** Insert a brick into the spatial hash based on its current position */
    insert(brick: Brick): void {
        if (!brick.active || !brick.visible) return;

        const halfW = brick.displayWidth / 2;
        const halfH = brick.displayHeight / 2;

        // Determine which cells this brick overlaps
        const minCol = this.worldToGrid(brick.x - halfW);
        const maxCol = this.worldToGrid(brick.x + halfW);
        const minRow = this.worldToGrid(brick.y - halfH);
        const maxRow = this.worldToGrid(brick.y + halfH);

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const key = this.hashKey(col, row);
                let cell = this.grid.get(key);
                if (!cell) {
                    cell = [];
                    this.grid.set(key, cell);
                }
                cell.push(brick);
            }
        }
    }

    /**
     * Query all bricks that overlap the given axis-aligned bounding box.
     * Returns a deduplicated set of bricks.
     */
    query(minX: number, minY: number, maxX: number, maxY: number, result: Set<Brick>): void {
        const minCol = this.worldToGrid(minX);
        const maxCol = this.worldToGrid(maxX);
        const minRow = this.worldToGrid(minY);
        const maxRow = this.worldToGrid(maxY);

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const key = this.hashKey(col, row);
                const cell = this.grid.get(key);
                if (cell) {
                    for (let i = 0; i < cell.length; i++) {
                        result.add(cell[i]);
                    }
                }
            }
        }
    }

    /** Rebuild the entire spatial hash from the current brick list */
    rebuild(bricks: Brick[]): void {
        // Clear lengths of existing arrays to prevent Garbage Collection allocation overhead
        this.grid.forEach(cell => {
            cell.length = 0;
        });

        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            if (!brick.active || !brick.visible) continue;

            const halfW = brick.displayWidth / 2;
            const halfH = brick.displayHeight / 2;

            const minCol = this.worldToGrid(brick.x - halfW);
            const maxCol = this.worldToGrid(brick.x + halfW);
            const minRow = this.worldToGrid(brick.y - halfH);
            const maxRow = this.worldToGrid(brick.y + halfH);

            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    const key = this.hashKey(col, row);
                    let cell = this.grid.get(key);
                    if (!cell) {
                        cell = [];
                        this.grid.set(key, cell);
                    }
                    cell.push(brick);
                }
            }
        }
    }

    private worldToGrid(worldCoord: number): number {
        return Math.floor(worldCoord / this.cellSize);
    }

    private hashKey(col: number, row: number): string {
        return col + ',' + row;
    }
}
