// apps/web/src/lib/animations.ts
// Centralized, reusable animation variants for Framer Motion

import { Variants } from 'framer-motion';

/**
 * Staggered list item animation with index-based delays
 * Perfect for animating lists, options, or menu items one by one
 */
export const staggeredListItem: Variants = {
    hidden: {
        opacity: 0,
        y: 15
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            delay: i * 0.1,
            ease: "easeOut",
        },
    }),
};

/**
 * Fade in from top animation
 */
export const fadeInDown: Variants = {
    hidden: {
        opacity: 0,
        y: -30
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

/**
 * Simple fade animation
 */
export const fadeIn: Variants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6
        }
    }
};

/**
 * Scale and rotate animation (for icons/badges)
 */
export const scaleRotate: Variants = {
    hidden: {
        scale: 0,
        rotate: -180
    },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10,
            delay: 0.2
        }
    }
};

/**
 * Container with staggered children
 */
export const staggerContainer: Variants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
    hidden: {
        x: -100,
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
    hidden: {
        x: 100,
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

/**
 * Custom stagger container generator
 * @param staggerDelay - Delay between children animations
 * @param delayChildren - Initial delay before starting
 */
export const createStaggerContainer = (
    staggerDelay: number = 0.1,
    delayChildren: number = 0,
    duration: number = 0.6
): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren
        }
    }
});

/**
 * Custom fade in animation generator
 * @param duration - Animation duration
 * @param delay - Animation delay
 * @param y - Vertical offset
 */
export const createFadeIn = (
    duration: number = 0.6,
    delay: number = 0,
    y: number = 30
): Variants => ({
    hidden: {
        opacity: 0,
        y
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration,
            delay,
            ease: "easeOut"
        }
    }
});

/**
 * Sparkle/floating animation for decorative elements
 * Combines fade-in with scale and infinite floating motion
 */
export const sparkleFloat: Variants = {
    hidden: {
        opacity: 0,
        scale: 0
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delay: 1,
            duration: 0.5,
        }
    },
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        }
    }
};

/**
 * Page-level container animation for orchestrating child animations
 * No initial delay, just controls stagger timing
 */
export const pageContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,  // Or pull from config
            staggerChildren: 0.1,
        },
    },
};

/**
 * Universal fade/scale/move animation generator
 */
export const createEntranceAnimation = (
    y: number = 30,
    scale: number = 1,
    duration: number = 0.6
): Variants => ({
    hidden: {
        opacity: 0,
        y,
        scale
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration,
            ease: "easeOut",
        },
    },
});

/**
 * Generator for menu/list items with staggered entrance and exit
 * @param yOffset - Initial Y offset for hidden state
 * @param exitY - Y offset for exit animation
 * @param staggerDelay - Delay multiplier for each item
 * @param duration - Animation duration
 */
export const createMenuItemStagger = (
    yOffset: number = 30,
    exitY: number = -20,
    staggerDelay: number = 0.1,
    duration: number = 0.6
): Variants => ({
    hidden: {
        opacity: 0,
        y: yOffset,
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * staggerDelay,
            duration,
            ease: "easeOut"
        }
    }),
    exit: {
        opacity: 0,
        y: exitY,
        transition: {
            duration: duration * 0.5  // Exit is typically faster
        }
    }
});

/**
 * Generator for hover opacity transitions
 * @param hiddenOpacity - Opacity when hidden
 * @param visibleOpacity - Opacity when visible
 * @param hoverOpacity - Opacity on hover
 */
export const createHoverOpacity = (
    hiddenOpacity: number = 0.3,
    visibleOpacity: number = 0.5,
    hoverOpacity: number = 0.8
): Variants => ({
    hidden: { opacity: hiddenOpacity },
    visible: { opacity: visibleOpacity },
    hover: { opacity: hoverOpacity }
});

/**
 * Generator for text style transformations on hover
 * @param hoverStyle - CSS properties to apply on hover
 * @param duration - Transition duration
 */
export const createHoverTextStyle = (
    hoverStyle: Record<string, any>,
    duration: number = 0.3
): Variants => ({
    hidden: { fontStyle: "normal" },
    visible: { fontStyle: "normal" },
    hover: {
        ...hoverStyle,
        transition: { duration, ease: "easeInOut" }
    }
});

/**
 * Generator for dropdown/popup animations with customizable direction
 * @param yOffset - Initial Y offset (negative for top, positive for bottom)
 * @param scale - Initial scale factor
 * @param enterDuration - Duration for entrance animation
 * @param exitDuration - Duration for exit animation
 */
export const createDropdown = (
    yOffset: number = -10,
    scale: number = 0.95,
    enterDuration: number = 0.2,
    exitDuration: number = 0.15
): Variants => ({
    hidden: {
        opacity: 0,
        scale,
        y: yOffset
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: enterDuration,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        scale,
        y: yOffset,
        transition: {
            duration: exitDuration
        }
    }
});

/**
 * @param staggerDelay - Delay between each item (default 0.1s)
 * @param duration - Animation duration for each item (default 0.4s)
 * @param yOffset - Initial Y offset (default 15px)
 */
export const createStaggeredListItem = (
    staggerDelay: number = 0.1,
    duration: number = 0.4,
    yOffset: number = 15
): Variants => ({
    hidden: {
        opacity: 0,
        y: yOffset
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration,
            delay: i * staggerDelay,
            ease: "easeOut",
        },
    }),
});

/**
 * Generator for animations with external index-based delays
 * @param yOffset - Initial Y offset
 * @param scale - Initial scale
 * @param duration - Animation duration
 * @param index - Item index for stagger calculation
 * @param staggerDelay - Delay between items
 */
export const createIndexedAnimation = (
    yOffset: number = 30,
    scale: number = 0.95,
    duration: number = 0.6,
    index: number = 0,
    staggerDelay: number = 0.1
): Variants => ({
    hidden: {
        opacity: 0,
        y: yOffset,
        scale
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration,
            ease: "easeOut",
            delay: index * staggerDelay,
        },
    },
});