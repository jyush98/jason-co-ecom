import Image from "next/image";

interface GalleryFeatureRowProps {
  item: {
    id: string;
    title: string;
    description: string;
    largeImage: string;
    portraits: string[];
  };
  reverse?: boolean;
}

export default function GalleryFeatureRow({ item, reverse = false }: GalleryFeatureRowProps) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}>
      {/* Large 4:5 Image */}
      <div className="md:w-[30%] w-full aspect-[5/4] relative">
        <Image src={item.largeImage} alt={item.title} fill className="object-cover" />
      </div>

      {/* Title + Text */}
      <div className="md:w-[20%] w-full flex flex-col justify-center text-white space-y-4 px-4">
        <h2 className="text-2xl font-sans-serif font-semibold">{item.title}</h2>
        <p className="text-sm text-gray-300">{item.description}</p>
      </div>

      {/* Portraits: 3 x 4:3 side by side */}
      <div className="md:w-[50%] w-full flex">
        {item.portraits.map((src, index) => (
          <div key={index} className="w-1/3 aspect-[4/3] relative">
            <Image src={src} alt={`Portrait ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
