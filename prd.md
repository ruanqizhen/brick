# 弹力砖块消除游戏 (brick) 

## 一、项目概述与技术约束

### 1.1 项目目标

开发一款基于物理反射的砖块消除游戏（Breakout/Arkanoid 风格），具备现代视觉效果、道具系统、多端适配。游戏需流畅运行于桌面端（鼠标/键盘）与移动端（触摸）。

### 1.2 强制技术栈

```
引擎:    Phaser 4（最新稳定版，原生 ESM）
构建:    Vite 6.x
语言:    TypeScript 5.x（严格模式 strict: true）
物理:    自定义轻量级碰撞解算器（球体反射）+ Matter.js（碎片粒子）
存储:    IndexedDB（游戏进度持久化）
音效:    Web Audio API
```

### 1.3 项目结构约定

```
src/
├── main.ts                  # 入口
├── config/
│   ├── GameConfig.ts        # 全局常量（速度、尺寸、颜色等）
│   └── LevelData.ts         # 关卡配置数据
├── scenes/
│   ├── BootScene.ts         # 资源预加载
│   ├── MenuScene.ts         # 主菜单
│   ├── GameScene.ts         # 核心游戏场景
│   └── GameOverScene.ts     # 结束场景
├── entities/
│   ├── Ball.ts              # 小球实体
│   ├── Paddle.ts            # 挡板实体
│   ├── Brick.ts             # 砖块实体
│   └── PowerUp.ts           # 道具实体
├── systems/
│   ├── CollisionSystem.ts   # 碰撞检测与响应
│   ├── PhysicsSystem.ts     # 物理模拟（含摩擦旋转）
│   ├── PowerUpSystem.ts     # 道具管理
│   ├── ParticleSystem.ts    # 粒子特效
│   └── ScreenShake.ts       # 屏幕抖动
├── ui/
│   ├── HUD.ts               # 分数/生命显示
│   └── PauseMenu.ts         # 暂停菜单
├── audio/
│   └── AudioManager.ts      # 音效/BGM 管理
├── storage/
│   └── SaveManager.ts       # IndexedDB 存储
└── utils/
    ├── MathUtils.ts         # 数学辅助函数
    └── ResponsiveUtils.ts   # 响应式适配工具
```

---

## 二、核心实体规格

### 2.1 画布与分辨率

```typescript
// GameConfig.ts 中定义
export const DESIGN_WIDTH  = 1080;
export const DESIGN_HEIGHT = 1920;
export const ASPECT_RATIO  = DESIGN_WIDTH / DESIGN_HEIGHT; // 9:16

// Phaser 配置
const config: Phaser.Types.Core.GameConfig = {
  width:  DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,          // 等比缩放
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#000010',
};
```

**桌面端**: Canvas 居中，两侧黑色背景填充。
**移动端**: 全屏显示，`Phaser.Scale.FIT` 自动处理。

---

### 2.2 挡板 (Paddle)

**位置**: Y 轴固定在 `DESIGN_HEIGHT * 0.90`（底部向上 10%）。

**移动约束**:
- 仅 X 轴运动，不超出左右墙壁（`x ∈ [paddleWidth/2, DESIGN_WIDTH - paddleWidth/2]`）
- 记录当前帧速度 `velocityX` 用于摩擦力计算

**碰撞体形状**: 椭圆形平板（中间厚、两端薄），使用自定义多边形碰撞体：

```typescript
// 伪代码：上表面使用椭圆弧，模拟中厚边薄的形态
// 实际用 Phaser Graphics 绘制圆角矩形，碰撞体用矩形近似即可
class Paddle {
  width:    number = 200;   // 初始宽度
  height:   number = 24;
  velocityX: number = 0;   // 本帧水平速度（用于摩擦力计算）
  prevX:    number = 0;

  update(pointer: Phaser.Input.Pointer) {
    this.prevX = this.x;
    // ... 移动逻辑
    this.velocityX = this.x - this.prevX;
  }
}
```

**输入映射**:

| 平台 | 输入 | 行为 |
|------|------|------|
| 桌面 | `pointermove` | 挡板 X = 鼠标 X |
| 桌面 | `A / ←` | 挡板匀速左移 |
| 桌面 | `D / →` | 挡板匀速右移 |
| 移动 | `touchmove`（相对位移） | 手指位移量叠加到挡板 X |

> **移动端关键**: 使用相对位移算法，避免手指遮挡挡板。记录 `touchStartX`，每帧更新 `paddle.x += (touch.clientX - prevTouchX)`。

