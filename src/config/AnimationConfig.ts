/**
 * Centralized tween animation presets for consistent animations
 * Using these presets ensures visual consistency and reduces code duplication
 */

export const TWEEN_PRESETS = {
    // Button animations
    BUTTON_HOVER: {
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
    },
    BUTTON_RESET: {
        scaleX: 1,
        scaleY: 1,
        duration: 200,
    },
    BUTTON_CLICK: {
        scaleX: 0.98,
        scaleY: 0.98,
        duration: 100,
    },

    // Score animations
    SCORE_POP: {
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Back.out',
    },

    // Life lost animation
    LIFE_FLASH: {
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 3,
    },

    // Level change animation
    LEVEL_CHANGE: {
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.out',
    },

    // Menu title entrance
    TITLE_ENTRANCE: {
        scale: { from: 0.7, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 600,
        ease: 'Back.out',
    },

    // High score celebration
    HIGH_SCORE_CELEBRATE: {
        scaleX: { from: 1, to: 1.15 },
        scaleY: { from: 1, to: 1.15 },
        angle: { from: -3, to: 3 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    },

    // Menu appearance
    MENU_APPEAR: {
        scale: 1,
        alpha: 1,
        from: { scale: 0.8, alpha: 0 },
        duration: 400,
        ease: 'Back.out',
    },

    // Button stagger animation
    BUTTON_STAGGER: {
        alpha: 1,
        from: 0,
        duration: 250,
        stagger: 120,
    },

    // Pause menu container
    PAUSE_CONTAINER: {
        scale: { from: 0.5, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 600,
        ease: 'Back.out',
    },

    // Win overlay
    WIN_OVERLAY: {
        scale: 1,
        alpha: 1,
        from: { scale: 0.5, alpha: 0 },
        duration: 600,
        ease: 'Back.out',
    },

    // Hint text fade
    HINT_FADE: {
        alpha: { from: 0, to: 0.7 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
    },

    // Score counting animation
    SCORE_COUNT: {
        duration: 1500,
        ease: 'easeOutQuad',
    },
};

/**
 * Easing functions for custom tweens
 */
export const EASING = {
    easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),
    easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};
