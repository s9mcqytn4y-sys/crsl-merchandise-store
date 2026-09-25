import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, Package } from 'lucide-react';
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

export default function PesananTab({ orders = [], onCariPesanan }: PesananTabProps) {
    const [selectedStatus, setSelectedStatus] = useState('all');

    const filteredOrders = orders.filter((order) => {
        if (selectedStatus === 'all') return true;
        const s = (order.status_raw || order.status || '').toLowerCase();
        return s.includes(selectedStatus.toLowerCase());
    });

    return (
        <div className="space-y-6 pt-4">
            {/* Top Bar Filter & Title (Sesuai Screenshot 1 & 2) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-base font-bold text-slate-800">
                    My Orders ({filteredOrders.length})
                </h3>

                <div className="flex items-center gap-4">
                    {/* Link Find your Orders (Screenshot 2) */}
                    <Link
                        href="/lacak"
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Find your Orders
                    </Link>

                    {/* Filter Status Dropdown (Screenshot 1 & 2) */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            aria-label="Filter status pesanan"
                            className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All status</option>
                            <option value="belum_bayar">Unpaid</option>
                            <option value="akan_dikirim">Processing</option>
                            <option value="dikirim">Shipped</option>
                            <option value="selesai">Completed</option>
                            <option value="dibatalkan">Cancelled</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Empty State (Sesuai Screenshot 1) */}
            {filteredOrders.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    {/* Cardboard Box Outline Icon */}
                    <div className="w-20 h-20 mb-3 text-slate-300 flex items-center justify-center">
                        <svg
                            className="w-16 h-16 stroke-current fill-none stroke-[1.2]"
                            viewBox="0 0 24 24"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                        No Orders Found
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        Place an order to see it listed here.
                    </p>
                </div>
            ) : (
                /* List Kartu Pesanan (Sesuai Screenshot 2) */
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const itemUtama = order.items?.[0] || {
                            nama: 'CRSL Drinke Tumblr Series | Botol Tempat minum | Tumbler | Tumblr Travel Bottle Stainless 900ml 32oz',
                            varian: 'DARK GREY',
                            harga: order.total,
                            jumlah: 1,
                            gambar: '/assets/ikon/produk-sample.webp',
                        };
                        const sisaItem = (order.item_count || order.items.length) - 1;

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:border-slate-200 transition-all"
                            >
                                {/* Header Pesanan: Nomor Pesanan & Status */}
                                <div className="flex items-center justify-between pb-1">
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Order #{order.order_number}
                                    </h4>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {order.status}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-400 mb-4">
                                    {order.created_at}
                                </p>

                                {/* Item Pesanan */}
                                <div className="flex items-center justify-between gap-4 pt-2">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                            {itemUtama.gambar ? (
                                                <img
                                                    src={itemUtama.gambar}
                                                    alt={itemUtama.nama}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = '/assets/ikon/akun.svg';
                                                    }}
                                                />
                                            ) : (
                                                <Package className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">
                                                {itemUtama.nama}
                                            </h5>
                                            {itemUtama.varian && (
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {itemUtama.varian}
                                                </p>
                                            )}
                                            {sisaItem > 0 && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    +{sisaItem} more items
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Harga & Kuantitas */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-slate-900">
                                            {formatRupiah(itemUtama.harga || order.total)}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            x{itemUtama.jumlah || 1}
                                        </p>
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
