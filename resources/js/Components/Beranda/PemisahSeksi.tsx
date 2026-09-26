import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PemisahSeksiProps {
    src?: string;
    alt?: string;
    label?: string;
}

export default function PemisahSeksi({
    src = "/assets/gambar/banner-bts-divider.webp",
    alt = "CRSL Collection Banner Divider",
    label = "CRSL Collection Divider",
}: PemisahSeksiProps) {
    const containerRef = useRef<HTMLElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!containerRef.current || !imgRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                imgRef.current,
                { yPercent: -10, scale: 1.06 },
                {
                    yPercent: 10,
                    scale: 1.06,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.5,
                    },
                },
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <aside
            ref={containerRef}
            className="w-full overflow-hidden my-4 md:my-8 bg-slate-900 border-y border-slate-800 relative select-none"
            aria-label={label}
        >
            <div className="w-full h-[120px] sm:h-[150px] md:h-[180px] lg:h-[210px] overflow-hidden relative">
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    className="w-full h-[125%] object-cover object-center filter brightness-95 hover:brightness-105 transition-all duration-300 pointer-events-none will-change-transform"
                    loading="lazy"
                    width={2048}
                    height={280}
                />
            </div>
        </aside>
    );
}