---

### 2.3 小球 (Ball)

**状态机**:

```
[READY] ──── 点击/空格键 ────> [MOVING]
              ↑                    |
              └──── 失去生命 ───────┘
```

**READY 态**: 吸附在挡板靠近中心随机位置的上方，随挡板水平移动。

**MOVING 态**:
- 速度向量 `(vx, vy)`，每帧移动 `speed` 个像素
- 初始发射角度：垂直向上偏移一定角度，与放置位置相关，越边缘偏移角越大，并增加 ±5° 随机值。
- 初始速度：`BASE_SPEED = 12`（像素/帧 @ 60FPS）

**碰撞体**: 圆形，半径 `BASE_RADIUS = 10`。

**拖尾粒子**: 每帧在球尾留下渐隐粒子，颜色随速度变化：
```
速度 < 1.0× BASE_SPEED  →  冷蓝色  #4FC3F7
速度 1.0–1.5×            →  白色    #FFFFFF
速度 1.5–2.0×            →  橙色    #FF8C00
速度 > 2.0×              →  赤红色  #FF1744
```

---

### 2.4 砖块 (Brick)

**网格布局**: 由关卡配置数据定义行列数，每块砖有固定宽高和间距。

**砖块类型**:

| 类型 | 标识 | 颜色 | 生命值 | 特性 |
|------|------|------|--------|------|
| 普通砖 | `NORMAL` | 渐变彩色 | 1 | 击碎得分，可掉落道具 |
| 硬砖（2HP） | `HARD_2` | 深灰 | 2 | 受击变色提示剩余耐久 |
| 硬砖（3HP） | `HARD_3` | 深红 | 3 | 同上 |
| 金刚砖 | `INDESTRUCTIBLE` | 金属银 | ∞ | 不可破坏，仅反弹 |

**耐久度颜色映射**（硬砖受击后变色）:
```
3HP 未受击: #B71C1C（暗红）
2HP 受击1次: #EF6C00（橙）
1HP 受击2次: #F9A825（黄）
```

**砖块得分**:
```
普通砖: 100分
硬砖（每次击中）: 50分
```

---

## 三、物理系统（核心）

### 3.1 基础碰撞反射

所有碰撞使用 AABB（轴对齐包围盒）+ 圆形相交检测，并判断碰撞法线方向：

```typescript
// CollisionSystem.ts
function resolveCircleAABB(ball: Ball, rect: Rect): CollisionResult {
  // 求球心到矩形最近点的向量
  const nearestX = clamp(ball.x, rect.left, rect.right);
  const nearestY = clamp(ball.y, rect.top, rect.bottom);
  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;

  if (dx * dx + dy * dy > ball.radius * ball.radius) return null;

  // 判断碰撞面：水平还是垂直
  const overlapX = ball.radius - Math.abs(dx);
  const overlapY = ball.radius - Math.abs(dy);

  if (overlapX < overlapY) {
    // 撞击垂直面（左/右）
    ball.vx *= -1;
    ball.x += dx > 0 ? overlapX : -overlapX; // 位置修正，防止穿透
  } else {
    // 撞击水平面（上/下）
    ball.vy *= -1;
    ball.y += dy > 0 ? overlapY : -overlapY;
  }
}
```

**墙壁反射**:
- 左墙/右墙: `vx = -vx`
- 顶墙: `vy = -vy`
- 底部穿出: 触发失命逻辑

---

### 3.2 挡板碰撞（关键体验）

调用 Phaser 碰撞检测功能。
比如
```typescript
this.physics.add.collider(ball, paddle, handleHit, null, this);
```

```typescript
// PhysicsSystem.ts
function handlePaddleCollision(ball: Ball, paddle: Paddle): void {
  if (!isCircleHittingRect(ball, paddle)) return;

  // 1. 计算撞击相对位置（-1 到 +1）
  const hitFactor = (ball.x - paddle.x) / (paddle.width / 2);
  const clampedFactor = clamp(hitFactor, -1, 1);

  // 2. 计算基础反射速度
  const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
  ball.vx = clampedFactor * MAX_SPEED;

  // 3. 应用摩擦力旋转（增强物理）
  // 挡板水平速度 paddleVx 传导给球，修正反射角
  const FRICTION_COEFF = 0.3;
  const angleModifier = Math.atan(FRICTION_COEFF * paddle.velocityX);
  const currentAngle = Math.atan2(-ball.vy, ball.vx);
  const newAngle = currentAngle + angleModifier;

  ball.vx = speed * Math.cos(newAngle);
  ball.vy = -Math.abs(speed * Math.sin(newAngle)); // vy 始终为负（向上）

  // 4. 防止近水平角度（最小仰角 15°）
  const minAngle = Math.PI / 12; // 15度
  if (Math.abs(ball.vy) < speed * Math.sin(minAngle)) {
    ball.vy = -speed * Math.sin(minAngle);
    ball.vx = speed * Math.cos(minAngle) * Math.sign(ball.vx);
  }

  // 5. 位置修正
  ball.y = paddle.y - paddle.height / 2 - ball.radius;
}
```

