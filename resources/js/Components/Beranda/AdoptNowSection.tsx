import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, Sparkles } from "lucide-react";

interface KategoriAdopt {
    id: number;
    slug: string;
    nama: string;
    gambar: string;
}

const DAFTAR_KATEGORI_ADOPT: KategoriAdopt[] = [
    {
        id: 16810,
        slug: "backpack-collection",
        nama: "Backpacks",
        gambar: "/assets/kategori/kategori-backpack.webp",
    },
    {
        id: 16811,
        slug: "slingbag-collection",
        nama: "Slingbags",
        gambar: "/assets/kategori/kategori-slingbag.webp",
    },
    {
        id: 16813,
        slug: "tops-collection",
        nama: "Tops",
        gambar: "/assets/kategori/kategori-tees.webp",
    },
    {
        id: 16814,
        slug: "bottoms-collection",
        nama: "Bottoms",
        gambar: "/assets/kategori/kategori-pants-skirt.webp",
    },
    {
        id: 16815,
        slug: "outerwears-collection",
        nama: "Outerwears",
        gambar: "/assets/kategori/kategori-outerwear.webp",
    },
    {
        id: 16816,
        slug: "footwear-collection",
        nama: "Footwears",
        gambar: "/assets/kategori/kategori-shoes.webp",
    },
    {
        id: 16817,
        slug: "headwear-collection",
        nama: "Headwears",
        gambar: "/assets/kategori/kategori-hat-helmet.webp",
    },
    {
        id: 16818,
        slug: "wallet-accessories",
        nama: "Wallet & Accessories",
        gambar: "/assets/kategori/kategori-wallet.webp",
    },
];

export default function AdoptNowSection() {
    return (
        <section
            aria-labelledby="heading-adopt-now"
            className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Banner: Let's Adopt Now */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#E52027] bg-red-100/70 px-3.5 py-1.5 rounded-full mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Animals As Your Bestfriends
                    </span>
                    <h2
                        id="heading-adopt-now"
                        className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900"
                    >
                        Let's Adopt Now!
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm mt-2">
                        Pilih merchandise karakter hewan favorit kamu sekarang
                    </p>
                </div>

                {/* Grid Kategori: 2 Kolom Tablet/Desktop, 1 Kolom Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {DAFTAR_KATEGORI_ADOPT.map((kat) => (
                        <Link
                            key={kat.id}
                            href={`/katalog?kategori=${kat.slug}`}
                            className="group relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 block"
                            aria-label={`Koleksi kategori ${kat.nama}`}
                        >
                            <img
                                src={kat.gambar}
                                alt={`${kat.nama} CRSL`}
                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                loading="lazy"
                                width={600}
                                height={375}
                                onError={(e) => {
                                    // Fallback ke banner umum jika kategori gambar spesifik belum ada
                                    (e.currentTarget as HTMLImageElement).src =
                                        "/assets/gambar/banner-1.webp";
                                }}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent group-hover:from-slate-950/90 transition-colors" />

                            {/* Content Details */}
                            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                                    {kat.nama}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 group-hover:text-white mt-1 transition-colors">
                                    <span>Adopt Now</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Bottom View All Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#E52027] hover:text-[#CC1C22] bg-white border border-red-200 hover:border-red-300 px-6 py-3 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95"
                    >
                        <span>Lihat Semua Produk Katalog</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
