// app/gallery/page.tsx
"use client";

import Gallery from "./Gallery";
import { BreadcrumbSchema } from '@/components/seo/SchemaMarkup';
import { useEffect, useState } from 'react';

/**
 * SEO-Optimized Gallery Page for Jason & Co. Luxury Jewelry
 * 
 * Business Impact:
 * - Visual storytelling SEO for brand authority
 * - Image optimization for Google Images ranking
 * - Gallery-specific social media optimization
 * - Enhanced user engagement and brand perception
 * 
 * SEO Features:
 * - Gallery-focused metadata and keywords
 * - Image gallery structured data
 * - Breadcrumb navigation for site structure
 * - Visual search optimization
 */

// Force dynamic rendering to avoid window is not defined errors
export const dynamic = 'force-dynamic';

// Static metadata for the gallery page
const galleryMetadata = {
    title: 'Jewelry Gallery - Artistic Luxury Collection | Jason & Co.',
    description: 'Explore our curated gallery of luxury jewelry pieces. Each piece showcases exceptional craftsmanship and artistic vision. Where ambition meets artistry in wearable art.',
    keywords: [
        'jewelry gallery',
        'luxury jewelry showcase',
        'designer jewelry collection',
        'handcrafted jewelry gallery',
        'fine jewelry art',
        'artistic jewelry pieces',
        'luxury jewelry photography',
        'jewelry craftsmanship',
        'custom jewelry gallery',
        'premium jewelry collection'
    ],
    url: '/gallery',
    type: 'website' as const,
    ogImage: '/images/og-gallery.jpg'
};

