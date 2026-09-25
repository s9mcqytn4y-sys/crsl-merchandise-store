import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "@inertiajs/react";
import { Menu, Search, User, ShoppingBag } from "lucide-react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";

interface FlagIconProps {
    currency: string;
}

function IkonBendera({ currency }: FlagIconProps) {
    switch (currency.toUpperCase()) {
        case "USD":
            return (
                <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="rounded-[2px] overflow-hidden shrink-0 border border-slate-200"
                >
                    <rect width="18" height="12" fill="#3C3B6E" />
                    <path
                        d="M0 0h18v2H0zm0 4h18v2H0zm0 4h18v2H0z"
                        fill="#B22234"
                    />
                </svg>
            );
        case "IDR":
        default:
            return (
                <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="rounded-[2px] overflow-hidden shrink-0 border border-slate-200"
                >
                    <rect width="18" height="6" fill="#CE1126" />
                    <rect y="6" width="18" height="6" fill="#FFFFFF" />
                </svg>
            );
    }
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface NavigasiUtamaProps {
    isMenuOpen: boolean;
    onMenuOpen: () => void;
    onSearchOpen: () => void;
    onPrefOpen: () => void;
    currency?: string;
    authUser?: AuthUser | null;
}

export default function NavigasiUtama({
    isMenuOpen,
    onMenuOpen,
    onSearchOpen,
    onPrefOpen,
    currency = "IDR",
    authUser = null,
}: NavigasiUtamaProps) {
    // Zustand Atomic Selectors
    const items = useKeranjangStore((state) => state.items);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    // Total item keranjang reaktif
    const jumlahKeranjang = useMemo(() => {
        if (!Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (item.jumlah || 1), 0);
    }, [items]);

    const [isScrolled, setIsScrolled] = useState(false);
    const rafId = useRef<number | null>(null);

    // Scroll listener teroptimasi dengan requestAnimationFrame
    useEffect(() => {
        const handleScroll = () => {
            if (rafId.current !== null) return;

            rafId.current = window.requestAnimationFrame(() => {
                setIsScrolled(window.scrollY > 4);
                rafId.current = null;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafId.current !== null) {
                window.cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return (
        <header
            className={`w-full bg-white transition-all duration-200 ${
                isScrolled
                    ? "border-b border-slate-200 shadow-xs"
                    : "border-b border-slate-100 shadow-none"
            }`}
        >
            <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
                {/* SISI KIRI: Tombol Menu Drawer */}
                <div className="flex items-center">
                    <button
                        id="btn-hamburger-menu"
                        type="button"
                        onClick={onMenuOpen}
                        className="p-2 -ml-2 text-slate-700 hover:text-primary hover:bg-slate-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label="Buka menu navigasi"
                        aria-expanded={isMenuOpen}
                        aria-controls="side-menu-drawer"
                    >
                        <Menu className="w-5 h-5" strokeWidth={2.2} />
                    </button>
                </div>

                {/* TENGAH: Logo Utama (<ROSL Mascot Logo) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-lg p-1"
                        aria-label="CRSL Official Store - Beranda"
                    >
                        <img
                            src="/assets/gambar/logo-crsl-bw.webp"
                            alt="CRSL Logo"
                            width={112}
                            height={32}
                            className="h-6 sm:h-7 md:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                                // Fallback jika webp gagal dimuat
                                (e.currentTarget as HTMLImageElement).src = "/assets/gambar/logo-crsl.png";
                            }}
                        />
                    </Link>
                </div>

                {/* SISI KANAN: Tombol Aksi */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Preferensi Mata Uang */}
                    <button
                        id="btn-preferensi-wilayah"
                        type="button"
                        onClick={onPrefOpen}
                        className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 px-1.5 sm:px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label={`Mata uang aktif: ${currency}`}
                    >
                        <IkonBendera currency={currency} />
                        <span className="hidden xs:inline sm:inline">{currency}</span>
                    </button>

                    {/* Tombol Pencarian */}
                    <button
                        id="btn-pencarian"
                        type="button"
                        onClick={onSearchOpen}
                        className="p-2 text-slate-700 hover:text-primary hover:bg-red-50/70 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label="Cari produk"
                    >
                        <Search className="w-5 h-5" strokeWidth={2} />
                    </button>

                    {/* Tombol Akun: Langsung ke URL Akun */}
                    <Link
                        href="/account"
                        id="btn-akun"
                        className="p-2 text-slate-700 hover:text-primary hover:bg-red-50/70 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none relative"
                        aria-label={
                            authUser
                                ? `Profil ${authUser.name}`
                                : "Halaman Akun Pengguna"
                        }
                    >
                        <User className="w-5 h-5" strokeWidth={2} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
