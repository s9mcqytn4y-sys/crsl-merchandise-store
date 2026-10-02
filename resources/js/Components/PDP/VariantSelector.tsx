import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Minus, AlertCircle } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface VariantItem {
    id: number | string;
    nama_varian?: string;
    variant_name?: string;
    warna?: string;
    warna_hex?: string;
    ukuran?: string;
    harga_tambahan?: number | string;
    stok?: number;
    sku?: string;
    gambar_varian?: string | null;
    aktif?: boolean;
}

interface VariantSelectorProps {
    variants: VariantItem[];
    selectedVariant: VariantItem | null;
    onSelectVariant: (v: VariantItem) => void;
    selectedSize?: string;
    onSelectSize?: (size: string) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    totalStock?: number;
    errorMessage?: string | null;
    className?: string;
}

/**
 * Normalisasi URL gambar thumbnail varian lokal Laravel Storage vs Remote CDN
 */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return "";
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

export default function VariantSelector({
    variants = [],
    selectedVariant,
    onSelectVariant,
    selectedSize,
    onSelectSize,
    quantity,
    onQuantityChange,
    totalStock = 0,
    errorMessage,
    className,
}: VariantSelectorProps) {
    // 1. Ekstraksi daftar ukuran unik dari array varian
    const availableSizes = useMemo(() => {
        return Array.from(
            new Set(variants.map((v) => v.ukuran).filter(Boolean) as string[]),
        );
    }, [variants]);

    const hasMultipleSizes =
        availableSizes.length > 1 &&
        !availableSizes.every((s) => s.toLowerCase() === "all size");

    // Hitung ketersediaan stok riil
    const currentVariantStock = selectedVariant
        ? Math.max(0, Number(selectedVariant.stok ?? totalStock))
        : Math.max(0, Number(totalStock));

    const isOutOfStock = currentVariantStock <= 0;

    // State lokal input kuantitas untuk kenyamanan pengetikan
    const [localQtyStr, setLocalQtyStr] = useState<string>(
        String(isOutOfStock ? 0 : Math.max(1, quantity)),
    );

    useEffect(() => {
        setLocalQtyStr(String(isOutOfStock ? 0 : Math.max(1, quantity)));
    }, [quantity, isOutOfStock]);

    // Auto-clamp jika kuantitas melebihi kapasitas stok varian yang baru dipilih
    useEffect(() => {
        if (isOutOfStock) {
            if (quantity !== 0) onQuantityChange(0);
        } else if (quantity > currentVariantStock) {
            onQuantityChange(currentVariantStock);
        } else if (quantity < 1 && currentVariantStock > 0) {
            onQuantityChange(1);
        }
    }, [
        selectedVariant,
        currentVariantStock,
        quantity,
        isOutOfStock,
        onQuantityChange,
    ]);

    const handleIncrement = () => {
        if (!isOutOfStock && quantity < currentVariantStock) {
            onQuantityChange(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (!isOutOfStock && quantity > 1) {
            onQuantityChange(quantity - 1);
        }
    };

    const handleQuantityBlur = () => {
        if (isOutOfStock) {
            onQuantityChange(0);
            setLocalQtyStr("0");
            return;
        }

        const parsed = parseInt(localQtyStr, 10);
        if (isNaN(parsed) || parsed < 1) {
            onQuantityChange(1);
            setLocalQtyStr("1");
        } else if (parsed > currentVariantStock) {
            onQuantityChange(currentVariantStock);
            setLocalQtyStr(String(currentVariantStock));
        } else {
            onQuantityChange(parsed);
            setLocalQtyStr(String(parsed));
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isOutOfStock) return;

        const val = e.target.value.replace(/\D/g, "");
        setLocalQtyStr(val);

        if (val) {
            const num = parseInt(val, 10);
            if (num > 0 && num <= currentVariantStock) {
                onQuantityChange(num);
            }
        }
    };

    // Sinkronisasi ganda saat varian diklik
    const handleVariantClick = useCallback(
        (v: VariantItem) => {
            const variantStock = Math.max(0, Number(v.stok ?? 0));
            if (variantStock <= 0) return;

            onSelectVariant(v);

            // Sinkronkan ke ukuran jika varian membawa atribut ukuran spesifik
            if (v.ukuran && onSelectSize && v.ukuran !== selectedSize) {
                onSelectSize(v.ukuran);
            }
        },
        [onSelectVariant, onSelectSize, selectedSize],
    );

    const activeColorName =
        selectedVariant?.warna || selectedVariant?.nama_varian;

    return (
        <div className={cn("space-y-5 select-none", className)}>
            {/* 1. Pemilih Warna / Varian Utama */}
            {variants.length > 0 && (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 tracking-tight">
                            Pilihan Varian
                            {activeColorName && (
                                <span className="font-normal text-slate-500 ml-1.5">
                                    :{" "}
                                    <strong className="font-bold text-slate-800">
                                        {activeColorName}
                                    </strong>
                                </span>
                            )}
                        </span>

                        {currentVariantStock > 0 &&
                            currentVariantStock <= 5 && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md">
                                    Sisa {currentVariantStock} item
                                </span>
                            )}

                        {isOutOfStock && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-md">
                                Stok Habis
                            </span>
                        )}
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Pilihan varian produk"
                        className="flex flex-wrap gap-2 sm:gap-2.5"
                    >
                        {variants.map((v) => {
                            const isSelected = selectedVariant?.id === v.id;
                            const stockCount = Math.max(0, Number(v.stok ?? 0));
                            const isSoldOut = stockCount <= 0;

                            const colorPart = v.warna || v.nama_varian || "";
                            const sizePart =
                                v.ukuran &&
                                v.ukuran.toLowerCase() !== "all size"
                                    ? v.ukuran
                                    : "";

                            const label =
                                sizePart && colorPart && !hasMultipleSizes
                                    ? `${colorPart.toUpperCase()} • ${sizePart.toUpperCase()}`
                                    : (
                                          colorPart ||
                                          sizePart ||
                                          v.sku ||
                                          "Varian"
                                      ).toUpperCase();

                            const extraPrice = Number(v.harga_tambahan || 0);
                            const variantImgUrl = normalizeMediaUrl(
                                v.gambar_varian,
                            );

                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-disabled={isSoldOut}
                                    disabled={isSoldOut}
                                    onClick={() => handleVariantClick(v)}
                                    className={cn(
                                        "group relative overflow-hidden flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                        isSelected
                                            ? "border-primary bg-red-50/40 text-primary ring-2 ring-primary/20 shadow-xs"
                                            : isSoldOut
                                              ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                                              : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs",
                                    )}
                                    aria-label={`${label} ${isSoldOut ? "(Stok Habis)" : ""}`}
                                >
                                    {/* Thumbnail Swatch */}
                                    {variantImgUrl ? (
                                        <img
                                            src={variantImgUrl}
                                            alt=""
                                            aria-hidden="true"
                                            className={cn(
                                                "w-4 h-4 rounded-full object-cover shrink-0 border border-slate-200",
                                                isSoldOut &&
                                                    "grayscale opacity-50",
                                            )}
                                        />
                                    ) : v.warna_hex ? (
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "w-3.5 h-3.5 rounded-full shrink-0 border border-black/15 shadow-2xs",
                                                isSoldOut && "opacity-40",
                                            )}
                                            style={{
                                                backgroundColor: v.warna_hex,
                                            }}
                                        />
                                    ) : null}

                                    <span
                                        className={cn(
                                            isSoldOut &&
                                                "line-through text-slate-400",
                                        )}
                                    >
                                        {label}
                                    </span>

                                    {/* Tambahan Harga */}
                                    {extraPrice > 0 && !isSoldOut && (
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md font-mono">
                                            +{formatRupiah(extraPrice)}
                                        </span>
                                    )}

                                    {/* Garis Coret Diagonal untuk Varian Habis */}
                                    {isSoldOut && (
                                        <svg
                                            className="absolute inset-0 w-full h-full pointer-events-none text-slate-300"
                                            preserveAspectRatio="none"
                                            viewBox="0 0 100 100"
                                            aria-hidden="true"
                                        >
                                            <line
                                                x1="0"
                                                y1="100"
                                                x2="100"
                                                y2="0"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Pemilih Ukuran (Size Selector Pills) */}
            {hasMultipleSizes && onSelectSize && (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 tracking-tight">
                            Pilih Ukuran
                            {selectedSize && (
                                <span className="font-normal text-slate-500 ml-1.5">
                                    :{" "}
                                    <strong className="font-bold text-slate-800">
                                        {selectedSize}
                                    </strong>
                                </span>
                            )}
                        </span>
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Pilihan ukuran produk"
                        className="flex flex-wrap gap-2"
                    >
                        {availableSizes.map((size) => {
                            const isSizeSelected =
                                selectedSize?.toLowerCase() ===
                                size.toLowerCase();
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSizeSelected}
                                    onClick={() => onSelectSize(size)}
                                    className={cn(
                                        "min-w-11 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                        isSizeSelected
                                            ? "border-primary bg-primary text-white shadow-sm scale-[1.02]"
                                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50",
                                    )}
                                >
                                    {size.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. Stepper Kuantitas & Indikator Error */}
            <div className="pt-1 space-y-2">
                <span className="block text-xs font-bold text-slate-900">
                    Jumlah Pembelian
                </span>

                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 w-fit">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Kurangi jumlah barang"
                    >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <input
                        type="text"
                        role="spinbutton"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-valuenow={isOutOfStock ? 0 : quantity}
                        aria-valuemin={isOutOfStock ? 0 : 1}
                        aria-valuemax={currentVariantStock}
                        value={isOutOfStock ? "0" : localQtyStr}
                        disabled={isOutOfStock}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        className="w-12 text-center text-xs sm:text-sm font-black text-slate-900 focus:outline-none tabular-nums bg-transparent font-mono disabled:opacity-50"
                        aria-label="Jumlah kuantitas produk"
                    />

                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={
                            quantity >= currentVariantStock || isOutOfStock
                        }
                        className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Tambah jumlah barang"
                    >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-in fade-in pt-0.5"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
