import { useState } from "react";
import { router } from "@inertiajs/react";
import { ShoppingBag, Zap, Heart, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useKeranjangStore } from "../../Stores/useKeranjangStore";
import WhatsAppIcon from "../Common/WhatsAppIcon";
import { cn } from "../../lib/utils";

interface ProductActionButtonsProps {
    produkId: number | string;
    namaProduk: string;
    slug: string;
    varianId?: number;
    varianNama?: string;
    ukuran?: string;
    warna?: string;
    sku?: string;
    harga: number;
    hargaAsli: number;
    gambar: string;
    stokTersedia: number;
    kuantitas: number;
    onKuantitasChange: (qty: number) => void;
    onOpenInquiry?: () => void;
    isWishlisted?: boolean;
    onToggleWishlist?: () => void;
    className?: string;
}

export default function ProductActionButtons({
    produkId,
    namaProduk,
    slug,
    varianId,
    varianNama,
    ukuran = "All Size",
    warna,
    sku = "SKU-DEF",
    harga,
    hargaAsli,
    gambar,
    stokTersedia,
    kuantitas,
    onKuantitasChange,
    onOpenInquiry,
    isWishlisted = false,
    onToggleWishlist,
    className,
}: ProductActionButtonsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const tambahItemKeranjang = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    const isOutOfStock = stokTersedia <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast.error("Maaf, stok untuk varian ini sedang habis.");
            return;
        }

        try {
            tambahItemKeranjang(
                {
                    id: `cart-${produkId}-${varianId || "def"}`,
                    produk_id: Number(produkId),
                    slug: slug,
                    varian_id: varianId,
                    nama_produk: namaProduk,
                    harga: harga,
                    harga_asli: hargaAsli,
                    gambar: gambar,
                    jumlah: kuantitas,
                    ukuran: ukuran,
                    warna: warna,
                    sku: sku,
                },
                kuantitas
            );

            bukaKeranjang();
            toast.success(
                `${namaProduk} (${varianNama || ukuran}) berhasil ditambahkan ke keranjang!`
            );
        } catch {
            toast.error("Gagal menambahkan ke keranjang.");
        }
    };

    const handleBuyNow = () => {
        if (isOutOfStock) {
            toast.error("Maaf, stok untuk varian ini sedang habis.");
            return;
        }

        setIsSubmitting(true);
        try {
            tambahItemKeranjang(
                {
                    id: `cart-${produkId}-${varianId || "def"}`,
                    produk_id: Number(produkId),
                    slug: slug,
                    varian_id: varianId,
                    nama_produk: namaProduk,
                    harga: harga,
                    harga_asli: hargaAsli,
                    gambar: gambar,
                    jumlah: kuantitas,
                    ukuran: ukuran,
                    warna: warna,
                    sku: sku,
                },
                kuantitas
            );

            // Langsung arahkan ke halaman checkout
            router.visit("/checkout");
        } catch {
            setIsSubmitting(false);
            toast.error("Gagal melanjutkan ke checkout.");
        }
    };

    return (
        <div className={cn("space-y-4 pt-2", className)}>
            {/* Quantity Counter */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Jumlah Pembelian</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => onKuantitasChange(Math.max(1, kuantitas - 1))}
                        disabled={kuantitas <= 1 || isOutOfStock}
                        aria-label="Kurangi jumlah item"
                        className="p-2.5 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-extrabold text-slate-900 min-w-9 text-center">
                        {kuantitas}
                    </span>
                    <button
                        type="button"
                        onClick={() => onKuantitasChange(Math.min(stokTersedia, kuantitas + 1))}
                        disabled={kuantitas >= stokTersedia || isOutOfStock}
                        aria-label="Tambah jumlah item"
                        className="p-2.5 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="min-h-12 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary-subtle active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                </button>

                <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || isSubmitting}
                    className="min-h-12 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold text-sm active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Zap className="w-4 h-4 fill-white" />
                    )}
                    <span>Beli Sekarang</span>
                </button>
            </div>

            {/* Secondary Actions: Inquiry & Wishlist */}
            <div className="flex items-center gap-3 pt-1">
                {onOpenInquiry && (
                    <button
                        type="button"
                        onClick={onOpenInquiry}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                        <WhatsAppIcon className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Tanya Admin CRSL (WhatsApp)</span>
                    </button>
                )}

                {onToggleWishlist && (
                    <button
                        type="button"
                        onClick={onToggleWishlist}
                        aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
                        className={cn(
                            "px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            isWishlisted
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "text-slate-700 hover:text-primary hover:bg-slate-50"
                        )}
                    >
                        <Heart
                            className={cn(
                                "w-4 h-4",
                                isWishlisted && "fill-rose-500 text-rose-500"
                            )}
                        />
                        <span>{isWishlisted ? "Tersimpan" : "Favorit"}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
