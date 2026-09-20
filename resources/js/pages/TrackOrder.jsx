import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function TrackOrder({ nomorPesanan = '', orderNumber = '', pesanan = null, order = null, keranjang = {}, cart = {} }) {
    const activeNumber = nomorPesanan || orderNumber || '';
    const activeOrder = pesanan || order || null;

    const [inputNumber, setInputNumber] = useState(activeNumber);

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputNumber.trim()) {
            router.get('/lacak', { nomor: inputNumber.trim() });
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-3xl font-black text-slate-800">Lacak Status Pesanan</h1>
                    <p className="text-xs text-slate-500 mt-1">Masukkan Nomor Pesanan (Contoh: INV/CRSL/20260920/XXXX) untuk melacak status</p>

                    <form onSubmit={handleSearch} className="mt-6 flex max-w-md mx-auto gap-2">
                        <input
                            type="text"
                            value={inputNumber}
                            onChange={(e) => setInputNumber(e.target.value)}
                            placeholder="Nomor Pesanan..."
                            className="flex-1 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-full px-4 py-3 focus:outline-none focus:border-[#E52027]"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-extrabold px-6 py-3 rounded-full shadow-md transition-all"
                        >
                            Lacak
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {activeNumber && !activeOrder && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
                        <div className="text-4xl">❌</div>
                        <h3 className="font-bold text-slate-800 text-sm">Pesanan Tidak Ditemukan</h3>
                        <p className="text-xs text-slate-500">Nomor pesanan <strong>"{activeNumber}"</strong> tidak terdaftar dalam sistem kami.</p>
                    </div>
                )}

                {activeOrder && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
                        {/* Status Timeline */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 text-base">Pesanan #{activeOrder.nomor_pesanan || activeOrder.order_number}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Total: <strong className="text-[#E52027]">{formatRupiah(activeOrder.total)}</strong></p>
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase">
                                    {activeOrder.status}
                                </span>
                            </div>

                            {/* Tracking Timeline Steps */}
                            <div className="grid grid-cols-4 gap-2 text-center text-xs py-4 relative">
                                <div className="space-y-1">
                                    <div className="w-8 h-8 rounded-full bg-[#E52027] text-white font-bold flex items-center justify-center mx-auto text-sm">1</div>
                                    <p className="font-bold text-slate-800">Pesanan Dibuat</p>
                                </div>
                                <div className="space-y-1">
                                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-sm ${activeOrder.status !== 'belum_bayar' ? 'bg-[#E52027] text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                                    <p className="font-bold text-slate-600">Pembayaran</p>
                                </div>
                                <div className="space-y-1">
                                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-sm ${['dikirim', 'selesai'].includes(activeOrder.status) ? 'bg-[#E52027] text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                                    <p className="font-bold text-slate-600">Pengiriman</p>
                                </div>
                                <div className="space-y-1">
                                    <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-sm ${activeOrder.status === 'selesai' ? 'bg-[#E52027] text-white' : 'bg-slate-200 text-slate-500'}`}>4</div>
                                    <p className="font-bold text-slate-600">Selesai</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Item Dipesan:</h4>
                            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                                {(activeOrder.item || activeOrder.items || []).map((item) => (
                                    <div key={item.id} className="p-3.5 flex justify-between items-center">
                                        <div>
                                            <h5 className="font-bold text-slate-800">{item.nama_produk || item.product_name}</h5>
                                            <p className="text-[10px] text-slate-500">Jumlah: {item.jumlah ?? item.quantity}</p>
                                        </div>
                                        <span className="font-bold text-slate-800">{formatRupiah((item.harga || item.price) * (item.jumlah ?? item.quantity))}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
