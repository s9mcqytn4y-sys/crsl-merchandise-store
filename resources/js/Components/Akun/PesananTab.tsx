import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { ShoppingBag, ChevronDown, Clock, CheckCircle2, Truck, XCircle, Search, ExternalLink } from 'lucide-react';
import { formatRupiah } from '../../Utils/formatters';

export interface OrderProductItem {
    id: number | string;
    nama: string;
    varian?: string;
    gambar?: string;
    harga: number;
    jumlah: number;
}

export interface OrderItem {
    id: number | string;
    order_number: string;
    created_at: string;
    status: string;
    status_raw?: string;
    total: number;
    item_count: number;
    items: OrderProductItem[];
}

interface PesananTabProps {
    orders?: OrderItem[];
    onCariPesanan?: () => void;
}

const DAFTAR_STATUS = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Belum Bayar', value: 'belum_bayar' },
    { label: 'Perlu Dikirim', value: 'akan_dikirim' },
    { label: 'Dikirim', value: 'dikirim' },
    { label: 'Selesai', value: 'selesai' },
    { label: 'Dibatalkan', value: 'dibatalkan' },
];

function BadgeStatusPesanan({ status }: { status: string }) {
    const s = (status || '').toLowerCase();
    if (s.includes('belum') || s.includes('pending') || s.includes('unpaid')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                <Clock className="w-3 h-3 text-amber-600" />
                Belum Bayar
            </span>
        );
    }
    if (s.includes('perlu') || s.includes('akan') || s.includes('processing') || s.includes('to ship')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
                <Clock className="w-3 h-3 text-blue-600" />
                Perlu Dikirim
            </span>
        );
    }
    if (s.includes('kirim') || s.includes('shipped')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                <Truck className="w-3 h-3 text-indigo-600" />
                Sedang Dikirim
            </span>
        );
    }
    if (s.includes('selesai') || s.includes('completed')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Selesai
            </span>
        );
    }
    if (s.includes('batal') || s.includes('cancel')) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/80">
                <XCircle className="w-3 h-3 text-rose-600" />
                Dibatalkan
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
        </span>
    );
}

export default function PesananTab({ orders = [], onCariPesanan }: PesananTabProps) {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const filteredOrders = useMemo(() => {
        if (filterStatus === 'all') return orders;
        return orders.filter((o) => {
            const raw = (o.status_raw || o.status || '').toLowerCase();
            return raw.includes(filterStatus.toLowerCase());
        });
    }, [orders, filterStatus]);

    const activeFilterLabel = DAFTAR_STATUS.find((s) => s.value === filterStatus)?.label || 'Semua Status';

    return (
        <div className="space-y-6">
            {/* Header Pesanan & Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Pesanan Saya
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {orders.length}
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {onCariPesanan && (
                        <button
                            type="button"
                            onClick={onCariPesanan}
                            className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Cari Pesanan
                        </button>
                    )}

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="inline-flex items-center justify-between gap-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs min-w-[140px]"
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                        >
                            <span>{activeFilterLabel}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20">
                                {DAFTAR_STATUS.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setFilterStatus(item.value);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                                            filterStatus === item.value
                                                ? 'bg-red-50 text-[#E52027] font-bold'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        {filterStatus === item.value && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E52027]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* List Pesanan */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                        Tidak Ada Pesanan
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {filterStatus === 'all'
                            ? 'Anda belum memiliki riwayat pesanan. Yuk temukan merchandise favoritmu!'
                            : `Tidak ditemukan pesanan dengan status "${activeFilterLabel}".`}
                    </p>
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-1.5 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs mt-2"
                    >
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const items = order.items || [];
                        const itemUtama = items[0];
                        const sisaItem = items.length - 1;

                        return (
                            <div
                                key={order.id || order.order_number}
                                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all p-5 space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className="font-black text-slate-900 font-mono">
                                            #{order.order_number}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-500">{order.created_at}</span>
                                    </div>
                                    <BadgeStatusPesanan status={order.status} />
                                </div>

                                {itemUtama && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0">
                                            <img
                                                src={itemUtama.gambar || '/assets/gambar/cassie-wallet.webp'}
                                                alt={itemUtama.nama}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/assets/gambar/cassie-wallet.webp';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2">
                                                {itemUtama.nama}
                                            </h4>
                                            {itemUtama.varian && (
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                                    Varian: {itemUtama.varian}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                                                <span className="text-slate-500">
                                                    {itemUtama.jumlah} barang x {formatRupiah(itemUtama.harga)}
                                                </span>
                                                {sisaItem > 0 && (
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        +{sisaItem} produk lainnya
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Total Belanja:</span>
                                        <span className="font-black text-sm sm:text-base text-slate-900 tabular-nums">
                                            {formatRupiah(order.total)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Link
                                            href={`/lacak?nomor=${encodeURIComponent(order.order_number)}`}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-colors"
                                        >
                                            <Truck className="w-3.5 h-3.5" />
                                            Lacak
                                        </Link>
                                        <Link
                                            href={`/faktur/${encodeURIComponent(order.order_number)}`}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold px-4 py-2 rounded-xl transition-all shadow-2xs"
                                        >
                                            <span>Detail Faktur</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