> **重要**: `vy` 在挡板碰撞后**永远为负值**（确保球向上运动），防止球卡在挡板内反复触发。

---

### 3.3 速度恒定性

球速不应随时间衰减，每帧结束后归一化：

```typescript
// 保持速度恒定
function normalizeSpeed(ball: Ball): void {
  const currentSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
  if (currentSpeed === 0) return;
  const factor = ball.targetSpeed / currentSpeed;
  ball.vx *= factor;
  ball.vy *= factor;
}
```

---

## 四、道具系统

### 4.1 掉落机制

- 击碎普通砖时有 `DROP_CHANCE = 0.2`（20%）概率掉落道具胶囊
- 道具沿 Y 轴向下匀速下落
- 挡板接触道具胶囊触发效果，未接住的道具超出底部销毁

### 4.2 道具类型

| 图标 | ID | 名称 | 效果 | 持续时间 |
|------|----|------|------|----------|
| 💊 | `PADDLE_EXPAND` | 扩张 | 挡板宽度 ×1.5 | 永久 |
| 🔹 | `PADDLE_SHRINK` | 缩小 | 挡板宽度 ×0.6 | 永久 |
| ☄️ | `FIREBALL` | 火球 | 球穿透普通砖；撞金刚砖时金刚砖碎并反弹 | 8秒 |
| 🧬 | `MULTI_BALL` | 分裂 | 立即产生 3 个球同时在场 | 永久（直到失命） |
| ⬆️ | `BALL_ENLARGE` | 增大球 | 球半径 ×1.4 | 永久 |
| ⬇️ | `BALL_SHRINK` | 缩小球 | 球半径 ×0.7 | 永久 |
| ⚡ | `SPEED_UP` | 加速 | 球速 ×1.3 | 8秒 后逐步减慢直到恢复正常 |
| 🐌 | `SPEED_DOWN` | 减速 | 球速 ×0.7 | 8秒 后逐步加快直到恢复正常 |

### 4.3 道具叠加规则

所有道具均可叠加，但限制挡板最大宽度不能超过频幕宽度的 70%。


---

## 五、视觉反馈系统（Juiciness）

### 5.1 屏幕抖动

```typescript
// ScreenShake.ts
class ScreenShake {
  shake(camera: Phaser.Cameras.Scene2D.Camera, intensity: number, duration: number): void {
    camera.shake(duration, intensity);
  }
}

// 使用时机与强度
// 击碎普通砖:    intensity=2,  duration=60ms
// 击碎硬砖:      intensity=4,  duration=80ms
// 球撞底部失命:  intensity=8,  duration=150ms
// 挡板重击:      intensity=3,  duration=50ms
```

### 5.2 Hitstop（时间冻结）

击碎瞬间游戏逻辑暂停 `50ms`：

```typescript
// 实现方式：修改 Phaser 场景的 timeScale
function triggerHitstop(scene: Phaser.Scene, duration: number = 50): void {
  scene.physics.world.timeScale = 10; // 极慢
  scene.time.delayedCall(duration, () => {
    scene.physics.world.timeScale = 1;
  });
}
```

### 5.3 砖块破碎粒子

```typescript
// ParticleSystem.ts
function spawnBrickParticles(scene: Phaser.Scene, x: number, y: number, color: number): void {
  const count = Phaser.Math.Between(6, 10);
  for (let i = 0; i < count; i++) {
    // 创建小矩形像素碎片
    // 随机速度向量（向四方飞散）
    // 受重力影响（vy += GRAVITY each frame）
    // alpha 随时间衰减，消失时销毁
  }
}
```

### 5.4 慢动作（Slo-mo）

触发条件：场景内仅剩最后一块可破坏砖块时：

