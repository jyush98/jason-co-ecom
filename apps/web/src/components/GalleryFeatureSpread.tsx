import Image from "next/image";

interface GalleryFeatureSpreadProps {
  item: {
    id: string;
    title: string;
    description: string;
    largeImage: string;
    portraits: string[];
  };
  reverse?: boolean;
}

export default function GalleryFeatureSpread({ item, reverse = false }: GalleryFeatureSpreadProps) {
  return (
    <div className={`flex flex-col md:flex-row items-stretch ${reverse ? "md:flex-row-reverse" : ""}`}>
      {/* Large Hero Image */}
      <div className="md:w-[60%] w-full aspect-[4/3] relative">
        <Image src={item.largeImage} alt={item.title} fill className="object-cover" />
      </div>

      {/* Right Column */}
      <div className="md:w-[40%] w-full flex flex-col justify-between text-white space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-sans-serif font-semibold">{item.title}</h2>
          <p className="text-sm text-gray-300">{item.description}</p>
        </div>

        <div className="flex">
          {item.portraits.map((src, i) => (
            <div key={i} className="w-1/3 aspect-[4/5] relative">
              <Image src={src} alt={`Portrait ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
