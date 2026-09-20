import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface PencarianModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const POPULAR_TERMS = [
    'slingbag', 'topi', 'monie', 'mosko', 'ruby', 'wallet', 'yori', 'helm'
];

const RECENT_VIEWED = [
    {
        id: 1,
        nama: 'CRSL Moccapo Tees | T-Shirt Mocca Unisex',
        harga: 188100,
        hargaAsli: 209000,
        gambar: '/assets/gambar/cassie-wallet.webp',
        badge: 'Low Stock',
        badgeColor: 'bg-slate-200 text-slate-800',
        slug: 'crsl-moccapo-tees',
    },
    {
        id: 2,
        nama: 'CRSL Drinke Tumblr Series | Botol Stainless',
        harga: 289000,
        hargaAsli: 289000,
        gambar: '/assets/gambar/drinke-tumblr.webp',
        badge: 'Pre Order',
        badgeColor: 'bg-sky-600 text-white',
        slug: 'crsl-drinke-tumblr-series',
    },
    {
        id: 3,
        nama: 'CRSL Cassie Wallet | Dompet Canvas Plaid',
        harga: 179100,
        hargaAsli: 199000,
        gambar: '/assets/gambar/cassie-wallet.webp',
        badge: 'Best Seller',
        badgeColor: 'bg-[#E52027] text-white',
        slug: 'crsl-cassie-wallet',
    },
];

export default function PencarianModal({ isOpen, onClose }: PencarianModalProps) {
    const [query, setQuery] = useState('');

    if (!isOpen) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.get('/katalog', { cari: query.trim() });
            onClose();
        }
    };

    const handleTermClick = (term: string) => {
        router.get('/katalog', { cari: term });
        onClose();
    };

    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 border border-slate-100">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search our products..."
                        className="flex-1 bg-transparent border-none text-sm text-slate-900 focus:outline-none font-medium placeholder-slate-400"
                        autoFocus
                    />
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </form>

                {/* Popular Search Terms */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Popular Search Terms</h4>
                    <div className="flex flex-wrap gap-2">
                        {POPULAR_TERMS.map((term) => (
                            <button
                                key={term}
                                type="button"
                                onClick={() => handleTermClick(term)}
                                className="px-3 py-1 bg-slate-100 hover:bg-[#E52027] text-slate-700 hover:text-white rounded-full text-xs font-semibold transition-colors"
                            >
                                {term}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Viewed Products Carousel */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Viewed</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {RECENT_VIEWED.map((prod) => (
                            <div key={prod.id} className="w-40 shrink-0 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 relative group space-y-2">
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200">
                                    <img src={prod.gambar} alt={prod.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs ${prod.badgeColor}`}>
                                        {prod.badge}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-bold text-[11px] text-slate-900 line-clamp-2 leading-tight">{prod.nama}</h5>
                                    <div className="text-[11px] font-black text-[#E52027]">
                                        {formatRupiah(prod.harga)}
                                    </div>
                                </div>
                                <Link
                                    href={`/produk/${prod.slug}`}
                                    onClick={onClose}
                                    className="block text-center py-1.5 bg-slate-200 hover:bg-[#E52027] text-slate-800 hover:text-white text-[10px] font-bold rounded-lg transition-colors"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
