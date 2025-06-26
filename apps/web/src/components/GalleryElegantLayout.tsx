import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface GalleryElegantLayoutProps {
    item: {
        id: string;
        title: string;
        description: string;
        largeImage: string;
        objectPosition?: string;
        collection: string;
        category: string;
    };
}

export default function GalleryElegantLayout({ item }: GalleryElegantLayoutProps) {
    return (
        <section className={`w-[90%] mx-auto py-6 px-6 md:px-[10%] text-white`}>
            {/* Title */}
            <div className="flex items-center justify-center gap-4 my-12">
                <hr className="flex-grow border-t border-white" />
                <h2 className="text-xl uppercase tracking-widest text-white whitespace-nowrap">
                    {item.title}
                </h2>
                <hr className="flex-grow border-t border-white" />
            </div>
            <a href="#" className="group block bg-black text-white">
                <div className="flex flex-col md:flex-row bg-black text-white items-stretch">
                    {/* Image with vignette overlay */}
                    <div className="relative w-full md:w-1/2 aspect-square overflow-hidden">
                        <Image
                            src={item.largeImage}
                            alt={item.title}
                            fill
                            className={`object-cover [object-position:${item.objectPosition || "50%_0%"}]`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/60 pointer-events-none" />
                    </div>

                    {/* Text Block */}
                    <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-black text-center">
                        <div className="space-y-2">
                            <p className="uppercase tracking-widest">{item.collection}</p>
                            <div className="h-[1px] bg-white w-40 mx-auto transition-all duration-300 group-hover:w-64" />
                            <p className="uppercase tracking-wide">{item.category}</p>
                            <div className="flex items-center justify-center">
                                <button className="group w-4 h-4 rounded-full border border-white flex items-center justify-center bg-transparent transition-colors duration-300 group-hover:bg-white">
                                    <ChevronRight className="text-white group-hover:text-black transition-colors duration-300" size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </section >
    );
}
