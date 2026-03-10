import Phaser from 'phaser';

interface StarData {
    speedMult: number;
    twinkleSpeed: number;
}

export class Starfield {
    private scene: Phaser.Scene;
    private stars: Phaser.GameObjects.Group;
    private speed: number = 2;
    private enabled: boolean = true;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.stars = scene.add.group();

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
            
            // Use circles instead of rectangles for smoother look
            const star = this.scene.add.circle(x, y, scale, color, 0.8);
            star.setData('speedMult', speedMult);
            star.setData('twinkleSpeed', Phaser.Math.FloatBetween(0.002, 0.008));
            star.setData('twinklePhase', Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.stars.add(star);
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    update() {
        if (!this.enabled) return;

        const height = this.scene.cameras.main.height;
        const width = this.scene.cameras.main.width;
        const stars = this.stars.getChildren();
        const time = this.scene.time.now;

        for (let i = 0; i < stars.length; i++) {
            const star = stars[i] as Phaser.GameObjects.Arc;
            const speedMult = star.getData('speedMult') as number || 1;
            const twinkleSpeed = star.getData('twinkleSpeed') as number || 0.004;
            const twinklePhase = star.getData('twinklePhase') as number || 0;

            // Move downward
            star.y += this.speed * speedMult;

            // Twinkle effect (alpha oscillation)
            star.setAlpha(0.4 + 0.5 * Math.sin(time * twinkleSpeed + twinklePhase));

            if (star.y > height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, width);
            }
        }
    }
}
