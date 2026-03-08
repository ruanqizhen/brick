import Phaser from 'phaser';

export class Starfield {
    private scene: Phaser.Scene;
    private stars: Phaser.GameObjects.Group;
    private speed: number = 2;
    private enabled: boolean = true;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.stars = scene.add.group();

        // 创建多层星星实现帕拉克斯效果
        this.createStars(100, 0.5, 0x555555, 1);
        this.createStars(50, 1, 0x888888, 1.5);
        this.createStars(20, 1.5, 0xffffff, 2);
    }

    private createStars(count: number, scale: number, color: number, speedMult: number) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.scene.add.rectangle(x, y, 2, 2, color);
            star.setScale(scale);
            (star as any).speedMult = speedMult;
            this.stars.add(star);
        }
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    update() {
        if (!this.enabled) return;

        const height = this.scene.cameras.main.height;
        this.stars.getChildren().forEach(s => {
            const star = s as Phaser.GameObjects.Rectangle;
            const speed = this.speed * ((star as any).speedMult || 1);
            star.y += speed;

            if (star.y > height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.scene.cameras.main.width);
            }
        });
    }
}
