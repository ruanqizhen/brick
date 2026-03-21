import Phaser from 'phaser';
import { TWEEN_PRESETS } from '../config/AnimationConfig';

export interface ButtonConfig {
    label: string;
    isPrimary?: boolean; // Primary (Cyan/glow) vs Secondary (White/minimal)
    width?: number;
    height?: number;
    fontSize?: string;
    onClick: () => void;
}

const DEFAULTS = {
    WIDTH: 260,
    HEIGHT: 54,
    FONT_SIZE: '28px',
};

/**
 * Unified Cyberpunk-style pill button component.
 * Replaces redundant button creation logic across scenes.
 */
export class UIButton extends Phaser.GameObjects.Container {
    private graphics!: Phaser.GameObjects.Graphics;
    private text!: Phaser.GameObjects.Text;
    private hitZone!: Phaser.GameObjects.Rectangle;
    private onClick: () => void;
    private isPrimary: boolean;
    private mainColor: number;
    private btnWidth: number;
    private btnHeight: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        config: ButtonConfig
    ) {
        super(scene, x, y);

        this.onClick = config.onClick;
        this.isPrimary = config.isPrimary ?? false;
        this.btnWidth = config.width ?? DEFAULTS.WIDTH;
        this.btnHeight = config.height ?? DEFAULTS.HEIGHT;
        const fontSize = config.fontSize ?? DEFAULTS.FONT_SIZE;

        this.mainColor = this.isPrimary ? 0x00d4ff : 0xffffff;

        // Background Graphics
        this.graphics = scene.add.graphics();
        this.drawState(false);

        // Text
        this.text = scene.add.text(0, 0, config.label, {
            fontSize,
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#dddddd',
            fontStyle: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);

        // Interaction Zone
        this.hitZone = scene.add.rectangle(0, 0, this.btnWidth, this.btnHeight, 0x000000, 0);
        this.hitZone.setInteractive({ useHandCursor: true });

        this.add([this.graphics, this.text, this.hitZone]);
        this.setSize(this.btnWidth, this.btnHeight);

        this.setupInteractions();
    }

    private drawState(isHover: boolean): void {
        this.graphics.clear();
        const radius = this.btnHeight / 2;
        const alphaRange = isHover ? (this.isPrimary ? 0.3 : 0.1) : (this.isPrimary ? 0.15 : 0.05);
        const strokeAlpha = isHover ? 0.8 : (this.isPrimary ? 0.4 : 0.2);
        const strokeWidth = isHover ? 2 : 1;

        // Fill
        this.graphics.fillStyle(this.mainColor, alphaRange);
        this.graphics.fillCircle(-this.btnWidth / 2 + radius, 0, radius);
        this.graphics.fillCircle(this.btnWidth / 2 - radius, 0, radius);
        this.graphics.fillRect(-this.btnWidth / 2 + radius, -radius, this.btnWidth - radius * 2, this.btnHeight);

        // Border
        this.graphics.lineStyle(strokeWidth, this.mainColor, strokeAlpha);
        this.graphics.beginPath();
        this.graphics.arc(-this.btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        this.graphics.lineTo(this.btnWidth / 2 - radius, -radius);
        this.graphics.arc(this.btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    private setupInteractions(): void {
        this.hitZone.on('pointerover', () => {
            this.drawState(true);
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_HOVER,
                // Add slight vertical lift like original implementation
                y: this.y - 2,
                duration: 200,
                ease: 'Power2'
            });
        });

        this.hitZone.on('pointerout', () => {
            this.drawState(false);
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_RESET,
                y: this.y + 2,
                duration: 200,
                ease: 'Power2'
            });
        });

        this.hitZone.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_CLICK,
                onComplete: () => this.onClick()
            });
        });
    }

    /**
     * Update button label
     */
    setLabel(label: string): void {
        this.text.setText(label);
    }

    /**
     * Enable/disable button
     */
    setEnabled(enabled: boolean): void {
        this.hitZone.setInteractive(enabled ? { useHandCursor: true } : false);
        this.setAlpha(enabled ? 1 : 0.5);
    }
}
