// components/seo/SchemaMarkup.tsx
import {
    generateProductSchema,
    generateOrganizationSchema,
    generateWebsiteSchema,
    generateBreadcrumbSchema,
} from "@/lib/seo/metadata";

interface SchemaMarkupProps {
    schema: Record<string, any>;
}

function SchemaMarkup({ schema }: SchemaMarkupProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema, null, 0),
            }}
        />
    );
}

// Product Schema Component
interface ProductSchemaProps {
    product: {
        name: string;
        description: string;
        price: number;
        images: string[];
        category: string;
        inStock: boolean;
        sku?: string;
        brand?: string;
    };
}

export function ProductSchema({ product }: ProductSchemaProps) {
    const schema = generateProductSchema(product);
    return <SchemaMarkup schema={schema} />;
}

// Organization Schema Component
export function OrganizationSchema() {
    const schema = generateOrganizationSchema();
    return <SchemaMarkup schema={schema} />;
}

// Website Schema Component  
export function WebsiteSchema() {
    const schema = generateWebsiteSchema();
    return <SchemaMarkup schema={schema} />;
}

// Breadcrumb Schema Component
interface BreadcrumbSchemaProps {
    items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = generateBreadcrumbSchema(items);
    return <SchemaMarkup schema={schema} />;
}

// FAQ Schema Component (for product pages)
interface FAQSchemaProps {
    faqs: Array<{
        question: string;
        answer: string;
    }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return <SchemaMarkup schema={schema} />;
}

// Review Schema Component
interface ReviewSchemaProps {
    reviews: Array<{
        author: string;
        rating: number;
        reviewBody: string;
        datePublished: string;
    }>;
    product: {
        name: string;
        sku: string;
    };
}

export function ReviewSchema({ reviews, product }: ReviewSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        review: reviews.map(review => ({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: review.author,
            },
            reviewRating: {
                '@type': 'Rating',
                ratingValue: review.rating,
                bestRating: 5,
            },
            reviewBody: review.reviewBody,
            datePublished: review.datePublished,
        })),
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
        },
    };

    return <SchemaMarkup schema={schema} />;
}

// Local Business Schema (if you have a physical location)
interface LocalBusinessSchemaProps {
    name: string;
    address: {
        streetAddress: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phone: string;
    email: string;
    hours?: Array<{
        day: string;
        opens: string;
        closes: string;
    }>;
}

export function LocalBusinessSchema({
    name,
    address,
    phone,
    email,
    hours
}: LocalBusinessSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'JewelryStore',
        name,
        image: '/images/store-front.jpg', // Add actual store image
        '@id': 'https://jasonandco.shop',
        url: 'https://jasonandco.shop',
        telephone: phone,
        email,
        address: {
            '@type': 'PostalAddress',
            streetAddress: address.streetAddress,
            addressLocality: address.city,
            addressRegion: address.state,
            postalCode: address.zipCode,
            addressCountry: address.country,
        },
        openingHoursSpecification: hours?.map(h => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.day,
            opens: h.opens,
            closes: h.closes,
        })),
        priceRange: '$$$$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash, Credit Card',
    };

    return <SchemaMarkup schema={schema} />;
}

// Collection Schema for category pages
interface CollectionSchemaProps {
    name: string;
    description: string;
    products: Array<{
        name: string;
        price: number;
        image: string;
    }>;
}

export function CollectionSchema({ name, description, products }: CollectionSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'Product',
                    name: product.name,
                    image: product.image,
                    offers: {
                        '@type': 'Offer',
                        price: product.price,
                        priceCurrency: 'USD',
                    },
                },
            })),
        },
    };

    return <SchemaMarkup schema={schema} />;
}