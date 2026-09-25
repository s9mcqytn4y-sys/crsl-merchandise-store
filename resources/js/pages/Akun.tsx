import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeaderProfil from '../Components/Akun/HeaderProfil';
import KartuLoyalitas from '../Components/Akun/KartuLoyalitas';
import KartuVoucher from '../Components/Akun/KartuVoucher';
import PesananTab, { OrderItem } from '../Components/Akun/PesananTab';
import WishlistTab, { WishlistItem } from '../Components/Akun/WishlistTab';
import MyInfoSection from '../Components/Akun/MyInfoSection';
import ModalEditProfil from '../Components/Akun/ModalEditProfil';
import ModalKelolaAlamat, { DeliveryAddress } from '../Components/Akun/ModalKelolaAlamat';
import { ShoppingBag, Heart, MapPin, UserCheck, LogIn, Sparkles } from 'lucide-react';
import { useAuthStore } from '../Stores/useAuthStore';

interface AccountProps {
    user?: {
        name?: string;
        email?: string;
        phone?: string;
        birth_day?: string;
        birth_month?: string;
        birth_year?: string;
        gender?: string;
    } | null;
    orders?: OrderItem[];
    wishlists?: WishlistItem[];
    loyalty?: {
        tier?: string;
        progress_text?: string;
    };
    addresses?: DeliveryAddress[];
    reseller_status?: string | null;
    vouchers?: any[];
    initialView?: 'dashboard' | 'profile' | 'delivery' | 'account_info';
}

export default function Akun({
    user,
    orders = [],
    wishlists = [],
    loyalty,
    addresses = [],
    reseller_status,
    vouchers = [],
    initialView = 'dashboard',
}: AccountProps) {
    const defaultTab = initialView === 'profile' ? 'myinfo' : 'pesanan';
    const [tabAktif, setTabAktif] = useState<'pesanan' | 'wishlist' | 'myinfo'>(defaultTab);
    const [isModalProfilBuka, setIsModalProfilBuka] = useState(false);
    const [isModalAlamatBuka, setIsModalAlamatBuka] = useState(false);
    const openLogin = useAuthStore((state) => state.openLogin);

    const isGuest = !user;

    return (
        <StorefrontLayout>
            <Head title={isGuest ? "Akun Pelanggan - CRSL Official Store" : `Akun Saya - ${user.name}`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* 1. Banner Guest / Header Profil User */}
                {isGuest ? (
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700">
                        <div className="space-y-2 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold tracking-wider uppercase border border-red-500/30">
                                <Sparkles className="w-3.5 h-3.5 text-[#E52027]" />
                                <span>CRSL Freen Membership</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Selamat Datang di CRSL Official Store!
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                                Masuk atau daftar akun untuk mengakses riwayat pesanan otomatis, menyimpan wishlist merchandise favorit, dan kumpulkan poin loyalitas New Freen.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={openLogin}
                                className="px-6 py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Masuk / Daftar Sekarang</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <HeaderProfil
                        nama={user.name || ''}
                        email={user.email}
                        resellerStatus={reseller_status}
                        onBukaPengaturan={() => setIsModalProfilBuka(true)}
                    />
                )}

                {/* 2. Ringkasan Loyalitas & Voucher (Guest & User Tetap Melihat Manfaat) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KartuLoyalitas
                        tier={loyalty?.tier || (isGuest ? 'Non-Member' : 'New Freen')}
                        progressText={
                            loyalty?.progress_text ||
                            (isGuest
                                ? 'Daftar sekarang & dapatkan 100 Welcome Points!'
                                : 'Belanja merchandise untuk mencapai tier Freen!')
                        }
                        onLihatDetail={() => setTabAktif('pesanan')}
                    />
                    <KartuVoucher vouchers={vouchers} />
                </div>

                {/* 3. Tab Navigation (Pesanan, Wishlist, My Info, Alamat) */}
                <div className="border-b border-slate-200">
                    <div className="flex items-center gap-6 overflow-x-auto [scrollbar-width:none]">
                        <button
                            type="button"
                            onClick={() => setTabAktif('pesanan')}
                            className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 shrink-0 cursor-pointer ${
                                tabAktif === 'pesanan'
                                    ? 'text-slate-900 border-b-2 border-[#E52027]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Pesanan</span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                    tabAktif === 'pesanan'
                                        ? 'bg-red-50 text-[#E52027]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {orders.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabAktif('wishlist')}
                            className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 shrink-0 cursor-pointer ${
                                tabAktif === 'wishlist'
                                    ? 'text-slate-900 border-b-2 border-[#E52027]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>Wishlist</span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                    tabAktif === 'wishlist'
                                        ? 'bg-red-50 text-[#E52027]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {wishlists.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabAktif('myinfo')}
                            className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 shrink-0 cursor-pointer ${
                                tabAktif === 'myinfo'
                                    ? 'text-slate-900 border-b-2 border-[#E52027]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Info Profil (My Info)</span>
                        </button>

                        {!isGuest && (
                            <button
                                type="button"
                                onClick={() => setIsModalAlamatBuka(true)}
                                className="pb-3.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors ml-auto hidden sm:flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>Alamat Tersimpan ({addresses.length})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 4. Tab Content */}
                {tabAktif === 'pesanan' && (
                    <PesananTab
                        orders={orders}
                        onCariPesanan={() => {
                            window.location.href = '/lacak';
                        }}
                    />
                )}

                {tabAktif === 'wishlist' && (
                    <WishlistTab wishlists={wishlists} />
                )}

                {tabAktif === 'myinfo' && (
                    <MyInfoSection
                        user={user}
                        isGuest={isGuest}
                        onOpenAuth={openLogin}
                    />
                )}
            </div>

            {/* Modals */}
            {!isGuest && (
                <>
                    <ModalEditProfil
                        isOpen={isModalProfilBuka}
                        onClose={() => setIsModalProfilBuka(false)}
                        user={user}
                    />

                    <ModalKelolaAlamat
                        isOpen={isModalAlamatBuka}
                        onClose={() => setIsModalAlamatBuka(false)}
                        addresses={addresses}
                    />
                </>
            )}
        </StorefrontLayout>
    );
}
