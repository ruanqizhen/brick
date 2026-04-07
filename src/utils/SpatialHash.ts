import { Brick } from '../entities/Brick';

/**
 * Spatial hash grid for O(1) average-case brick lookups during CCD.
 * Divides the game area into uniform cells and maps bricks to cells.
 * Querying only checks cells intersecting the query region.
 */
export class SpatialHash {
    private cellSize: number;
    private grid: Brick[][];
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
        
        const totalCells = this.cols * this.rows;
        this.grid = new Array(totalCells);
        for (let i = 0; i < totalCells; i++) {
            this.grid[i] = [];
        }
    }

    /** Clear all entries without destroying the arrays */
    clear(): void {
        const len = this.cols * this.rows;
        for (let i = 0; i < len; i++) {
            this.grid[i].length = 0;
        }
    }

    /** Insert a brick into the spatial hash based on its current position */
    insert(brick: Brick): void {
        if (!brick.active || !brick.visible) return;

        const halfW = brick.displayWidth / 2;
        const halfH = brick.displayHeight / 2;

        let minCol = (brick.x - halfW) / this.cellSize | 0;
        let maxCol = (brick.x + halfW) / this.cellSize | 0;
        let minRow = (brick.y - halfH) / this.cellSize | 0;
        let maxRow = (brick.y + halfH) / this.cellSize | 0;

        if (minCol < 0) minCol = 0;
        if (maxCol >= this.cols) maxCol = this.cols - 1;
        if (minRow < 0) minRow = 0;
        if (maxRow >= this.rows) maxRow = this.rows - 1;

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const index = row * this.cols + col;
                this.grid[index].push(brick);
            }
        }
    }

    /**
     * Query all bricks that overlap the given axis-aligned bounding box.
     * Returns a deduplicated set of bricks.
     */
    query(minX: number, minY: number, maxX: number, maxY: number, result: Set<Brick>): void {
        let minCol = minX / this.cellSize | 0;
        let maxCol = maxX / this.cellSize | 0;
        let minRow = minY / this.cellSize | 0;
        let maxRow = maxY / this.cellSize | 0;

        if (minCol < 0) minCol = 0;
        if (maxCol >= this.cols) maxCol = this.cols - 1;
        if (minRow < 0) minRow = 0;
        if (maxRow >= this.rows) maxRow = this.rows - 1;

        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const index = row * this.cols + col;
                const cell = this.grid[index];
                for (let i = 0; i < cell.length; i++) {
                    result.add(cell[i]);
                }
            }
        }
    }

    /** Rebuild the entire spatial hash from the current brick list */
    rebuild(bricks: Brick[]): void {
        // Clear lengths of existing arrays to prevent Garbage Collection allocation overhead
        const len = this.cols * this.rows;
        for (let i = 0; i < len; i++) {
            this.grid[i].length = 0;
        }

        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i];
            if (!brick.active || !brick.visible) continue;

            const halfW = brick.displayWidth / 2;
            const halfH = brick.displayHeight / 2;

            let minCol = (brick.x - halfW) / this.cellSize | 0;
            let maxCol = (brick.x + halfW) / this.cellSize | 0;
            let minRow = (brick.y - halfH) / this.cellSize | 0;
            let maxRow = (brick.y + halfH) / this.cellSize | 0;

            if (minCol < 0) minCol = 0;
            if (maxCol >= this.cols) maxCol = this.cols - 1;
            if (minRow < 0) minRow = 0;
            if (maxRow >= this.rows) maxRow = this.rows - 1;

            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    const index = row * this.cols + col;
                    this.grid[index].push(brick);
                }
            }
        }
    }
}
