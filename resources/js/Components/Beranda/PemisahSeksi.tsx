import React from 'react';

interface PemisahSeksiProps {
    src?: string;
    alt?: string;
    label?: string;
}

export default function PemisahSeksi({
    src = '/assets/gambar/banner-bts-divider.webp',
    alt = 'CRSL Collection Banner Divider',
    label = 'CRSL Collection Divider',
}: PemisahSeksiProps) {
    return (
        <aside className="w-full overflow-hidden my-4 md:my-8 bg-slate-900 border-y border-slate-800" aria-label={label}>
            <div className="w-full max-h-[160px] md:max-h-[220px] overflow-hidden">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto min-h-[90px] md:min-h-[140px] object-cover object-center filter brightness-95 hover:brightness-105 transition-all duration-500"
                    loading="lazy"
                    width={2048}
                    height={180}
                />
            </div>
        </aside>
    );
}
