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
    // --- EASY (1-10) ---
    {
        id: 1,
        name: '入门之路',
        difficulty: 'easy',
        cols: 7,
        rows: 3,
        brickWidth: 120,
        brickHeight: 45,
        brickPaddingX: 15,
        brickPaddingY: 10,
        offsetTop: 150,
        grid: [
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL',],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL',],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL',]
        ]
    },
    {
        id: 2,
        name: '双重防线',
        difficulty: 'easy',
        cols: 10,
        rows: 4,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 140,
        grid: [
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 3,
        name: '心形回响',
        difficulty: 'easy',
        cols: 11,
        rows: 6,
        brickWidth: 90,
        brickHeight: 32,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 140,
        grid: [
            ['EMPTY', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'EMPTY'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY']
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
    // --- MEDIUM (6-25) ---
    {
        id: 6,
        name: '波动',
        difficulty: 'medium',
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
    {
        id: 7,
        name: '尖锐阶梯',
        difficulty: 'medium',
        cols: 10,
        rows: 6,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 6,
        offsetTop: 130,
        grid: [
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 8,
        name: '黑钻',
        difficulty: 'medium',
        cols: 11,
        rows: 7,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 140,
        grid: [
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 9,
        name: '致命交叉',
        difficulty: 'medium',
        cols: 10,
        rows: 6,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 130,
        grid: [
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2'],
            ['NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 10,
        name: '护卫墙',
        difficulty: 'medium',
        cols: 12,
        rows: 4,
        brickWidth: 80,
        brickHeight: 40,
        brickPaddingX: 8,
        brickPaddingY: 10,
        offsetTop: 150,
        grid: [
            ['HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY', 'HARD_2', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2', 'HARD_3', 'HARD_2'],
            ['HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL']
        ]
    },

    // --- MEDIUM (CONTINUED 11-15) ---
    {
        id: 11,
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
        id: 12,
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
        id: 13,
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
        id: 14,
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
        id: 15,
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
    // --- HARD (16-25) ---
    {
        id: 16,
        name: '双螺旋',
        difficulty: 'hard',
        cols: 10,
        rows: 8,
        brickWidth: 100,
        brickHeight: 32,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 120,
        grid: [
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2'],
            ['EMPTY', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'EMPTY'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2']
        ]
    },
    {
        id: 17,
        name: '能量环',
        difficulty: 'hard',
        cols: 12,
        rows: 6,
        brickWidth: 80,
        brickHeight: 35,
        brickPaddingX: 6,
        brickPaddingY: 10,
        offsetTop: 130,
        grid: [
            ['EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'EMPTY'],
            ['HARD_2', 'HARD_3', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_2'],
            ['HARD_2', 'HARD_3', 'EMPTY', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_2'],
            ['EMPTY', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_2', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 18,
        name: '波浪谷',
        difficulty: 'hard',
        cols: 11,
        rows: 7,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 140,
        grid: [
            ['NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2'],
            ['NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL']
        ]
    },
    {
        id: 19,
        name: '矩阵重组',
        difficulty: 'hard',
        cols: 10,
        rows: 6,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 130,
        grid: [
            ['HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 20,
        name: '护城河',
        difficulty: 'hard',
        cols: 12,
        rows: 8,
        brickWidth: 80,
        brickHeight: 28,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 120,
        grid: [
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2']
        ]
    },

    // --- HARD (21-30) ---
    {
        id: 21,
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
        id: 22,
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
        id: 23,
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
        id: 24,
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
        id: 25,
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
    // --- EXPERT (26-40) ---
    {
        id: 26,
        name: '齿轮核心',
        difficulty: 'expert',
        cols: 10,
        rows: 9,
        brickWidth: 100,
        brickHeight: 28,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 110,
        grid: [
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 27,
        name: '审判之刃',
        difficulty: 'expert',
        cols: 11,
        rows: 8,
        brickWidth: 90,
        brickHeight: 32,
        brickPaddingX: 6,
        brickPaddingY: 10,
        offsetTop: 120,
        grid: [
            ['HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'HARD_3', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2']
        ]
    },
    {
        id: 28,
        name: '能量增幅器',
        difficulty: 'expert',
        cols: 12,
        rows: 7,
        brickWidth: 80,
        brickHeight: 35,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 140,
        grid: [
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY'],
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE']
        ]
    },
    {
        id: 29,
        name: '无限循环',
        difficulty: 'expert',
        cols: 10,
        rows: 6,
        brickWidth: 100,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 12,
        offsetTop: 130,
        grid: [
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'HARD_2'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2']
        ]
    },
    {
        id: 30,
        name: '极光闪耀',
        difficulty: 'expert',
        cols: 11,
        rows: 7,
        brickWidth: 90,
        brickHeight: 32,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 120,
        grid: [
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL']
        ]
    },

    // --- EXPERT (31-40) ---
    {
        id: 31,
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
        id: 32,
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
        id: 33,
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
        id: 34,
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
        id: 35,
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
    },
    {
        id: 36,
        name: '幻影迷宫',
        difficulty: 'expert',
        cols: 10,
        rows: 10,
        brickWidth: 100,
        brickHeight: 30,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 90,
        grid: [
            ['HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY'],
            ['INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE'],
            ['EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY'],
            ['HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3'],
            ['HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3'],
            ['EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY'],
            ['INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE'],
            ['EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY'],
            ['HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'HARD_3']
        ]
    },
    {
        id: 37,
        name: '湮灭核心',
        difficulty: 'expert',
        cols: 11,
        rows: 11,
        brickWidth: 90,
        brickHeight: 28,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 80,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'EMPTY', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'EMPTY', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'EMPTY', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'EMPTY', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 38,
        name: '星辰破碎',
        difficulty: 'expert',
        cols: 12,
        rows: 9,
        brickWidth: 80,
        brickHeight: 32,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 100,
        grid: [
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['EMPTY', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_3', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'HARD_3', 'HARD_3', 'EMPTY', 'EMPTY', 'EMPTY']
        ]
    },
    {
        id: 39,
        name: '维度裂缝',
        difficulty: 'expert',
        cols: 10,
        rows: 12,
        brickWidth: 100,
        brickHeight: 26,
        brickPaddingX: 8,
        brickPaddingY: 6,
        offsetTop: 90,
        grid: [
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2'],
            ['NORMAL', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'NORMAL'],
            ['EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY'],
            ['EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY'],
            ['NORMAL', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'HARD_2', 'HARD_2', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'NORMAL'],
            ['HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2'],
            ['HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE']
        ]
    },
    {
        id: 40,
        name: '永恒领域',
        difficulty: 'expert',
        cols: 12,
        rows: 13,
        brickWidth: 80,
        brickHeight: 22,
        brickPaddingX: 6,
        brickPaddingY: 4,
        offsetTop: 70,
        grid: [
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_2', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'INDESTRUCTIBLE'],
            ['INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE']
        ]
    },
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
