import Phaser from 'phaser';

interface StarLayerConfig {
    key: string;
    count: number;
    colors: number[];
    minSize: number;
    maxSize: number;
    /** px/秒，等价于原 60fps 下每帧 1.6/3/5px */
    speedPxPerSec: number;
}

const TILE_SIZE = 512;

const LAYERS: StarLayerConfig[] = [
    { key: 'starfield_far', count: 14, colors: [0x334466, 0x445577, 0x556688], minSize: 1, maxSize: 1, speedPxPerSec: 96 },
    { key: 'starfield_mid', count: 8, colors: [0x8888aa, 0xaa88cc, 0xffffff], minSize: 1, maxSize: 2, speedPxPerSec: 180 },
    { key: 'starfield_near', count: 4, colors: [0x00ffff, 0xff88ff, 0xffffff], minSize: 2, maxSize: 2, speedPxPerSec: 300 },
];

/**
 * 三层视差星空：每层 1 个 TileSprite（共 3 个 draw call），纹理只生成一次。
 * 滚动走 GPU 纹理偏移，闪烁改为整层呼吸式 alpha，每帧仅 1 次 setAlpha。
 */
export class Starfield {
    private layers: Phaser.GameObjects.TileSprite[] = [];
    private enabled: boolean = true;
    private twinkleTime: number = 0;

    constructor(scene: Phaser.Scene) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;

        LAYERS.forEach((config, index) => {
            this.ensureTexture(scene, config);
            const tile = scene.add.tileSprite(width / 2, height / 2, width, height, config.key);
            tile.setDepth(-30 + index);
            this.layers.push(tile);
        });
    }

    private ensureTexture(scene: Phaser.Scene, config: StarLayerConfig): void {
        if (scene.textures.exists(config.key)) return;
        const graphics = scene.make.graphics({ x: 0, y: 0 });
        for (let i = 0; i < config.count; i++) {
            const color = Phaser.Math.RND.pick(config.colors);
            const size = Phaser.Math.Between(config.minSize, config.maxSize);
            // 留边距，避免平铺接缝处被裁半
            const margin = size + 1;
            const x = Phaser.Math.Between(margin, TILE_SIZE - margin);
            const y = Phaser.Math.Between(margin, TILE_SIZE - margin);
            graphics.fillStyle(color, 0.8);
            graphics.fillCircle(x, y, size);
        }
        graphics.generateTexture(config.key, TILE_SIZE, TILE_SIZE);
        graphics.destroy();
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    update(delta: number): void {
        if (!this.enabled) return;
        const dtSec = delta / 1000;
        for (let i = 0; i < this.layers.length; i++) {
            // tilePositionY 减小 = 纹理内容下移（与原逐星下移同向）
            this.layers[i].tilePositionY -= LAYERS[i].speedPxPerSec * dtSec;
        }
        this.twinkleTime += delta;
        const twinkle = 0.8 + 0.2 * Math.sin(this.twinkleTime * 0.002);
        this.layers[this.layers.length - 1].setAlpha(twinkle);
    }
}
