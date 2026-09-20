import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { Menu, Search, User, ShoppingBag, Globe } from 'lucide-react';
import BilahAtas from '../Components/BilahAtas';
import PreferensiModal from '../Components/PreferensiModal';
import PencarianModal from '../Components/PencarianModal';
import SideMenuDrawer from '../Components/SideMenuDrawer';

export default function MainLayout({ children, keranjang = {}, cart = {} }) {
    const { flash } = usePage().props;
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPrefOpen, setIsPrefOpen] = useState(false);

    // Preferences state
    const [country, setCountry] = useState('ID');
    const [language, setLanguage] = useState('id');
    const [currency, setCurrency] = useState('IDR');

    const activeCart = keranjang && Object.keys(keranjang).length > 0 ? keranjang : cart;
    const cartItems = Object.values(activeCart || {});
    const cartCount = cartItems.reduce((acc, item) => acc + (item.jumlah ?? item.quantity ?? 1), 0);
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.harga ?? item.price ?? 0) * (item.jumlah ?? item.quantity ?? 1)), 0);

    const handleUpdateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.put(`/keranjang/${cartKey}`, { jumlah: newQty }, { preserveScroll: true });
    };

    const handleRemoveItem = (cartKey) => {
        router.delete(`/keranjang/${cartKey}`, { preserveScroll: true });
        toast.info('Item dihapus dari keranjang.');
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(number || 0);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans relative">
            <Toaster position="top-right" richColors />

            {/* Announcement Bar Rotator (Bilah Atas) */}
            <BilahAtas />

            {/* Header Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
                    {/* Left: Side Menu & Brand Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-1.5 text-slate-700 hover:text-[#E52027] hover:bg-slate-100 rounded-xl transition-all"
                            title="Buka Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-lg tracking-tighter shadow-md group-hover:scale-105 transition-transform">
                                CRSL
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-lg font-extrabold text-[#E52027] tracking-wider block leading-none">CRSL</span>
                                <span className="text-[9px] text-slate-500 tracking-widest font-medium uppercase">Merchandise Store</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6 font-bold text-xs text-slate-700 uppercase tracking-wider">
                        <Link href="/" className="hover:text-[#E52027] transition-colors">Beranda</Link>
                        <Link href="/katalog" className="hover:text-[#E52027] transition-colors">Katalog Produk</Link>
                        <Link href="/katalog?kategori=back-to-school-essentials" className="hover:text-[#E52027] transition-colors flex items-center gap-1 text-[#E52027]">
                            <span>🎒</span> BTS Collection
                        </Link>
                        <Link href="/lacak" className="hover:text-[#E52027] transition-colors">Lacak Pesanan</Link>
                    </nav>

                    {/* Actions Right */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Region & Currency Preference */}
                        <button
                            onClick={() => setIsPrefOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#E52027] px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            <span>🇮🇩</span>
                            <span>{currency}</span>
                        </button>

                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-slate-700 hover:text-[#E52027] hover:bg-red-50 rounded-full transition-all"
                            title="Cari Produk"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Customer Account */}
                        <Link
                            href="/akun"
                            className="p-2 text-slate-700 hover:text-[#E52027] hover:bg-red-50 rounded-full transition-all relative"
                            title="Akun Saya"
                        >
                            <User className="w-5 h-5" />
                        </Link>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2 bg-[#E52027] text-white rounded-full hover:bg-red-700 transition-all shadow-sm flex items-center justify-center group"
                            title="Keranjang Belanja"
                        >
                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Flash Message */}
            {flash?.sukses && (
                <div className="bg-emerald-500 text-white py-2 px-4 text-center font-bold text-xs shadow-sm flex items-center justify-center gap-2">
                    <span>✨ {flash.sukses}</span>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Floating Sticky Cart Capsule Bar at Bottom */}
            {cartCount > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#E52027] text-white px-5 py-3 rounded-full shadow-2xl flex items-center justify-between gap-6 border-2 border-white/20 animate-fade-in hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setIsCartOpen(true)}
                >
                    <div className="text-left">
                        <div className="font-extrabold text-xs">{cartCount} Items in My Cart</div>
                        <div className="text-[11px] font-bold text-amber-300">{formatRupiah(subtotal)}</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white text-[#E52027] flex items-center justify-center font-bold text-xs shadow-sm">
                        🛍️
                    </div>
                </div>
            )}

            {/* Main Footer */}
            <footer className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#E52027] text-white flex items-center justify-center font-bold text-lg">CRSL</div>
                            <span className="text-xl font-black text-white tracking-wider">CRSL STORE</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed mb-4">
                            CRSL Merchandise — Apparel & Accessories brand lokal Indonesia yang terinspirasi dari karakter 5 hewan sahabat unik. Animals as your bestfriends!
                        </p>
                        <div className="text-xs text-slate-500">📍 Sleman, D.I. Yogyakarta, Indonesia</div>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-white mb-3 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Kategori Populer</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/katalog?kategori=backpack-collection" className="hover:text-white transition-colors">Backpack Collection</Link></li>
                            <li><Link href="/katalog?kategori=tumbler-collection" className="hover:text-[#E52027] transition-colors">Tumbler Series</Link></li>
                            <li><Link href="/katalog?kategori=outerwears-collection" className="hover:text-white transition-colors">Outerwears & Hoodie</Link></li>
                            <li><Link href="/katalog?kategori=wallet-accessories" className="hover:text-white transition-colors">Wallet & Accessories</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-white mb-3 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Bantuan & Layanan</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/lacak" className="hover:text-white transition-colors">Lacak Pesanan</Link></li>
                            <li><a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">Customer Service WhatsApp</a></li>
                            <li><Link href="/akun" className="hover:text-white transition-colors">Akun & Wishlist</Link></li>
                            <li><span className="text-slate-500">Panduan Ukuran (Size Chart)</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-white mb-3 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Pembayaran Safe & Easy</h4>
                        <p className="text-xs text-slate-400 mb-3">Mendukung QRIS, Virtual Account BCA, Mandiri, BNI, BRI, & E-Wallet.</p>
                        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center text-xs font-bold text-amber-400">
                            🔒 100% Original CRSL Merchandise Guaranteed
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
                    © 2026 CRSL Merchandise Official Store v2. Modular Monolith Architecture.
                </div>
            </footer>

            {/* Slide-Over Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                            {/* Drawer Header */}
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🛍️</span>
                                    <h2 className="text-lg font-bold">Keranjang Belanja</h2>
                                    <span className="bg-[#E52027] text-xs font-extrabold px-2 py-0.5 rounded-full text-white">
                                        {cartCount} item
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-16 space-y-3">
                                        <div className="text-5xl animate-bounce">🎒</div>
                                        <p className="font-bold text-slate-700">Keranjang Anda masih kosong</p>
                                        <p className="text-xs text-slate-400">Yuk, pilih merchandise CRSL favoritmu sekarang!</p>
                                        <Link
                                            href="/katalog"
                                            onClick={() => setIsCartOpen(false)}
                                            className="inline-block mt-2 px-5 py-2.5 bg-[#E52027] text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-all"
                                        >
                                            Jelajahi Katalog
                                        </Link>
                                    </div>
                                ) : (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 relative group">
                                            <img
                                                src={item.gambar || item.image || '/assets/gambar/cassie-wallet.webp'}
                                                alt={item.nama_produk || item.name}
                                                className="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-xs text-slate-900 truncate">{item.nama_produk || item.name}</h4>
                                                {(item.ukuran || item.size) && (
                                                    <span className="inline-block text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold mt-1">
                                                        Varian: {item.ukuran || item.size}
                                                    </span>
                                                )}
                                                <div className="text-[#E52027] font-extrabold text-xs mt-1">
                                                    {formatRupiah(item.harga || item.price)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, (item.jumlah ?? item.quantity) - 1)}
                                                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-xs flex items-center justify-center text-slate-700"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs font-extrabold text-slate-800 w-4 text-center">{item.jumlah ?? item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, (item.jumlah ?? item.quantity) + 1)}
                                                        className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-xs flex items-center justify-center text-slate-700"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-slate-400 hover:text-red-600 text-xs font-bold p-1"
                                                title="Hapus"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Drawer Footer */}
                            {cartItems.length > 0 && (
                                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                                    <div className="flex justify-between items-center text-sm font-extrabold text-slate-900">
                                        <span>Subtotal</span>
                                        <span className="text-[#E52027] text-base">{formatRupiah(subtotal)}</span>
                                    </div>
                                    <Link
                                        href="/pembayaran"
                                        onClick={() => setIsCartOpen(false)}
                                        className="block w-full py-3 bg-[#E52027] hover:bg-red-700 text-white font-extrabold text-center text-sm rounded-xl shadow-md transition-all uppercase tracking-wider"
                                    >
                                        Lanjut ke Pembayaran
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals & Drawers */}
            <PreferensiModal
                isOpen={isPrefOpen}
                onClose={() => setIsPrefOpen(false)}
                currentCountry={country}
                currentLanguage={language}
                currentCurrency={currency}
                onSavePreferences={(c, l, curr) => {
                    setCountry(c);
                    setLanguage(l);
                    setCurrency(curr);
                }}
            />

            <PencarianModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            <SideMenuDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </div>
    );
}
