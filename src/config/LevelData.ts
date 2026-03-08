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
    {
        id: 1,
        name: '入门',
        difficulty: 'easy',
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
    },
    {
        id: 2,
        name: '进阶',
        difficulty: 'easy',
        cols: 11,
        rows: 6,
        brickWidth: 90,
        brickHeight: 35,
        brickPaddingX: 8,
        brickPaddingY: 8,
        offsetTop: 140,
        grid: [
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL']
        ]
    },
    {
        id: 3,
        name: '挑战',
        difficulty: 'medium',
        cols: 12,
        rows: 7,
        brickWidth: 80,
        brickHeight: 32,
        brickPaddingX: 6,
        brickPaddingY: 6,
        offsetTop: 130,
        grid: [
            ['HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3', 'HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL'],
            ['NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'HARD_2', 'NORMAL', 'NORMAL'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 4,
        name: '迷宫',
        difficulty: 'medium',
        cols: 10,
        rows: 8,
        brickWidth: 90,
        brickHeight: 30,
        brickPaddingX: 10,
        brickPaddingY: 5,
        offsetTop: 120,
        grid: [
            ['NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL'],
            ['NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_2'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL'],
            ['NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY'],
            ['HARD_3', 'NORMAL', 'HARD_3', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_3', 'NORMAL', 'HARD_3'],
            ['EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY'],
            ['NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL', 'NORMAL', 'EMPTY', 'NORMAL', 'EMPTY', 'NORMAL']
        ]
    },
    {
        id: 5,
        name: '堡垒',
        difficulty: 'hard',
        cols: 11,
        rows: 9,
        brickWidth: 85,
        brickHeight: 28,
        brickPaddingX: 7,
        brickPaddingY: 7,
        offsetTop: 110,
        grid: [
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_2', 'NORMAL', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'INDESTRUCTIBLE', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_2', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_2', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_2', 'HARD_2', 'HARD_2', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL', 'HARD_3'],
            ['HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3', 'HARD_3']
        ]
    },
    {
        id: 6,
        name: '巅峰',
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
