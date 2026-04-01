import Phaser from 'phaser';

export class Starfield {
    private scene: Phaser.Scene;
    private stars: Phaser.GameObjects.Arc[] = [];
    private speed: number = 2;
    private enabled: boolean = true;

    // Parallel arrays for star properties (eliminates getData() overhead)
    private speedMults: number[] = [];
    private twinkleSpeeds: number[] = [];
    private twinklePhases: number[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Layer 1: Dim distant stars (cool blue)
        this.createStars(80, 0.4, [0x334466, 0x445577, 0x556688], 0.8);
        // Layer 2: Mid stars (white/pink)
        this.createStars(40, 0.8, [0x8888aa, 0xaa88cc, 0xffffff], 1.5);
        // Layer 3: Bright foreground stars (cyan/magenta)
        this.createStars(15, 1.2, [0x00ffff, 0xff88ff, 0xffffff], 2.5);
    }

    private createStars(count: number, scale: number, colors: number[], speedMult: number) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const color = Phaser.Math.RND.pick(colors);
            
            const star = this.scene.add.circle(x, y, scale, color, 0.8);
            this.stars.push(star);
            this.speedMults.push(speedMult);
            this.twinkleSpeeds.push(Phaser.Math.FloatBetween(0.002, 0.008));
            this.twinklePhases.push(Phaser.Math.FloatBetween(0, Math.PI * 2));
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    update() {
        if (!this.enabled) return;

        const height = this.scene.cameras.main.height;
        const width = this.scene.cameras.main.width;
        const time = this.scene.time.now;
        const speed = this.speed;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];

            // Move downward
            star.y += speed * this.speedMults[i];

            // Twinkle effect (alpha oscillation)
            star.setAlpha(0.4 + 0.5 * Math.sin(time * this.twinkleSpeeds[i] + this.twinklePhases[i]));

            if (star.y > height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, width);
            }
        }
    }
}
