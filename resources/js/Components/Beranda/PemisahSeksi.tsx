import React from "react";

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
    return (
        <aside
            className="w-full overflow-hidden my-4 md:my-6 bg-slate-950 border-y border-slate-900/60 relative select-none"
            aria-label={label}
        >
            <div className="w-full h-25 sm:h-35 md:h-42.5 lg:h-50 overflow-hidden relative">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover object-center filter brightness-95 hover:brightness-105 transition-all duration-300 pointer-events-none"
                    loading="lazy"
                    width={2048}
                    height={280}
                />
            </div>
        </aside>
    );
}
