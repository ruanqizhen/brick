import Phaser from 'phaser';
import { DESIGN_WIDTH, GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Matter.Image {
    private prevX: number = 0;
    private _velocityX: number = 0;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private aKey: Phaser.Input.Keyboard.Key | undefined;
    private dKey: Phaser.Input.Keyboard.Key | undefined;
    private keyboardSpeed: number = 18;
    private lastClientX: number = 0;
    private wasPointerDown: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene.matter.world, x, y, 'paddle', undefined, {
            isStatic: true,
            label: 'paddle',
            friction: 0,
            restitution: 1,
            isSensor: false
        });
        scene.add.existing(this);
        this.setOrigin(0.5);
        this.prevX = x;
        this.setIgnoreGravity(true);

        this.setBody({ type: 'rectangle', width: GameConfig.PADDLE_WIDTH, height: GameConfig.PADDLE_HEIGHT });
        this.setStatic(true);
        if (this.body) {
            (this.body as MatterJS.BodyType).label = 'paddle';
            (this.body as MatterJS.BodyType).restitution = 1;
            (this.body as MatterJS.BodyType).friction = 0;
        }

        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }

        window.addEventListener('pointerdown', this.handleWindowPointerDown);
        window.addEventListener('pointermove', this.handleWindowPointerMove);
        window.addEventListener('pointerup', this.handleWindowPointerUp);
        window.addEventListener('pointercancel', this.handleWindowPointerUp);
    }

    private handleWindowPointerDown = (event: PointerEvent) => {
        this.wasPointerDown = true;
        this.lastClientX = event.clientX;
    };

    private handleWindowPointerMove = (event: PointerEvent) => {
        if (!this.wasPointerDown) return;

        const currentClientX = event.clientX;
        const clientDeltaX = currentClientX - this.lastClientX;
        const cssScale = this.scene.scale.displaySize.width / DESIGN_WIDTH;
        const gameDeltaX = clientDeltaX / (cssScale || 1);

        if (!isNaN(gameDeltaX)) {
            this.x += gameDeltaX;
            this.lastClientX = currentClientX;
        }
    };

    private handleWindowPointerUp = () => {
        this.wasPointerDown = false;
    };

    update(time: number, delta: number) {
        this.prevX = this.x;

        // Keyboard input
        if (this.cursors || this.aKey || this.dKey) {
            const frameRatio = delta / (1000 / 60);
            if (this.cursors?.left.isDown || this.aKey?.isDown) {
                this.x -= this.keyboardSpeed * frameRatio;
            } else if (this.cursors?.right.isDown || this.dKey?.isDown) {
                this.x += this.keyboardSpeed * frameRatio;
            }
        }

        // Clamp to bounds
        const halfWidth = this.displayWidth / 2;
        this.x = Phaser.Math.Clamp(this.x, halfWidth, DESIGN_WIDTH - halfWidth);

        // Calculate velocity for ball angle calculation
        this._velocityX = this.x - this.prevX;

        // Sync Matter body position — static bodies don't auto-follow GameObject
        this.setPosition(this.x, this.y);
    }

    updateBodyWidth() {
        // Rebuild the Matter body to match new display width
        const w = this.displayWidth + 10; // extra margin for sub-pixel safety
        const h = GameConfig.PADDLE_HEIGHT;
        this.setBody({ type: 'rectangle', width: w, height: h });
        this.setStatic(true);
        if (this.body) {
            (this.body as MatterJS.BodyType).label = 'paddle';
            (this.body as MatterJS.BodyType).restitution = 1;
        }
        this.setPosition(this.x, this.y);
    }

    get velocityX(): number {
        return this._velocityX;
    }

    override destroy(fromScene?: boolean) {
        this.cleanupEventListeners();
        super.destroy(fromScene);
    }

    public cleanupEventListeners(): void {
        window.removeEventListener('pointerdown', this.handleWindowPointerDown);
        window.removeEventListener('pointermove', this.handleWindowPointerMove);
        window.removeEventListener('pointerup', this.handleWindowPointerUp);
        window.removeEventListener('pointercancel', this.handleWindowPointerUp);
    }
}
