import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/EventConstants';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';
import { UIButton } from '../ui/UIButton';
import { PowerUp, PowerUpType } from './../entities/PowerUp';

export class HelpScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.HELP);
    }

    private contentContainer!: Phaser.GameObjects.Container;
    private scrollMask!: Phaser.GameObjects.Graphics;
    private scrollbarHandle!: Phaser.GameObjects.Graphics;
    private scrollbarTrack!: Phaser.GameObjects.Graphics;

    private isDragging: boolean = false;
    private dragStartY: number = 0;
    private containerStartY: number = 0;
    private contentHeight: number = 0;

    create() {
        const VIEW_X = 50;
        const VIEW_Y = 130;
        const VIEW_W = DESIGN_WIDTH - 100;
        const VIEW_H = DESIGN_HEIGHT - 280;

        // --- 1. Background Layer ---
        this.add.rectangle(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 0x050510).setOrigin(0);

        // --- 2. Title (Fixed) ---
        this.add.text(DESIGN_WIDTH / 2, 60, '游戏帮助', {
            fontSize: '56px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setShadow(0, 0, '#00ffff', 15, true, true);

        // --- 3. Scrollable Content Container ---
        this.contentContainer = this.add.container(0, VIEW_Y);

        // --- 4. Mask ---
        this.scrollMask = this.add.graphics();
        this.scrollMask.fillStyle(0xffffff);
        this.scrollMask.fillRect(VIEW_X, VIEW_Y, VIEW_W, VIEW_H);
        this.scrollMask.setVisible(false); // Mask graphics should not be rendered directly
        this.contentContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.scrollMask));

        this.setupHelpContent();

        // --- 5. Scrollbar ---
        this.scrollbarTrack = this.add.graphics();
        this.scrollbarTrack.fillStyle(0xffffff, 0.1);
        this.scrollbarTrack.fillRoundedRect(DESIGN_WIDTH - 30, VIEW_Y, 6, VIEW_H, 3);

        this.scrollbarHandle = this.add.graphics();
        this.updateScrollbar();

        // --- 6. Interaction Logic ---
        const hitArea = this.add.rectangle(VIEW_X, VIEW_Y, VIEW_W, VIEW_H, 0xffffff, 0)
            .setOrigin(0).setInteractive();

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            this.scroll(deltaY * -0.5);
        });

        hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.contentContainer.y;
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging) {
                const deltaY = pointer.y - this.dragStartY;
                this.contentContainer.y = this.containerStartY + deltaY;
                this.clampScroll();
                this.updateScrollbar();
            }
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // --- 7. Sticky Footer Buttons ---
        this.setupFooter(VIEW_Y + VIEW_H + 30);
    }

    private setupHelpContent() {
        let currentY = 20;
        const centerX = DESIGN_WIDTH / 2;

        // Section: Difficulty Modes (New!)
        const diffTitle = this.add.text(centerX, currentY, '【 难度模式 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(diffTitle);
        currentY += 60;

        const diffText = this.add.text(centerX, currentY, '• 简单模式：基础球速，道具为传感器（不挡球），适合新手。\n• 困难模式：球速增加 50%，道具变为物理实体（会弹球），挑战极大。', {
            fontSize: '22px', fontFamily: "'Noto Sans SC', sans-serif", color: '#00d4ff', align: 'center', lineSpacing: 10
        }).setOrigin(0.5, 0);
        this.contentContainer.add(diffText);
        currentY += 120;

        // Section 1: Rules & Controls
        const rulesTitle = this.add.text(centerX, currentY, '【 玩法指南 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(rulesTitle);
        currentY += 60;

        const rulesText = this.add.text(centerX, currentY, '• 滑动鼠标或移动端点击拖拽 即可控制挡板\n• 点击屏幕任意处 或按 空格 发射小球\n• 消除所有普通砖块即可过关\n• 丢球会损失生命，生命归零则游戏结束\n• 打破砖块有几率掉落强力道具！', {
            fontSize: '22px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffffff', lineSpacing: 10, align: 'center'
        }).setOrigin(0.5, 0);
        this.contentContainer.add(rulesText);
        currentY += 240;

        // Section 2: Bricks
        const brickTitle = this.add.text(centerX, currentY, '【 砖块种类 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(brickTitle);
        currentY += 60;

        const brickTypes = [
            { color: 0x00e5ff, name: '基础砖块', desc: '能量核心，击中1次消除' },
            { color: 0xffea00, name: '强化砖块', desc: '双层装甲，需要击中2次' },
            { color: 0xff00d4, name: '重装砖块', desc: '三层装甲，最为坚硬' },
            { color: 0xff3300, name: '爆炸砖块', desc: '连锁爆炸，清除周围砖块' },
            { color: 0xcc00ff, name: '移动砖块', desc: '半空游走，极难捕捉' },
            { color: 0x33ff99, name: '隐形砖块', desc: '击中前保持幽灵形态' },
            { texture: 'brick_metal', color: 0xcccccc, name: '金属砖块', desc: '无法被破坏，仅供借力' }
        ];

        brickTypes.forEach((b) => {
            const bx = 360;
            const img = this.add.image(bx, currentY, 'brick').setDisplaySize(80, 24).setTint(b.color);
            const txt = this.add.text(bx + 60, currentY, `${b.name} - ${b.desc}`, {
                fontSize: '20px', fontFamily: "'Noto Sans SC', sans-serif", color: '#dddddd'
            }).setOrigin(0, 0.5);
            this.contentContainer.add([img, txt]);
            currentY += 45;
        });
        currentY += 60;

        // Section 3: PowerUps
        const powerTitle = this.add.text(centerX, currentY, '【 道具说明 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.contentContainer.add(powerTitle);
        currentY += 70;

        const powerups: { type: PowerUpType, name: string }[] = [
            { type: 'PADDLE_EXPAND', name: '挡板变长' }, { type: 'BALL_ENLARGE', name: '小球变大' }, { type: 'SPEED_DOWN', name: '小球减速' },
            { type: 'PADDLE_SHRINK', name: '挡板变短' }, { type: 'BALL_SHRINK', name: '小球变小' }, { type: 'SPEED_UP', name: '小球加速' },
            { type: 'MULTI_BALL', name: '分裂球' }, { type: 'EXTRA_LIFE', name: '增加生命' }, { type: 'FIREBALL', name: '烈火球' }
        ];

        powerups.forEach((pu, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const px = centerX - 300 + col * 300;
            const py = currentY + row * 110;
            const textureKey = `powerup_${pu.type}`;
            if (!this.textures.exists(textureKey)) PowerUp.createPowerUpTexture(this, pu.type, textureKey);

            const img = this.add.image(px, py, textureKey).setScale(0.85);
            const txt = this.add.text(px, py + 50, pu.name, {
                fontSize: '20px', fontFamily: "'Noto Sans SC', sans-serif", color: '#dddddd'
            }).setOrigin(0.5);
            this.contentContainer.add([img, txt]);
        });

        currentY += 380;
        this.contentHeight = currentY;
    }

    private setupFooter(startY: number) {
        const docLink = this.add.text(DESIGN_WIDTH / 2, startY, '查看更详细的在线帮助手册 (GitHub)', {
            fontSize: '20px', fontFamily: "'Noto Sans SC', sans-serif", color: '#00ffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        docLink.on('pointerdown', () => window.open('https://github.com/ruanqizhen/brick/blob/main/README.md', '_blank'));
        docLink.on('pointerover', () => docLink.setColor('#ffffff'));
        docLink.on('pointerout', () => docLink.setColor('#00ffff'));

        const backBtn = new UIButton(this, DESIGN_WIDTH / 2, startY + 70, {
            label: '返回主菜单',
            onClick: () => this.scene.start(SCENE_KEYS.MENU)
        });
        this.add.existing(backBtn);
    }

    private scroll(amount: number) {
        this.contentContainer.y += amount;
        this.clampScroll();
        this.updateScrollbar();
    }

    private clampScroll() {
        const VIEW_Y = 130;
        const VIEW_H = DESIGN_HEIGHT - 280;
        const minY = VIEW_Y - (this.contentHeight - VIEW_H);
        const maxY = VIEW_Y;

        if (this.contentContainer.y > maxY) this.contentContainer.y = maxY;
        if (this.contentContainer.y < minY) this.contentContainer.y = minY;
    }

    private updateScrollbar() {
        const VIEW_Y = 130;
        const VIEW_H = DESIGN_HEIGHT - 280;
        const handleH = Math.max(30, (VIEW_H / this.contentHeight) * VIEW_H);

        const scrollPercent = (VIEW_Y - this.contentContainer.y) / (this.contentHeight - VIEW_H);
        const handleY = VIEW_Y + scrollPercent * (VIEW_H - handleH);

        this.scrollbarHandle.clear();
        this.scrollbarHandle.fillStyle(0x00ffff, 0.8);
        this.scrollbarHandle.fillRoundedRect(DESIGN_WIDTH - 30, handleY, 6, handleH, 3);
    }
}
