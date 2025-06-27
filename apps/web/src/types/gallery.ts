export interface GalleryItemType {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
}

export interface GalleryElegantItemType {
    id: string;
    title: string;
    description: string;
    largeImage: string;
    portraits: string[];
    category: string;
    objectPosition?: string;
    collection: string;
}
