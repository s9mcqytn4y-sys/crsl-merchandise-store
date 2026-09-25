import React from "react";
import { Link } from "@inertiajs/react";
import { ArrowRight, Package } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { useCartModalStore } from "../../Stores/useCartModalStore";

export interface VarianDot {
    id: number;
    warna_hex?: string;
    warna?: string;
    nama_varian?: string;
}

export interface ProdukItem {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number;
    harga_diskon: number | null;
    gambar_utama: string | null;
    status_stok?: "in_stock" | "low_stock" | "out_of_stock" | string;
    terjual?: number;
    varian?: VarianDot[];
}

export function KartuProduk({ produk }: { produk: ProdukItem }) {
    const openCartModal = useCartModalStore((state) => state.openCartModal);
    const hargaAkhir = produk.harga_diskon ?? produk.harga_dasar;
    const adaDiskon =
        produk.harga_diskon !== null && produk.harga_diskon < produk.harga_dasar;
    const productUrl = `/produk/${encodeURIComponent(produk.slug)}`;

    const varianDots = produk.varian || [];

    return (
        <article className="group bg-white rounded-xl overflow-hidden border border-slate-100 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300">
            {/* Foto Produk Mendominasi ~70% Card */}
            <div>
                <Link
                    href={productUrl}
                    className="block relative aspect-square bg-[#F8F9FA] overflow-hidden cursor-pointer"
                    aria-label={`Detail ${produk.nama}`}
                >
                    {produk.gambar_utama ? (
                        <img
                            src={produk.gambar_utama}
                            alt={produk.nama}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                            loading="lazy"
                            width={320}
                            height={320}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-slate-300"
                            aria-hidden="true"
                        >
                            <Package className="w-10 h-10" />
                        </div>
                    )}
                </Link>

                <div className="p-3 flex flex-col gap-1.5">
                    {/* Dot Warna Varian Sesuai Screenshot 5 */}
                    {varianDots.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                            {varianDots.slice(0, 4).map((v, i) => (
                                <span
                                    key={v.id || i}
                                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                                    style={{
                                        backgroundColor:
                                            v.warna_hex ||
                                            (v.warna?.toLowerCase() === "pink"
                                                ? "#ec4899"
                                                : v.warna?.toLowerCase() === "brown"
                                                ? "#78350f"
                                                : v.warna?.toLowerCase() === "green"
                                                ? "#15803d"
                                                : v.warna?.toLowerCase() === "white"
                                                ? "#ffffff"
                                                : "#1f2937"),
                                    }}
                                    title={v.nama_varian || v.warna}
                                />
                            ))}
                        </div>
                    )}

                    {/* Judul Produk Sesuai Screenshot 5 */}
                    <Link
                        href={productUrl}
                        className="text-xs sm:text-[13px] font-normal text-slate-800 hover:text-[#E52027] line-clamp-2 leading-snug transition-colors"
                    >
                        {produk.nama}
                    </Link>

                    {/* Harga Coret & Harga Aktif */}
                    <div className="flex flex-col mt-0.5">
                        {adaDiskon && (
                            <span className="text-[11px] text-slate-400 line-through tabular-nums leading-none">
                                {formatRupiah(produk.harga_dasar)}
                            </span>
                        )}
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 tabular-nums mt-0.5">
                            {formatRupiah(hargaAkhir)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tombol Outline Pill Merah: Buy Sesuai Screenshot 5 */}
            <div className="p-3 pt-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openCartModal(produk);
                    }}
                    className="w-full py-2 border border-[#E52027] text-[#E52027] hover:bg-[#E52027] hover:text-white active:scale-[0.98] rounded-full text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer text-center"
                    aria-label={`Beli ${produk.nama}`}
                >
                    Buy
                </button>
            </div>
        </article>
    );
}

interface ProductGridSectionProps {
    id: string;
    labelSubjudul?: string;
    judul?: string;
    produk: ProdukItem[];
    linkHref?: string;
    linkLabel?: string;
    dark?: boolean;
}

export default function ProductGridSection({
    id,
    labelSubjudul,
    judul,
    produk,
    linkHref,
    linkLabel,
    dark = false,
}: ProductGridSectionProps) {
    if (!produk || produk.length === 0) return null;

    return (
        <section
            aria-labelledby={judul ? id : undefined}
            className={`py-8 sm:py-12 ${
                dark ? "bg-[#E52027] text-white" : "bg-white text-slate-900"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header (Optional jika divider banner sudah digunakan) */}
                {judul && (
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            {labelSubjudul && (
                                <p
                                    className={`text-[11px] font-black uppercase tracking-[0.25em] mb-1 ${
                                        dark ? "text-red-100" : "text-[#E52027]"
                                    }`}
                                >
                                    {labelSubjudul}
                                </p>
                            )}
                            <h2
                                id={id}
                                className={`text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight ${
                                    dark ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {judul}
                            </h2>
                        </div>
                        {linkHref && (
                            <Link
                                href={linkHref}
                                className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                    dark
                                        ? "text-white hover:text-red-100"
                                        : "text-[#E52027] hover:text-[#CC1C22]"
                                }`}
                                aria-label={linkLabel}
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Grid Sesuai Screenshot 5: 2 Kolom Mobile, 3 Kolom Tablet, 4 Kolom Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                    {produk.slice(0, 8).map((p) => (
                        <KartuProduk key={p.id} produk={p} />
                    ))}
                </div>

                {/* Mobile Button View All */}
                {linkHref && (
                    <div className="mt-8 text-center sm:hidden">
                        <Link
                            href={linkHref}
                            className={`inline-flex items-center gap-2 text-xs font-extrabold px-6 py-2.5 rounded-full shadow-xs transition-all ${
                                dark
                                    ? "bg-white text-[#E52027] hover:bg-red-50"
                                    : "bg-[#E52027] text-white hover:bg-[#CC1C22]"
                            }`}
                        >
                            <span>{linkLabel || "Lihat Semua"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
