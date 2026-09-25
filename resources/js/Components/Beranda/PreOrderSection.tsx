import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useKeranjangStore } from '../../Stores/useKeranjangStore';
import { formatRupiah } from '../../Utils/formatters';

interface VarianTumblr {
    id: number;
    nama: string;
    karakter: string;
    warnaHex: string;
    sku: string;
}

interface PreOrderSectionProps {
    slug?: string;
    nama?: string;
    harga?: number;
    kategori?: string;
    kategoriSlug?: string;
    gambar?: string;
    productId?: number;
}

const DAFTAR_VARIAN: VarianTumblr[] = [
    { id: 4, nama: 'CHILO PINK', karakter: 'Chilo the Cat', warnaHex: '#ec4899', sku: 'CRSL-TMB-DRN-32-CHILO' },
    { id: 5, nama: 'POPO BLUE', karakter: 'Popo the Panda', warnaHex: '#3b82f6', sku: 'CRSL-TMB-DRN-32-POPO' },
    { id: 6, nama: 'ODIN YELLOW', karakter: 'Odin the Dino', warnaHex: '#eab308', sku: 'CRSL-TMB-DRN-32-ODIN' },
    { id: 7, nama: 'CHOCO GREY', karakter: 'Choco the Bear', warnaHex: '#6b7280', sku: 'CRSL-TMB-DRN-32-CHOCO' },
    { id: 8, nama: 'PIGKO PEACH', karakter: 'Pigko the Pig', warnaHex: '#f97316', sku: 'CRSL-TMB-DRN-32-PIGKO' },
];

