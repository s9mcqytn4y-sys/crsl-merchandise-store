import React from 'react';
import { Link } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { Package, ExternalLink, ArrowRight, Download, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface OrderItem {
    id: number;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string;
}

interface Order {
    id: string;
    nomor_pesanan: string;
    status: string;
    subtotal: number;
    ongkir: number;
    diskon: number;
    total: number;
    created_at: string;
    items?: OrderItem[];
    pengiriman?: {
        kurir: string;
        layanan: string;
        nomor_resi?: string;
    };
    pembayaran?: {
        metode_bayar: string;
        midtrans_status?: string;
    };
}

interface PesananIndexProps {
    pesanan: {
        data: Order[];
    };
    keranjang?: any;
    cart?: any;
}

export default function PesananIndex({ pesanan, keranjang = {}, cart = {} }: PesananIndexProps) {
    const ordersList = pesanan?.data || [];

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'belum_bayar':
                return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 animate-spin" /> MENUNGGU PEMBAYARAN</span>;
            case 'akan_dikirim':
                return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> DIPROSES / AKAN DIKIRIM</span>;
            case 'dikirim':
                return <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 font-extrabold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> DALAM PENGIRIMAN</span>;
            case 'selesai':
                return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-extrabold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> SELESAI</span>;
            case 'dibatalkan':
                return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> DIBATALKAN</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 font-extrabold px-3 py-1 rounded-full text-xs">{status}</span>;
        }
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-[#E52027]" /> Riwayat Transaksi Pesanan
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Daftar seluruh pesanan produk merchandise CRSL beserta status pembayaran dan resi logistik</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {ordersList.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
                        <div className="text-6xl">📦</div>
                        <h3 className="font-extrabold text-base text-slate-800">Belum ada transaksi pesanan</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">Anda belum melakukan pesanan apa pun. Yuk, temukan koleksi merchandise CRSL favoritmu sekarang!</p>
                        <Link
                            href="/katalog"
                            className="inline-block bg-[#E52027] hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md transition-all uppercase tracking-wider"
                        >
                            Jelajahi Katalog Merchandise
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ordersList.map((ord) => (
                            <div key={ord.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-sm text-slate-900">#{ord.nomor_pesanan}</h4>
                                            {renderStatusBadge(ord.status)}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Tanggal: {new Date(ord.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/faktur/${ord.nomor_pesanan}`}
                                            className="bg-slate-100 hover:bg-[#E52027] text-slate-800 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Invoice
                                        </Link>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="space-y-2">
                                    {ord.items?.map((item) => (
                                        <div key={item.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 text-xs">
                                            <div className="flex items-center gap-3">
                                                <img src={item.gambar || '/assets/gambar/cassie-wallet.webp'} alt={item.nama_produk} className="w-12 h-12 object-cover rounded-xl bg-white border border-slate-200 shrink-0" />
                                                <div>
                                                    <div className="font-extrabold text-slate-900">{item.nama_produk}</div>
                                                    {item.ukuran && <span className="text-[10px] text-slate-500">Ukuran: {item.ukuran}</span>}
                                                </div>
                                            </div>
                                            <div className="text-slate-500 font-medium">{item.jumlah} x {formatRupiah(item.harga)}</div>
                                            <div className="font-black text-slate-900">{formatRupiah(item.harga * item.jumlah)}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping & Total Summary */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                                    <div>
                                        <span className="text-slate-500">Kurir: </span>
                                        <strong className="text-slate-800 uppercase">{ord.pengiriman?.kurir || 'JNE'} ({ord.pengiriman?.layanan || 'REG'})</strong>
                                        {ord.pengiriman?.nomor_resi && (
                                            <span className="ml-2 font-mono text-emerald-600 font-bold">Resi: {ord.pengiriman.nomor_resi}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className="text-slate-500 block text-[10px]">Total Pembayaran:</span>
                                            <span className="text-[#E52027] font-black text-base">{formatRupiah(ord.total)}</span>
                                        </div>
                                        <Link
                                            href={`/lacak?nomor=${ord.nomor_pesanan}`}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1"
                                        >
                                            Lacak Resi <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
