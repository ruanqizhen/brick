export type BrickType = 'NORMAL' | 'HARD_2' | 'HARD_3' | 'INDESTRUCTIBLE' | 'EMPTY';

export interface BrickRow {
    type: BrickType;
    color?: number;
}

export interface LevelConfig {
    id: number;
    name: string;
    cols: number;
    rows: number;
    brickWidth: number;
    brickHeight: number;
    brickPaddingX: number;
    brickPaddingY: number;
    offsetTop: number;
    grid: BrickType[][];
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export const LEVELS: LevelConfig[] = [
    // --- EASY (1-5) ---
    {
        id: 1,
        name: '基础训练',
        difficulty: 'easy',
        cols: 10,
        rows: 4,
        brickWidth: 100,
        brickHeight: 40,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 150,
        grid: [
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 2,
        name: '双重防线',
        difficulty: 'easy',
        cols: 10,
        rows: 5,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 140,
        grid: [
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 3,
        name: '之字走廊',
        difficulty: 'easy',
        cols: 11,
        rows: 6,
        brickWidth: 90,
        brickHeight: 32,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 140,
        grid: [
            ['NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL'],
            ['EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY'],
            ['NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 4,
        name: '四象限',
        difficulty: 'easy',
        cols: 10,
        rows: 6,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 130,
        grid: [
            ['HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2']
        ]
    },
    {
        id: 5,
        name: '波动',
        difficulty: 'easy',
        cols: 12,
        rows: 5,
        brickWidth: 80,
        brickHeight: 30,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 150,
        grid: [
            ['NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2'],
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2'],
            ['NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY']
        ]
    },

    // --- MEDIUM (6-10) ---
    {
        id: 6,
        name: '中庭',
        difficulty: 'medium',
        cols: 10,
        rows: 7,
        brickWidth: 100,
        brickHeight: 32,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 130,
        grid: [
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'NORMAL', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'NORMAL', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2']
        ]
    },
    {
        id: 7,
        name: '对角线',
        difficulty: 'medium',
        cols: 11,
        rows: 8,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 7,
        brickPaddingY: 7,
        offsetTop: 120,
        grid: [
            ['HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3']
        ]
    },
    {
        id: 8,
        name: '三塔',
        difficulty: 'medium',
        cols: 12,
        rows: 7,
        brickWidth: 80,
        brickHeight: 35,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 120,
        grid: [
            ['EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY'],
            ['INDESTRUCTIBLE', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'INDESTRUCTIBLE'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['INDESTRUCTIBLE', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'INDESTRUCTIBLE'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY']
        ]
    },
    {
        id: 9,
        name: '迷宫中心',
        difficulty: 'medium',
        cols: 10,
        rows: 10,
        brickWidth: 100,
        brickHeight: 28,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 110,
        grid: [
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2']
        ]
    },
    {
        id: 10,
        name: '星形排列',
        difficulty: 'medium',
        cols: 11,
        rows: 9,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 120,
        grid: [
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'HARD_3', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'EMPTY'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['EMPTY', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'HARD_3', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY']
        ]
    },

    // --- HARD (11-15) ---
    {
        id: 11,
        name: '钢铁防线',
        difficulty: 'hard',
        cols: 10,
        rows: 8,
        brickWidth: 100,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 120,
        grid: [
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE'],
            ['HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'EMPTY', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'EMPTY', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE']
        ]
    },
    {
        id: 12,
        name: '同心圆',
        difficulty: 'hard',
        cols: 12,
        rows: 10,
        brickWidth: 80,
        brickHeight: 28,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 100,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 13,
        name: '棋盘格',
        difficulty: 'hard',
        cols: 10,
        rows: 8,
        brickWidth: 100,
        brickHeight: 32,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 120,
        grid: [
            ['HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2'],
            ['EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL']
        ]
    },
    {
        id: 14,
        name: '沙漏',
        difficulty: 'hard',
        cols: 11,
        rows: 9,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 110,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 15,
        name: '坚固堡垒',
        difficulty: 'hard',
        cols: 12,
        rows: 8,
        brickWidth: 80,
        brickHeight: 35,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 100,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },

    // --- EXPERT (16-20) ---
    {
        id: 16,
        name: '最终巅峰',
        difficulty: 'expert',
        cols: 12,
        rows: 10,
        brickWidth: 80,
        brickHeight: 26,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 100,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 17,
        name: '锁死网格',
        difficulty: 'expert',
        cols: 10,
        rows: 10,
        brickWidth: 100,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 90,
        grid: [
            ['INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3']
        ]
    },
    {
        id: 18,
        name: '蜂巢结构',
        difficulty: 'expert',
        cols: 12,
        rows: 10,
        brickWidth: 80,
        brickHeight: 28,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 90,
        grid: [
            ['EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY', 'HARD_3', 'EMPTY']
        ]
    },
    {
        id: 19,
        name: '混沌空间',
        difficulty: 'expert',
        cols: 11,
        rows: 10,
        brickWidth: 90,
        brickHeight: 28,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 90,
        grid: [
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE'],
            ['HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3']
        ]
    },
    {
        id: 20,
        name: '最终之墙',
        difficulty: 'expert',
        cols: 12,
        rows: 12,
        brickWidth: 80,
        brickHeight: 24,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 80,
        grid: [
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE']
        ]
    }
];

// Get difficulty color
export function getDifficultyColor(difficulty: string): number {
    switch (difficulty) {
        case 'easy': return 0x4CAF50;
        case 'medium': return 0xFFC107;
        case 'hard': return 0xFF9800;
        case 'expert': return 0xF44336;
        default: return 0x888888;
    }
}

// Get difficulty label in Chinese
export function getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
        case 'easy': return '简单';
        case 'medium': return '中等';
        case 'hard': return '困难';
        case 'expert': return '专家';
        default: return '未知';
    }
}
