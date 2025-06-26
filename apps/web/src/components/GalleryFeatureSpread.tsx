import Image from "next/image";

interface GalleryFeatureSpreadProps {
  item: {
    id: string;
    title: string;
    description: string;
    largeImage: string;
  };
  reverse?: boolean;
}

export default function GalleryFeatureSpread({ item, reverse = false }: GalleryFeatureSpreadProps) {
  return (
    <section className={`w-[90%] mx-auto py-24 px-6 md:px-[10%] bg-black text-white`}>
      <div
        className={`flex flex-col md:flex-row items-center gap-12 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Image */}
        <div className="md:w-3/5 w-full aspect-[3/4] relative">
          <Image
            src={item.largeImage}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        </div>

        {/* Text */}
        <div className="md:w-2/5 w-full text-left space-y-6">
          <h2 className="text-lg md:text-5xl font-sans-serif uppercase tracking-wide leading-tight">
            {item.title}
          </h2>
          <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-md">
            {item.description}
          </p>
        </div>
      </div>
    </section>
  );
}
