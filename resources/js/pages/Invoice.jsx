import React from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Invoice({ pesanan, order, detailBank = {}, bankDetails = {}, keranjang = {}, cart = {} }) {
    const activeOrder = pesanan || order || {};
    const activeBank = Object.keys(detailBank).length > 0 ? detailBank : bankDetails;

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'belum_bayar': return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-full text-xs">MENUNGGU PEMBAYARAN</span>;
            case 'akan_dikirim': return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-extrabold px-3 py-1 rounded-full text-xs">DIPROSES</span>;
            case 'dikirim': return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 font-extrabold px-3 py-1 rounded-full text-xs">DALAM PENGIRIMAN</span>;
            case 'selesai': return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs">SELESAI</span>;
            default: return <span className="bg-slate-100 text-slate-800 font-extrabold px-3 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    const orderItems = activeOrder.item || activeOrder.items || [];

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                ✅ PESANAN BERHASIL DIBUAT
                            </span>
                            <h1 className="text-2xl font-black text-slate-800 mt-1">Invoice #{activeOrder.nomor_pesanan || activeOrder.order_number}</h1>
                        </div>
                        <div>{statusBadge(activeOrder.status)}</div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Payment Instruction Banner */}
                {activeOrder.status === 'belum_bayar' && (
                    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-2xl shadow-md space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">💳</span>
                            <div>
                                <h3 className="font-extrabold text-base">Instruksi Pembayaran</h3>
                                <p className="text-xs text-red-100">Silakan selesaikan pembayaran sebesar <strong className="text-yellow-300">{formatRupiah(activeOrder.total)}</strong></p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl text-xs space-y-2 border border-white/20">
                            <div>
                                <p className="font-bold text-red-100">Transfer Bank BCA:</p>
                                <p className="text-lg font-black tracking-wider text-white mt-0.5">{activeBank.bca?.nomor || activeBank.bca?.number || '8730-8888-21'}</p>
                                <p className="text-[11px] text-red-200">a.n. {activeBank.bca?.nama || activeBank.bca?.name || 'PT CRSL MERCHANDISE INDONESIA'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Rincian Pesanan</h4>
                            <p className="font-medium text-slate-800 leading-relaxed">
                                Nomor Pesanan: {activeOrder.nomor_pesanan || activeOrder.order_number}<br/>
                                Total Pembayaran: {formatRupiah(activeOrder.total)}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Transaksi</h4>
                            <ul className="space-y-1 text-slate-700">
                                <li>Tanggal: <strong>{activeOrder.created_at ? new Date(activeOrder.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hari Ini'}</strong></li>
                                {activeOrder.catatan && <li>Catatan: <em>{activeOrder.catatan}</em></li>}
                            </ul>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Item Produk</h4>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                            {orderItems.map((item) => (
                                <div key={item.id} className="p-3 bg-slate-50 flex items-center justify-between gap-4">
                                    <div className="font-bold text-slate-800">{item.nama_produk || item.name}</div>
                                    <div className="text-slate-500">{item.jumlah ?? item.quantity} x {formatRupiah(item.harga || item.price)}</div>
                                    <div className="font-black text-slate-900">{formatRupiah((item.harga || item.price) * (item.jumlah ?? item.quantity))}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Link href="/lacak" className="text-xs font-bold text-[#E52027] hover:underline">
                            ← Lacak Status Pesanan
                        </Link>
                        <Link href="/katalog" className="bg-[#E52027] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs">
                            Kembali Belanja
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
