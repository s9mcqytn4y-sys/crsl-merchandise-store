import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function ProductDetail({ produk, product, rekomendasi = [], recommended = [], keranjang = {}, cart = {} }) {
    const activeProduct = produk || product || {};
    const listRekomendasi = rekomendasi.length > 0 ? rekomendasi : recommended;

    const mainImage = activeProduct.gambar_utama || activeProduct.main_image || '/assets/gambar/cassie-wallet.webp';
    const images = activeProduct.gambar && activeProduct.gambar.length > 0
        ? activeProduct.gambar
        : activeProduct.images && activeProduct.images.length > 0
            ? activeProduct.images
            : [{ id: 'main', url: mainImage, alt_text: activeProduct.nama || activeProduct.name }];

    const variants = activeProduct.varian || activeProduct.variants || [];
    const specs = activeProduct.spesifikasi || activeProduct.specifications || [];

    const [selectedImage, setSelectedImage] = useState(images[0]?.url || mainImage);
    const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
    const [selectedSize, setSelectedSize] = useState(selectedVariant?.ukuran || selectedVariant?.size_attribute || 'All Size');
    const [quantity, setQuantity] = useState(1);

    const price = activeProduct.harga_dasar ?? activeProduct.price ?? 0;
    const discountPrice = activeProduct.harga_diskon ?? activeProduct.discount_price ?? price;
    const isDiscounted = discountPrice && discountPrice < price;
    const currentPrice = discountPrice + (selectedVariant?.harga_tambahan || selectedVariant?.additional_price || 0);

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        router.post('/keranjang', {
            produk_id: activeProduct.id,
            varian_id: selectedVariant?.id,
            jumlah: quantity,
            ukuran: selectedSize,
            warna: selectedVariant?.nama_varian || selectedVariant?.variant_name,
        }, { preserveScroll: true });
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        router.post('/keranjang', {
            produk_id: activeProduct.id,
            varian_id: selectedVariant?.id,
            jumlah: quantity,
            ukuran: selectedSize,
            warna: selectedVariant?.nama_varian || selectedVariant?.variant_name,
        }, {
            onSuccess: () => router.get('/pembayaran')
        });
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            {/* Breadcrumb */}
            <div className="bg-slate-100 border-b border-slate-200 py-3 text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
                    <Link href="/" className="hover:text-slate-800">Beranda</Link>
                    <span>/</span>
                    <Link href="/katalog" className="hover:text-slate-800">Katalog</Link>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold truncate">{activeProduct.nama || activeProduct.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* PDP Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Column 1: Thumbnails */}
                    <div className="lg:col-span-1 order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[500px] no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={img.id || idx}
                                onClick={() => setSelectedImage(img.url)}
                                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                    selectedImage === img.url
                                        ? 'border-[#E52027] shadow-md scale-105'
                                        : 'border-slate-200 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img src={img.url} alt={img.alt_teks || img.alt_text || activeProduct.nama} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Column 2: Main Image View */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="aspect-square rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-lg">
                            <img
                                src={selectedImage}
                                alt={activeProduct.nama || activeProduct.name}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                            {isDiscounted && (
                                <span className="absolute top-4 left-4 bg-[#E52027] text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                                    SPECIAL PROMO
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Options */}
                    <div className="lg:col-span-6 order-3 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div>
                            <span className="text-xs font-bold text-[#E52027] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">
                                {activeProduct.kategori?.nama || activeProduct.category?.name || 'CRSL Merch'}
                            </span>
                            <h1 className="text-2xl font-black text-slate-900 mt-3 leading-snug">
                                {activeProduct.nama || activeProduct.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-3xl font-black text-[#E52027]">
                                {formatRupiah(currentPrice)}
                            </span>
                            {isDiscounted && (
                                <span className="text-sm font-semibold text-slate-400 line-through">
                                    {formatRupiah(price)}
                                </span>
                            )}
                        </div>

                        {/* Variants */}
                        {variants.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                    Pilih Varian Sahabat CRSL:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => {
                                                setSelectedVariant(variant);
                                                setSelectedSize(variant.ukuran || variant.size_attribute || 'All Size');
                                            }}
                                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                                                selectedVariant?.id === variant.id
                                                    ? 'border-[#E52027] bg-red-50 text-[#E52027] shadow-sm ring-1 ring-[#E52027]'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                            }`}
                                        >
                                            <span>{variant.nama_varian || variant.variant_name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Actions */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                                Jumlah Pembelian:
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-extrabold text-sm text-slate-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                                    Ready Stock ({activeProduct.stok_total ?? activeProduct.stock ?? 0} pcs)
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-[#E52027] border border-red-200 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
                            >
                                <span>🛍️</span> Tambah Keranjang
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-3.5 bg-[#E52027] hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                <span>⚡</span> Beli Sekarang
                            </button>
                        </div>

                        {/* Description & Specifications */}
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <div>
                                <h4 className="font-extrabold text-sm text-slate-900 mb-2">Deskripsi Produk</h4>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                    {activeProduct.deskripsi || activeProduct.description}
                                </p>
                            </div>

                            {specs.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="font-extrabold text-sm text-slate-900 mb-2">Spesifikasi Detail</h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                        {specs.map((spec) => (
                                            <div key={spec.id} className="grid grid-cols-3 text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                                                <span className="font-bold text-slate-500">{spec.kunci || spec.spec_key}</span>
                                                <span className="col-span-2 font-semibold text-slate-800">{spec.nilai || spec.spec_value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommended Products */}
                {listRekomendasi.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-slate-200">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Rekomendasi Produk Lainnya</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {listRekomendasi.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/produk/${item.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all p-3 space-y-2"
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                                        <img src={item.gambar_utama || item.main_image} alt={item.nama || item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.nama || item.name}</h4>
                                    <span className="text-xs font-black text-[#E52027]">
                                        {formatRupiah(item.harga_diskon ?? item.harga_dasar ?? item.price)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
