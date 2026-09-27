import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import KartuLoyalitas from "../Components/Akun/KartuLoyalitas";
import KartuVoucher from "../Components/Akun/KartuVoucher";
import PesananTab, { OrderItem } from "../Components/Akun/PesananTab";
import WishlistTab, { WishlistItem } from "../Components/Akun/WishlistTab";
import ModalLoyaltyTiers, {
    TierItem,
} from "../Components/Akun/ModalLoyaltyTiers";
import { useAuthStore } from "../Stores/useAuthStore";

interface AccountProps {
    user?: {
        name?: string;
        email?: string;
        phone?: string;
        birth_day?: string;
        birth_month?: string;
        birth_year?: string;
    } | null;
    orders?: OrderItem[];
    wishlists?: WishlistItem[];
    loyalty?: {
        tier?: string;
        progress_text?: string;
        points?: number;
        total_spend?: number;
        tiers?: TierItem[];
    };
    vouchers?: any[];
    reseller_status?: string | null;
    harusBukaLogin?: boolean;
    flash_message?: string | null;
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
}: AccountProps) {
    const [tabAktif, setTabAktif] = useState<"orders" | "wishlist">("orders");
    const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    const isGuest = !user;

    useEffect(() => {
        if (harusBukaLogin && isGuest) {
            openAuthModal("login");
        }
    }, [harusBukaLogin, isGuest, openAuthModal]);

    return (
        <StorefrontLayout>
            <Head
                title={
                    isGuest
                        ? "My Account - CRSL Official Store"
                        : `My Account - ${user?.name || "Member"}`
                }
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
                {/* Flash Toast Notification */}
                {flash_message && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                        <div className="bg-slate-800/90 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-xl backdrop-blur-xs flex items-center gap-2">
                            <span className="text-emerald-400">✓</span>
                            <span>{flash_message}</span>
                        </div>
                    </div>
                )}

                {/* Guest Interface */}
                {isGuest ? (
                    <section
                        aria-labelledby="heading-guest"
                        className="space-y-6"
                    >
                        <h1
                            id="heading-guest"
                            className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight"
                        >
                            My Account
                        </h1>

                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="space-y-1 max-w-xl">
                                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                                    Join as a member to get more benefits
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    As a CRSL member, enjoy exclusive benefits,
                                    discounts, and earn points effortlessly with
                                    our free loyalty program.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("login")}
                                    className="px-6 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openAuthModal("register")}
                                    className="px-6 py-2 rounded-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                >
                                    Signup
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* Logged-in User Interface */
                    <section
                        aria-labelledby="heading-user"
                        className="space-y-6"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h1
                                id="heading-user"
                                className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                            >
                                Hi {user?.name || "Customer"}
                            </h1>

                            <div className="flex items-center gap-3">
                                {reseller_status && (
                                    <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                                        {reseller_status}
                                    </span>
                                )}

                                <Link
                                    href="/profile/myinfo"
                                    className="px-5 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Settings
                                </Link>
                            </div>
                        </div>

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

                {/* Tabs Container */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    <div className="border-b border-slate-200">
                        <div
                            role="tablist"
                            aria-label="Navigasi Akun"
                            className="flex space-x-12 -mb-px"
                        >
                            <button
                                role="tab"
                                id="tab-orders"
                                aria-selected={tabAktif === "orders"}
                                aria-controls="panel-orders"
                                type="button"
                                onClick={() => setTabAktif("orders")}
                                className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
                                    tabAktif === "orders"
                                        ? "text-slate-900 border-b-2 border-slate-900"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                Orders
                            </button>

                            <button
                                role="tab"
                                id="tab-wishlist"
                                aria-selected={tabAktif === "wishlist"}
                                aria-controls="panel-wishlist"
                                type="button"
                                onClick={() => setTabAktif("wishlist")}
                                className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
                                    tabAktif === "wishlist"
                                        ? "text-slate-900 border-b-2 border-slate-900"
                                        : "text-slate-500 hover:text-slate-800"
                                }`}
                            >
                                Wishlist
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
