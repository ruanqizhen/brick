import Phaser from 'phaser';
import { TWEEN_PRESETS } from '../config/AnimationConfig';

export interface ButtonConfig {
    label: string;
    color: number;
    hoverColor?: number;
    width?: number;
    height?: number;
    fontSize?: string;
    onClick: () => void;
}

const DEFAULTS = {
    WIDTH: 280,
    HEIGHT: 70,
    FONT_SIZE: '36px',
    HOVER_COLOR_BRIGHTNESS: 30,
};

/**
 * Reusable button component with consistent styling and animations
 */
export class UIButton extends Phaser.GameObjects.Container {
    private bg!: Phaser.GameObjects.Rectangle;
    private text!: Phaser.GameObjects.Text;
    private onClick: () => void;
    private color: number;
    private hoverColor?: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        config: ButtonConfig
    ) {
        super(scene, x, y);

        this.onClick = config.onClick;
        this.color = config.color;
        this.hoverColor = config.hoverColor;

        const width = config.width ?? DEFAULTS.WIDTH;
        const height = config.height ?? DEFAULTS.HEIGHT;
        const fontSize = config.fontSize ?? DEFAULTS.FONT_SIZE;

        // Background
        this.bg = scene.add.rectangle(0, 0, width, height, this.color);
        this.bg.setOrigin(0.5);
        this.bg.setStrokeStyle(3, 0xffffff, 0.8);

        // Inner highlight
        const highlight = scene.add.rectangle(
            -width / 2 + 10,
            -height / 2 + 10,
            width - 20,
            height / 2 - 10,
            0xffffff,
            0.15
        );
        highlight.setOrigin(0);

        // Text
        this.text = scene.add.text(0, 0, config.label, {
            fontSize,
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                blur: 8,
                color: '#000000',
                fill: true,
                offsetX: 2,
                offsetY: 2
            }
        }).setOrigin(0.5);

        this.add([this.bg, highlight, this.text]);
        this.setSize(width, height);
        this.setDepth(100);

        // Interaction
        this.bg.setInteractive({ useHandCursor: true });
        this.setupInteractions();
    }

    private setupInteractions(): void {
        this.bg.on('pointerover', () => {
            const hoverColor = this.hoverColor ?? this.brightenColor(this.color, DEFAULTS.HOVER_COLOR_BRIGHTNESS);
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_HOVER,
                ease: 'Back.out'
            });
            this.bg.setFillStyle(hoverColor);
        });

        this.bg.on('pointerout', () => {
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_RESET,
                ease: 'Back.out'
            });
            this.bg.setFillStyle(this.color);
        });

        this.bg.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this,
                ...TWEEN_PRESETS.BUTTON_CLICK
            });
        });

        this.bg.on('pointerup', () => {
            this.onClick();
        });
    }

    private brightenColor(color: number, amount: number): number {
        const r = Math.min(255, ((color >> 16) & 0xFF) + amount);
        const g = Math.min(255, ((color >> 8) & 0xFF) + amount);
        const b = Math.min(255, (color & 0xFF) + amount);
        return Phaser.Display.Color.GetColor(r, g, b);
    }

    /**
     * Update button label
     */
    setLabel(label: string): void {
        this.text.setText(label);
    }

    /**
     * Update button color
     */
    setColor(color: number): void {
        this.color = color;
        this.bg.setFillStyle(color);
    }

    /**
     * Enable/disable button
     */
    setEnabled(enabled: boolean): void {
        this.bg.setInteractive(enabled ? { useHandCursor: true } : false);
        this.setAlpha(enabled ? 1 : 0.5);
    }
}
