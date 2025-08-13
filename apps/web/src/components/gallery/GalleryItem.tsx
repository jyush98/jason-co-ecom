import { GalleryItemType } from "@/types/gallery";
import { JewelryImage } from "../ui/OptimizedImage";

interface Props {
  item: GalleryItemType;
}

export default function GalleryItem({ item }: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl group">
      <JewelryImage.Product
        src={item.imageUrl}
        alt={item.title}
        width={500}
        height={500}
        className="w-full h-auto object-cover group-hover:scale-105 transition-transform"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2">
        {item.title}
      </div>
    </div>
  );
}
