import React, { useState, useEffect } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import KartuLoyalitas from "../Components/Akun/KartuLoyalitas";
import KartuVoucher from "../Components/Akun/KartuVoucher";
import PesananTab, { OrderItem } from "../Components/Akun/PesananTab";
import WishlistTab, { WishlistItem } from "../Components/Akun/WishlistTab";
import ModalLoyaltyTiers, {
    TierItem,
} from "../Components/Akun/ModalLoyaltyTiers";
import { useAuthStore } from "../Stores/useAuthStore";
import { toast } from "sonner";
import { Settings, ShoppingBag, Heart, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

export interface UserAccountData {
    id?: number | string;
    name?: string;
    email?: string;
    phone?: string;
    birth_day?: string;
    birth_month?: string;
    birth_year?: string;
}

export interface LoyaltyData {
    tier?: string;
    progress_text?: string;
    points?: number;
    total_spend?: number;
    tiers?: TierItem[];
}

export interface AkunPageProps {
    user?: UserAccountData | null;
    orders?: OrderItem[];
    wishlists?: WishlistItem[];
    loyalty?: LoyaltyData;
    vouchers?: any[];
    reseller_status?: string | null;
    harusBukaLogin?: boolean;
    flash_message?: string | null;
    tabAwal?: "orders" | "wishlist";
    className?: string;
}

export default function Akun({
    user,
    orders = [],
    wishlists = [],
    loyalty,
    vouchers = [],
    reseller_status,
    harusBukaLogin = false,
    flash_message,
    tabAwal = "orders",
    className,
}: AkunPageProps) {
    const { url } = usePage();

    // Membaca tab dari URL query jika ada (?tab=wishlist)
    const initialTab = useMemoTabFromUrl(url, tabAwal);
    const [tabAktif, setTabAktif] = useState<"orders" | "wishlist">(initialTab);
    const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    const isGuest = !user;

    // Trigger popup login saat diarahkan dari checkout / guest guard
    useEffect(() => {
        if (harusBukaLogin && isGuest) {
            openAuthModal("login");
        }
    }, [harusBukaLogin, isGuest, openAuthModal]);

    // Menampilkan flash toast dari controller via Sonner
    useEffect(() => {
        if (flash_message) {
            toast.success(flash_message);
        }
    }, [flash_message]);

    // Keyboard navigation WAI-ARIA tablist (ArrowLeft & ArrowRight)
    const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            setTabAktif("wishlist");
            document.getElementById("tab-wishlist")?.focus();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            setTabAktif("orders");
            document.getElementById("tab-orders")?.focus();
        }
    };

    return (
        <StorefrontLayout>
            <Head
                title={
                    isGuest
                        ? "Akun Saya - CRSL Official Store"
                        : `Akun Saya - ${user?.name || "Member"}`
                }
            />

            <div
                className={cn(
                    "max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 select-none",
                    className,
                )}
            >
                {/* 1. Guest Interface Banner */}
                {isGuest ? (
                    <section
                        aria-labelledby="heading-guest"
                        className="space-y-4"
                    >
                        <div>
                            <span className="text-xs font-black text-primary uppercase tracking-wider">
                                CRSL Membership
                            </span>
                            <h1
                                id="heading-guest"
                                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5"
                            >
                                Akun Saya
                            </h1>
                        </div>

                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="space-y-1.5 max-w-xl">
                                <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h2>Bergabung Menjadi Member CRSL</h2>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Dapatkan voucher diskon khusus member,
                                    kumpulkan Koin Loyalitas pada setiap
                                    pembelian, dan nikmati kemudahan pelacakan
                                    pesanan tanpa batas.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("login")}
                                    className="px-6 py-2.5 rounded-2xl border border-slate-300 hover:border-primary text-slate-700 hover:text-primary hover:bg-red-50/30 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                                >
                                    Masuk
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("register")}
                                    className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
                                >
                                    Daftar Akun
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* 2. Logged-in User Header & Loyalty Cards */
                    <section
                        aria-labelledby="heading-user"
                        className="space-y-6"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                            <div>
                                <span className="text-xs font-black text-primary uppercase tracking-wider">
                                    Member Area
                                </span>
                                <h1
                                    id="heading-user"
                                    className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5"
                                >
                                    Halo, {user?.name || "Customer"}!
                                </h1>
                            </div>

                            <div className="flex items-center gap-2.5">
                                {reseller_status && (
                                    <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 font-mono">
                                        {reseller_status}
                                    </span>
                                )}

                                <Link
                                    href="/profile/myinfo"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-primary text-slate-700 hover:text-primary hover:bg-red-50/30 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                                >
                                    <Settings className="w-3.5 h-3.5 stroke-[2.2]" />
                                    <span>Pengaturan Akun</span>
                                </Link>
                            </div>
                        </div>

                        {/* Kartu Ringkasan Member & Voucher */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <KartuLoyalitas
                                tier={loyalty?.tier || "Non-Member"}
                                progressText={loyalty?.progress_text}
                                onLihatDetail={() =>
                                    setIsLoyaltyModalOpen(true)
                                }
                            />
                            <KartuVoucher vouchers={vouchers} />
                        </div>
                    </section>
                )}

                {/* 3. Panel Tab Interaktif (Orders & Wishlist) */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="border-b border-slate-100">
                        <div
                            role="tablist"
                            aria-label="Navigasi Menu Akun"
                            className="flex space-x-8 -mb-px"
                        >
                            <button
                                role="tab"
                                id="tab-orders"
                                aria-selected={tabAktif === "orders"}
                                aria-controls="panel-orders"
                                tabIndex={tabAktif === "orders" ? 0 : -1}
                                onKeyDown={handleTabKeyDown}
                                type="button"
                                onClick={() => setTabAktif("orders")}
                                className={cn(
                                    "pb-3.5 text-xs sm:text-sm font-black tracking-tight transition-all cursor-pointer relative flex items-center gap-2 focus:outline-none focus-visible:text-primary",
                                    tabAktif === "orders"
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-slate-400 hover:text-slate-700",
                                )}
                            >
                                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                <span>Riwayat Pesanan</span>
                                {orders.length > 0 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                                        {orders.length}
                                    </span>
                                )}
                            </button>

                            <button
                                role="tab"
                                id="tab-wishlist"
                                aria-selected={tabAktif === "wishlist"}
                                aria-controls="panel-wishlist"
                                tabIndex={tabAktif === "wishlist" ? 0 : -1}
                                onKeyDown={handleTabKeyDown}
                                type="button"
                                onClick={() => setTabAktif("wishlist")}
                                className={cn(
                                    "pb-3.5 text-xs sm:text-sm font-black tracking-tight transition-all cursor-pointer relative flex items-center gap-2 focus:outline-none focus-visible:text-primary",
                                    tabAktif === "wishlist"
                                        ? "text-primary border-b-2 border-primary"
                                        : "text-slate-400 hover:text-slate-700",
                                )}
                            >
                                <Heart className="w-4 h-4 stroke-[2.2]" />
                                <span>Wishlist Saya</span>
                                {wishlists.length > 0 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                                        {wishlists.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div
                        role="tabpanel"
                        id={`panel-${tabAktif}`}
                        aria-labelledby={`tab-${tabAktif}`}
                        tabIndex={0}
                        className="focus:outline-none"
                    >
                        {tabAktif === "orders" ? (
                            <PesananTab
                                orders={orders}
                                userEmail={user?.email}
                                userPhone={user?.phone}
                            />
                        ) : (
                            <WishlistTab wishlists={wishlists} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Detail Level Loyalitas */}
            <ModalLoyaltyTiers
                isOpen={isLoyaltyModalOpen}
                onClose={() => setIsLoyaltyModalOpen(false)}
                currentTierName={loyalty?.tier}
                currentPoints={loyalty?.points}
                totalSpend={loyalty?.total_spend}
                progressText={loyalty?.progress_text}
                tiers={loyalty?.tiers}
            />
        </StorefrontLayout>
    );
}

/** Helper URL sync tab */
function useMemoTabFromUrl(
    url: string,
    defaultTab: "orders" | "wishlist",
): "orders" | "wishlist" {
    if (typeof window === "undefined" && !url) return defaultTab;
    try {
        const search = url && url.includes("?") ? url.split("?")[1] : (typeof window !== "undefined" ? window.location.search : "");
        const params = new URLSearchParams(search);
        const queryTab = params.get("tab");
        if (queryTab === "wishlist" || queryTab === "orders") {
            return queryTab;
        }
    } catch {
        // Fallback default tab
    }
    return defaultTab;
}
