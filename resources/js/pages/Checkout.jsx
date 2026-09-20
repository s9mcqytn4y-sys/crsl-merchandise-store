import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Checkout({
    keranjang = {},
    cart = {},
    subtotal = 0,
    kurirList = [],
    couriers = [],
    metodeBayarList = [],
    paymentMethods = []
}) {
    const activeCart = Object.keys(keranjang).length > 0 ? keranjang : cart;
    const cartItems = Object.values(activeCart);

    const activeCouriers = kurirList.length > 0 ? kurirList : couriers;
    const activePayments = metodeBayarList.length > 0 ? metodeBayarList : paymentMethods;

    const [selectedCourier, setSelectedCourier] = useState(activeCouriers[0]?.id || 'jne');
    const [selectedPayment, setSelectedPayment] = useState(activePayments[0]?.id || 'qris');

    const courierCost = activeCouriers.find((c) => c.id === selectedCourier)?.biaya ?? activeCouriers.find((c) => c.id === selectedCourier)?.cost ?? 18000;
    const grandTotal = subtotal + courierCost;

    const { data, setData, post, processing, errors } = useForm({
        nama_lengkap: '',
        email: '',
        telepon: '',
        alamat_lengkap: '',
        kota: '',
        kode_pos: '',
        kurir: selectedCourier,
        metode_pembayaran: selectedPayment,
        catatan: '',
    });

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/pembayaran');
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-black text-slate-800">Checkout Pesanan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Lengkapi informasi pengiriman dan metode pembayaran Anda</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Customer Form */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Information */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span>👤</span> Informasi Penerima
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        value={data.nama_lengkap}
                                        onChange={(e) => setData('nama_lengkap', e.target.value)}
                                        placeholder="Nama Penerima"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                        required
                                    />
                                    {errors.nama_lengkap && <span className="text-rose-500 text-[10px] mt-0.5">{errors.nama_lengkap}</span>}
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / Telepon *</label>
                                    <input
                                        type="tel"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                        required
                                    />
                                    {errors.telepon && <span className="text-rose-500 text-[10px] mt-0.5">{errors.telepon}</span>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="font-bold text-slate-700 block mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@domain.com"
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                        required
                                    />
                                    {errors.email && <span className="text-rose-500 text-[10px] mt-0.5">{errors.email}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span>📍</span> Alamat Pengiriman
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah) *</label>
                                    <textarea
                                        value={data.alamat_lengkap}
                                        onChange={(e) => setData('alamat_lengkap', e.target.value)}
                                        placeholder="Jl. Kaliurang KM 5, Depok, Sleman"
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kota / Kabupaten *</label>
                                        <input
                                            type="text"
                                            value={data.kota}
                                            onChange={(e) => setData('kota', e.target.value)}
                                            placeholder="Sleman / Yogyakarta"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1">Kode Pos *</label>
                                        <input
                                            type="text"
                                            value={data.kode_pos}
                                            onChange={(e) => setData('kode_pos', e.target.value)}
                                            placeholder="55281"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E52027]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Courier Selection */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span>🚚</span> Opsi Pengiriman (Biteship Rates)
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {activeCouriers.map((courier) => (
                                    <button
                                        type="button"
                                        key={courier.id}
                                        onClick={() => {
                                            setSelectedCourier(courier.id);
                                            setData('kurir', courier.id);
                                        }}
                                        className={`p-3.5 rounded-xl border text-left transition-all ${
                                            selectedCourier === courier.id
                                                ? 'border-[#E52027] bg-red-50 ring-1 ring-[#E52027]'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="font-bold text-xs text-slate-900">{courier.nama || courier.name}</div>
                                        <div className="text-[#E52027] font-extrabold text-xs mt-1">
                                            {formatRupiah(courier.biaya ?? courier.cost)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                                <span>💳</span> Metode Pembayaran (Midtrans Core API)
                            </h3>

                            <div className="space-y-2">
                                {activePayments.map((method) => (
                                    <button
                                        type="button"
                                        key={method.id}
                                        onClick={() => {
                                            setSelectedPayment(method.id);
                                            setData('metode_pembayaran', method.id);
                                        }}
                                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                                            selectedPayment === method.id
                                                ? 'border-[#E52027] bg-red-50 ring-1 ring-[#E52027]'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <span className="text-xl">{method.ikon || method.icon}</span>
                                        <div className="font-bold text-xs text-slate-800">{method.nama || method.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Summary Sidebar (Col-span-5) */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
                        <h3 className="font-black text-slate-900 text-base border-b border-slate-100 pb-3">
                            Ringkasan Pesanan ({cartItems.length} Item)
                        </h3>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 text-xs items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <img src={item.gambar || item.image || '/assets/gambar/cassie-wallet.webp'} alt={item.nama_produk || item.name} className="w-12 h-12 object-cover rounded-lg bg-white shrink-0 border border-slate-200" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{item.nama_produk || item.name}</h4>
                                        <p className="text-slate-400 text-[10px]">{item.jumlah ?? item.quantity} x {formatRupiah(item.harga || item.price)}</p>
                                    </div>
                                    <div className="font-black text-slate-900 shrink-0">
                                        {formatRupiah((item.harga || item.price) * (item.jumlah ?? item.quantity))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>Subtotal Produk</span>
                                <span className="font-bold text-slate-800">{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Pengiriman</span>
                                <span className="font-bold text-slate-800">{formatRupiah(courierCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
                                <span>Total Pembayaran</span>
                                <span className="text-[#E52027] text-base">{formatRupiah(grandTotal)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-[#E52027] hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            {processing ? 'Memproses Pesanan...' : '🔒 Buat Pesanan Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
