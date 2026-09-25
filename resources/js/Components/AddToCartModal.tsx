import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { X, ChevronRight } from 'lucide-react';
import { useCartModalStore, VarianModalItem } from '../Stores/useCartModalStore';
import { useKeranjangStore } from '../Stores/useKeranjangStore';
import { toast } from 'sonner';

export default function AddToCartModal() {
    const { isOpen, product, closeCartModal } = useCartModalStore();
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    const [selectedVarian, setSelectedVarian] = useState<VarianModalItem | null>(null);
    const [jumlah, setJumlah] = useState(1);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Reset state saat modal dibuka
    useEffect(() => {
        if (isOpen && product) {
            setSelectedVarian(null);
            setJumlah(1);
            setErrorMessage(null);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const varianList = product.varian || [];
    const hasVariants = varianList.length > 0;

    const handleSelectVariant = (varian: VarianModalItem) => {
        setSelectedVarian(varian);
        setErrorMessage(null);
    };

    const handleAddToCart = () => {
        // Validasi SKU / Selector Varian (Screenshot 1)
        if (hasVariants && !selectedVarian) {
            setErrorMessage('Please select WARNA');
            return;
        }

        const effectivePrice = product.harga_diskon ?? product.harga_dasar;
        const finalPrice = effectivePrice + (selectedVarian?.harga_tambahan ?? 0);
        const finalImage = selectedVarian?.gambar_varian || product.gambar_utama || '/assets/gambar/drinke-tumblr.webp';
        const finalSku = selectedVarian?.sku || `CRSL-PROD-${product.id}`;

        tambahItem({
            id: `cart-${product.id}-${selectedVarian?.id ?? 'default'}`,
            produk_id: product.id,
            varian_id: selectedVarian?.id ? Number(selectedVarian.id) : undefined,
            nama_produk: product.nama,
            warna: selectedVarian?.warna || selectedVarian?.nama_varian,
            ukuran: selectedVarian?.ukuran || 'All Size',
            harga: finalPrice,
            gambar: finalImage,
            jumlah: jumlah,
            sku: finalSku,
        });

        toast.success(`${product.nama} ditambahkan ke keranjang!`);
        closeCartModal();
        bukaKeranjang();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-to-cart-title"
        >
            <div
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="flex items-center justify-between">
                    <h3
                        id="modal-add-to-cart-title"
                        className="text-base font-bold text-slate-900 tracking-tight font-heading"
                    >
                        Add to Cart
                    </h3>
                    <button
                        type="button"
                        onClick={closeCartModal}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5 stroke-[2.2]" />
                    </button>
                </div>

                {/* Card Ringkasan Produk & Link PDP (Screenshot 1) */}
                <Link
                    href={`/produk/${product.slug}`}
                    onClick={closeCartModal}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors group cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img
                            src={product.gambar_utama || '/assets/gambar/drinke-tumblr.webp'}
                            alt={product.nama}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#E52027] transition-colors">
                            {product.nama}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#E52027] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>

                {/* Section Selector Varian (WARNA) */}
                {hasVariants && (
                    <div className="space-y-3">
                        <span className="block text-xs font-bold text-[#E52027] uppercase tracking-wider">
                            WARNA
                        </span>

                        <div className="grid grid-cols-3 gap-3">
                            {varianList.map((varian) => {
                                const isSelected = selectedVarian?.id === varian.id;
                                const imgThumb = varian.gambar_varian || product.gambar_utama || '/assets/gambar/drinke-tumblr.webp';

                                return (
                                    <button
                                        key={varian.id}
                                        type="button"
                                        onClick={() => handleSelectVariant(varian)}
                                        className={`flex flex-col items-center p-2 rounded-2xl border transition-all text-center cursor-pointer ${
                                            isSelected
                                                ? 'border-[#E52027] bg-red-50/20 ring-2 ring-red-100 shadow-2xs'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden mb-2">
                                            <img
                                                src={imgThumb}
                                                alt={varian.nama_varian}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight line-clamp-2">
                                            {varian.nama_varian}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Kotak Error Validasi (Screenshot 1: Please select WARNA) */}
                {errorMessage && (
                    <div className="bg-[#FFF1F2] border border-red-200 text-[#E52027] text-xs font-semibold px-4 py-3 rounded-xl text-center animate-in fade-in duration-150">
                        {errorMessage}
                    </div>
                )}

                {/* Quantity Counter */}
                <div className="flex items-center justify-center pt-1">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-full border border-slate-200 text-slate-700 font-black text-lg flex items-center justify-center hover:bg-slate-50 active:scale-95 cursor-pointer"
                            aria-label="Kurangi jumlah"
                        >
                            -
                        </button>
                        <span className="text-sm font-extrabold text-slate-900 min-w-6 text-center">
                            {jumlah}
                        </span>
                        <button
                            type="button"
                            onClick={() => setJumlah((prev) => prev + 1)}
                            className="w-8 h-8 rounded-full border border-slate-200 text-[#E52027] font-black text-lg flex items-center justify-center hover:bg-red-50 active:scale-95 cursor-pointer"
                            aria-label="Tambah jumlah"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Tombol Add to Cart (Merah Solid Sesuai Screenshot 1) */}
                <button
                    type="button"
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-98 text-white font-black text-sm rounded-full shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
