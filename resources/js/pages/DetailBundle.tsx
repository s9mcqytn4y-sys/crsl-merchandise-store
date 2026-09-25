import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import { useKeranjangStore } from '../Stores/useKeranjangStore';
import { formatRupiah } from '../Utils/formatters';
import { toast } from 'sonner';
import {
    CheckCircle2,
    ShieldCheck,
    Gift,
    Sparkles,
    ChevronRight,
    ShoppingBag,
    ArrowLeft,
} from 'lucide-react';

interface BundleVarian {
    id: number;
    nama: string;
    hex: string;
    sku: string;
}

interface BundleSubItem {
    id: number;
    nama: string;
    harga: number;
    gambar: string;
    varian: BundleVarian[];
}

interface BundleDetailData {
    id: number;
    judul: string;
    slug: string;
    harga_paket: number;
    harga_asli: number;
    diskon_persen: number;
    hemat: string;
    gambar_utama: string;
    galeri: string[];
    deskripsi: string;
    items: BundleSubItem[];
    freebies: string[];
}

interface DetailBundleProps {
    bundle: BundleDetailData;
    rekomendasi?: any[];
}

export default function DetailBundle({ bundle, rekomendasi = [] }: DetailBundleProps) {
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    const [activeImage, setActiveImage] = useState(bundle.gambar_utama || bundle.galeri[0]);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, BundleVarian>>(() => {
        const initial: Record<number, BundleVarian> = {};
        bundle.items?.forEach((item) => {
            if (item.varian && item.varian.length > 0) {
                initial[item.id] = item.varian[0];
            }
        });
        return initial;
    });

    const [jumlah, setJumlah] = useState(1);

    const handleSelectVariant = (itemId: number, varian: BundleVarian) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [itemId]: varian,
        }));
    };

    const handleAddToCart = () => {
        // Gabungkan SKU & nama varian bundle
        const varianNames = Object.values(selectedVariants).map((v) => v.nama).join(' + ');
        const compositeSku = Object.values(selectedVariants).map((v) => v.sku).join('-');

        tambahItem({
            id: `bundle-${bundle.id}-${compositeSku}`,
            produk_id: bundle.id,
            nama_produk: bundle.judul,
            warna: varianNames,
            ukuran: 'Bundle Set',
            harga: bundle.harga_paket,
            gambar: bundle.gambar_utama,
            jumlah: jumlah,
            sku: `BND-${bundle.id}-${compositeSku}`,
        });

        toast.success(`${bundle.judul} berhasil ditambahkan ke keranjang!`);
        bukaKeranjang();
    };

    return (
        <StorefrontLayout>
            <Head title={`${bundle.judul} - CRSL Official Store`} />

            <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-slate-900 transition-colors">Beranda</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <Link href="/katalog" className="hover:text-slate-900 transition-colors">Bundles</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900 line-clamp-1">{bundle.judul}</span>
                    </nav>

                    {/* Main Layout: 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Kolom Kiri: Galeri Foto */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="relative aspect-[4/3] sm:aspect-square bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden group">
                                <span className="absolute top-4 left-4 z-10 bg-[#E52027] text-white text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md tracking-wider">
                                    BUNDLE SPECIAL
                                </span>
                                <span className="absolute top-4 right-4 z-10 bg-amber-400 text-slate-950 text-xs font-black uppercase px-3 py-1.5 rounded-full shadow-md">
                                    {bundle.diskonPersen}% OFF
                                </span>

                                <img
                                    src={activeImage}
                                    alt={bundle.judul}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Thumbnail Switcher */}
                            {bundle.galeri && bundle.galeri.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {bundle.galeri.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveImage(imgUrl)}
                                            className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                                activeImage === imgUrl
                                                    ? 'border-[#E52027] ring-2 ring-red-100 scale-95'
                                                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Freebies Card */}
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/70 rounded-3xl p-6 space-y-3">
                                <div className="flex items-center gap-2.5 text-[#E52027] font-black text-sm">
                                    <Gift className="w-5 h-5" />
                                    <span>FREEBIES & BONUS SPESIAL (TERMASUK DALAM PAKET)</span>
                                </div>
                                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                                    {bundle.freebies?.map((bonus, i) => (
                                        <li key={i} className="flex items-center gap-2.5">
                                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                            <span>{bonus}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Kolom Kanan: Detail & Konfigurasi Pilihan Paket */}
                        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                            <div>
                                <span className="text-xs font-bold text-[#E52027] uppercase tracking-wider">
                                    Paket Back to School 2026
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 leading-snug font-heading">
                                    {bundle.judul}
                                </h1>

                                <div className="mt-4 flex items-baseline gap-3">
                                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                        {formatRupiah(bundle.harga_paket)}
                                    </span>
                                    <span className="text-sm sm:text-base font-semibold text-slate-400 line-through">
                                        {formatRupiah(bundle.harga_asli)}
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200">
                                        {bundle.hemat}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-500 mt-4 leading-relaxed">
                                    {bundle.deskripsi}
                                </p>
                            </div>

                            {/* Konfigurasi Pilihan Item 1 & Item 2 */}
                            <div className="space-y-5 pt-4 border-t border-slate-100">
                                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                                    Pilih Varian Item Paket:
                                </h4>

                                {bundle.items?.map((item, index) => {
                                    const currentVar = selectedVariants[item.id];

                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={item.gambar}
                                                        alt={item.nama}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                        Item {index + 1}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                                                        {item.nama}
                                                    </h5>
                                                    <span className="text-xs font-semibold text-[#E52027]">
                                                        Pilihan: {currentVar?.nama || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Swatch Varian */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {item.varian?.map((v) => {
                                                    const isSelected = currentVar?.id === v.id;
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            onClick={() => handleSelectVariant(item.id, v)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                                                isSelected
                                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                                                style={{ backgroundColor: v.hex }}
                                                            />
                                                            <span>{v.nama}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Quantity & Add to Cart Button */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Jumlah Paket
                                    </span>
                                    <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
                                            className="w-7 h-7 rounded-full bg-white text-slate-700 font-black text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 text-xs font-extrabold text-slate-900">
                                            {jumlah}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setJumlah((prev) => prev + 1)}
                                            className="w-7 h-7 rounded-full bg-white text-slate-700 font-black text-sm flex items-center justify-center hover:bg-slate-100 shadow-2xs"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    className="w-full py-4 bg-[#E52027] hover:bg-[#CC1C22] active:scale-98 text-white font-black text-sm rounded-full shadow-lg shadow-red-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                                >
                                    <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
                                    <span>Tambah Bundle ke Keranjang ({formatRupiah(bundle.harga_paket * jumlah)})</span>
                                </button>

                                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>100% Produk Original CRSL</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        <span>Garansi Retur 7 Hari</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
