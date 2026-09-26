import React from "react";
import { Plus, Minus, Tag } from "lucide-react";
import { ItemKeranjang } from "../../Stores/useKeranjangStore";
import { formatRupiah } from "../../Utils/formatters";

interface DrawerItemRowProps {
    item: ItemKeranjang;
    onHapus: (id: string | number) => void;
    onUbahJumlah: (id: string | number, delta: number) => void;
}

export default function DrawerItemRow({
    item,
    onHapus,
    onUbahJumlah,
}: DrawerItemRowProps) {
    const hargaCoret = item.harga_asli || item.harga_dasar || 0;
    const hasDiscount = hargaCoret > item.harga;
    const discountAmount = hasDiscount ? hargaCoret - item.harga : 0;
    const isLowStock =
        item.stok !== undefined && item.stok > 0 && item.stok <= 5;

    return (
        <div className="pt-4 first:pt-0 space-y-3">
            {item.is_bundle ? (
                <div className="space-y-2">
                    <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0">
                            <img
                                src={item.gambar || "/assets/gambar/produk-placeholder.webp"}
                                alt={item.nama_produk}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                BUNDLED PRODUCT
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                {item.bundle_name || item.nama_produk}
                            </h4>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                                {formatRupiah(item.harga)}
                            </p>
                        </div>
                    </div>

                    {((item.sub_items && item.sub_items.length > 0) || (item.bundle_items && item.bundle_items.length > 0)) && (
                        <div className="pl-3.5 space-y-2 border-l-2 border-slate-200">
                            {(item.sub_items || (item.bundle_items?.map((b: any) => ({
                                nama: b.item_nama || "Item Paket",
                                variasi: b.varian_nama || "Standar",
                                gambar: item.gambar,
                            })) || [])).map((sub, sIdx) => (
                                <div
                                    key={sIdx}
                                    className="flex items-center gap-2.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200/60"
                                >
                                    <div className="w-8 h-8 rounded-md bg-white overflow-hidden shrink-0 border border-slate-200">
                                        <img
                                            src={sub.gambar || item.gambar || "/assets/gambar/placeholder.webp"}
                                            alt={sub.nama}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-bold text-slate-900 truncate">
                                            {sub.nama}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            Varian: {sub.variasi}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] sm:text-[11px] text-slate-600 leading-relaxed font-medium">
                        Paket bundle spesial hemat telah mengunci harga promo dan tidak dapat digabung dengan kupon tertentu.
                    </div>
                </div>
            ) : (
                <div className="flex gap-3.5">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0">
                        <img
                            src={item.gambar || "/assets/gambar/produk-placeholder.webp"}
                            alt={item.nama_produk}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.nama_produk}
                        </h4>

                        {(item.warna || item.ukuran) && (
                            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                {[item.warna, item.ukuran].filter(Boolean).join(" • ")}
                            </p>
                        )}

                        {hasDiscount && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-slate-400 rounded-md text-[10px] font-bold text-slate-700">
                                <Tag className="w-3 h-3 text-slate-500" />
                                <span>Get {formatRupiah(discountAmount)} off</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {hasDiscount && (
                                <span className="text-[11px] text-slate-400 line-through">
                                    {formatRupiah(hargaCoret)}
                                </span>
                            )}
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                                {formatRupiah(item.harga)}
                            </span>
                        </div>

                        {isLowStock && (
                            <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-bold text-slate-700">
                                Only {item.stok} stocks left.
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={() => onHapus(item.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-primary underline underline-offset-2 transition-colors cursor-pointer"
                >
                    Hapus
                </button>

                <div className="flex items-center border border-slate-300 rounded-full bg-white px-1 py-0.5 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => onUbahJumlah(item.id, -1)}
                        disabled={item.jumlah <= 1}
                        className="w-6 h-6 flex items-center justify-center text-primary hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors cursor-pointer"
                        aria-label="Kurangi jumlah"
                    >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <span className="w-7 text-center text-xs font-bold text-slate-900 select-none">
                        {item.jumlah}
                    </span>

                    <button
                        type="button"
                        onClick={() => onUbahJumlah(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-primary hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        aria-label="Tambah jumlah"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
