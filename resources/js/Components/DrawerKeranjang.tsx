import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "@inertiajs/react";
import { X, ShoppingBag, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import DrawerItemRow from "./Keranjang/DrawerItemRow";
import RecommendedProducts, { RecommendedProduct } from "./Keranjang/RecommendedProducts";
import DrawerFooter from "./Keranjang/DrawerFooter";

interface DrawerKeranjangProps {
    isOpen: boolean;
    onClose: () => void;
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
                {/* Header */}
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
                        aria-label="Tutup keranjang"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 scrollbar-thin">
                    {items.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-primary flex items-center justify-center">
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
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                                <span>Start Shopping</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5 divide-y divide-slate-100">
                            {items.map((item) => (
                                <DrawerItemRow
                                    key={item.id}
                                    item={item}
                                    onHapus={hapusItem}
                                    onUbahJumlah={ubahJumlah}
                                />
                            ))}
                        </div>
                    )}

                    {/* Trust Badges */}
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

                    {/* Recently Ordered Recommendations */}
                    <RecommendedProducts
                        items={RECENTLY_ORDERED_FALLBACK}
                        onAdd={handleAddRecentlyOrdered}
                    />
                </div>

                {/* Sticky Footer */}
                {items.length > 0 && (
                    <DrawerFooter
                        totalItem={totalItem}
                        totalHarga={totalHarga}
                        totalHemat={totalHemat}
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
}
