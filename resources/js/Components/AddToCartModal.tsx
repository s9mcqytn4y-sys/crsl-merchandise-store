import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { X, ChevronRight, Check, AlertCircle, ShoppingBag } from "lucide-react";
import {
    useCartModalStore,
    ModalProductVariant,
} from "../Stores/useCartModalStore";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";
import { toast } from "sonner";
import { cn } from "../lib/utils";

const FALLBACK_IMAGE = "/assets/gambar/drinke-tumblr.webp";

/**
 * Normalisasi URL media aman untuk storage lokal Laravel maupun remote CDN
 */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return FALLBACK_IMAGE;
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/storage/${clean}`;
}

export default function AddToCartModal() {
    const { isAddToCartOpen, activeProduct, closeAddToCart } = useCartModalStore();
    const tambah = useKeranjangStore((state) => state.tambah);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    const [selectedVarian, setSelectedVarian] =
        useState<ModalProductVariant | null>(null);
    const [jumlah, setJumlah] = useState(1);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const isVisible = Boolean(isAddToCartOpen && activeProduct);

    // Reset formulir saat modal dibuka
    useEffect(() => {
        if (isVisible && activeProduct) {
            const varianList = activeProduct.varians || [];
            // Jika produk hanya memiliki tepat 1 varian, pilih secara otomatis
            if (varianList.length === 1) {
                setSelectedVarian(varianList[0]);
            } else {
                setSelectedVarian(null);
            }
            setJumlah(1);
            setHasAttemptedSubmit(false);
        }
    }, [isVisible, activeProduct]);

    const varianList = useMemo(() => activeProduct?.varians || [], [activeProduct]);
    const hasVariants = varianList.length > 0;

    // Hitung batas stok maksimum
    const maxStock = useMemo(() => {
        if (!activeProduct) return 99;
        if (selectedVarian && typeof selectedVarian.stok === "number") {
            return Math.max(0, selectedVarian.stok);
        }
        if (typeof activeProduct.stok_total === "number") {
            return Math.max(0, activeProduct.stok_total);
        }
        return 99; // Default upper limit jika stok tidak dibatasi
    }, [activeProduct, selectedVarian]);

    // Hitung harga efektif dan subtotal
    const unitPrice = useMemo(() => {
        if (!activeProduct) return 0;
        const basePrice = Number(
            activeProduct.harga_diskon ?? activeProduct.harga ?? 0,
        );
        const variantAddon = Number(selectedVarian?.harga_tambahan ?? 0);
        return basePrice + variantAddon;
    }, [activeProduct, selectedVarian]);

    const subtotal = unitPrice * jumlah;

    const handleSelectVariant = useCallback(
        (varian: ModalProductVariant) => {
            setSelectedVarian(varian);
            setHasAttemptedSubmit(false);
            // Reset kuantitas jika melebihi stok varian baru
            if (
                typeof varian.stok === "number" &&
                varian.stok > 0 &&
                jumlah > varian.stok
            ) {
                setJumlah(varian.stok);
            }
        },
        [jumlah],
    );

    const handleAddToCart = () => {
        if (!activeProduct) return;

        if (hasVariants && !selectedVarian) {
            setHasAttemptedSubmit(true);
            return;
        }

        if (maxStock <= 0) {
            toast.error("Maaf, stok untuk varian ini sedang habis.");
            return;
        }

        const finalImage = normalizeMediaUrl(
            selectedVarian?.gambar_varian || activeProduct.gambar_utama,
        );
        const finalSku = selectedVarian?.sku || `CRSL-PROD-${activeProduct.id}`;

        tambah({
            id: `cart-${activeProduct.id}-${selectedVarian?.id ?? "default"}`,
            produk_id: activeProduct.id,
            varian_id: selectedVarian?.id
                ? Number(selectedVarian.id)
                : undefined,
            nama_produk: activeProduct.nama,
            warna:
                selectedVarian?.warna ||
                selectedVarian?.nama_varian ||
                "Default",
            ukuran: selectedVarian?.ukuran || "All Size",
            harga: unitPrice,
            gambar: finalImage,
            jumlah: Math.min(jumlah, maxStock > 0 ? maxStock : jumlah),
            sku: finalSku,
        });

        toast.success(`${activeProduct.nama} berhasil ditambahkan ke keranjang!`, {
            action: {
                label: "Lihat Keranjang",
                onClick: () => bukaKeranjang(),
            },
        });

        closeAddToCart();
    };

    if (!activeProduct) return null;

    return (
        <Transition show={isVisible} as={React.Fragment}>
            <Dialog
                as="div"
                id="modal-add-to-cart"
                className="relative z-50 select-none"
                onClose={closeAddToCart}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Kontainer Modal Tengah */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-sm sm:max-w-md transform overflow-hidden rounded-3xl bg-white p-5 sm:p-6 text-left align-middle shadow-2xl transition-all border border-slate-200/90 space-y-4">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                    <DialogTitle
                                        as="h3"
                                        className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-[#E52027]" />
                                        <span>Pilih Varian & Jumlah</span>
                                    </DialogTitle>
                                    <button
                                        type="button"
                                        onClick={closeAddToCart}
                                        className="p-1.5 -mr-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                        aria-label="Tutup jendela pemilihan varian"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Box Informasi Produk */}
                                <Link
                                    href={`/produk/${activeProduct.slug}`}
                                    onClick={closeAddToCart}
                                    className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors group cursor-pointer"
                                    aria-label={`Lihat detail produk ${activeProduct.nama}`}
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center">
                                        <img
                                            src={normalizeMediaUrl(
                                                activeProduct.gambar_utama,
                                            )}
                                            alt={activeProduct.nama}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src = FALLBACK_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-1">
                                        <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E52027] transition-colors">
                                            {activeProduct.nama}
                                        </p>
                                        <p className="text-xs font-black text-[#E52027] mt-1 font-mono">
                                            {formatRupiah(unitPrice)}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E52027] group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>

                                {/* Swatch Varian Produk */}
                                {hasVariants && (
                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-extrabold text-[#E52027] tracking-wider uppercase">
                                                PILIH VARIAN
                                            </span>
                                            {selectedVarian && (
                                                <span className="text-slate-500 font-medium text-[11px]">
                                                    Terpilih:{" "}
                                                    <strong className="text-slate-800 font-bold">
                                                        {
                                                            selectedVarian.nama_varian
                                                        }
                                                    </strong>
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                                            {varianList.map((varian) => {
                                                const isSelected =
                                                    selectedVarian?.id ===
                                                    varian.id;
                                                const isOutOfStock =
                                                    typeof varian.stok ===
                                                        "number" &&
                                                    varian.stok <= 0;
                                                const imgThumb =
                                                    normalizeMediaUrl(
                                                        varian.gambar_varian ||
                                                            activeProduct?.gambar_utama || "",
                                                    );

                                                return (
                                                    <button
                                                        key={varian.id}
                                                        type="button"
                                                        disabled={isOutOfStock}
                                                        onClick={() =>
                                                            handleSelectVariant(
                                                                varian,
                                                            )
                                                        }
                                                        className={cn(
                                                            "relative flex flex-col items-center justify-between p-2 rounded-2xl border transition-all text-center min-h-[92px] group",
                                                            isSelected &&
                                                                "border-[#E52027] bg-red-50/20 ring-2 ring-[#E52027]/20 shadow-2xs",
                                                            !isSelected &&
                                                                !isOutOfStock &&
                                                                "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white cursor-pointer",
                                                            isOutOfStock &&
                                                                "border-slate-200 bg-slate-100/60 opacity-50 cursor-not-allowed",
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E52027] text-white rounded-full flex items-center justify-center">
                                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                            </div>
                                                        )}

                                                        <div className="w-11 h-11 overflow-hidden mb-1 flex items-center justify-center rounded-lg bg-white border border-slate-100">
                                                            <img
                                                                src={imgThumb}
                                                                alt={
                                                                    varian.nama_varian
                                                                }
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    const target =
                                                                        e.currentTarget;
                                                                    target.onerror =
                                                                        null;
                                                                    target.src =
                                                                        FALLBACK_IMAGE;
                                                                }}
                                                            />
                                                        </div>

                                                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight line-clamp-2 leading-tight">
                                                            {varian.nama_varian}
                                                        </span>

                                                        {isOutOfStock && (
                                                            <span className="text-[9px] font-black text-rose-600 mt-0.5">
                                                                Habis
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Peringatan Validasi Pemilihan Varian */}
                                {hasVariants &&
                                    !selectedVarian &&
                                    hasAttemptedSubmit && (
                                        <div
                                            role="alert"
                                            className="bg-rose-50 text-[#E52027] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-rose-200 flex items-center gap-2 animate-in fade-in duration-150"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>
                                                Silakan pilih varian terlebih
                                                dahulu.
                                            </span>
                                        </div>
                                    )}

                                {/* Stepper Pengatur Jumlah Pembelian */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                    <div className="text-left">
                                        <span className="block text-xs font-bold text-slate-700">
                                            Jumlah Pembelian
                                        </span>
                                        {maxStock < 99 && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Tersisa {maxStock} unit
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={jumlah <= 1}
                                            className="w-9 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-bold text-base transition-colors"
                                            aria-label="Kurangi jumlah item"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-xs font-extrabold text-slate-900 select-none font-mono">
                                            {jumlah}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.min(
                                                        maxStock,
                                                        prev + 1,
                                                    ),
                                                )
                                            }
                                            disabled={jumlah >= maxStock}
                                            className="w-9 h-8 flex items-center justify-center text-[#E52027] hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold text-base transition-colors"
                                            aria-label="Tambah jumlah item"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Tombol Aksi Tambah ke Keranjang */}
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    className="w-full py-3.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-500/20 transition-all cursor-pointer flex items-center justify-between px-5"
                                >
                                    <span>Tambah ke Keranjang</span>
                                    <span className="font-mono text-white/95">
                                        {formatRupiah(subtotal)}
                                    </span>
                                </button>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
