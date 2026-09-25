import React from "react";
import { Link } from "@inertiajs/react";
import { formatRupiah } from "../../Utils/formatters";

export interface BundleItem {
    id: number;
    slug: string;
    judul: string;
    hargaPaket: number;
    hargaAsli: number;
    gambarCover: string;
}

const DAFTAR_BUNDLE: BundleItem[] = [
    {
        id: 3516,
        slug: "back-to-school-with-miflo",
        judul: "BACK TO SCHOOL with Miflo",
        hargaPaket: 289000,
        hargaAsli: 343100,
        gambarCover: "/assets/gambar/bundle-miflo-cover.webp",
    },
    {
        id: 2188,
        slug: "back-to-school-with-haru",
        judul: "BACK TO SCHOOL WITH HARU!",
        hargaPaket: 329000,
        hargaAsli: 395000,
        gambarCover: "/assets/gambar/bundle-haru-cover.webp",
    },
];

export default function BundleSection() {
    return (
        <section
            id="bts-bundles"
            className="py-8 sm:py-12 bg-white border-b border-slate-100"
            aria-labelledby="judul-bundle"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section Sesuai Screenshot 4 */}
                <div className="text-center mb-6 sm:mb-8">
                    <h2
                        id="judul-bundle"
                        className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight"
                    >
                        BTS Must-Have Bundle
                    </h2>
                </div>

                {/* 2-Column Clean Grid Sesuai Screenshot 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {DAFTAR_BUNDLE.map((bundle) => {
                        const bundleUrl = `/bundles/${bundle.id}/${bundle.slug}`;

                        return (
                            <article
                                key={bundle.id}
                                className="group flex flex-col bg-white overflow-hidden"
                            >
                                <Link
                                    href={bundleUrl}
                                    className="block aspect-square w-full bg-slate-100 overflow-hidden rounded-xl cursor-pointer"
                                    aria-label={`Lihat ${bundle.judul}`}
                                >
                                    <img
                                        src={bundle.gambarCover}
                                        alt={bundle.judul}
                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                        loading="lazy"
                                        width={500}
                                        height={500}
                                    />
                                </Link>

                                <div className="pt-2.5 flex flex-col">
                                    <Link
                                        href={bundleUrl}
                                        className="text-xs sm:text-sm font-normal text-slate-800 hover:text-[#E52027] line-clamp-1 transition-colors"
                                    >
                                        {bundle.judul}
                                    </Link>
                                    <span className="text-xs sm:text-sm font-normal text-slate-600 tabular-nums mt-0.5">
                                        {formatRupiah(bundle.hargaPaket)}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
