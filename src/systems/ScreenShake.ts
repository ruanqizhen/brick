import Phaser from 'phaser';

export class ScreenShake {
    static shake(camera: Phaser.Cameras.Scene2D.Camera, intensity: number = 0.01, duration: number = 100) {
        camera.shake(duration, intensity);
    }
}
