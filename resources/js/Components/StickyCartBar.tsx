import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

interface StickyCartBarProps {
    className?: string;
}

export default function StickyCartBar({ className }: StickyCartBarProps) {
    const { url } = usePage();

    // Ambil aksi dan state reaktif dari Zustand
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const isCartOpen = useKeranjangStore((state) => state.isOpen);
    const items = useKeranjangStore((state) => state.items);
    const hitungJumlahTotal = useKeranjangStore(
        (state) => state.hitungJumlahTotal,
    );

    // Blacklist rute transaksi: sembunyikan bar di halaman checkout & faktur
    const isBlacklistedRoute = useMemo(() => {
        const cleanUrl = url.toLowerCase();
        return (
            cleanUrl.startsWith("/pembayaran") ||
            cleanUrl.startsWith("/checkout") ||
            cleanUrl.startsWith("/faktur") ||
            cleanUrl.includes("/pesanan/sukses")
        );
    }, [url]);

    // Kalkulasi reaktif jumlah item & subtotal keranjang
    const totalQty = useMemo(() => {
        if (typeof hitungJumlahTotal === "function") {
            return hitungJumlahTotal();
        }
        return Array.isArray(items)
            ? items.reduce((acc, item) => acc + (Number(item.jumlah) || 1), 0)
            : 0;
    }, [items, hitungJumlahTotal]);

    const totalHarga = useMemo(() => {
        return Array.isArray(items)
            ? items.reduce(
                  (acc, item) =>
                      acc +
                      (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
                  0,
              )
            : 0;
    }, [items]);

    // Jangan render jika keranjang kosong, laci keranjang sedang aktif, atau di rute transaksi
    if (totalQty <= 0 || isCartOpen || isBlacklistedRoute) {
        return null;
    }

    return (
        <aside
            id="sticky-cart-bar"
            aria-label="Ringkasan Keranjang Belanja Mengambang"
            className={cn(
                "fixed bottom-5 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none",
                className,
            )}
            style={{
                paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
            }}
        >
            <button
                type="button"
                onClick={bukaKeranjang}
                className="pointer-events-auto w-full max-w-[340px] sm:max-w-[380px] bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.98] text-white rounded-2xl py-3 px-4 sm:px-5 shadow-2xl flex items-center justify-between transition-all duration-200 cursor-pointer border border-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#E52027]/40 animate-in fade-in slide-in-from-bottom-4"
                aria-label={`Buka keranjang belanja: ${totalQty} produk, subtotal ${formatRupiah(totalHarga)}`}
            >
                {/* Sisi Kiri: Ikon Belanja & Rincian Produk */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                        className="relative flex items-center justify-center w-10 h-10 bg-white text-[#E52027] rounded-xl shadow-xs shrink-0"
                        aria-hidden="true"
                    >
                        <ShoppingBag className="w-5 h-5 stroke-[2.2]" />

                        {/* Counter Badge Bulat Kontras Tinggi */}
                        <span className="absolute -top-1.5 -right-1.5 bg-[#E52027] text-white text-[10px] font-black rounded-full min-w-5 h-5 px-1 flex items-center justify-center border-2 border-white shadow-xs tabular-nums leading-none">
                            {totalQty > 99 ? "99+" : totalQty}
                        </span>
                    </div>

                    <div className="text-left flex flex-col justify-center min-w-0">
                        <span className="text-xs sm:text-[13px] font-bold text-white tracking-tight truncate">
                            {totalQty} Produk di Keranjang
                        </span>
                        <span className="text-xs sm:text-[13px] font-extrabold text-white/95 mt-0.5 tabular-nums font-mono">
                            {formatRupiah(totalHarga)}
                        </span>
                    </div>
                </div>

                {/* Sisi Kanan: Call-to-Action Lihat Keranjang */}
                <div className="flex items-center gap-1.5 pl-2 shrink-0 border-l border-white/20 text-white font-bold text-xs tracking-wide">
                    <span className="hidden sm:inline">Lihat</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>
            </button>
        </aside>
    );
}
