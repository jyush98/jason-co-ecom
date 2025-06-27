"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import { CustomItemType } from "@/types/custom";
import { useEffect } from "react";


export default function SignatureGallery({ customItems }: { customItems: CustomItemType[] }) {
    const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: {
            perView: 1,
        },
    }, [
        (slider) => {
            let timeout: ReturnType<typeof setTimeout>;
            const clearNextTimeout = () => clearTimeout(timeout);

            const nextTimeout = () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    slider.next();
                }, 4000); // change slide every 4s
            };

            slider.on("created", () => {
                nextTimeout();
            });
            slider.on("dragStarted", clearNextTimeout);
            slider.on("animationEnded", nextTimeout);
            slider.on("updated", nextTimeout);
        }
    ]);

    useEffect(() => {
        const container = instanceRef.current?.container;
        if (container) {
          container.style.transitionDuration = "1.6s";
        }
      }, [instanceRef]);

    return (
        <section className="w-full h-80 bg-black flex justify-center">
            <div ref={sliderRef} className="keen-slider w-[90%] h-full">
                {customItems.map((item) => (
                    <div key={item.id} className="keen-slider__slide relative h-full">
                        <Image
                            src={`/images/custom-page/${item.imageUrl}`}
                            alt={item.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
