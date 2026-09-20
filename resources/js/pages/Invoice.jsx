import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { Copy, Check, Clock, RefreshCw, QrCode, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Invoice({ pesanan, keranjang = {}, cart = {} }) {
    const activeOrder = pesanan || {};
    const pembayaran = activeOrder.pembayaran || {};
    const pengiriman = activeOrder.pengiriman || {};
    const orderItems = activeOrder.items || activeOrder.item || [];

    const [statusPesanan, setStatusPesanan] = useState(activeOrder.status || 'belum_bayar');
    const [copied, setCopied] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    // Real-time payment status polling every 5 seconds if status is 'belum_bayar'
    useEffect(() => {
        if (statusPesanan !== 'belum_bayar') return;

        const interval = setInterval(async () => {
            try {
                const nomor = activeOrder.nomor_pesanan;
                if (!nomor) return;
                const response = await fetch(`/api/pesanan/${encodeURIComponent(nomor)}/status`);
                const res = await response.json();
                if (res.sukses && res.status && res.status !== statusPesanan) {
                    setStatusPesanan(res.status);
                    if (res.status === 'akan_dikirim') {
                        toast.success('🎉 Pembayaran Berhasil Dikonfirmasi! Pesanan Anda sedang disiapkan.');
                    }
                }
            } catch (err) {
                console.error("Gagal mengecek status:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [statusPesanan, activeOrder.nomor_pesanan]);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Nomor Virtual Account disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManualCheckStatus = async () => {
        setIsChecking(true);
        try {
            const nomor = activeOrder.nomor_pesanan;
            const response = await fetch(`/api/pesanan/${encodeURIComponent(nomor)}/status`);
            const res = await response.json();
            if (res.sukses && res.status) {
                setStatusPesanan(res.status);
                if (res.status === 'akan_dikirim') {
                    toast.success('🎉 Pembayaran Lunas! Status pesanan otomatis diperbarui.');
                } else {
                    toast.info('Status pembayaran masih ' + res.status);
                }
            }
        } catch (err) {
            toast.error('Gagal mengecek status pembayaran.');
        } finally {
            setIsChecking(false);
        }
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'belum_bayar':
                return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5 animate-spin" /> MENUNGGU PEMBAYARAN</span>;
            case 'akan_dikirim':
                return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs flex items-center gap-1">✅ SUDAH BAYAR / DIPROSES</span>;
            case 'dikirim':
                return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 font-extrabold px-3 py-1 rounded-full text-xs">🚚 DALAM PENGIRIMAN</span>;
            case 'selesai':
                return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-extrabold px-3 py-1 rounded-full text-xs">🎉 SELESAI</span>;
            case 'dibatalkan':
                return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-full text-xs">❌ DIBATALKAN</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 font-extrabold px-3 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                🛒 FAKTUR RESMI PESANAN
                            </span>
                            <h1 className="text-2xl font-black text-slate-800 mt-1">Invoice #{activeOrder.nomor_pesanan}</h1>
                        </div>
                        <div>{statusBadge(statusPesanan)}</div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Native Midtrans Direct Charge Instruction Box */}
                {statusPesanan === 'belum_bayar' && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl space-y-5 border border-slate-700">
                        <div className="flex justify-between items-start border-b border-slate-700 pb-4">
                            <div>
                                <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                                    <CreditCard className="w-5 h-5 text-amber-400" /> Instruksi Pembayaran ({pembayaran.metode_bayar || 'Direct Charge'})
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Selesaikan pembayaran tepat sebesar <strong className="text-amber-300 text-base">{formatRupiah(activeOrder.total)}</strong>
                                </p>
                            </div>
                            <button
                                onClick={handleManualCheckStatus}
                                disabled={isChecking}
                                className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-extrabold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                                {isChecking ? 'Mengecek...' : 'Cek Status Pembayaran'}
                            </button>
                        </div>

                        {/* Display QRIS Code Image / String */}
                        {pembayaran.qr_code_url && (
                            <div className="bg-white p-4 rounded-2xl text-slate-900 text-center space-y-3 max-w-xs mx-auto shadow-md">
                                <div className="font-extrabold text-xs text-slate-800 flex items-center justify-center gap-1">
                                    <QrCode className="w-4 h-4 text-[#E52027]" /> Scan QRIS via Aplikasi E-Wallet / Banking
                                </div>
                                <img src={pembayaran.qr_code_url} alt="QRIS Code" className="w-48 h-48 mx-auto border border-slate-200 rounded-xl" />
                                <p className="text-[10px] text-slate-500">Mendukung GoPay, OVO, ShopeePay, Dana, LinkAja, & Mobile Banking</p>
                            </div>
                        )}

                        {/* Display Bank Virtual Account Number */}
                        {pembayaran.nomor_va && (
                            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                                <span className="text-xs text-slate-400 block font-semibold">Nomor Virtual Account ({pembayaran.metode_bayar}):</span>
                                <div className="flex items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-700">
                                    <span className="font-mono text-xl font-extrabold tracking-widest text-amber-300">{pembayaran.nomor_va}</span>
                                    <button
                                        onClick={() => handleCopy(pembayaran.nomor_va)}
                                        className="bg-[#E52027] hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Tersalin' : 'Salin VA'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Display Mandiri Biller Code */}
                        {pembayaran.kode_biller && (
                            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                    <div>
                                        <span className="text-slate-400 block">Kode Biller (Perusahaan):</span>
                                        <span className="font-bold text-lg text-amber-300">{pembayaran.kode_biller}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Bill Key (Nomor Tagihan):</span>
                                        <span className="font-bold text-lg text-amber-300">{pembayaran.kode_biller}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Steps Instructions */}
                        {Array.isArray(pembayaran.instruksi_bayar) && pembayaran.instruksi_bayar.length > 0 && (
                            <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-700">
                                <span className="font-bold text-white block mb-1">Panduan Pembayaran:</span>
                                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                                    {pembayaran.instruksi_bayar.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                )}

                {/* Order Summary & Products */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Rincian Pesanan</h4>
                            <p className="font-medium text-slate-800 leading-relaxed">
                                Nomor Invoice: <strong className="text-slate-900">{activeOrder.nomor_pesanan}</strong><br />
                                Kurir Pengiriman: <strong>{(pengiriman.kurir || 'JNE').toUpperCase()} ({pengiriman.layanan || 'REG'})</strong><br />
                                Nomor Resi: <strong className="text-emerald-600">{pengiriman.nomor_resi || 'Menunggu Pembayaran'}</strong>
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Pembayaran</h4>
                            <div className="space-y-1 text-slate-700">
                                <div className="flex justify-between"><span>Subtotal Produk:</span> <span>{formatRupiah(activeOrder.subtotal)}</span></div>
                                <div className="flex justify-between"><span>Ongkir Biteship:</span> <span>{formatRupiah(activeOrder.ongkir)}</span></div>
                                {activeOrder.diskon > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold"><span>Diskon Voucher:</span> <span>- {formatRupiah(activeOrder.diskon)}</span></div>
                                )}
                                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
                                    <span>Total:</span> <span className="text-[#E52027]">{formatRupiah(activeOrder.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">Item Produk Dalam Pesanan</h4>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                            {orderItems.map((item) => (
                                <div key={item.id} className="p-3 bg-slate-50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <img src={item.gambar || '/assets/gambar/cassie-wallet.webp'} alt={item.nama_produk} className="w-10 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-900">{item.nama_produk}</div>
                                            {item.ukuran && <span className="text-[10px] text-slate-500">Ukuran: {item.ukuran}</span>}
                                        </div>
                                    </div>
                                    <div className="text-slate-500">{item.jumlah} x {formatRupiah(item.harga)}</div>
                                    <div className="font-black text-slate-900">{formatRupiah(item.harga * item.jumlah)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Link href="/lacak" className="text-xs font-bold text-[#E52027] hover:underline flex items-center gap-1">
                            ← Lacak Resi & Status Pengiriman
                        </Link>
                        <Link href="/katalog" className="bg-[#E52027] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs hover:bg-red-700 transition-colors">
                            Kembali Belanja
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