```typescript
function enterSlowMotion(scene: Phaser.Scene): void {
  scene.tweens.add({
    targets: scene,
    timeScale: 0.2,     // 降速到 20%
    duration: 200,
    onComplete: () => {
      // 击碎后恢复
    }
  });
  // 同时触发屏幕抖动
  screenShake.shake(scene.cameras.main, 5, 200);
}
```

### 5.5 渲染层级

```
Layer 0: 动态星空背景（Shader / TileSprite 滚动）
Layer 1: 砖块层（Phaser Group，实例化渲染）
Layer 2: 挡板、球、道具胶囊
Layer 3: 粒子特效（独立粒子池）
Layer 4: HUD（score, lives, 道具状态图标）
Layer 5: Post-FX（Bloom 高光溢出，增强霓虹感）
```

> 使用 Phaser 的 `setDepth()` 控制层级顺序。

---

## 六、关卡系统

### 6.1 关卡数据格式

```typescript
// config/LevelData.ts
interface BrickRow {
  type: 'NORMAL' | 'HARD_2' | 'HARD_3' | 'INDESTRUCTIBLE' | 'EMPTY';
  color?: number; // 仅 NORMAL 砖有效
}

interface LevelConfig {
  id: number;
  cols: number;       // 列数（推荐 8–12）
  rows: number;       // 行数（推荐 5–10）
  brickWidth: number;
  brickHeight: number;
  brickPaddingX: number;
  brickPaddingY: number;
  offsetTop: number;  // 砖块区域顶部偏移
  grid: BrickRow[][];  // grid[row][col]
  bgColor?: number;
}
```

### 6.2 胜利与失败

- **胜利**: 场景内所有非 `INDESTRUCTIBLE` 砖块被消灭 → 进入下一关（或显示通关画面）
- **失败**: `lives <= 0` → 显示 Game Over 画面。每一局要有时间限制，超时也算做失败。

---

## 七、响应式与多端适配

### 7.1 画布适配

```typescript
// Phaser Scale Manager 配置
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 1080,
  height: 1920,
  parent: 'game-container',
}
```

### 7.2 桌面端两侧填充

```html


  body { margin: 0; background: #000; display: flex; justify-content: center; }
  #game-container { position: relative; }

```

### 7.3 移动端触摸相对位移

```typescript
// InputManager.ts
let lastTouchX = 0;

scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
  lastTouchX = p.x;
});

scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
  if (!p.isDown) return; // 仅触摸/鼠标按下时生效（移动端）
  const delta = p.x - lastTouchX;
  paddle.x = clamp(paddle.x + delta, paddleHalfW, DESIGN_WIDTH - paddleHalfW);
  lastTouchX = p.x;
});
```

> **注意**: 桌面端鼠标使用绝对坐标映射（`paddle.x = pointer.x`），移动端使用相对位移。通过 `scene.sys.game.device.input.touch` 判断设备类型。

---

## 八、音效系统

### 8.1 Web Audio API 封装

```typescript
// AudioManager.ts
class AudioManager {
  ctx: AudioContext;

  playHit(variant: 'normal' | 'hard' | 'indestructible'): void { /* 短促打击音 */ }
  playPaddleHit(): void { /* 挡板弹击音 */ }
  playPowerUpCollect(): void { /* 道具拾取音 */ }
  playBallLost(): void { /* 失球音效 */ }
  playBGM(): void { /* 循环背景音乐，含循环点优化 */ }
  stopBGM(): void {}
  setVolume(v: number): void {}
}
```

### 8.2 音效规格

- 所有音效使用 Web Audio API 程序化生成（振荡器 + 滤波器）或加载 `.ogg`/`.mp3` 文件
- BGM 设置精确循环点，避免循环间隙
- 移动端音频需在用户首次触摸后解锁（`AudioContext.resume()`）

---

## 九、存储系统

```typescript
// SaveManager.ts
interface GameSave {
  currentLevel: number;
  highScore: number;
  lives: number;
  unlockedLevels: number[];
}

class SaveManager {
  async save(data: GameSave): Promise { /* IndexedDB write */ }
  async load(): Promise { /* IndexedDB read */ }
  async clear(): Promise { /* 清档 */ }
}
```

---

## 十、性能规格与要求

| 指标 | 要求 |
|------|------|
| 目标帧率 | 60FPS（支持 120Hz 自适应） |
| 砖块数量 | 单关最多 200 块，使用 Phaser Group 批量渲染 |
| 粒子上限 | 场景同时最多 500 个粒子（使用对象池） |
| 初始加载 | 首屏 < 3s（Vite 代码分割） |
| 图片资源 | 所有图片使用 WebP 格式 |

