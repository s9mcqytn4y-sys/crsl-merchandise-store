import { useMemo, useState } from "react";
import { Plus, Minus, Tag, Package } from "lucide-react";
import { KeranjangItem } from "../../Stores/useKeranjangStore";
import { formatRupiah } from "../../Utils/formatters";

export interface BundleSubItem {
    nama: string;
    variasi?: string;
    gambar?: string | null;
}

export interface ExtendedCartItem extends KeranjangItem {
    stok?: number;
    harga_dasar?: number;
    is_bundle?: boolean;
    bundle_name?: string;
    sub_items?: BundleSubItem[];
    bundle_items?: Array<{
        item_nama?: string;
        varian_nama?: string;
        gambar?: string | null;
    }>;
}

interface DrawerItemRowProps {
    item: ExtendedCartItem;
    onHapus: (id: string | number) => void;
    onUbahJumlah: (id: string | number, delta: number) => void;
}

/** Helper normalisasi URL gambar aman */
function normalizeImageUrl(gambar?: string | null): string {
    if (!gambar) return "";
    const g = gambar.trim();
    if (
        g.startsWith("http://") ||
        g.startsWith("https://") ||
        g.startsWith("data:")
    ) {
        return g;
    }
    if (g.startsWith("/storage/")) return g;
    if (g.startsWith("storage/")) return `/${g}`;
    if (g.startsWith("/")) return g;
    return `/storage/${g}`;
}

const DEFAULT_IMAGE_PLACEHOLDER = "/assets/gambar/placeholder.webp";

