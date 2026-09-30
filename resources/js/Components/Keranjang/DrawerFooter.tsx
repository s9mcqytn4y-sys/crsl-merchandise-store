import { Link } from "@inertiajs/react";
import { formatRupiah } from "../../Utils/formatters";
import LoyaltyProgressBar from "./LoyaltyProgressBar";

interface DrawerFooterProps {
    totalItem: number;
    totalHarga: number;
    totalHemat: number;
    onClose: () => void;
}

export default function DrawerFooter({
    totalItem,
    totalHarga,
    totalHemat,
    onClose,
}: DrawerFooterProps) {
    const isCartEmpty = totalItem <= 0;

    return (
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3 shadow-xl shrink-0">
            {/* Total Pembayaran & Hemat */}
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-xs font-bold text-slate-700">
                        Total Pembayaran ({totalItem} produk)
                    </span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums font-mono">
                        {formatRupiah(totalHarga)}
                    </span>
                    {totalHemat > 0 && (
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                            Hemat {formatRupiah(totalHemat)}
                        </p>
                    )}
                </div>
            </div>

            {/* Loyalty Tier Milestone Progress */}
            {!isCartEmpty && (
                <LoyaltyProgressBar
                    totalHarga={totalHarga}
                    onCloseDrawer={onClose}
                />
            )}

            {/* CTA Button */}
            <div className="space-y-1.5 pt-1">
                {isCartEmpty ? (
                    <button
                        type="button"
                        disabled
                        className="w-full min-h-[44px] py-3.5 px-6 rounded-full bg-slate-200 text-slate-400 font-extrabold text-sm sm:text-base cursor-not-allowed text-center transition-all select-none"
                        aria-label="Keranjang belanja kosong"
                    >
                        Pilih Produk Dahulu
                    </button>
                ) : (
                    <Link
                        href="/pembayaran"
                        onClick={onClose}
                        className="w-full min-h-[44px] py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center text-center transition-all cursor-pointer"
                        aria-label="Lanjut ke halaman pembayaran"
                    >
                        Lanjut ke Pembayaran
                    </Link>
                )}

                <p className="text-center text-[10px] text-slate-500">
                    Selesaikan pesanan untuk memproses koin loyalitas Anda.
                </p>
            </div>
        </div>
    );
}
