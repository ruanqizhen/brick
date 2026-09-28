import Phaser from 'phaser';

/**
 * 休眠：将 body 移出 Matter 世界，不再参与 broadphase 与碰撞检测。
 * world.remove 对已移出的 body 是 no-op，可重复调用。
 */
export function removeBodyFromWorld(obj: Phaser.Physics.Matter.Image): void {
    const body = obj.body as MatterJS.BodyType | null;
    const world = obj.world;
    if (!body || !world) return;
    if (world.has(body)) {
        world.remove(body);
    }
}

/**
 * 取用：将 body 加回 Matter 世界。world.has 守卫防止重复加入。
 */
export function addBodyToWorld(obj: Phaser.Physics.Matter.Image): void {
    const body = obj.body as MatterJS.BodyType | null;
    const world = obj.world;
    if (!body || !world) return;
    if (!world.has(body)) {
        world.add(body);
    }
}
