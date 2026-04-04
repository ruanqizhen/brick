import Phaser from 'phaser';
import { Brick } from '../entities/Brick';

/**
 * Represents a single crack line segment in local brick space (centered on brick center).
 */
export interface CrackSegment {
    points: { x: number; y: number }[];
    color: number;
    alpha: number;
    lineWidth: number;
}

/**
 * Batched crack renderer — replaces per-brick Graphics objects.
 * All cracks are stored as local-space line data and drawn in a single Graphics call.
 * Brick positions are tracked for world-space transformation at render time.
 */
export class CrackRenderer {
    private scene: Phaser.Scene;
    private graphics: Phaser.GameObjects.Graphics;
    // Map brick ID -> crack segments (in local space)
    private cracks: Map<string, CrackSegment[]> = new Map();
    // Map brick ID -> brick reference (for world position lookup)
    private brickRefs: Map<string, Brick> = new Map();
    private dirty = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(100); // Above all bricks
    }

    /**
     * Register a brick reference so we can look up its world position at render time.
     */
    registerBrick(brickId: string, brick: Brick): void {
        this.brickRefs.set(brickId, brick);
    }

    /**
     * Remove a brick from the renderer (on release/destruction).
     */
    removeBrick(brickId: string): void {
        this.cracks.delete(brickId);
        this.brickRefs.delete(brickId);
        this.dirty = true;
    }

    /**
     * Set crack data for a brick (in local brick space).
     * The brick sends its full accumulated crack set — we replace.
     */
    setCracks(brickId: string, segments: CrackSegment[]): void {
        if (segments.length === 0) {
            this.cracks.delete(brickId);
        } else {
            this.cracks.set(brickId, segments);
        }
        this.dirty = true;
    }

    /**
     * Mark that this brick's position may have changed (for moving bricks).
     */
    markDirty(brickId: string): void {
        if (this.cracks.has(brickId)) {
            this.dirty = true;
        }
    }

    /**
     * Redraw all cracks in a single batched pass. Only runs if something changed.
     * Transforms local-space crack coordinates to world space using each brick's position.
     */
    render(): void {
        if (!this.dirty) return;

        this.graphics.clear();

        for (const [brickId, segments] of this.cracks) {
            const brick = this.brickRefs.get(brickId);
            if (!brick || !brick.active || !brick.visible) continue;

            const bx = brick.x;
            const by = brick.y;

            for (const seg of segments) {
                this.graphics.lineStyle(seg.lineWidth, seg.color, seg.alpha);
                this.graphics.beginPath();

                const pts = seg.points;
                this.graphics.moveTo(bx + pts[0].x, by + pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    this.graphics.lineTo(bx + pts[i].x, by + pts[i].y);
                }
                this.graphics.strokePath();
            }
        }

        this.dirty = false;
    }

    /**
     * Set visibility of the entire crack layer.
     */
    setVisible(visible: boolean): void {
        this.graphics.setVisible(visible);
    }

    destroy(): void {
        this.graphics.destroy();
        this.cracks.clear();
        this.brickRefs.clear();
    }
}