export default function GalleryPage() {
    // I'm using state to track when we're on the client
    const [isClient, setIsClient] = useState(false);
    const [origin, setOrigin] = useState('https://jasonjewels.com'); // Default to production origin

    // Generate breadcrumb items for SEO
    const breadcrumbItems = [
        { name: 'Home', url: '/' },
        { name: 'Gallery', url: '/gallery' }
    ];

    useEffect(() => {
        // Mark that we're on the client
        setIsClient(true);

        // Get the actual origin only on the client
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }

        // Update document title
        document.title = galleryMetadata.title;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', galleryMetadata.description);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = galleryMetadata.description;
            document.head.appendChild(meta);
        }

        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            metaKeywords.setAttribute('content', galleryMetadata.keywords.join(', '));
        } else {
            const meta = document.createElement('meta');
            meta.name = 'keywords';
            meta.content = galleryMetadata.keywords.join(', ');
            document.head.appendChild(meta);
        }

        // Update Open Graph tags
        const updateOGTag = (property: string, content: string) => {
            let ogTag = document.querySelector(`meta[property="${property}"]`);
            if (ogTag) {
                ogTag.setAttribute('content', content);
            } else {
                ogTag = document.createElement('meta');
                ogTag.setAttribute('property', property);
                ogTag.setAttribute('content', content);
                document.head.appendChild(ogTag);
            }
        };

        updateOGTag('og:title', galleryMetadata.title);
        updateOGTag('og:description', galleryMetadata.description);
        updateOGTag('og:image', `${window.location.origin}${galleryMetadata.ogImage}`);
        updateOGTag('og:url', `${window.location.origin}${galleryMetadata.url}`);
        updateOGTag('og:type', 'website');

        // Update Twitter Card tags
        const updateTwitterTag = (name: string, content: string) => {
            let twitterTag = document.querySelector(`meta[name="${name}"]`);
            if (twitterTag) {
                twitterTag.setAttribute('content', content);
            } else {
                twitterTag = document.createElement('meta');
                twitterTag.setAttribute('name', name);
                twitterTag.setAttribute('content', content);
                document.head.appendChild(twitterTag);
            }
        };

        updateTwitterTag('twitter:card', 'summary_large_image');
        updateTwitterTag('twitter:title', galleryMetadata.title);
        updateTwitterTag('twitter:description', galleryMetadata.description);
        updateTwitterTag('twitter:image', `${window.location.origin}${galleryMetadata.ogImage}`);

    }, []);

    return (
        <>
            {/* ===== STRUCTURED DATA FOR SEO ===== */}

            {/* Breadcrumb Schema for Navigation */}
            <BreadcrumbSchema items={breadcrumbItems} />

            {/* I'm only rendering structured data on the client to avoid window errors */}
            {isClient && (
                <>
                    {/* Gallery Collection Schema */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'ImageGallery',
                                '@id': `${origin}/gallery#gallery`,
                                name: 'Jason & Co. Luxury Jewelry Gallery',
                                description: 'Curated collection showcasing exceptional craftsmanship and artistic vision in luxury jewelry design.',
                                about: {
                                    '@type': 'Thing',
                                    name: 'Luxury Jewelry',
                                    description: 'Handcrafted fine jewelry and custom pieces'
                                },
                                creator: {
                                    '@type': 'Organization',
                                    name: 'Jason & Co.',
                                    url: origin
                                },
                                isPartOf: {
                                    '@type': 'WebSite',
                                    name: 'Jason & Co. Luxury Jewelry',
                                    url: origin
                                }
                            })
                        }}
                    />

                    {/* Visual Artwork Schema for Gallery Images */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'CreativeWork',
                                '@id': `${origin}/gallery#artwork`,
                                name: 'Jason & Co. Jewelry Artistry',
                                description: 'Collection of luxury jewelry pieces showcasing artistic craftsmanship and innovative design.',
                                creator: {
                                    '@type': 'Organization',
                                    name: 'Jason & Co.',
                                    description: 'Luxury jewelry artisans specializing in custom and designer pieces'
                                },
                                about: [
                                    {
                                        '@type': 'Thing',
                                        name: 'Luxury Jewelry Design'
                                    },
                                    {
                                        '@type': 'Thing',
                                        name: 'Handcrafted Jewelry'
                                    },
                                    {
                                        '@type': 'Thing',
                                        name: 'Custom Jewelry Creation'
                                    }
                                ],
                                keywords: galleryMetadata.keywords.join(', ')
                            })
                        }}
                    />

                    {/* JSON-LD for Gallery Navigation */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'SiteNavigationElement',
                                '@id': `${origin}/gallery#navigation`,
                                name: 'Gallery Navigation',
                                description: 'Navigate through our luxury jewelry gallery collection',
                                url: `${origin}/gallery`,
                                inLanguage: 'en-US',
                                isPartOf: {
                                    '@type': 'WebSite',
                                    name: 'Jason & Co. Luxury Jewelry'
                                }
                            })
                        }}
                    />
                </>
            )}

            {/* ===== MAIN GALLERY CONTENT ===== */}
            <main
                className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]"
                style={{
                    scrollSnapType: "y mandatory",
                    overscrollBehavior: "none"
                }}
                role="main"
                aria-label="Jewelry Gallery - Luxury Collection Showcase"
            >
                {/* Hidden SEO content for better indexing */}
                <div className="sr-only">
                    <h1>Jason & Co. Luxury Jewelry Gallery</h1>
                    <p>
                        Explore our curated gallery featuring exceptional handcrafted jewelry pieces.
                        Each item in our collection represents the pinnacle of luxury craftsmanship,
                        where ambition meets artistry. From custom engagement rings to designer necklaces,
                        discover jewelry that tells your unique story.
                    </p>
                </div>

                <Gallery />

                {/* Enhanced scroll styling with SEO considerations */}
                <style jsx global>{`
                    /* Slower, more elegant scroll snapping */
                    html {
                        scroll-snap-type: y mandatory;
                        scroll-behavior: smooth;
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
                        scroll-behavior: smooth;
                    }
                    
                    /* Custom scroll timing for webkit browsers */
                    @supports (-webkit-scroll-snap-type: y mandatory) {
                        html {
                            -webkit-scroll-snap-type: y mandatory;
                            -webkit-scroll-behavior: smooth;
                        }
                    }

                    /* SEO Enhancement: Ensure images are crawlable */
                    img {
                        height: auto;
                        max-width: 100%;
                    }

                    /* Accessibility enhancement for gallery navigation */
                    [role="main"] {
                        outline: none;
                    }

                    /* Performance optimization for gallery images */
                    .gallery-image {
                        content-visibility: auto;
                        contain-intrinsic-size: 800px 600px;
                    }
                `}</style>
            </main>

            {/* Additional SEO Enhancements */}

            {/* Preload critical gallery images for performance */}
            <link
                rel="preload"
                as="image"
                href="/images/gallery-hero.jpg"
                fetchPriority="high"
            />
        </>
    );
}