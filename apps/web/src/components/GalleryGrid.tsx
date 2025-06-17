import GalleryItem from "./GalleryItem";
import { GalleryItemType } from "@/types/gallery";

interface Props {
    items: GalleryItemType[];
}

export default function GalleryGrid({ items }: Props) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => (
                <GalleryItem key={item.id} item={item} />
            ))}
        </div>
    );
}
