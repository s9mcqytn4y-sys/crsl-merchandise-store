import {
    Package,
    MapPin,
    Phone,
    User,
    FileText,
    ShoppingBag,
} from "lucide-react";
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
    total?: number;
}

export default function RincianPaket({
    items = [],
    penerima,
    telepon,
    alamatLengkap,
    catatan,
    total,
}: RincianPaketProps) {
    const totalItemCount = items.reduce(
        (sum, it) => sum + (it.jumlah ?? it.quantity ?? 1),
        0,
    );

    return (
        <div className="space-y-5 pt-2">
            {/* 1. Daftar Produk Dalam Paket */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-[#E52027]" />
                        <span>
                            Produk Dalam Paket ({items.length} Macam /{" "}
                            {totalItemCount} Pcs)
                        </span>
                    </h4>
                </div>

                {items.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1.5">
                        <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">
                            Tidak ada rincian produk dalam paket ini.
                        </p>
                    </div>
                ) : (
                    <div className="border border-slate-200/80 rounded-2xl divide-y divide-slate-100 text-xs overflow-hidden bg-white shadow-2xs">
                        {items.map((item, idx) => {
                            const nama =
                                item.nama_produk ||
                                item.product_name ||
                                "Produk CRSL Merchandise";
                            const qty = item.jumlah ?? item.quantity ?? 1;
                            const harga = item.harga || item.price || 0;
                            const subtotalItem = harga * qty;

                            const gambarSrc = item.gambar
                                ? item.gambar.startsWith("http") ||
                                  item.gambar.startsWith("/")
                                    ? item.gambar
                                    : `/storage/${item.gambar}`
                                : "/assets/gambar/placeholder.webp";

                            return (
                                <div
                                    key={item.id ? `${item.id}-${idx}` : idx}
                                    className="p-3.5 bg-slate-50/40 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 shrink-0 overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                                            <img
                                                src={gambarSrc}
                                                alt={nama}
                                                loading="lazy"
                                                className="w-full h-full object-cover rounded-lg"
                                                onError={(e) => {
                                                    const target =
                                                        e.currentTarget;
                                                    target.onerror = null;
                                                    target.src =
                                                        "/assets/gambar/placeholder.webp";
                                                }}
                                            />
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <h5 className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                                {nama}
                                            </h5>
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                                <span className="font-semibold text-slate-700">
                                                    {qty} pcs
                                                </span>
                                                {qty > 1 && harga > 0 && (
                                                    <span>
                                                        (@ {formatRupiah(harga)}
                                                        )
                                                    </span>
                                                )}
                                                {item.ukuran && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                            {item.ukuran}
                                                        </span>
                                                    </>
                                                )}
                                                {item.warna && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                                                            {item.warna}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="font-bold font-mono text-slate-900 tabular-nums shrink-0 text-xs sm:text-sm text-right">
                                        {formatRupiah(subtotalItem)}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Rekapitulasi Total Tagihan (Memanfaatkan Prop total) */}
                        {typeof total === "number" && total > 0 && (
                            <div className="p-3.5 bg-slate-50/90 flex items-center justify-between border-t border-slate-200 text-xs">
                                <span className="font-bold text-slate-700">
                                    Total Nilai Tagihan Pesanan:
                                </span>
                                <span className="font-black font-mono text-slate-900 tabular-nums text-sm">
                                    {formatRupiah(total)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Informasi Penerima & Alamat Tujuan */}
            {(penerima || alamatLengkap) && (
                <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 text-xs">
                    <h5 className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-[#E52027]" />
                        <span>Tujuan Pengiriman Paket:</span>
                    </h5>

                    <div className="space-y-2">
                        {penerima && (
                            <div className="flex flex-wrap items-center gap-2 text-slate-900 font-bold">
                                <span className="inline-flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{penerima}</span>
                                </span>
                                {telepon && (
                                    <a
                                        href={`tel:${telepon}`}
                                        className="inline-flex items-center gap-1 font-mono text-slate-500 hover:text-slate-900 font-normal transition-colors"
                                    >
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        <span>{telepon}</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {alamatLengkap && (
                            <p className="text-slate-600 leading-relaxed pl-5 sm:pl-0">
                                {alamatLengkap}
                            </p>
                        )}

                        {catatan && (
                            <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/80 mt-2">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-amber-900">
                                        Catatan Pengiriman:
                                    </strong>{" "}
                                    <span>{catatan}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
