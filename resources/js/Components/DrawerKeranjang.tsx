import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "@inertiajs/react";
import {
    X,
    Plus,
    Minus,
    ShoppingBag,
    Tag,
    ArrowRight,
    Gift,
    ShieldCheck,
    CreditCard,
    ChevronRight,
} from "lucide-react";
import { useKeranjangStore, ItemKeranjang } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";

interface DrawerKeranjangProps {
    isOpen: boolean;
    onClose: () => void;
}

const LOYALTY_THRESHOLD = 200000;

interface RecommendedProduct {
    id: string;
    nama_produk: string;
    harga: number;
    harga_asli?: number;
    gambar: string;
    warna?: string;
    ukuran?: string;
}

const RECENTLY_ORDERED_FALLBACK: RecommendedProduct[] = [
    {
        id: "rec_1",
        nama_produk: "CRSL Drinke Tumbler Series | Botol Tempat Minum Stainless",
        harga: 289000,
        harga_asli: 339000,
        gambar: "/assets/gambar/banner-tumbler.webp",
        warna: "Dark Grey",
    },
    {
        id: "rec_2",
        nama_produk: "CRSL Mini Daysic Backpack | Ransel Karakter Hewan",
        harga: 224100,
        harga_asli: 279000,
        gambar: "/assets/gambar/banner-hero-main.webp",
        warna: "Odin Cream",
    },
    {
        id: "rec_3",
        nama_produk: "CRSL Chilo Pouch Slingbag | Black | Tas Selempang",
        harga: 159000,
        gambar: "/assets/gambar/banner-2.webp",
        warna: "Black",
    },
    {
        id: "rec_4",
        nama_produk: "CRSL Haru Backpack | Pattern Backpack Plaid Tartan",
        harga: 288150,
        harga_asli: 339000,
        gambar: "/assets/gambar/banner-cassie.webp",
        warna: "Choco Brown",
    },
];

