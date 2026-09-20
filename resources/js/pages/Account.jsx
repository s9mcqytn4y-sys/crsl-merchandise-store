import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { Package, Heart, Award, ArrowRight, ExternalLink } from 'lucide-react';

export default function Account({
    pengguna = {},
    user = {},
    pesananList = [],
    orders = [],
    wishlistList = [],
    wishlists = [],
    loyalitas = {},
    keranjang = {},
    cart = {}
}) {
    const activeUser = Object.keys(pengguna).length > 0 ? pengguna : user;
    const activeOrders = pesananList.length > 0 ? pesananList : orders;
    const activeWishlists = wishlistList.length > 0 ? wishlistList : wishlists;

    const [activeTab, setActiveTab] = useState('orders');

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'belum_bayar':
                return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">MENUNGGU PEMBAYARAN</span>;
            case 'akan_dikirim':
                return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">DIPROSES / AKAN DIKIRIM</span>;
            case 'dikirim':
                return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">DALAM PENGIRIMAN</span>;
            case 'selesai':
                return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">SELESAI</span>;
            case 'dibatalkan':
                return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">DIBATALKAN</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] uppercase">{status}</span>;
        }
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-black text-slate-800">Akun Saya</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola riwayat pesanan, status pengiriman, dan poin keanggotaan CRSL</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Profile Card */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-2xl shadow-md">
                            {activeUser.name?.[0] || activeUser.nama?.[0] || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-base text-slate-900 truncate">{activeUser.name || activeUser.nama || 'CRSL Bestie'}</h3>
                            <p className="text-xs text-slate-500 truncate">{activeUser.email || 'bestie@crslstore.com'}</p>
                            <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                🌟 {loyalitas.tier_nama || 'New Freen Member'}
                            </span>
                        </div>
                    </div>

                    {/* Loyalty Stats Box */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl space-y-2 border border-slate-700">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 flex items-center gap-1"><Award className="w-4 h-4 text-amber-400" /> Saldo Poin CRSL:</span>
                            <span className="font-extrabold text-amber-400 text-sm">{loyalitas.poin || 250} Poin</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-700">
                            <span>Total Belanja:</span>
                            <span className="font-bold text-white">{formatRupiah(loyalitas.total_belanja || 350000)}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                                activeTab === 'orders' ? 'bg-[#E52027] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Riwayat Pesanan</span>
                            <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">{activeOrders.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                                activeTab === 'wishlist' ? 'bg-[#E52027] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist Produk</span>
                            <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">{activeWishlists.length}</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-8">
                    {activeTab === 'orders' && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                                Riwayat Transaksi Pesanan
                            </h3>

                            {activeOrders.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <div className="text-5xl">📦</div>
                                    <p className="text-xs font-bold text-slate-700">Belum ada riwayat pesanan.</p>
                                    <p className="text-[11px] text-slate-400">Jelajahi koleksi merchandise CRSL dan buat pesanan pertamamu!</p>
                                    <Link href="/katalog" className="inline-block bg-[#E52027] text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-md hover:bg-red-700 transition-colors">
                                        Mulai Belanja Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeOrders.map((ord) => (
                                        <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h5 className="font-black text-xs text-slate-900">#{ord.nomor_pesanan}</h5>
                                                        {renderStatusBadge(ord.status)}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hari Ini'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/faktur/${ord.nomor_pesanan}`}
                                                        className="bg-white border border-slate-300 hover:border-[#E52027] text-slate-800 hover:text-[#E52027] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                                    >
                                                        Invoice <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600">Total Pembayaran: <strong className="text-[#E52027] font-extrabold text-sm ml-1">{formatRupiah(ord.total)}</strong></span>
                                                <Link href={`/lacak?nomor=${ord.nomor_pesanan}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                                                    Lacak Pengiriman <ArrowRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                                Wishlist Produk Saya
                            </h3>

                            {activeWishlists.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <div className="text-5xl">❤️</div>
                                    <p className="text-xs font-bold text-slate-700">Wishlist Anda masih kosong.</p>
                                    <p className="text-[11px] text-slate-400">Simpan produk favoritmu untuk dibeli nanti!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeWishlists.map((w) => {
                                        const prod = w.produk || w.product || {};
                                        return (
                                            <div key={w.id} className="p-3 border border-slate-200 rounded-2xl flex gap-3 items-center bg-slate-50 hover:bg-white transition-all">
                                                <img src={prod.gambar_utama || '/assets/gambar/cassie-wallet.webp'} alt={prod.nama} className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-200 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-xs text-slate-900 truncate">{prod.nama}</h5>
                                                    <p className="text-xs font-black text-[#E52027] mt-0.5">{formatRupiah(prod.harga_diskon ?? prod.harga_dasar)}</p>
                                                    <Link href={`/produk/${prod.slug}`} className="text-[10px] font-bold text-blue-600 hover:underline inline-block mt-1">
                                                        Lihat Detail Produk →
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
