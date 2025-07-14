"use client";

import Gallery from "./Gallery";

export default function GalleryPage() {
    return (
        <main 
            className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]"
            style={{
                scrollBehavior: "smooth",
                scrollSnapType: "y mandatory",
                // Make scrolling more responsive
                overscrollBehavior: "none"
            }}
        >
            <Gallery />
            
            <style jsx global>{`
                /* Enhanced scroll snap for quicker transitions */
                html {
                    scroll-snap-type: y mandatory;
                    scroll-behavior: smooth;
                }
                
                /* Reduce scroll momentum for more responsive snapping */
                body {
                    -webkit-overflow-scrolling: touch;
                    scroll-snap-type: y mandatory;
                }
                
                /* Make scroll snapping more aggressive */
                @media (prefers-reduced-motion: no-preference) {
                    html {
                        scroll-snap-type: y mandatory;
                    }
                }
            `}</style>
        </main>
    );
}