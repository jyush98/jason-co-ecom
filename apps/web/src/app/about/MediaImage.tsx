'use client'

import Image from 'next/image'

interface MediaImageProps {
    image: string
    alt?: string
}

export default function MediaImage({ image, alt = 'Media item' }: MediaImageProps) {
    return (
        <div className="relative aspect-[9/16] w-1/6 h-1/2 hidden lg:block mt-10">
            <Image
                src={image}
                alt={alt}
                fill
                className="object-cover rounded-md"
            />
        </div>
    )
}
