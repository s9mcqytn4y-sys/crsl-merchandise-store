import React from "react";
import { Link } from "@inertiajs/react";

interface KoleksiAdopt {
    id: number;
    slug: string;
    judul: string;
    gambar: string;
    alt: string;
}

const DAFTAR_KOLEKSI_ADOPT: KoleksiAdopt[] = [
    {
        id: 16810,
        slug: "backpack-collection",
        judul: "Backpack Collection",
        gambar: "/assets/gambar/banner-1.webp",
        alt: "CRSL Backpack Collection",
    },
    {
        id: 16819,
        slug: "tumbler-collection",
        judul: "Tumbler Collection",
        gambar: "/assets/gambar/banner-tumbler.webp",
        alt: "CRSL Tumbler Collection",
    },
    {
        id: 16813,
        slug: "tops-collection",
        judul: "Apparel Collection",
        gambar: "/assets/gambar/banner-lookbook.webp",
        alt: "CRSL Apparel Collection",
    },
    {
        id: 16811,
        slug: "slingbag-collection",
        judul: "Slingbag Collection",
        gambar: "/assets/gambar/banner-cassie.webp",
        alt: "CRSL Slingbag Collection",
    },
];

export default function AdoptNowSection() {
    return (
        <section
            aria-labelledby="heading-adopt-now"
            className="py-12 sm:py-16 bg-white"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Sesuai Screenshot Resmi crsl-store.id */}
                <div className="text-center mb-8 sm:mb-10">
                    <Link
                        href="/katalog"
                        className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors inline-block tracking-wide cursor-pointer"
                    >
                        View All
                    </Link>
                    <h2
                        id="heading-adopt-now"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mt-2"
                    >
                        Let's Adopt Now!
                    </h2>
                </div>

                {/* Grid Koleksi: 2 Kolom Responsif Desktop/Tablet, 1 Kolom Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {DAFTAR_KOLEKSI_ADOPT.map((koleksi) => (
                        <Link
                            key={koleksi.id}
                            href={`/katalog?kategori=${koleksi.slug}`}
                            className="group relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 block"
                            aria-label={`Lihat ${koleksi.judul}`}
                        >
                            {/* Gambar Banner Koleksi */}
                            <img
                                src={koleksi.gambar}
                                alt={koleksi.alt}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                loading="lazy"
                                width={800}
                                height={450}
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "/assets/gambar/banner-1.webp";
                                }}
                            />

                            {/* Gradient Overlay Gelap di Bagian Bawah */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />

                            {/* Judul Koleksi di Pojok Kiri Bawah (Matches Screenshot 2) */}
                            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 right-5">
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                                    {koleksi.judul}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

