import React from 'react';
import { Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Catalog({
    produk = [],
    products = [],
    kategori = [],
    categories = [],
    filter = {},
    filters = {},
    keranjang = {},
    cart = {}
}) {
    const listProduk = produk.length > 0 ? produk : products;
    const listKategori = kategori.length > 0 ? kategori : categories;
    const activeFilter = Object.keys(filter).length > 0 ? filter : filters;

    const handleCategoryChange = (slug) => {
        router.get('/katalog', { ...activeFilter, kategori: slug }, { preserveScroll: true });
    };

    const handleSortChange = (e) => {
        router.get('/katalog', { ...activeFilter, urutkan: e.target.value }, { preserveScroll: true });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    const handleQuickAddToCart = (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        router.post('/keranjang', {
            produk_id: productId,
            jumlah: 1,
        }, { preserveScroll: true });
    };

    return (
        <MainLayout keranjang={keranjang} cart={cart}>
            <div className="bg-slate-100 border-b border-slate-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-black text-slate-800">Katalog Produk CRSL</h1>
                    <p className="text-xs text-slate-500 mt-1">Temukan berbagai koleksi merchandise unik & sahabat karakter CRSL</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters & Sorting Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    {/* Category Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => handleCategoryChange('all-products')}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                (activeFilter.kategori === 'all-products' || activeFilter.category === 'all-products' || !activeFilter.kategori)
                                    ? 'bg-[#E52027] text-white shadow-md'
                                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                        >
                            Semua Produk
                        </button>
                        {listKategori.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    (activeFilter.kategori === cat.slug || activeFilter.category === cat.slug)
                                        ? 'bg-[#E52027] text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                            >
                                {cat.emoji && <span>{cat.emoji}</span>}
                                {cat.nama || cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Urutkan:</span>
                        <select
                            value={activeFilter.urutkan || activeFilter.sort || 'default'}
                            onChange={handleSortChange}
                            className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-[#E52027]"
                        >
                            <option value="default">Default</option>
                            <option value="harga_rendah">Harga Terendah</option>
                            <option value="harga_tinggi">Harga Tertinggi</option>
                            <option value="terbaru">Terbaru</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {listProduk.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-8">
                        <div className="text-5xl opacity-40 mb-3">🔍</div>
                        <h3 className="font-bold text-slate-800 text-base">Tidak ada produk ditemukan</h3>
                        <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau kategori filter Anda.</p>
                        <button
                            onClick={() => handleCategoryChange('all-products')}
                            className="mt-4 bg-[#E52027] text-white font-bold text-xs px-6 py-2.5 rounded-full"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {listProduk.map((item) => {
                            const price = item.harga_dasar ?? item.price ?? 0;
                            const discountPrice = item.harga_diskon ?? item.discount_price ?? price;
                            const isDiscounted = discountPrice && discountPrice < price;
                            const discountPercent = isDiscounted ? Math.round(((price - discountPrice) / price) * 100) : 0;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/produk/${item.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                                >
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={item.gambar_utama || item.main_image}
                                            alt={item.nama || item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {isDiscounted && (
                                            <span className="absolute top-3 left-3 bg-[#E52027] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-xs">
                                                -{discountPercent}% OFF
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => handleQuickAddToCart(e, item.id)}
                                            className="absolute bottom-3 right-3 bg-white hover:bg-[#E52027] text-slate-800 hover:text-white p-2.5 rounded-full shadow-md transition-colors opacity-90 group-hover:opacity-100"
                                            title="Tambah Cepat ke Keranjang"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {item.kategori?.nama || item.category?.name || 'CRSL Merch'}
                                            </span>
                                            <h3 className="font-bold text-xs text-slate-800 line-clamp-2 mt-0.5 group-hover:text-[#E52027] transition-colors">
                                                {item.nama || item.name}
                                            </h3>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                {isDiscounted ? (
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-sm font-black text-[#E52027]">
                                                            {formatRupiah(discountPrice)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 line-through">
                                                            {formatRupiah(price)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-black text-slate-800">
                                                        {formatRupiah(price)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                Stok {item.stok_total ?? item.stock ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
