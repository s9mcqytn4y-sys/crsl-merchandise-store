import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { X, ChevronRight } from "lucide-react";
import { useCartModalStore, VarianModalItem } from "../Stores/useCartModalStore";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { toast } from "sonner";

export default function AddToCartModal() {
    const { isOpen, product, closeCartModal } = useCartModalStore();
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    const [selectedVarian, setSelectedVarian] = useState<VarianModalItem | null>(null);
    const [jumlah, setJumlah] = useState(1);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Reset state saat modal dibuka
    useEffect(() => {
        if (isOpen && product) {
            setSelectedVarian(null);
            setJumlah(1);
            setHasAttemptedSubmit(false);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const varianList = product.varian || [];
    const hasVariants = varianList.length > 0;

    const handleSelectVariant = (varian: VarianModalItem) => {
        setSelectedVarian(varian);
    };

    const handleAddToCart = () => {
        if (hasVariants && !selectedVarian) {
            setHasAttemptedSubmit(true);
            return;
        }

        const effectivePrice = product.harga_diskon ?? product.harga_dasar;
        const finalPrice = effectivePrice + (selectedVarian?.harga_tambahan ?? 0);
        const finalImage =
            selectedVarian?.gambar_varian ||
            product.gambar_utama ||
            "/assets/gambar/drinke-tumblr.webp";
        const finalSku = selectedVarian?.sku || `CRSL-PROD-${product.id}`;

        tambahItem({
            id: `cart-${product.id}-${selectedVarian?.id ?? "default"}`,
            produk_id: product.id,
            varian_id: selectedVarian?.id ? Number(selectedVarian.id) : undefined,
            nama_produk: product.nama,
            warna: selectedVarian?.warna || selectedVarian?.nama_varian,
            ukuran: selectedVarian?.ukuran || "900ml / 32oz",
            harga: finalPrice,
            gambar: finalImage,
            jumlah: jumlah,
            sku: finalSku,
        });

        toast.success(`${product.nama} ditambahkan ke keranjang!`);
        closeCartModal();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-to-cart-title"
            onClick={closeCartModal}
        >
            <div
                className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal Sesuai Screenshot 2 */}
                <div className="flex items-center justify-between pb-1">
                    <h3
                        id="modal-add-to-cart-title"
                        className="text-base font-bold text-slate-800 tracking-tight"
                    >
                        Add to Cart
                    </h3>
                    <button
                        type="button"
                        onClick={closeCartModal}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5 stroke-[2]" />
                    </button>
                </div>

                {/* Box Header Produk Sesuai Screenshot 2 */}
                <Link
                    href={`/produk/${product.slug}`}
                    onClick={closeCartModal}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-100 transition-colors group cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                        <img
                            src={product.gambar_utama || "/assets/gambar/drinke-tumblr.webp"}
                            alt={product.nama}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                        <p className="text-xs font-medium text-slate-800 line-clamp-3 leading-snug group-hover:text-[#E52027] transition-colors">
                            {product.nama}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E52027] shrink-0" />
                </Link>

                {/* Label & Swatch Varian WARNA Sesuai Screenshot 2 */}
                {hasVariants && (
                    <div className="space-y-2 pt-1">
                        <span className="block text-xs font-bold text-[#E52027] tracking-wider uppercase">
                            WARNA
                        </span>

                        <div className="grid grid-cols-3 gap-2.5">
                            {varianList.map((varian) => {
                                const isSelected = selectedVarian?.id === varian.id;
                                const imgThumb =
                                    varian.gambar_varian ||
                                    product.gambar_utama ||
                                    "/assets/gambar/drinke-tumblr.webp";

                                return (
                                    <button
                                        key={varian.id}
                                        type="button"
                                        onClick={() => handleSelectVariant(varian)}
                                        className={`flex flex-col items-center justify-between p-2 rounded-lg border transition-all text-center cursor-pointer min-h-[90px] ${
                                            isSelected
                                                ? "border-[#E52027] bg-white ring-1 ring-[#E52027]"
                                                : "border-slate-200 bg-[#F9FAFB] hover:border-slate-300"
                                        }`}
                                    >
                                        <div className="w-12 h-12 overflow-hidden mb-1 flex items-center justify-center">
                                            <img
                                                src={imgThumb}
                                                alt={varian.nama_varian}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-700 uppercase tracking-tight line-clamp-2">
                                            {varian.nama_varian}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Validasi Warning Sesuai Screenshot 2: Please select WARNA */}
                {hasVariants && !selectedVarian && hasAttemptedSubmit && (
                    <div className="bg-[#FFF1F2] text-[#E52027] text-xs font-semibold px-4 py-2.5 rounded-lg border border-red-100 text-left animate-in fade-in duration-150">
                        Please select WARNA
                    </div>
                )}

                {/* Stepper Jumlah Sesuai Screenshot 2 */}
                <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
                            disabled={jumlah <= 1}
                            className="w-9 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-bold text-base transition-colors"
                            aria-label="Kurangi jumlah"
                        >
                            -
                        </button>
                        <span className="w-12 text-center text-xs font-semibold text-slate-800 select-none">
                            {jumlah}
                        </span>
                        <button
                            type="button"
                            onClick={() => setJumlah((prev) => prev + 1)}
                            className="w-9 h-8 flex items-center justify-center text-[#E52027] hover:bg-red-50 cursor-pointer font-bold text-base transition-colors"
                            aria-label="Tambah jumlah"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Tombol Add to Cart Merah Solid Sesuai Screenshot 2 */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
