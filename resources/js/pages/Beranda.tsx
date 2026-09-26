import React, { useEffect, useRef } from "react";
import { Head } from "@inertiajs/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

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
    const mainRef = useRef<HTMLDivElement>(null);

    const produkTampil =
        produkBestSeller && produkBestSeller.length > 0
            ? produkBestSeller
            : produkTerbaru;

    useEffect(() => {
        if (!mainRef.current) return;

        const ctx = gsap.context(() => {
            // 1. Animasi reveal bertahap yang smooth untuk setiap seksi beranda
            const revealSections =
                gsap.utils.toArray<HTMLElement>(".gsap-section-reveal");

            revealSections.forEach((sec) => {
                gsap.fromTo(
                    sec,
                    { opacity: 0.92, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: sec,
                            start: "top 90%",
                            toggleActions: "play none none reverse",
                        },
                    },
                );
            });

            // 2. Subtle Micro-Parallax pada Konten Produk (Bukan Section Divider)
            const cardItems = gsap.utils.toArray<HTMLElement>(".gsap-card-item");
            if (cardItems.length > 0) {
                cardItems.forEach((card, index) => {
                    const offset = (index % 2 === 0 ? 8 : -8);
                    gsap.fromTo(
                        card,
                        { y: offset },
                        {
                            y: -offset,
                            ease: "none",
                            scrollTrigger: {
                                trigger: card,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 0.8,
                            },
                        }
                    );
                });
            }
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <StorefrontLayout>
            <Head title="CRSL Official Merchandise Store - Animals as your Bestfriends!" />

            <div ref={mainRef} className="space-y-0">
                {/* 1. HERO CAROUSEL FIT-TO-SCREEN */}
                <HeroCarousel slides={SITUS_CONFIG.heroSlidesCMS} />

                {/* 2. PRE-ORDER SECTION */}
                <div className="gsap-section-reveal">
                    <PreOrderSection produk={produkPreOrder} />
                </div>

                {/* 3. SECTION DIVIDER BACK TO SCHOOL */}
                <PemisahSeksi
                    src="/assets/gambar/banner-bts-divider.webp"
                    alt="Back to School CRSL Collection"
                    label="Back to School Divider"
                />

                {/* 4. BTS MUST-HAVE BUNDLE SECTION */}
                <div className="gsap-section-reveal">
                    <BundleSection />
                </div>

                {/* 5. NEW ARRIVAL SECTION DIVIDER & GRID */}
                {produkTerbaru && produkTerbaru.length > 0 && (
                    <div className="gsap-section-reveal">
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
                    </div>
                )}

                {/* 6. BEST SELLER SECTION DIVIDER & GRID */}
                {produkTampil && produkTampil.length > 0 && (
                    <div className="gsap-section-reveal">
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
                    </div>
                )}

                {/* 7. ALL DAY PROMO SECTION DIVIDER & GRID */}
                {produkPromo && produkPromo.length > 0 && (
                    <div className="gsap-section-reveal">
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
                    </div>
                )}

                {/* 8. LET'S ADOPT NOW - CATEGORY TILES */}
                <div className="gsap-section-reveal">
                    <AdoptNowSection />
                </div>
            </div>
        </StorefrontLayout>
    );
}
