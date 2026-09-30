import { useMemo } from "react";
import { Link } from "@inertiajs/react";
import {
    MapPin,
    MessageCircle,
    ShieldCheck,
    CreditCard,
    ExternalLink,
    Truck,
} from "lucide-react";
import { SITEMAP_CONFIG } from "../Config/sitemapConfig";
import { cn } from "../lib/utils";

interface FooterProps {
    className?: string;
}

export default function Footer({ className }: FooterProps) {
    const currentYear = useMemo(() => new Date().getFullYear(), []);

    // Schema.org Structured Data untuk Rich Snippets Mesin Pencari (Google)
    const jsonLdOrg = {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        name: "CRSL Official Store",
        url: "https://crsl-store.id",
        logo: "https://crsl-store.id/assets/gambar/logo-crsl.png",
        description:
            "Apparel & accessories brand asal Yogyakarta yang terinspirasi dari karakter 5 hewan sahabat unik. Animals as your bestfriends!",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Sleman",
            addressRegion: "D.I. Yogyakarta",
            addressCountry: "ID",
        },
        sameAs: [
            "https://instagram.com/crsl.store",
            "https://wa.me/6281222222775",
        ],
        paymentAccepted: "Cash, Credit Card, QRIS, Bank Transfer, E-Wallet",
        currenciesAccepted: "IDR",
    };

    return (
        <footer
            id="storefront-footer"
            role="contentinfo"
            aria-label="Informasi Toko dan Navigasi Bawah"
            className={cn(
                "bg-slate-950 text-white pt-12 sm:pt-16 border-t border-slate-900 select-none relative z-30",
                className,
            )}
            style={{
                // Padding ekstra di bawah untuk mencegah tumpang tindih dengan StickyCartBar
                paddingBottom:
                    "max(6.5rem, calc(6rem + env(safe-area-inset-bottom)))",
            }}
        >
            {/* Structured Data JSON-LD untuk Search Engine Indexing */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-slate-900">
                    {/* Brand Info & Alamat Yogyakarta */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] rounded-xl"
                            aria-label="Beranda CRSL Official Store"
                        >
                            <img
                                src="/assets/gambar/logo-crsl.png"
                                alt="Logo CRSL"
                                width={36}
                                height={36}
                                className="h-9 w-auto object-contain"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    target.src =
                                        "/assets/gambar/logo-crsl.webp";
                                }}
                            />
                            <span className="text-xl font-black text-white tracking-widest font-heading font-mono">
                                CRSL STORE
                            </span>
                        </Link>

                        <p className="text-slate-400 text-xs leading-relaxed">
                            Apparel & accessories brand asal Yogyakarta yang
                            terinspirasi dari karakter 5 hewan sahabat unik:
                            Odin, Chilo, Pigko, Popo, dan Choco. Animals as your
                            bestfriends! 🐾
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-4 h-4 text-[#E52027] shrink-0" />
                            <span>Sleman, D.I. Yogyakarta, Indonesia</span>
                        </div>

                        {/* Social Links dengan Rel Aman */}
                        <div className="pt-2 flex items-center gap-3">
                            <a
                                href="https://instagram.com/crsl.store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#E52027] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer border border-slate-800"
                                aria-label="Kunjungi Akun Instagram Resmi @crsl.store"
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <rect
                                        width="20"
                                        height="20"
                                        x="2"
                                        y="2"
                                        rx="5"
                                        ry="5"
                                    />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line
                                        x1="17.5"
                                        x2="17.51"
                                        y1="6.5"
                                        y2="6.5"
                                    />
                                </svg>
                            </a>
                            <a
                                href="https://wa.me/6281222222775"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer border border-slate-800"
                                aria-label="Chat Customer Care WhatsApp CRSL"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Sitemap Sections Ter-modularisasi */}
                    {SITEMAP_CONFIG.map((section) => (
                        <div key={section.judul}>
                            <h4 className="font-extrabold text-white mb-4 text-xs sm:text-sm uppercase tracking-wider">
                                {section.judul}
                            </h4>
                            <ul className="space-y-2.5 text-xs text-slate-400">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        {link.isExternal ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <span>{link.label}</span>
                                                <ExternalLink className="w-3 h-3 opacity-70" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <span>{link.label}</span>
                                                {link.badge && (
                                                    <span className="text-[9px] font-black bg-[#E52027] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Pembayaran, Ekspedisi & Keaslian Merchandise */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-extrabold text-white mb-2.5 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#E52027]" />
                                <span>Pembayaran Terverifikasi</span>
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Mendukung QRIS (GoPay, OVO, ShopeePay), Transfer
                                Virtual Account (BCA, Mandiri, BNI, BRI), serta
                                gerai resmi via Midtrans.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-white mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#E52027]" />
                                <span>Logistik & Ekspedisi</span>
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Pengiriman aman seluruh Indonesia didukung oleh
                                J&T, JNE, SiCepat, dan Anteraja melalui
                                integrasi Biteship.
                            </p>
                        </div>

                        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-2.5 shadow-2xs">
                            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 stroke-[2.2]" />
                            <span>100% Produk Original Garansi Resmi CRSL</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Bottom Navigation */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <p className="text-center sm:text-left">
                        &copy; {currentYear} CRSL Official Store. Animals as
                        your Bestfriends. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-slate-400 font-semibold">
                        <Link
                            href="/katalog"
                            className="hover:text-white transition-colors"
                        >
                            Katalog
                        </Link>
                        <span>•</span>
                        <Link
                            href="/account"
                            className="hover:text-white transition-colors"
                        >
                            Akun Saya
                        </Link>
                        <span>•</span>
                        <Link
                            href="/lacak"
                            className="hover:text-white transition-colors"
                        >
                            Lacak Pesanan
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
