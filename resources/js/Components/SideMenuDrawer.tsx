import { useMemo, Fragment } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Transition,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
} from "@headlessui/react";
import {
    X,
    LogOut,
    LogIn,
    User,
    Sparkles,
    ChevronRight,
    ShoppingBag,
    HelpCircle,
} from "lucide-react";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { AuthUser } from "../types";
import { cn } from "../lib/utils";

export interface NavigasiItem {
    label: string;
    href: string;
    isHighlight?: boolean;
    badgeText?: string;
}

export interface KategoriItem {
    id: number | string;
    nama: string;
    slug: string;
}

interface SideMenuDrawerProps {
    isOpen?: boolean;
    onClose: () => void;
    authUser?: AuthUser | null;
    kategori?: KategoriItem[];
    menuItems?: NavigasiItem[];
    onOpenAuth?: () => void;
    onLogout?: () => void;
    className?: string;
}

const DEFAULT_NAV_ITEMS: NavigasiItem[] = [
    { label: "Beranda", href: "/" },
    { label: "Semua Produk", href: "/katalog" },
    {
        label: "Best Seller",
        href: "/katalog?urutan=terlaris",
        isHighlight: true,
        badgeText: "Hot",
    },
    { label: "New Arrival", href: "/katalog?urutan=terbaru" },
    {
        label: "Paket Bundle",
        href: "/katalog?tipe=bundle",
        badgeText: "Hemat",
    },
];