export default function DrawerKeranjang({
    isOpen,
    onClose,
}: DrawerKeranjangProps) {
    const items = useKeranjangStore((state) => state.items ?? []);
    const ubahJumlah = useKeranjangStore((state) => state.ubahJumlah);
    const hapusItem = useKeranjangStore((state) => state.hapusItem);
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const hitungTotal = useKeranjangStore((state) => state.hitungTotal);
    const hitungJumlahTotal = useKeranjangStore((state) => state.hitungJumlahTotal);

    const drawerRef = useRef<HTMLDivElement>(null);

    // Dynamic calculations
    const totalHarga = useMemo(() => {
        return typeof hitungTotal === "function"
            ? hitungTotal()
            : items.reduce(
                  (acc, item) => acc + (item.harga || 0) * (item.jumlah || 1),
                  0,
              );
    }, [items, hitungTotal]);

    const totalItem = useMemo(() => {
        return typeof hitungJumlahTotal === "function"
            ? hitungJumlahTotal()
            : items.reduce((acc, item) => acc + (item.jumlah || 1), 0);
    }, [items, hitungJumlahTotal]);

    const totalHemat = useMemo(() => {
        return items.reduce((acc, item) => {
            const hargaAsli = item.harga_asli || item.harga_dasar || 0;
            if (hargaAsli > item.harga) {
                return acc + (hargaAsli - item.harga) * (item.jumlah || 1);
            }
            return acc;
        }, 0);
    }, [items]);

    const sisaLoyalty = Math.max(0, LOYALTY_THRESHOLD - totalHarga);
    const loyaltyProgress = Math.min(
        100,
        Math.round((totalHarga / LOYALTY_THRESHOLD) * 100),
    );

    // Escape listener & Body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAddRecentlyOrdered = (prod: RecommendedProduct) => {
        tambahItem({
            id: `rec_item_${prod.id}_${Date.now()}`,
            nama_produk: prod.nama_produk,
            harga: prod.harga,
            harga_asli: prod.harga_asli,
            gambar: prod.gambar,
            jumlah: 1,
            warna: prod.warna,
            ukuran: prod.ukuran,
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            onClick={onClose}
        >
            <div
                ref={drawerRef}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-slideInRight"
            >
                {/* Header (Screenshot 1: "Cart" + "x") */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <h2
                        id="cart-drawer-title"
                        className="text-xl font-black text-slate-900 tracking-tight"
                    >
                        Cart
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin">
                    {items.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-[#E52027] flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Your cart is empty
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                    Explore CRSL best apparel & merchandise collection.
                                </p>
                            </div>
                            <Link
                                href="/katalog"
                                onClick={onClose}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                            >
                                <span>Start Shopping</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5 divide-y divide-slate-100">
                            {items.map((item) => {
                                const hargaCoret = item.harga_asli || item.harga_dasar || 0;
                                const hasDiscount = hargaCoret > item.harga;
                                const discountAmount = hasDiscount ? hargaCoret - item.harga : 0;
                                const isLowStock = item.stok !== undefined && item.stok > 0 && item.stok <= 5;

                                return (
                                    <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                                        {/* Standard or Bundled Header */}
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

                                                {/* Nested Sub-items (Screenshot 1) */}
                                                {item.sub_items && item.sub_items.length > 0 && (
                                                    <div className="pl-4 space-y-2 border-l-2 border-slate-100">
                                                        {item.sub_items.map((sub, sIdx) => (
                                                            <div key={sIdx} className="flex items-center gap-2.5 text-xs">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                                                                    {sub.gambar && (
                                                                        <img src={sub.gambar} alt="" className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                                                                        {sub.nama}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500">
                                                                        Variation: {sub.variasi}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Bundle exclusion notice */}
                                                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
                                                    Bundled Product will be excluded from all other discount & discount conditions.
                                                </div>
                                            </div>
                                        ) : (
                                            /* Standard Item View (Screenshot 1) */
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

                                                    {/* Dashed discount tag (Screenshot 1: "Get Rp 50,000 off") */}
                                                    {hasDiscount && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-slate-400 rounded-md text-[10px] font-bold text-slate-700">
                                                            <Tag className="w-3 h-3 text-slate-500" />
                                                            <span>Get {formatRupiah(discountAmount)} off</span>
                                                        </div>
                                                    )}

                                                    {/* Prices */}
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

                                                    {/* Stock urgency indicator */}
                                                    {isLowStock && (
                                                        <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-bold text-slate-700">
                                                            Only {item.stok} stocks left.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions: Remove link on left, rounded stepper on right */}
                                        <div className="flex items-center justify-between pt-1">
                                            <button
                                                type="button"
                                                onClick={() => hapusItem(item.id)}
                                                className="text-xs font-semibold text-slate-500 hover:text-red-600 underline underline-offset-2 transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>

                                            <div className="flex items-center border border-slate-300 rounded-full bg-white px-1 py-0.5 shadow-2xs">
                                                <button
                                                    type="button"
                                                    onClick={() => ubahJumlah(item.id, -1)}
                                                    disabled={item.jumlah <= 1}
                                                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-colors"
                                                    aria-label="Reduce quantity"
                                                >
                                                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>

                                                <span className="w-7 text-center text-xs font-bold text-slate-900 select-none">
                                                    {item.jumlah}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => ubahJumlah(item.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-slate-100 rounded-full transition-colors"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Trust Badges (Screenshot 1: Secure payment | Privacy protection) */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 divide-x divide-slate-200 text-center py-2 text-slate-500 text-xs font-medium">
                            <div className="flex items-center justify-center gap-1.5 px-2">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span>Secure payment</span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 px-2">
                                <ShieldCheck className="w-4 h-4 text-slate-400" />
                                <span>Privacy protection</span>
                            </div>
                        </div>
                    </div>

                    {/* Recently Ordered Section (Screenshot 1) */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Recently Ordered
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {RECENTLY_ORDERED_FALLBACK.map((prod) => (
                                <div
                                    key={prod.id}
                                    className="p-2.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between group"
                                >
                                    <div className="space-y-2">
                                        <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative">
                                            <img
                                                src={prod.gambar}
                                                alt={prod.nama_produk}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.src = "/assets/gambar/produk-placeholder.webp";
                                                }}
                                            />
                                            {/* Add to bag icon button (Matches Screenshot 1) */}
                                            <button
                                                type="button"
                                                onClick={() => handleAddRecentlyOrdered(prod)}
                                                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-white hover:bg-[#E52027] flex items-center justify-center shadow-md transition-colors cursor-pointer"
                                                aria-label={`Tambah ${prod.nama_produk} ke tas`}
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <h4 className="text-[11px] font-bold text-slate-900 line-clamp-2 leading-tight">
                                            {prod.nama_produk}
                                        </h4>
                                    </div>

                                    <div className="pt-2">
                                        {prod.harga_asli && (
                                            <p className="text-[10px] text-slate-400 line-through">
                                                {formatRupiah(prod.harga_asli)}
                                            </p>
                                        )}
                                        <p className="text-xs font-black text-slate-900">
                                            {formatRupiah(prod.harga)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Footer Checkout (Screenshot 1) */}
                {items.length > 0 && (
                    <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3 shadow-xl shrink-0">
                        {/* Total Price & Savings */}
                        <div className="flex items-baseline justify-between">
                            <div>
                                <span className="text-xs font-bold text-slate-700">
                                    Total Price ({totalItem})
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                                    {formatRupiah(totalHarga)}
                                </span>
                                {totalHemat > 0 && (
                                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                                        🏷️ Save {formatRupiah(totalHemat)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Loyalty Tier Progress (Screenshot 1: "Spend Rp 200,000 more to reach New Freen") */}
                        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                                <Gift className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>
                                    {sisaLoyalty > 0 ? (
                                        <>Spend {formatRupiah(sisaLoyalty)} more to reach New Freen</>
                                    ) : (
                                        <>🎉 You have unlocked New Freen Loyalty Tier!</>
                                    )}
                                </span>
                            </div>

                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                <div
                                    className="bg-slate-400 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${loyaltyProgress}%` }}
                                />
                            </div>

                            <div>
                                <Link
                                    href="/akun/loyalty"
                                    onClick={onClose}
                                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900"
                                >
                                    <span>View Loyalty benefit</span>
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Red CTA Button (Screenshot 1: "Checkout with Discount") */}
                        <div className="space-y-1.5 pt-1">
                            <Link
                                href="/pembayaran"
                                onClick={onClose}
                                className="w-full py-3.5 px-6 rounded-full bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center text-center transition-all cursor-pointer"
                            >
                                Checkout with Discount
                            </Link>

                            <p className="text-center text-[10px] text-slate-500">
                                Spend 200K to unlock loyalty rewards!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
