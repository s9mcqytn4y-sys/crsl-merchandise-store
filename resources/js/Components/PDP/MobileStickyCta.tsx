import { ShoppingBag, Zap } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

interface MobileStickyCtaProps {
    harga: number;
    hargaAsli?: number;
    namaVarian?: string;
    stokTersedia: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    className?: string;
}

export default function MobileStickyCta({
    harga,
    hargaAsli,
    namaVarian,
    stokTersedia,
    onAddToCart,
    onBuyNow,
    className,
}: MobileStickyCtaProps) {
    const isOutOfStock = stokTersedia <= 0;

    return (
        <aside
            aria-label="Aksi Cepat Pembelian Mobile"
            className={cn(
                "fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-4 py-3 md:hidden transition-transform duration-300",
                className
            )}
        >
            <div className="max-w-md mx-auto flex items-center justify-between gap-3">
                {/* Informasi Harga & Varian Singkat */}
                <div className="flex flex-col min-w-0 pr-1">
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[130px]">
                        {namaVarian || "Pilihan Standar"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-primary">
                            {formatRupiah(harga)}
                        </span>
                        {hargaAsli && hargaAsli > harga && (
                            <span className="text-[11px] text-slate-400 line-through">
                                {formatRupiah(hargaAsli)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        aria-label="Tambah ke keranjang"
                        className="min-h-11 px-3.5 rounded-xl border border-primary text-primary font-bold text-xs flex items-center gap-1.5 hover:bg-primary-subtle active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span className="hidden xs:inline">+ Keranjang</span>
                    </button>

                    <button
                        type="button"
                        onClick={onBuyNow}
                        disabled={isOutOfStock}
                        className="min-h-11 px-4 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Beli Sekarang</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
