import HomePage from "../components/HomePage";
import { createMetadata } from '@/lib/seo/metadata';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/SchemaMarkup';

export const metadata = createMetadata({
    title: 'Jason & Co. | Where Ambition Meets Artistry | Luxury Custom Jewelry',
    description: 'Discover handcrafted luxury jewelry designed without limits. Custom engagement rings, bespoke necklaces, and artisanal pieces that embody where ambition meets artistry.',
    keywords: [
        'luxury jewelry',
        'custom engagement rings',
        'designer jewelry collections',
        'handcrafted fine jewelry',
        'premium wedding bands',
        'luxury accessories',
        'custom jewelry design'
    ],
    url: '/',
    type: 'website'
});

export default function Home() {
    return (<>
        {/* Structured Data for Homepage */}
        <OrganizationSchema />
        <WebsiteSchema />

        <HomePage />
    </>);
}