export default function DrawerItemRow({
    item,
    onHapus,
    onUbahJumlah,
}: DrawerItemRowProps) {
    const [mainImageFailed, setMainImageFailed] = useState(false);

    // Normalisasi harga yang aman terhadap tipe data string/number
    const hargaSekarang = Number(item.harga) || 0;
    const hargaCoret = Number(item.harga_asli || item.harga_dasar || 0);
    const hasDiscount = hargaCoret > hargaSekarang;
    const discountAmount = hasDiscount ? hargaCoret - hargaSekarang : 0;

    // Validasi stok
    const stokTersedia = typeof item.stok === "number" ? item.stok : undefined;
    const isLowStock =
        stokTersedia !== undefined && stokTersedia > 0 && stokTersedia <= 5;
    const isMaxStockReached =
        stokTersedia !== undefined && item.jumlah >= stokTersedia;

    const mainImageUrl = normalizeImageUrl(item.gambar);

    // Normalisasi sub-item bundle tunggal
    const normalizedBundleItems = useMemo<BundleSubItem[]>(() => {
        if (!item.is_bundle) return [];
        if (item.sub_items && item.sub_items.length > 0) {
            return item.sub_items;
        }
        if (item.bundle_items && item.bundle_items.length > 0) {
            return item.bundle_items.map((b) => ({
                nama: b.item_nama || "Item Paket",
                variasi: b.varian_nama || "Standar",
                gambar: b.gambar || item.gambar,
            }));
        }
        return [];
    }, [item.is_bundle, item.sub_items, item.bundle_items, item.gambar]);

    return (
        <div className="pt-4 first:pt-0 space-y-3">
            {item.is_bundle ? (
                /* ============================================================
                   TAMPILAN PRODUK PAKET / BUNDLE HEMAT
                   ============================================================ */
                <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                            {mainImageUrl && !mainImageFailed ? (
                                <img
                                    src={mainImageUrl}
                                    alt={item.bundle_name || item.nama_produk}
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={() => setMainImageFailed(true)}
                                />
                            ) : (
                                <Package className="w-6 h-6 text-slate-300 stroke-[1.5]" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                            <span className="text-[10px] font-black text-primary tracking-wider uppercase block">
                                Paket Bundle Hemat
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                                {item.bundle_name || item.nama_produk}
                            </h4>
                            <p className="text-xs sm:text-sm font-black text-slate-900 font-mono tabular-nums">
                                {formatRupiah(hargaSekarang)}
                            </p>
                        </div>
                    </div>

                    {/* Rincian Item di dalam Bundle */}
                    {normalizedBundleItems.length > 0 && (
                        <div className="pl-3.5 space-y-2 border-l-2 border-slate-200">
                            {normalizedBundleItems.map((sub, sIdx) => {
                                const subImg = normalizeImageUrl(sub.gambar);
                                return (
                                    <div
                                        key={`${sub.nama}-${sIdx}`}
                                        className="flex items-center gap-2.5 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/70"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                            {subImg ? (
                                                <img
                                                    src={subImg}
                                                    alt={sub.nama}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target =
                                                            e.currentTarget;
                                                        target.onerror = null;
                                                        target.src =
                                                            DEFAULT_IMAGE_PLACEHOLDER;
                                                    }}
                                                />
                                            ) : (
                                                <Package className="w-4 h-4 text-slate-300 stroke-[1.5]" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-slate-900 truncate">
                                                {sub.nama}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium truncate">
                                                Varian:{" "}
                                                {sub.variasi || "Standar"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium">
                        Paket bundle spesial telah mengunci harga promo dan
                        tidak dapat digabungkan dengan kupon tertentu.
                    </div>
                </div>
            ) : (
                /* ============================================================
                   TAMPILAN PRODUK REGULER
                   ============================================================ */
                <div className="flex gap-3.5">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                        {mainImageUrl && !mainImageFailed ? (
                            <img
                                src={mainImageUrl}
                                alt={item.nama_produk}
                                className="w-full h-full object-cover rounded-xl"
                                onError={() => setMainImageFailed(true)}
                            />
                        ) : (
                            <Package className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                            {item.nama_produk}
                        </h4>

                        {(item.warna || item.ukuran) && (
                            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                {[item.warna, item.ukuran]
                                    .filter(Boolean)
                                    .join(" • ")}
                            </p>
                        )}

                        {hasDiscount && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-emerald-300 bg-emerald-50 rounded-md text-[10px] font-bold text-emerald-800">
                                <Tag className="w-3 h-3 text-emerald-600" />
                                <span>
                                    Hemat {formatRupiah(discountAmount)}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {hasDiscount && (
                                <span className="text-[11px] text-slate-400 line-through tabular-nums font-mono">
                                    {formatRupiah(hargaCoret)}
                                </span>
                            )}
                            <span className="text-xs sm:text-sm font-black text-slate-900 font-mono tabular-nums">
                                {formatRupiah(hargaSekarang)}
                            </span>
                        </div>

                        {/* Indikator Stok Kritis */}
                        {isLowStock && !isMaxStockReached && (
                            <div className="inline-block px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[10px] font-bold">
                                Sisa {stokTersedia} pcs
                            </div>
                        )}

                        {/* Indikator Batas Maksimal Stok Tercapai */}
                        {isMaxStockReached && (
                            <div className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[10px] font-bold">
                                Maks. stok tercapai ({stokTersedia} pcs)
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================
               KONTROL KUANTITAS & TOMBOL HAPUS (TOUCH ERGONOMICS)
               ============================================================ */}
            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={() => onHapus(item.id)}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 underline underline-offset-4 transition-colors cursor-pointer py-1"
                >
                    Hapus
                </button>

                <div className="flex items-center border border-slate-300 rounded-full bg-white p-1 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => onUbahJumlah(item.id, -1)}
                        disabled={item.jumlah <= 1}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-primary hover:bg-red-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-full transition-colors cursor-pointer active:scale-95"
                        aria-label="Kurangi jumlah barang"
                    >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <span className="w-8 text-center text-xs font-bold text-slate-900 select-none tabular-nums font-mono">
                        {item.jumlah}
                    </span>

                    <button
                        type="button"
                        onClick={() => onUbahJumlah(item.id, 1)}
                        disabled={isMaxStockReached}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-primary hover:bg-red-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed rounded-full transition-colors cursor-pointer active:scale-95"
                        aria-label="Tambah jumlah barang"
                        aria-disabled={isMaxStockReached}
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
