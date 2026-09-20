import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Account({
    pengguna = {},
    user = {},
    pesananList = [],
    orders = [],
    wishlistList = [],
    wishlists = [],
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

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-black text-slate-800">Akun Saya</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola riwayat pesanan dan produk wishlist impianmu</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Profile Card */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-2xl shadow-md">
                            {activeUser.name?.[0] || activeUser.nama?.[0] || 'C'}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-slate-800">{activeUser.name || activeUser.nama || 'CRSL Bestie'}</h3>
                            <p className="text-xs text-slate-500">{activeUser.email || 'bestie@crslstore.com'}</p>
                            <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                🌟 CRSL Bestie Member
                            </span>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                                activeTab === 'orders' ? 'bg-[#E52027] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <span>📦 Riwayat Pesanan</span>
                            <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                                activeTab === 'wishlist' ? 'bg-[#E52027] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <span>❤️ Wishlist Produk</span>
                            <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full">{activeWishlists.length}</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="lg:col-span-8">
                    {activeTab === 'orders' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                                Riwayat Pesanan
                            </h3>

                            {activeOrders.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <div className="text-4xl">📦</div>
                                    <p className="text-xs font-semibold text-slate-600">Belum ada riwayat pesanan.</p>
                                    <Link href="/katalog" className="inline-block bg-[#E52027] text-white text-xs font-bold px-6 py-2 rounded-full">
                                        Mulai Belanja Now
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeOrders.map((ord) => (
                                        <div key={ord.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-black text-xs text-slate-800">#{ord.nomor_pesanan || ord.order_number}</h5>
                                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                                                        {ord.status}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    Total: <strong className="text-[#E52027]">{formatRupiah(ord.total)}</strong> • {(ord.item || ord.items)?.length || 0} item
                                                </p>
                                            </div>

                                            <Link
                                                href={`/faktur/${ord.nomor_pesanan || ord.order_number}`}
                                                className="bg-slate-100 hover:bg-[#E52027] text-slate-800 hover:text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                                            >
                                                Lihat Invoice
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                                Wishlist Saya
                            </h3>

                            {activeWishlists.length === 0 ? (
                                <div className="text-center py-12 space-y-2">
                                    <div className="text-4xl">❤️</div>
                                    <p className="text-xs font-semibold text-slate-600">Wishlist Anda masih kosong.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {activeWishlists.map((w) => {
                                        const prod = w.produk || w.product || {};
                                        return (
                                            <div key={w.id} className="p-3 border border-slate-200 rounded-xl flex gap-3 items-center">
                                                <img src={prod.gambar_utama || prod.main_image} alt={prod.nama || prod.name} className="w-14 h-14 object-cover rounded-lg bg-slate-100" />
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-xs text-slate-800 truncate">{prod.nama || prod.name}</h5>
                                                    <p className="text-xs font-black text-[#E52027] mt-0.5">{formatRupiah(prod.harga_diskon ?? prod.harga_dasar ?? prod.price)}</p>
                                                    <Link href={`/produk/${prod.slug}`} className="text-[10px] font-bold text-blue-600 hover:underline">
                                                        Lihat Detail
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
