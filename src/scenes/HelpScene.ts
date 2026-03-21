import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/EventConstants';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';
import { UIButton } from '../ui/UIButton';
import { PowerUp, PowerUpType } from './../entities/PowerUp';

export class HelpScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.HELP);
    }

    create() {
        // Dark background
        this.add.rectangle(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 0x050510).setOrigin(0);

        // Title
        this.add.text(DESIGN_WIDTH / 2, 80, '游戏帮助', {
            fontSize: '56px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setShadow(0, 0, '#00ffff', 15, true, true);

        // ==========================================
        // Section 1: Rules & Controls
        // ==========================================
        this.add.text(DESIGN_WIDTH / 2, 170, '【 玩法指南 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(DESIGN_WIDTH / 2, 230, '• 滑动鼠标或触摸屏幕 控制下方挡板移动\n• 点击屏幕任意位置 发射小球\n• 消除所有普通砖块即可前往下一关\n• 注意接住小球，如果小球掉落将损失生命\n• 打破砖块或接住掉落道具可获得强力效果！', {
            fontSize: '24px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffffff',
            align: 'left', lineSpacing: 12
        }).setOrigin(0.5, 0);

        // ==========================================
        // Section 2: Normal Bricks
        // ==========================================
        this.add.text(DESIGN_WIDTH / 2, 480, '【 砖块 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);

        const normalBrickTypes = [
            { color: 0x00e5ff, name: '基础砖块', desc: '普通的能量核心，击中1次即可消除' },
            { color: 0xffea00, name: '强化砖块', desc: '拥有双层装甲，需要击中2次消除' },
            { color: 0xff00d4, name: '重装砖块', desc: '最坚固的核心，需要击中3次消除' },
            { color: 0xff3300, name: '爆炸砖块', desc: '击碎后瞬间炸毁周围的相邻砖块' },
            { color: 0xcc00ff, name: '移动砖块', desc: '在空中来回游走，难以瞄准' },
            { color: 0x33ff99, name: '隐形砖块', desc: '幽灵砖块，首次击中才会显现实体' },
            { texture: 'brick_metal', color: 0xcccccc, name: '金属砖块', desc: '坚不可摧的阻挡物，用来借力反弹' }
        ];

        normalBrickTypes.forEach((b, i) => {
            const bx = 270;
            const by = 540 + i * 50;
            this.add.image(bx, by, 'brick').setDisplaySize(80, 24).setTint(b.color);
            this.add.text(bx + 80, by, `[${b.name}]  -  ${b.desc}`, {
                fontSize: '22px', fontFamily: "'Noto Sans SC', sans-serif", color: '#dddddd'
            }).setOrigin(0, 0.5);
        });

        // ==========================================
        // Section 4: PowerUps
        // ==========================================
        this.add.text(DESIGN_WIDTH / 2, 920, '【 道具说明 】', {
            fontSize: '32px', fontFamily: "'Noto Sans SC', sans-serif", color: '#ffdd00', fontStyle: 'bold'
        }).setOrigin(0.5);

        const powerups: { type: PowerUpType, name: string }[] = [
            { type: 'PADDLE_EXPAND', name: '挡板变长' },
            { type: 'BALL_ENLARGE', name: '小球变大' },
            { type: 'SPEED_DOWN', name: '小球减速' },

            { type: 'PADDLE_SHRINK', name: '挡板变短' },
            { type: 'BALL_SHRINK', name: '小球变小' },
            { type: 'SPEED_UP', name: '小球加速' },

            { type: 'MULTI_BALL', name: '分裂球' },
            { type: 'EXTRA_LIFE', name: '增加生命' },
            { type: 'FIREBALL', name: '烈火球' }
        ];

        const cols = 3;
        const startX = 240;
        const spacingX = 300;
        const startY = 1030;
        const spacingY = 110;

        powerups.forEach((pu, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const px = startX + col * spacingX;
            const py = startY + row * spacingY;

            const textureKey = `powerup_${pu.type}`;
            if (!this.textures.exists(textureKey)) {
                PowerUp.createPowerUpTexture(this, pu.type, textureKey);
            }

            this.add.image(px, py - 35, textureKey).setScale(0.9);
            this.add.text(px, py + 20, pu.name, {
                fontSize: '22px', fontFamily: "'Noto Sans SC', sans-serif", color: '#dddddd', fontStyle: 'bold'
            }).setOrigin(0.5);
        });

        // Documentation Link
        const docLink = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT - 120, '查看更详细的在线帮助手册 (GitHub)', {
            fontSize: '20px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#00ffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        docLink.on('pointerdown', () => {
            window.open('https://github.com/ruanqizhen/brick/blob/main/README.md', '_blank');
        });

        docLink.on('pointerover', () => docLink.setColor('#ffffff'));
        docLink.on('pointerout', () => docLink.setColor('#00ffff'));

        // Back Button
        const backBtn = new UIButton(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT - 50, {
            label: '返回主菜单',
            onClick: () => {
                this.scene.start(SCENE_KEYS.MENU);
            }
        });
        this.add.existing(backBtn);
    }
}
