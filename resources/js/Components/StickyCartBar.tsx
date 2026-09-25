import React from "react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";

export default function StickyCartBar() {
    const items = useKeranjangStore((state) => state.items);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const hitungTotal = useKeranjangStore((state) => state.hitungTotal);
    const hitungJumlahTotal = useKeranjangStore((state) => state.hitungJumlahTotal);

    const totalQty = hitungJumlahTotal();
    const totalHarga = hitungTotal();

    if (totalQty <= 0) return null;

    return (
        <div
            id="sticky-cart-bar"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md transition-all duration-300 transform animate-in slide-in-from-bottom-5"
        >
            <button
                type="button"
                onClick={bukaKeranjang}
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between transition-all duration-200 cursor-pointer border border-red-500/30"
                aria-label={`Keranjang belanja: ${totalQty} produk, total ${formatRupiah(totalHarga)}`}
            >
                {/* Informasi Kiri: Jumlah Item & Total Harga */}
                <div className="text-left flex flex-col">
                    <span className="text-sm font-black tracking-tight leading-tight">
                        {totalQty} Items in My Cart
                    </span>
                    <span className="text-xs font-medium text-white/95 tabular-nums">
                        {formatRupiah(totalHarga)}
                    </span>
                </div>

                {/* Tombol Bulat Kanan: Icon Cart + Badge Merah Sesuai Screenshot 4 */}
                <div className="relative flex items-center justify-center w-11 h-11 bg-white text-primary rounded-full shadow-md shrink-0">
                    <svg
                        className="w-5 h-5 fill-none stroke-current"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>

                    {/* Badge Angka Bulat Merah Kecil di Sudut */}
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xs">
                        {totalQty > 99 ? "99+" : totalQty}
                    </span>
                </div>
            </button>
        </div>
    );
}
