/**
 * Generic object pool for efficient object reuse
 * Reduces garbage collection pressure by recycling objects instead of creating/destroying them
 */
export class ObjectPool<T extends Poolable> {
    private pool: T[] = [];
    private active: Set<T> = new Set();
    private createFn: () => T;
    private initialSize: number;

    constructor(createFn: () => T, initialSize: number = 10) {
        this.createFn = createFn;
        this.initialSize = initialSize;
        this.prepopulate(initialSize);
    }

    private prepopulate(count: number): void {
        for (let i = 0; i < count; i++) {
            const obj = this.createFn();
            obj.setPoolActive?.(false);
            this.pool.push(obj);
        }
    }

    get(): T {
        let obj: T;

        if (this.pool.length > 0) {
            obj = this.pool.pop()!;
        } else {
            obj = this.createFn();
        }

        obj.setPoolActive?.(true);
        this.active.add(obj);
        return obj;
    }

    release(obj: T): void {
        if (!this.active.has(obj)) return;

        this.active.delete(obj);
        obj.setPoolActive?.(false);
        obj.onRelease?.();
        this.pool.push(obj);
    }

    releaseAll(): void {
        this.active.forEach(obj => {
            obj.setPoolActive?.(false);
            obj.onRelease?.();
            this.pool.push(obj);
        });
        this.active.clear();
    }

    getActiveCount(): number {
        return this.active.size;
    }

    getPoolCount(): number {
        return this.pool.length;
    }

    getTotalCount(): number {
        return this.active.size + this.pool.length;
    }

    expand(count: number): void {
        this.prepopulate(count);
    }

    shrink(count: number): void {
        const removeCount = Math.min(count, this.pool.length);
        for (let i = 0; i < removeCount; i++) {
            const obj = this.pool.pop();
            if (obj && obj.destroy) {
                obj.destroy();
            }
        }
    }

    destroy(): void {
        this.releaseAll();
        this.pool.forEach(obj => {
            if (obj.destroy) {
                obj.destroy();
            }
        });
        this.pool = [];
        this.active.clear();
    }
}

export interface Poolable {
    setPoolActive?(active: boolean): void;
    onRelease?(): void;
    destroy?(): void;
}
