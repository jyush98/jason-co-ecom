// Gallery animation and layout configuration
export const GALLERY_CONFIG = {
    // Scroll section heights (in vh units) - increased for smoother scrolling
    SECTION_HEIGHT: 120,
    
    // Animation timing values
    TRANSITIONS: {
      // How far items overlap during transitions (0.6 = 60% overlap)
      OVERLAP_FACTOR: 0.6,
      
      // Opacity fade timing - more gradual
      FADE_IN_START: 1.0,
      FADE_VISIBLE_START: 0.4,
      FADE_VISIBLE_END: 0.4,
      FADE_OUT_END: 1.0,
      
      // Horizontal movement timing - smoother
      ENTER_START: 1.2,
      ENTER_CENTERED: 0.3,
      EXIT_CENTERED: 0.3,
      EXIT_END: 1.2,
      
      // Scale effect timing
      SCALE_START: 0.8,
      SCALE_CENTERED: 0.15,
      SCALE_MIN: 0.95,
      SCALE_MAX: 1.0,
      
      // Rotation effect - reduced for smoother feel
      ROTATION_RANGE: 6, // degrees (reduced from 10)
      ROTATION_TRANSITION: 1.0,
    },
    
    // Title animation
    TITLE: {
      FADE_OVERLAP: 0.8,
      VERTICAL_MOVEMENT: 15, // pixels (reduced)
      FADE_OUT_START: 0.3, // when to start fading out before end form
    },
    
    // End form animation
    END_FORM: {
      FADE_IN_START: 0.5, // relative to last item
      SCALE_START: 0.3,
      ANIMATION_DELAYS: {
        TITLE: 0.3,
        DESCRIPTION: 0.5,
        BUTTONS: 0.7,
        CONTACT: 1.0,
      }
    },
    
    // Scroll snap settings - precise snapping to items
    SCROLL: {
      SNAP_TYPE: "y mandatory", // Back to mandatory for precise control
      SNAP_ALIGN: "center", // Center alignment for precise positioning
      SNAP_STOP: "always", // Always stop at snap points
      BEHAVIOR: "smooth",
    }
  } as const;
  
  // Type for better TypeScript support
  export type GalleryConfig = typeof GALLERY_CONFIG;