---

## 十一、开发阶段与验收标准

### 阶段 1：基础框架搭建

**任务**:
1. 初始化 Vite + Phaser 4 + TypeScript 项目结构
2. 实现 `Ball` 和 `Paddle` 基础移动
3. 实现最简碰撞检测（墙壁 + 挡板）
4. 实现挡板分区域反射公式

**验收标准**:
- [ ] 球能正确在三面墙壁反弹
- [ ] 球撞挡板左侧向左偏转，撞中心向上，撞右侧向右偏转
- [ ] 桌面鼠标控制挡板流畅无抖动
- [ ] 移动端触摸相对位移工作正常

---

### 阶段 2：砖块系统

**任务**:
1. 实现 `Brick` 类与 `LevelData` 解析
2. 实现砖块网格渲染（基于第一关配置）
3. 实现球与砖块碰撞（含耐久度、类型判断）
4. 实现分数计算

**验收标准**:
- [ ] 普通砖一击消失，产生分数
- [ ] 硬砖受击变色，3 击消失
- [ ] 金刚砖不消失，仅反弹
- [ ] 关卡砖块清空后触发胜利逻辑

---

### 阶段 3：物理增强与手感优化

**任务**:
1. 实现摩擦力旋转公式（`θr = θi + arctan(k·Vp)`）
2. 防穿透位置修正
3. 防近水平角度锁死
4. 实现 `ScreenShake`、`Hitstop` 类
5. 实现砖块破碎粒子（像素碎片带重力）

**验收标准**:
- [ ] 快速移动挡板时球的轨迹发生可感知的偏转
- [ ] 球不会穿透砖块或挡板
- [ ] 球不会进入近水平角度死循环
- [ ] 击碎砖块有屏幕抖动和粒子飞溅

---

### 阶段 4：道具系统

**任务**:
1. 实现 `PowerUp` 掉落、下落、接触检测
2. 实现所有 8 种道具效果
3. 实现道具计时器和 HUD 状态显示

**验收标准**:
- [ ] 所有道具效果正确触发
- [ ] 同类道具叠加时正确刷新计时器
- [ ] HUD 显示当前激活道具及剩余时间

---

### 阶段 5：视觉增强与多端适配

**任务**:
1. 实现球拖尾粒子（颜色随速度变化）
2. 实现慢动作（最后一块砖时触发）
3. 实现 Bloom Post-FX
4. 实现动态星空背景
5. 全平台输入适配与响应式布局验证

**验收标准**:
- [ ] 游戏在 Chrome/Safari 桌面端 60FPS 稳定运行
- [ ] 游戏在 iOS Safari / Android Chrome 正常运行且触控流畅
- [ ] 视觉效果（拖尾、粒子、Bloom）均正常显示
- [ ] 最后一块砖触发慢动作效果

---

## 十二、关键实现注意事项

### ⚠️ 高优先级问题

1. **球速恒定**: 任何碰撞后都需调用 `normalizeSpeed()`，防止速度因浮点误差累积或道具效果错乱
2. **防穿透**: 每帧使用连续碰撞检测（CCD），当球速 > 球直径时必须分步检测
3. **vy 符号**: 挡板碰撞后 `vy` **必须为负**（向上），用 `Math.abs()` 强制保证
4. **多球逻辑**: 分裂道具产生多球时，失命只在**所有球**均落出底部时触发
5. **AudioContext 解锁**: 移动端在首次用户交互（`pointerdown`）时调用 `audioCtx.resume()`
6. **IndexedDB 异步**: 所有存储操作使用 `async/await`，游戏启动时先等待 `load()` 完成

### 📝 代码规范

- 使用 TypeScript 严格模式，所有函数参数和返回值必须有类型注解
- 常量统一在 `GameConfig.ts` 中定义，禁止魔法数字散落在代码中
- 每个系统类（`CollisionSystem`、`PowerUpSystem` 等）负责单一职责
- 使用 Phaser 的 `EventEmitter` 进行跨系统通信（如砖块被击碎通知 PowerUpSystem 尝试掉落道具）

---

## 十三、快速开始命令

```bash
# 初始化项目
npm create vite@latest brick-breaker -- --template vanilla-ts
cd brick-breaker
npm install phaser@latest
npm install matter-js @types/matter-js
npm install --save-dev typescript @types/node

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```
