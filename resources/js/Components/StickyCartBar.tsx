import React, { useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";

export default function StickyCartBar() {
    // Ambil aksi dan state reaktif
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const items = useKeranjangStore((state) => state.items);
    const hitungTotal = useKeranjangStore((state) => state.hitungTotal);
    const hitungJumlahTotal = useKeranjangStore(
        (state) => state.hitungJumlahTotal,
    );

    // Kalkulasi reaktif dengan memoization aman
    const totalQty = useMemo(() => {
        if (typeof hitungJumlahTotal === "function") {
            return hitungJumlahTotal();
        }
        return Array.isArray(items)
            ? items.reduce((acc, item) => acc + (item.jumlah || 1), 0)
            : 0;
    }, [items, hitungJumlahTotal]);

    const totalHarga = useMemo(() => {
        if (typeof hitungTotal === "function") {
            return hitungTotal();
        }
        return Array.isArray(items)
            ? items.reduce(
                  (acc, item) => acc + (item.harga || 0) * (item.jumlah || 1),
                  0,
              )
            : 0;
    }, [items, hitungTotal]);

    // Jangan render jika keranjang kosong
    if (totalQty <= 0) return null;

    return (
        <div
            id="sticky-cart-bar"
            role="region"
            aria-label="Ringkasan Keranjang Belanja"
            className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none pb-safe"
        >
            <button
                type="button"
                onClick={bukaKeranjang}
                className="pointer-events-auto w-full max-w-85 sm:max-w-90 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-2xl py-2.5 px-4 shadow-xl flex items-center justify-between transition-all duration-200 cursor-pointer border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white animate-in fade-in slide-in-from-bottom-4"
                aria-label={`Buka keranjang belanja: ${totalQty} produk, total ${formatRupiah(totalHarga)}`}
            >
                {/* Sisi Kiri: Deskripsi Jumlah & Subtotal */}
                <div className="text-left flex flex-col justify-center leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-white tracking-normal">
                        {totalQty} Items in My Cart
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-white/95 mt-0.5 tabular-nums">
                        {formatRupiah(totalHarga)}
                    </span>
                </div>

                {/* Sisi Kanan: Lingkaran Putih + Badge Counter */}
                <div
                    className="relative flex items-center justify-center w-9 h-9 bg-white text-primary rounded-full shadow-xs shrink-0"
                    aria-hidden="true"
                >
                    <ShoppingCart className="w-4 h-4" strokeWidth={2.4} />

                    {/* Counter Badge Bulat */}
                    <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-primary shadow-2xs tabular-nums leading-none">
                        {totalQty > 99 ? "99+" : totalQty}
                    </span>
                </div>
            </button>
        </div>
    );
}