export default function PreOrderSection({
    slug = 'crsl-drinke-tumblr-series',
    nama = 'CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml',
    harga = 289000,
    kategori = 'Tumbler Collection',
    kategoriSlug = 'tumbler-collection',
    gambar = '/assets/gambar/drinke-tumblr.webp',
    productId = 7,
}: PreOrderSectionProps) {
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVarian, setSelectedVarian] = useState<VarianTumblr>(DAFTAR_VARIAN[3]); // Default CHOCO GREY
    const [jumlah, setJumlah] = useState(1);
    const productUrl = `/produk/${encodeURIComponent(slug)}`;

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleConfirmAddToCart = () => {
        tambahItem({
            id: `po-tumblr-900ml-${selectedVarian.sku}`,
            produk_id: 7,
            varian_id: selectedVarian.id,
            nama_produk: `CRSL Drinke Tumblr Series | Botol Tempat Minum Stainless 900ml`,
            warna: selectedVarian.nama,
            ukuran: '900ml / 32oz',
            harga: 289000,
            gambar: '/assets/gambar/drinke-tumblr.webp',
            jumlah: jumlah,
            sku: selectedVarian.sku,
        });
        setIsModalOpen(false);
    };

    return (
        <section
            id="pre-order-section"
            className="py-12 md:py-16 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-100"
            aria-label="Section Pre-Order CRSL"
        >
            <div className="container-crsl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                    {/* Kolom Kiri: Informasi & Copywriting Spesial */}
                    <div className="md:col-span-7 flex flex-col gap-4 text-left">
                        <div className="inline-flex items-center gap-2 self-start px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                            EDISI SPESIAL PRE-ORDER
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            PRE-ORDER <span className="text-red-600">NOW!</span>
                        </h2>

                        <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
                            Miliki koleksi Drinke Tumblr Series 900ml eksklusif dengan 5 karakter sahabat CRSL. Menjaga suhu minuman tetap dingin hingga 12 jam, dirancang tahan bocor dan siap menemani petualangan harianmu.
                        </p>

                        <ul className="flex flex-col gap-3 my-2" role="list">
                            <li className="flex items-center gap-3 text-sm text-slate-800 font-medium">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </span>
                                <span>Estimasi pengiriman 30 hari kerja</span>
                            </li>

                            <li className="flex items-center gap-3 text-sm text-slate-800 font-medium">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </span>
                                <span>Material food-grade stainless steel 304 (BPA Free)</span>
                            </li>

                            <li className="flex items-center gap-3 text-sm text-slate-800 font-medium">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </span>
                                <span>Termasuk bonus stiker pack karakter eksklusif</span>
                            </li>
                        </ul>

                        <div className="pt-2">
                            <a
                                href="/katalog"
                                className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition-colors group"
                            >
                                <span>Eksplor Koleksi Lainnya</span>
                                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                            </a>
                        </div>
                    </div>

                    {/* Kolom Kanan: Kartu Produk Pre-Order */}
                    <div className="md:col-span-5 flex justify-center">
                        <article className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <Link href={productUrl} className="block relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" aria-label={`Lihat detail ${nama}`}>
                                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-white/95 text-slate-900 text-xs font-black uppercase rounded shadow-sm tracking-wider">
                                    PRE ORDER
                                </span>

                                <img
                                    src={gambar}
                                    alt={nama}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    width={360}
                                    height={360}
                                />
                            </Link>

                            <div className="p-5 flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    {kategori}
                                </span>

                                <Link href={productUrl} className="hover:text-red-600 transition-colors">
                                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                                        {nama}
                                    </h3>
                                </Link>

                                <div className="flex items-center justify-between py-1">
                                    <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                                        {formatRupiah(harga)}
                                    </span>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                        PO 30 Hari
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOpenModal}
                                    className="w-full mt-2 h-11 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                                    aria-label="Pilih varian dan tambah ke keranjang"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="9" cy="21" r="1"/>
                                        <circle cx="20" cy="21" r="1"/>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                    </svg>
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </article>
                    </div>
                </div>
            </div>

            {/* Modal Pemilih Varian Cepat */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-varian-judul"
                >
                    <div
                        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsModalOpen(false);
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Tutup modal varian"
                        >
                            &times;
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="/assets/gambar/drinke-tumblr.webp"
                                alt="Thumbnail Tumblr"
                                className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50"
                            />
                            <div>
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                    Pilih Varian Karakter
                                </span>
                                <h4 id="modal-varian-judul" className="text-sm font-bold text-slate-900 line-clamp-1">
                                    CRSL Drinke Tumblr Series 900ml
                                </h4>
                                <span className="text-base font-extrabold text-slate-900">
                                    {formatRupiah(289000)}
                                </span>
                            </div>
                        </div>

                        {/* Pilihan 5 Varian */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Varian: <span className="font-bold text-slate-900">{selectedVarian.nama}</span>
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {DAFTAR_VARIAN.map((varian) => (
                                    <button
                                        key={varian.id}
                                        type="button"
                                        onClick={() => setSelectedVarian(varian)}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            selectedVarian.id === varian.id
                                                ? 'border-red-600 bg-red-50/50 shadow-xs'
                                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                                style={{ backgroundColor: varian.warnaHex }}
                                            />
                                            <div>
                                                <div className="text-xs font-bold text-slate-900">{varian.nama}</div>
                                                <div className="text-[11px] text-slate-500">{varian.karakter}</div>
                                            </div>
                                        </div>
                                        {selectedVarian.id === varian.id && (
                                            <span className="text-xs font-bold text-red-600">&check; Terpilih</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stepper Jumlah */}
                        <div className="flex items-center justify-between py-2 border-t border-slate-100 mb-4">
                            <span className="text-xs font-bold text-slate-700">Jumlah:</span>
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    disabled={jumlah <= 1}
                                    onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer font-bold"
                                    aria-label="Kurangi jumlah"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center text-xs font-bold text-slate-900">
                                    {jumlah}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setJumlah(jumlah + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer font-bold"
                                    aria-label="Tambah jumlah"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleConfirmAddToCart}
                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                        >
                            <span>Konfirmasi & Tambah ke Keranjang</span>
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
