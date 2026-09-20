import React from 'react';
import { Link, router } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Home({
    kategori = [],
    categories = [],
    produkUnggulan = [],
    featuredProducts = [],
    produkBts = [],
    btsProducts = [],
    produkPromo = [],
    promoProducts = [],
    keranjang = {},
    cart = {}
}) {
    const listKategori = kategori.length > 0 ? kategori : categories;
    const listProduk = produkUnggulan.length > 0 ? produkUnggulan : featuredProducts;

    const characters = [
        { name: 'Odin', type: 'Dinosaurus Hijau Petualang', emoji: '🦖', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        { name: 'Chilo', type: 'Kucing Pink Artistik', emoji: '🐱', color: 'bg-pink-100 text-pink-800 border-pink-300' },
        { name: 'Pigko', type: 'Babi Peach Ceria', emoji: '🐷', color: 'bg-rose-100 text-rose-800 border-rose-300' },
        { name: 'Popo', type: 'Panda Slate Bijak', emoji: '🐼', color: 'bg-slate-200 text-slate-800 border-slate-300' },
        { name: 'Choco', type: 'Beruang Cokelat Pelindung', emoji: '🐻', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    ];

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
            {/* Hero Section */}
            <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold px-3 py-1 rounded-full">
                            <span>🐾 Official CRSL Merchandise</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Animals as your <span className="text-[#E52027] underline decoration-wavy">Bestfriends!</span>
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                            Temukan koleksi dompet canvas, tas ransel fluffy, tumbler stainless steel, dan apparel streetwear eksklusif dengan 5 karakter sahabat CRSL.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <Link
                                href="/katalog"
                                className="bg-[#E52027] hover:bg-[#CC1C22] text-white font-extrabold text-sm px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                Jelajahi Katalog
                            </Link>
                            <Link
                                href="/katalog?kategori=back-to-school-essentials"
                                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-full border border-white/20 transition-all"
                            >
                                🎒 BTS Collection
                            </Link>
                        </div>
                    </div>

                    <div className="relative group flex justify-center">
                        <div className="w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800">
                            <img
                                src="/assets/gambar/banner-bts.webp"
                                alt="CRSL BTS Collection Banner"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5 Character Sahabat CRSL Section */}
            <section className="py-12 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sahabat Karakter CRSL</h2>
                        <p className="text-xs text-slate-500 mt-1">Setiap produk dirancang terinspirasi dari 5 kepribadian unik sahabat CRSL</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {characters.map((char) => (
                            <div
                                key={char.name}
                                className={`p-4 rounded-2xl border ${char.color} flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer`}
                            >
                                <span className="text-3xl mb-2">{char.emoji}</span>
                                <h4 className="font-extrabold text-sm">{char.name}</h4>
                                <p className="text-[10px] font-medium opacity-80 mt-0.5">{char.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Grid Section */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kategori Pilihan</h2>
                            <p className="text-xs text-slate-500 mt-1">Cari produk berdasarkan kategori favoritmu</p>
                        </div>
                        <Link href="/katalog" className="text-xs font-bold text-[#E52027] hover:underline flex items-center gap-1">
                            Lihat Semua <span>→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {listKategori.slice(0, 6).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/katalog?kategori=${cat.slug}`}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#E52027] hover:shadow-md transition-all flex flex-col items-center text-center group"
                            >
                                <div className="w-12 h-12 rounded-full bg-red-50 text-[#E52027] flex items-center justify-center text-xl font-bold mb-2 group-hover:scale-110 transition-transform">
                                    {cat.emoji || '📦'}
                                </div>
                                <span className="font-bold text-xs text-slate-800 group-hover:text-[#E52027] line-clamp-1">
                                    {cat.nama || cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products / All Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-xs font-extrabold text-[#E52027] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                            PRODUK POPULER
                        </span>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
                            Official CRSL Collection
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {listProduk.map((product) => {
                            const price = product.harga_dasar ?? product.price ?? 0;
                            const discountPrice = product.harga_diskon ?? product.discount_price ?? price;
                            const isDiscounted = discountPrice && discountPrice < price;
                            const discountPercent = isDiscounted ? Math.round(((price - discountPrice) / price) * 100) : 0;

                            return (
                                <Link
                                    key={product.id}
                                    href={`/produk/${product.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                                >
                                    {/* Image Thumbnail */}
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        <img
                                            src={product.gambar_utama || product.main_image}
                                            alt={product.nama || product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {isDiscounted && (
                                            <span className="absolute top-3 left-3 bg-[#E52027] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-xs">
                                                -{discountPercent}% OFF
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => handleQuickAddToCart(e, product.id)}
                                            className="absolute bottom-3 right-3 bg-white hover:bg-[#E52027] text-slate-800 hover:text-white p-2.5 rounded-full shadow-md transition-colors opacity-90 group-hover:opacity-100"
                                            title="Tambah Cepat ke Keranjang"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {product.kategori?.nama || product.category?.name || 'CRSL Merch'}
                                            </span>
                                            <h3 className="font-bold text-xs text-slate-800 line-clamp-2 mt-0.5 group-hover:text-[#E52027] transition-colors">
                                                {product.nama || product.name}
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
                                                Stok {product.stok_total ?? product.stock ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Brand Values / Why Choose CRSL */}
            <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
                            <span className="text-3xl">✨</span>
                            <h4 className="font-extrabold text-sm text-white">100% Produk Original</h4>
                            <p className="text-xs text-slate-400">Jaminan produk merchandise asli dan desain eksklusif sahabat CRSL.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
                            <span className="text-3xl">🚚</span>
                            <h4 className="font-extrabold text-sm text-white">Pengiriman Cepat</h4>
                            <p className="text-xs text-slate-400">Bisa kirim ke seluruh wilayah Indonesia dengan JNE, J&T, dan SiCepat.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-2">
                            <span className="text-3xl">🛡️</span>
                            <h4 className="font-extrabold text-sm text-white">Garansi Retur 7 Hari</h4>
                            <p className="text-xs text-slate-400">Jaminan ganti baru apabila produk mengalami cacat produksi saat diterima.</p>
                        </div>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
