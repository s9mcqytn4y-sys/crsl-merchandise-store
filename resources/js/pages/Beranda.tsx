import React from "react";
import { Head } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import HeroCarousel from "../Components/HeroCarousel";
import PreOrderSection from "../Components/Beranda/PreOrderSection";
import PemisahSeksi from "../Components/Beranda/PemisahSeksi";
import BundleSection from "../Components/Beranda/BundleSection";
import ProductGridSection, {
    ProdukItem,
} from "../Components/Beranda/ProductGridSection";
import AdoptNowSection from "../Components/Beranda/AdoptNowSection";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface Kategori {
    id: number;
    nama: string;
    slug: string;
    emoji: string | null;
}

interface BerandaProps {
    kategori: Kategori[];
    produkBestSeller: ProdukItem[];
    produkTerbaru: ProdukItem[];
    produkPromo: ProdukItem[];
    produkPreOrder?: ProdukItem;
}

export default function Beranda({
    kategori,
    produkBestSeller,
    produkTerbaru,
    produkPromo,
    produkPreOrder,
}: BerandaProps) {
    const produkTampil =
        produkBestSeller && produkBestSeller.length > 0
            ? produkBestSeller
            : produkTerbaru;

    return (
        <StorefrontLayout>
            <Head title="CRSL Official Merchandise Store - Animals as your Bestfriends!" />

            <div className="space-y-0">
                {/* 1. HERO CAROUSEL */}
                <HeroCarousel slides={SITUS_CONFIG.heroSlidesCMS} />

                {/* 2. PRE-ORDER SECTION DENGAN DATA VALID & DINAMIS */}
                <PreOrderSection produk={produkPreOrder} />

                {/* 3. SECTION DIVIDER BACK TO SCHOOL */}
                <PemisahSeksi
                    src="/assets/gambar/banner-bts-divider.webp"
                    alt="Back to School CRSL Collection"
                    label="Back to School Divider"
                />

                {/* 4. BTS MUST-HAVE BUNDLE SECTION */}
                <BundleSection />

                {/* 5. NEW ARRIVAL SECTION DIVIDER & GRID */}
                {produkTerbaru && produkTerbaru.length > 0 && (
                    <>
                        <PemisahSeksi
                            src="/assets/gambar/banner-new-arrival.webp"
                            alt="New Arrival CRSL Collection"
                            label="New Arrival Divider"
                        />
                        <ProductGridSection
                            id="section-new-arrival"
                            produk={produkTerbaru}
                            linkHref="/katalog?urutan=terbaru"
                            linkLabel="Lihat Semua New Arrival"
                        />
                    </>
                )}

                {/* 6. BEST SELLER SECTION DIVIDER & GRID */}
                {produkTampil && produkTampil.length > 0 && (
                    <>
                        <PemisahSeksi
                            src="/assets/gambar/banner-best-seller.webp"
                            alt="Best Seller CRSL Collection"
                            label="Best Seller Divider"
                        />
                        <ProductGridSection
                            id="section-best-seller"
                            produk={produkTampil}
                            linkHref="/katalog?urutan=terlaris"
                            linkLabel="Lihat Semua Best Seller"
                        />
                    </>
                )}

                {/* 7. ALL DAY PROMO SECTION DIVIDER & GRID */}
                {produkPromo && produkPromo.length > 0 && (
                    <>
                        <PemisahSeksi
                            src="/assets/gambar/banner-all-day-promo.webp"
                            alt="All Day Promo CRSL"
                            label="All Day Promo Divider"
                        />
                        <ProductGridSection
                            id="section-promo"
                            produk={produkPromo}
                            linkHref="/katalog?promo=true"
                            linkLabel="Lihat Semua Promo"
                            dark={false}
                        />
                    </>
                )}

                {/* 8. LET'S ADOPT NOW - CATEGORY TILES */}
                <AdoptNowSection />
            </div>
        </StorefrontLayout>
    );
}
