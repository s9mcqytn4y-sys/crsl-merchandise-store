import { useEffect, useState, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, Search, User } from "lucide-react";
import { AuthUser } from "../types";
import { cn } from "../lib/utils";

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
        case "SGD":
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
                    <rect width="18" height="6" fill="#ED2939" />
                    <rect y="6" width="18" height="6" fill="#FFFFFF" />
                </svg>
            );
        case "MYR":
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
                    <rect width="18" height="12" fill="#CC0000" />
                    <path
                        d="M0 2h18v2H0zm0 4h18v2H0zm0 4h18v2H0z"
                        fill="#FFFFFF"
                    />
                    <rect width="9" height="7" fill="#000066" />
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
                    <rect width="18" height="6" fill="#E52027" />
                    <rect y="6" width="18" height="6" fill="#FFFFFF" />
                </svg>
            );
    }
}

interface NavigasiUtamaProps {
    isMenuOpen: boolean;
    onMenuOpen: () => void;
    onSearchOpen: () => void;
    onPrefOpen: () => void;
    onOpenAuth?: () => void;
    currency?: string;
    authUser?: AuthUser | null;
    className?: string;
}

export default function NavigasiUtama({
    isMenuOpen,
    onMenuOpen,
    onSearchOpen,
    onPrefOpen,
    onOpenAuth,
    currency = "IDR",
    authUser = null,
    className,
}: NavigasiUtamaProps) {
    const { url } = usePage();


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

    const isAccountActive =
        url.startsWith("/account") || url.startsWith("/profile");

    return (
        <header
            className={cn(
                "w-full bg-white transition-all duration-200 sticky top-0 z-40 select-none",
                isScrolled
                    ? "border-b border-slate-200/90 shadow-2xs backdrop-blur-md bg-white/95"
                    : "border-b border-slate-100 shadow-none",
                className,
            )}
        >
            <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
                {/* SISI KIRI: Tombol Menu Drawer */}
                <div className="flex items-center">
                    <button
                        id="btn-hamburger-menu"
                        type="button"
                        onClick={onMenuOpen}
                        className="p-2 -ml-2 text-slate-700 hover:text-[#E52027] hover:bg-red-50/50 active:bg-red-50 rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                        aria-label="Buka menu navigasi utama"
                        aria-expanded={isMenuOpen}
                        aria-controls="side-menu-drawer"
                    >
                        <Menu className="w-5 h-5 stroke-[2.2]" />
                    </button>
                </div>

                {/* TENGAH: Logo Resmi CRSL */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] rounded-xl p-1 transition-transform active:scale-95"
                        aria-label="CRSL Official Store - Beranda"
                    >
                        <img
                            src="/assets/gambar/logo-crsl-bw.webp"
                            alt="CRSL Logo"
                            width={112}
                            height={32}
                            className="h-6 sm:h-7 md:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                                const target =
                                    e.currentTarget as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/assets/gambar/logo-crsl.png";
                            }}
                        />
                    </Link>
                </div>

                {/* SISI KANAN: Tombol Aksi */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Preferensi Mata Uang & Wilayah */}
                    <button
                        id="btn-preferensi-wilayah"
                        type="button"
                        onClick={onPrefOpen}
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-slate-900 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer shadow-2xs"
                        aria-label={`Mata uang aktif: ${currency}`}
                    >
                        <IkonBendera currency={currency} />
                        <span className="hidden xs:inline sm:inline font-mono">
                            {currency}
                        </span>
                    </button>

                    {/* Tombol Pencarian */}
                    <button
                        id="btn-pencarian"
                        type="button"
                        onClick={onSearchOpen}
                        className="p-2 text-slate-700 hover:text-[#E52027] hover:bg-red-50/60 rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                        aria-label="Cari produk toko"
                    >
                        <Search className="w-5 h-5 stroke-[2.2]" />
                    </button>

                    {/* Tombol Akun / Profil */}
                    {authUser ? (
                        <Link
                            href="/account"
                            id="btn-akun"
                            className={cn(
                                "p-2 rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer relative",
                                isAccountActive
                                    ? "bg-red-50 text-[#E52027]"
                                    : "text-slate-700 hover:text-[#E52027] hover:bg-red-50/60",
                            )}
                            aria-label={`Profil ${authUser.name || (authUser as any).nama || "Akun"}`}
                        >
                            <User className="w-5 h-5 stroke-[2.2]" />
                        </Link>
                    ) : (
                        <button
                            type="button"
                            id="btn-akun-guest"
                            onClick={() => {
                                if (onOpenAuth) {
                                    onOpenAuth();
                                } else {
                                    onMenuOpen();
                                }
                            }}
                            className="p-2 text-slate-700 hover:text-[#E52027] hover:bg-red-50/60 rounded-2xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                            aria-label="Masuk atau daftar akun"
                        >
                            <User className="w-5 h-5 stroke-[2.2]" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
