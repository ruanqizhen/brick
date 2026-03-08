export type BrickType = 'NORMAL' | 'HARD_2' | 'HARD_3' | 'INDESTRUCTIBLE' | 'EMPTY';

export interface BrickRow {
    type: BrickType;
    color?: number;
}

export interface LevelConfig {
    id: number;
    cols: number;
    rows: number;
    brickWidth: number;
    brickHeight: number;
    brickPaddingX: number;
    brickPaddingY: number;
    offsetTop: number;
    grid: BrickType[][];
}

export const LEVELS: LevelConfig[] = [
    {
        id: 1,
        cols: 10,
        rows: 5,
        brickWidth: 100,
        brickHeight: 40,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 150,
        grid: [
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL']
        ]
    }
];
