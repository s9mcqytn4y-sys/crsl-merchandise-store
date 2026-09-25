import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeaderProfil from '../Components/Akun/HeaderProfil';
import KartuLoyalitas from '../Components/Akun/KartuLoyalitas';
import KartuVoucher from '../Components/Akun/KartuVoucher';
import PesananTab, { OrderItem } from '../Components/Akun/PesananTab';
import WishlistTab, { WishlistItem } from '../Components/Akun/WishlistTab';
import ModalEditProfil from '../Components/Akun/ModalEditProfil';
import ModalKelolaAlamat, { DeliveryAddress } from '../Components/Akun/ModalKelolaAlamat';
import { ShoppingBag, Heart, MapPin, User, LogIn } from 'lucide-react';
import { useAuthStore } from '../Stores/useAuthStore';

interface AccountProps {
    user?: {
        name?: string;
        email?: string;
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
}: AccountProps) {
    const [tabAktif, setTabAktif] = useState<'pesanan' | 'wishlist'>('pesanan');
    const [isModalProfilBuka, setIsModalProfilBuka] = useState(false);
    const [isModalAlamatBuka, setIsModalAlamatBuka] = useState(false);
    const openLogin = useAuthStore((state) => state.openLogin);

    // Jika pengguna belum login
    if (!user) {
        return (
            <StorefrontLayout>
                <Head title="Akun Saya - CRSL Official Store" />
                <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E52027] flex items-center justify-center mx-auto border border-red-100 shadow-2xs">
                        <User className="w-7 h-7" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        Masuk ke Akun Anda
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        Akses riwayat pesanan, kumpulkan poin loyalitas membership, dan simpan daftar wishlist favoritmu.
                    </p>
                    <button
                        type="button"
                        onClick={openLogin}
                        className="inline-flex items-center gap-2 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                    >
                        <LogIn className="w-4 h-4" />
                        Masuk / Daftar Sekarang
                    </button>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout>
            <Head title={`Akun Saya - ${user.name || 'CRSL Store'}`} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
                {/* 1. Header Profil */}
                <HeaderProfil
                    nama={user.name || ''}
                    email={user.email}
                    resellerStatus={reseller_status}
                    onBukaPengaturan={() => setIsModalProfilBuka(true)}
                />

                {/* 2. Ringkasan Loyalitas & Voucher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KartuLoyalitas
                        tier={loyalty?.tier || 'Non-Member'}
                        progressText={loyalty?.progress_text || 'Kumpulkan poin dengan berbelanja merchandise original CRSL!'}
                        onLihatDetail={() => setTabAktif('pesanan')}
                    />
                    <KartuVoucher vouchers={vouchers} />
                </div>

                {/* 3. Tab Switcher (Pesanan & Wishlist) */}
                <div className="border-b border-slate-200">
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => setTabAktif('pesanan')}
                            className={`pb-3.5 text-sm font-black transition-all relative flex items-center gap-2 ${
                                tabAktif === 'pesanan'
                                    ? 'text-slate-900 border-b-2 border-[#E52027]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Pesanan</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                tabAktif === 'pesanan' ? 'bg-red-50 text-[#E52027]' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {orders.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setTabAktif('wishlist')}
                            className={`pb-3.5 text-sm font-black transition-all relative flex items-center gap-2 ${
                                tabAktif === 'wishlist'
                                    ? 'text-slate-900 border-b-2 border-[#E52027]'
                                    : 'text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>Wishlist</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                tabAktif === 'wishlist' ? 'bg-red-50 text-[#E52027]' : 'bg-slate-100 text-slate-500'
                            }`}>
                                {wishlists.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsModalAlamatBuka(true)}
                            className="pb-3.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors ml-auto hidden sm:flex items-center gap-1.5"
                        >
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Alamat Tersimpan ({addresses.length})</span>
                        </button>
                    </div>
                </div>

                {/* 4. Konten Tab Aktif */}
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
            </div>

            {/* Modals */}
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
        </StorefrontLayout>
    );
}