export default function SideMenuDrawer({
    isOpen = false,
    onClose,
    authUser,
    kategori,
    menuItems,
    onOpenAuth,
    onLogout,
    className,
}: SideMenuDrawerProps) {
    const { url, props } = usePage();
    const isShowing = Boolean(isOpen ?? false);

    // Ambil nama pengguna dengan fallback tangguh nama/name
    const displayName = useMemo(() => {
        if (!authUser) return "";
        return authUser.name || (authUser as any).nama || "Pelanggan CRSL";
    }, [authUser]);

    // Defensive resolution untuk daftar navigasi (mencegah undefined .map)
    const listNavigasi: NavigasiItem[] = useMemo(() => {
        if (Array.isArray(menuItems) && menuItems.length > 0) return menuItems;
        if (
            Array.isArray((SITUS_CONFIG as any)?.navigasiKategori) &&
            (SITUS_CONFIG as any).navigasiKategori.length > 0
        ) {
            return (SITUS_CONFIG as any).navigasiKategori;
        }
        return DEFAULT_NAV_ITEMS;
    }, [menuItems]);

    // Defensive resolution untuk kategori produk dari props atau shared inertia
    const listKategori: KategoriItem[] = useMemo(() => {
        if (Array.isArray(kategori) && kategori.length > 0) return kategori;
        const pageKategori =
            (props as any)?.kategori ?? (props as any)?.categories;
        return Array.isArray(pageKategori) ? pageKategori : [];
    }, [kategori, props]);

    const maskotList = Array.isArray(SITUS_CONFIG?.maskot)
        ? SITUS_CONFIG.maskot
        : [];

    return (
        <Transition show={isShowing} as={Fragment}>
            <Dialog
                as="div"
                id="side-menu-drawer"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Blur Overlay */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Sliding Drawer Container */}
                <div className="fixed inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                        <TransitionChild
                            as={Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-250"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="pointer-events-auto w-[85vw] max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col h-full border-r border-slate-200/80">
                                {/* Header Drawer */}
                                <div className="h-16 px-4 sm:px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                                    <DialogTitle className="sr-only">
                                        Menu Navigasi Utama
                                    </DialogTitle>

                                    <Link
                                        href="/"
                                        onClick={onClose}
                                        className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl py-1 px-1 transition-transform active:scale-95"
                                        aria-label="Beranda CRSL"
                                    >
                                        <img
                                            src="/assets/gambar/logo-crsl.png"
                                            alt="Logo CRSL"
                                            width={32}
                                            height={32}
                                            className="h-8 w-auto object-contain"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src =
                                                    "/assets/gambar/placeholder.webp";
                                            }}
                                        />
                                        <span className="font-black text-lg text-primary tracking-wider font-mono">
                                            CRSL
                                        </span>
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 -mr-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                                        aria-label="Tutup menu navigasi"
                                    >
                                        <X className="w-5 h-5 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Menu List Navigasi */}
                                <nav
                                    className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 overscroll-contain no-scrollbar"
                                    aria-label="Menu navigasi etalase"
                                >
                                    {/* 1. Navigasi Utama */}
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                                            Menu Utama
                                        </p>
                                        <ul className="space-y-1" role="list">
                                            {listNavigasi.map(
                                                (item: NavigasiItem) => {
                                                    const isActive =
                                                        item.href === "/"
                                                            ? url === "/"
                                                            : url.startsWith(
                                                                  item.href,
                                                              );

                                                    return (
                                                        <li
                                                            key={
                                                                item.href ||
                                                                item.label
                                                            }
                                                        >
                                                            <Link
                                                                href={item.href}
                                                                onClick={
                                                                    onClose
                                                                }
                                                                className={cn(
                                                                    "group flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                                    isActive &&
                                                                        "bg-red-50/80 text-primary shadow-2xs",
                                                                    !isActive &&
                                                                        item.isHighlight &&
                                                                        "bg-amber-50/60 text-amber-900 hover:bg-amber-100/60",
                                                                    !isActive &&
                                                                        !item.isHighlight &&
                                                                        "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                                                                )}
                                                                aria-current={
                                                                    isActive
                                                                        ? "page"
                                                                        : undefined
                                                                }
                                                            >
                                                                <span className="flex items-center gap-2.5">
                                                                    {item.isHighlight ? (
                                                                        <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
                                                                    ) : (
                                                                        <ShoppingBag className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                                                                    )}
                                                                    <span className="truncate">
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </span>
                                                                </span>

                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {item.badgeText ? (
                                                                        <span className="text-[10px] uppercase tracking-wider font-black bg-primary text-white px-2 py-0.5 rounded-md shadow-2xs font-mono">
                                                                            {
                                                                                item.badgeText
                                                                            }
                                                                        </span>
                                                                    ) : null}

                                                                    <ChevronRight
                                                                        className={cn(
                                                                            "w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5",
                                                                            isActive
                                                                                ? "text-primary"
                                                                                : "text-slate-400",
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    );
                                                },
                                            )}
                                        </ul>
                                    </div>

                                    {/* 2. Daftar Kategori Produk (Jika ada data) */}
                                    {listKategori.length > 0 && (
                                        <div className="space-y-1 pt-3 border-t border-slate-100">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                                                Kategori Pilihan
                                            </p>
                                            <ul
                                                className="space-y-1"
                                                role="list"
                                            >
                                                {listKategori.map((kat) => (
                                                    <li key={kat.id}>
                                                        <Link
                                                            href={`/katalog?kategori=${kat.slug}`}
                                                            onClick={onClose}
                                                            className="flex items-center justify-between py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary hover:bg-red-50/40 transition-all group"
                                                        >
                                                            <span>
                                                                {kat.nama}
                                                            </span>
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* 3. Karakter Maskot CRSL */}
                                    {maskotList.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-slate-100">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span>
                                                    Karakter Maskot CRSL
                                                </span>
                                            </p>
                                            <div className="grid grid-cols-2 gap-1.5 px-1">
                                                {maskotList.map((m) => (
                                                    <Link
                                                        key={m.nama}
                                                        href={`/katalog?cari=${encodeURIComponent(m.nama)}`}
                                                        onClick={onClose}
                                                        className="flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 hover:border-primary hover:bg-red-50/30 transition-all group shadow-2xs"
                                                    >
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    m.warnaHex,
                                                            }}
                                                        />
                                                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary truncate">
                                                            {m.nama}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </nav>

                                {/* Footer Drawer */}
                                <div
                                    className="border-t border-slate-100 p-4 space-y-2.5 bg-slate-50/80 shrink-0"
                                    style={{
                                        paddingBottom:
                                            "max(1rem, env(safe-area-inset-bottom))",
                                    }}
                                >
                                    {authUser ? (
                                        <>
                                            <Link
                                                href="/account"
                                                onClick={onClose}
                                                className="flex items-center gap-3 p-2.5 bg-white border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-all shadow-2xs group cursor-pointer"
                                                aria-label="Ke halaman akun profil saya"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-red-50 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                                    <User className="w-4 h-4 stroke-[2.2]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-slate-900 truncate">
                                                        {displayName}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 truncate font-mono">
                                                        {authUser.email}
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>

                                            {onLogout && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose();
                                                        onLogout();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
                                                    aria-label="Keluar dari akun"
                                                >
                                                    <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                                                    <span>Keluar Akun</span>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onOpenAuth?.();
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover active:scale-[0.99] shadow-md shadow-red-500/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                                            aria-label="Masuk atau buat akun baru"
                                        >
                                            <LogIn className="w-4 h-4 stroke-[2.5]" />
                                            <span>Masuk / Daftar Akun</span>
                                        </button>
                                    )}

                                    {/* Link Bantuan CS */}
                                    <a
                                        href={`https://wa.me/${(SITUS_CONFIG.whatsappCS || "").replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 font-bold text-xs transition-colors shadow-2xs"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
                                        <span>Bantuan CS WhatsApp</span>
                                    </a>

                                    <p className="text-center text-[10px] text-slate-400 font-semibold tracking-wide pt-0.5 select-none">
                                        Animals as your Bestfriends! 🐾
                                    </p>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
