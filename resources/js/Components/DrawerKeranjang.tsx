import React from 'react';
import { Link } from '@inertiajs/react';
import { useKeranjangStore } from '../Stores/useKeranjangStore';
import { formatRupiah } from '../Utils/formatters';

interface DrawerKeranjangProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DrawerKeranjang({ isOpen, onClose }: DrawerKeranjangProps) {
    const items = useKeranjangStore((state) => state.items);
    const ubahJumlah = useKeranjangStore((state) => state.ubahJumlah);
    const hapusItem = useKeranjangStore((state) => state.hapusItem);
    const hitungTotal = useKeranjangStore((state) => state.hitungTotal);
    const hitungJumlahTotal = useKeranjangStore((state) => state.hitungJumlahTotal);

    if (!isOpen) return null;

    const totalHarga = hitungTotal();
    const totalItem = hitungJumlahTotal();
    const diskonHemat = 50000; // Standar hemat promo CRSL

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-heading"
        >
            <div
                className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                }}
            >
                {/* Header: Sesuai Screenshot 4 ("Cart" dengan tombol silang) */}
                <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 id="cart-drawer-heading" className="text-xl font-bold text-slate-900">
                        Cart
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Tutup Keranjang"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Item Keranjang */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl">
                                🛍️
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Keranjang Belanja Kosong</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                                    Yuk miliki merchandise karakter hewan favoritmu sekarang!
                                </p>
                            </div>
                            <Link
                                href="/katalog"
                                onClick={onClose}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                            >
                                Jelajahi Katalog
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="pb-6 border-b border-slate-100 last:border-b-0 space-y-3">
                                <div className="flex gap-4">
                                    {/* Thumbnail Produk */}
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                        <img
                                            src={item.gambar || '/assets/gambar/drinke-tumblr.webp'}
                                            alt={item.nama_produk}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Informasi Produk */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                                                {item.nama_produk}
                                            </h4>
                                            {item.warna && (
                                                <div className="text-[11px] font-semibold text-slate-500 uppercase mt-0.5">
                                                    {item.warna}
                                                </div>
                                            )}
                                        </div>

                                        {/* Promo Tag */}
                                        <div className="mt-1">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-slate-800 border border-dashed border-slate-300 rounded bg-slate-50">
                                                <span>🏷️</span>
                                                <span>Get Rp 50,000 off</span>
                                            </span>
                                        </div>

                                        {/* Baris Harga: Coret & Realistis */}
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-400 line-through">
                                                {formatRupiah(item.harga + 50000)}
                                            </span>
                                            <span className="text-sm font-extrabold text-slate-900">
                                                {formatRupiah(item.harga)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Urgency Badge: Sesuai Screenshot 4 */}
                                <div>
                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md border border-slate-200/70">
                                        Only 5 stocks left.
                                    </span>
                                </div>

                                {/* Actions: Remove Text & Red Stepper */}
                                <div className="flex items-center justify-between pt-1">
                                    <button
                                        type="button"
                                        onClick={() => hapusItem(item.id)}
                                        className="text-xs font-semibold text-slate-500 hover:text-red-600 underline transition-colors cursor-pointer"
                                    >
                                        Remove
                                    </button>

                                    <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-2 py-0.5">
                                        <button
                                            type="button"
                                            onClick={() => ubahJumlah(item.id, -1)}
                                            className="text-red-600 hover:text-red-700 font-bold text-sm px-1.5 cursor-pointer disabled:opacity-30"
                                            disabled={item.jumlah <= 1}
                                            aria-label="Kurangi kuantitas"
                                        >
                                            -
                                        </button>
                                        <span className="text-xs font-bold text-slate-900 min-w-4 text-center">
                                            {item.jumlah}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => ubahJumlah(item.id, 1)}
                                            className="text-red-600 hover:text-red-700 font-bold text-sm px-1.5 cursor-pointer"
                                            aria-label="Tambah kuantitas"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Drawer: Sesuai Screenshot 4 */}
                {items.length > 0 && (
                    <div className="p-6 bg-white border-t border-slate-100 space-y-4 shadow-lg">
                        {/* Ringkasan Total Price & Save */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-semibold text-slate-700">
                                    Total Price ({totalItem})
                                </span>
                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                    <span>🏷️</span>
                                    <span>Save {formatRupiah(diskonHemat)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-extrabold text-slate-900">
                                    {formatRupiah(totalHarga)}
                                </span>
                            </div>
                        </div>

                        {/* Loyalty Progress Card: Sesuai Screenshot 4 */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                <span>🎁</span>
                                <span>Spend Rp 200,000 more to reach New Freen</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-slate-500 h-full rounded-full w-2/5"></div>
                            </div>
                            <div className="text-right">
                                <Link
                                    href="/account"
                                    onClick={onClose}
                                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                                >
                                    <span>View Loyalty benefit</span>
                                    <span>&rsaquo;</span>
                                </Link>
                            </div>
                        </div>

                        {/* Yellow Checkout CTA Button: Sesuai Screenshot 4 (#eab308) */}
                        <div className="space-y-2">
                            <Link
                                href="/pembayaran"
                                onClick={onClose}
                                className="w-full py-3.5 bg-[#eab308] hover:bg-[#ca8a04] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center text-center transition-all cursor-pointer"
                            >
                                Checkout with Discount
                            </Link>

                            <p className="text-center text-[11px] text-slate-500">
                                Spend 200K to unlock loyalty rewards!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
