import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import KartuLoyalitas from '../Components/Akun/KartuLoyalitas';
import KartuVoucher from '../Components/Akun/KartuVoucher';
import PesananTab, { OrderItem } from '../Components/Akun/PesananTab';
import WishlistTab, { WishlistItem } from '../Components/Akun/WishlistTab';
import { useAuthStore } from '../Stores/useAuthStore';

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
    const [tabAktif, setTabAktif] = useState<'orders' | 'wishlist'>('orders');
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    useEffect(() => {
        if (harusBukaLogin && !user) {
            openAuthModal('login');
        }
    }, [harusBukaLogin, user, openAuthModal]);

    const isGuest = !user;

    return (
        <StorefrontLayout>
            <Head title={isGuest ? "My Account - CRSL Official Store" : `My Account - ${user.name}`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
                {/* Toast Notification (Sesuai Screenshot 2: "✓ Login Success") */}
                {flash_message && (
                    <div className="flex justify-center -mt-2 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-slate-700/90 text-white px-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xl backdrop-blur-xs flex items-center gap-2">
                            <span>✓</span>
                            <span>{flash_message}</span>
                        </div>
                    </div>
                )}

                {/* 1. GUEST USER INTERFACE (Sesuai Screenshot 1) */}
                {isGuest ? (
                    <div className="space-y-6">
                        {/* Title My Account */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                            My Account
                        </h1>

                        {/* Banner Join as a Member */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="space-y-1 max-w-xl">
                                <h2 className="text-sm sm:text-base font-bold text-slate-800">
                                    Join as a member to get more benefits
                                </h2>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    As a CRSL member, enjoy exclusive benefits, discounts, and earn points effortlessly with our free loyalty program.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => openAuthModal('login')}
                                    className="px-6 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => openAuthModal('register')}
                                    className="px-6 py-2 rounded-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                                >
                                    Signup
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 2. LOGGED-IN USER INTERFACE (Sesuai Screenshot 2) */
                    <div className="space-y-6">
                        {/* Header Greeting Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Hi {user.name}
                            </h1>

                            <div className="flex items-center gap-3">
                                {reseller_status && (
                                    <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                                        {reseller_status}
                                    </span>
                                )}

                                <Link
                                    href="/profile/myinfo"
                                    className="px-5 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-50 font-bold text-xs transition-colors"
                                >
                                    Settings
                                </Link>
                            </div>
                        </div>

                        {/* Loyalty & Vouchers 2-Col Grid (Screenshot 2) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <KartuLoyalitas
                                tier={loyalty?.tier || 'Non-Member'}
                                progressText={loyalty?.progress_text || 'Spend Rp 200,000 more to reach New Freen'}
                                onLihatDetail={() => {}}
                            />
                            <KartuVoucher vouchers={vouchers} />
                        </div>
                    </div>
                )}

                {/* 3. TABS CONTAINER: Orders & Wishlist (Screenshot 1 & 2) */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    {/* Tabs Navigation */}
                    <div className="border-b border-slate-200">
                        <div className="flex space-x-12 -mb-px">
                            <button
                                type="button"
                                onClick={() => setTabAktif('orders')}
                                className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
                                    tabAktif === 'orders'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Orders
                            </button>

                            <button
                                type="button"
                                onClick={() => setTabAktif('wishlist')}
                                className={`pb-3 text-sm font-bold tracking-tight transition-all cursor-pointer relative ${
                                    tabAktif === 'wishlist'
                                        ? 'text-slate-900 border-b-2 border-slate-900'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Wishlist
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {tabAktif === 'orders' ? (
                        <PesananTab orders={orders} />
                    ) : (
                        <WishlistTab
                            wishlists={wishlists}
                            onBelanja={() => router.visit('/katalog')}
                        />
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
