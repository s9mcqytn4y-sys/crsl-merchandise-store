import React from "react";
import { Package, MapPin, Phone, User, FileText } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

export interface OrderItem {
    id: number | string;
    nama_produk?: string;
    product_name?: string;
    harga?: number;
    price?: number;
    jumlah?: number;
    quantity?: number;
    gambar?: string;
    ukuran?: string;
    warna?: string;
}

interface RincianPaketProps {
    items: OrderItem[];
    penerima?: string;
    telepon?: string;
    alamatLengkap?: string;
    catatan?: string;
    total: number;
}

export default function RincianPaket({
    items = [],
    penerima,
    telepon,
    alamatLengkap,
    catatan,
    total,
}: RincianPaketProps) {
    return (
        <div className="space-y-6 pt-2">
            {/* Daftar Produk Dalam Paket */}
            <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" />
                    <span>Produk Dalam Paket ({items.length} Item):</span>
                </h4>
                <div className="border border-slate-200/80 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden bg-white shadow-2xs">
                    {items.map((item, idx) => {
                        const nama =
                            item.nama_produk ||
                            item.product_name ||
                            "Produk CRSL Merchandise";
                        const qty = item.jumlah ?? item.quantity ?? 1;
                        const harga = item.harga || item.price || 0;
                        const gambarSrc = item.gambar
                            ? item.gambar.startsWith("http") || item.gambar.startsWith("/")
                                ? item.gambar
                                : `/storage/${item.gambar}`
                            : "/assets/gambar/placeholder.webp";

                        return (
                            <div
                                key={item.id ? `${item.id}-${idx}` : idx}
                                className="p-3.5 bg-slate-50/40 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                        <img
                                            src={gambarSrc}
                                            alt={nama}
                                            className="w-full h-full object-cover rounded-lg"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src = "/assets/gambar/placeholder.webp";
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h5 className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                            {nama}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            {qty} pcs
                                            {item.ukuran ? ` • Ukuran: ${item.ukuran}` : ""}
                                            {item.warna ? ` • Warna: ${item.warna}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="font-black text-slate-900 tabular-nums shrink-0 text-xs sm:text-sm">
                                    {formatRupiah(harga * qty)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Informasi Penerima & Alamat Tujuan */}
            {(penerima || alamatLengkap) && (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                    <h5 className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>Tujuan Pengiriman:</span>
                    </h5>
                    <div className="text-slate-800 font-semibold space-y-0.5">
                        {penerima && (
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{penerima}</span>
                                {telepon && (
                                    <span className="text-slate-500 font-normal">
                                        ({telepon})
                                    </span>
                                )}
                            </div>
                        )}
                        {alamatLengkap && (
                            <p className="text-slate-600 leading-relaxed pt-1">
                                {alamatLengkap}
                            </p>
                        )}
                        {catatan && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 inline-block mt-1">
                                Catatan: {catatan}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
