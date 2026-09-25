import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { formatRupiah } from '../../Utils/formatters';

export interface WishlistItem {
    id: number | string;
    nama: string;
    gambar?: string;
    harga: number;
    slug?: string;
}

interface WishlistTabProps {
    wishlists?: WishlistItem[];
}

export default function WishlistTab({ wishlists = [] }: WishlistTabProps) {
    const handleHapus = (produkId: number | string) => {
        router.post('/wishlist/toggle', { produk_id: produkId }, {
            preserveScroll: true,
        });
    };

    if (wishlists.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                    Wishlist Masih Kosong
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Simpan produk impianmu dengan menekan ikon hati pada katalog produk.
                </p>
                <Link
                    href="/katalog"
                    className="inline-flex items-center gap-1.5 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs mt-2"
                >
                    Jelajahi Produk
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Wishlist Saya
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {wishlists.length}
                </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlists.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    >
                        <div className="relative aspect-square bg-slate-100 overflow-hidden">
                            <img
                                src={item.gambar || '/assets/gambar/cassie-wallet.webp'}
                                alt={item.nama}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/gambar/cassie-wallet.webp';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => handleHapus(item.id)}
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs"
                                title="Hapus dari Wishlist"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug">
                                    {item.nama}
                                </h4>
                                <span className="font-black text-xs sm:text-sm text-[#E52027] block mt-1">
                                    {formatRupiah(item.harga)}
                                </span>
                            </div>

                            <Link
                                href={item.slug ? `/produk/${item.slug}` : '/katalog'}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-[#E52027] text-white text-[11px] font-bold py-2 rounded-xl transition-colors mt-2"
                            >
                                <span>Lihat Produk</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
