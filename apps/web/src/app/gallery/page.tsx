"use client";

import Gallery from "./Gallery";

export default function GalleryPage() {
    return (
        <main 
            className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]"
            style={{
                scrollSnapType: "y mandatory",
                overscrollBehavior: "none"
            }}
        >
            <Gallery />
            
            <style jsx global>{`
                /* Slower, more elegant scroll snapping */
                html {
                    scroll-snap-type: y mandatory;
                    scroll-behavior: smooth;
                    /* Custom scroll timing - slower and more elegant */
                    scroll-padding-top: var(--navbar-height);
                }
                
                /* Enhanced smooth scrolling with custom timing */
                * {
                    scroll-behavior: smooth;
                }
                
                /* Slower scroll transitions */
                @media (prefers-reduced-motion: no-preference) {
                    html {
                        scroll-snap-type: y mandatory;
                        /* Smoother, slower transitions */
                        scroll-behavior: smooth;
                    }
                    
                    /* Add custom scroll timing via CSS animation */
                    body {
                        animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                }
                
                /* Make scroll snapping more deliberate and slower */
                body {
                    -webkit-overflow-scrolling: touch;
                    scroll-snap-type: y mandatory;
                    /* Slower scroll momentum */
                    scroll-behavior: smooth;
                }
                
                /* Custom scroll timing for webkit browsers */
                @supports (-webkit-scroll-snap-type: y mandatory) {
                    html {
                        -webkit-scroll-snap-type: y mandatory;
                        -webkit-scroll-behavior: smooth;
                    }
                }
            `}</style>
        </main>
    );
}