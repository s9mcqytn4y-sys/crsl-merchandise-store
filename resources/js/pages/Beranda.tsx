import { useEffect, useRef } from "react";
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

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface Kategori {
    id: number;
    nama: string;
    slug: string;
    emoji: string | null;
}

interface BerandaProps {
    kategori?: Kategori[];
    produkBestSeller?: ProdukItem[];
    produkTerbaru?: ProdukItem[];
    produkPromo?: ProdukItem[];
    produkPreOrder?: ProdukItem;
}

export default function Beranda({
    kategori = [],
    produkBestSeller = [],
    produkTerbaru = [],
    produkPromo = [],
    produkPreOrder,
}: BerandaProps) {
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mainRef.current) return;

        // 1. Cek preferensi aksesibilitas pengguna (prefers-reduced-motion)
        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            // 2. Animasi reveal bertahap yang smooth untuk setiap seksi beranda
            const revealSections = gsap.utils.toArray<HTMLElement>(
                ".gsap-section-reveal",
            );

            revealSections.forEach((sec) => {
                gsap.fromTo(
                    sec,
                    { opacity: 0.88, y: 16 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: sec,
                            start: "top 92%",
                            toggleActions: "play none none reverse",
                        },
                    },
                );
            });

            // 3. Subtle Micro-Parallax: Khusus desktop untuk menjaga performa mobile (FPS 60)
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop) {
                const cardItems =
                    gsap.utils.toArray<HTMLElement>(".gsap-card-item");
                if (cardItems.length > 0) {
                    cardItems.forEach((card, index) => {
                        const offset = index % 2 === 0 ? 6 : -6;
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
                                    scrub: 1,
                                },
                            },
                        );
                    });
                }
            }
        }, mainRef);

        // 4. Refresh ScrollTrigger setelah seluruh banner & asset DOM selesai dimuat
        const handleLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", handleLoad);

        return () => {
            window.removeEventListener("load", handleLoad);
            ctx.revert();
        };
    }, []);

    const hasNewArrivals = produkTerbaru && produkTerbaru.length > 0;
    const hasBestSellers = produkBestSeller && produkBestSeller.length > 0;
    const hasPromos = produkPromo && produkPromo.length > 0;

    return (
        <StorefrontLayout>
            <Head title="CRSL Official Merchandise Store - Animals as your Bestfriends!" />

            <div
                ref={mainRef}
                className="space-y-0 select-none overflow-x-hidden"
            >
                {/* 1. HERO CAROUSEL BANNER */}
                <HeroCarousel slides={SITUS_CONFIG.heroSlidesCMS} />

                {/* 2. PRE-ORDER SECTION */}
                {produkPreOrder && (
                    <div className="gsap-section-reveal">
                        <PreOrderSection produk={produkPreOrder} />
                    </div>
                )}

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
                {hasNewArrivals && (
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
                {hasBestSellers && (
                    <div className="gsap-section-reveal">
                        <PemisahSeksi
                            src="/assets/gambar/banner-best-seller.webp"
                            alt="Best Seller CRSL Collection"
                            label="Best Seller Divider"
                        />
                        <ProductGridSection
                            id="section-best-seller"
                            produk={produkBestSeller}
                            linkHref="/katalog?urutan=terlaris"
                            linkLabel="Lihat Semua Best Seller"
                        />
                    </div>
                )}

                {/* 7. ALL DAY PROMO SECTION DIVIDER & GRID */}
                {hasPromos && (
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

                {/* 8. LET'S ADOPT NOW - CATEGORY & MASCOT TILES */}
                <div className="gsap-section-reveal">
                    <AdoptNowSection />
                </div>
            </div>
        </StorefrontLayout>
    );
}
