import { useState } from "react";
import { ChevronDown, FileText, Settings, HeartHandshake, PackageCheck } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SpecItem {
    id: number | string;
    kunci: string;
    nilai: string;
}

interface ProductSpecsAndCareProps {
    deskripsi: string;
    spesifikasi: SpecItem[];
    beratGram: number;
    className?: string;
}

export default function ProductSpecsAndCare({
    deskripsi,
    spesifikasi = [],
    beratGram,
    className,
}: ProductSpecsAndCareProps) {
    const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({
        desc: true,
        specs: true,
        care: false,
        shipping: false,
    });

    const toggleTab = (key: string) => {
        setOpenTabs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <section aria-label="Rincian Produk & Spesifikasi" className={cn("space-y-3", className)}>
            {/* 1. Deskripsi Produk */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-shadow duration-200">
                <button
                    type="button"
                    onClick={() => toggleTab("desc")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-expanded={openTabs.desc}
                >
                    <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-slate-800">
                            Deskripsi Produk
                        </span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            openTabs.desc && "rotate-180 text-primary"
                        )}
                    />
                </button>
                {openTabs.desc && (
                    <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        <p className="whitespace-pre-line">{deskripsi}</p>
                    </div>
                )}
            </div>

            {/* 2. Spesifikasi Teknis */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-shadow duration-200">
                <button
                    type="button"
                    onClick={() => toggleTab("specs")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-expanded={openTabs.specs}
                >
                    <div className="flex items-center gap-2.5">
                        <Settings className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-slate-800">
                            Spesifikasi & Material
                        </span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            openTabs.specs && "rotate-180 text-primary"
                        )}
                    />
                </button>
                {openTabs.specs && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <dt className="text-slate-500 font-medium">Bobot Produk</dt>
                                <dd className="text-slate-800 font-semibold">{beratGram} gram</dd>
                            </div>
                            {spesifikasi.map((spec) => (
                                <div
                                    key={spec.id}
                                    className="flex justify-between py-1.5 border-b border-slate-100"
                                >
                                    <dt className="text-slate-500 font-medium">{spec.kunci}</dt>
                                    <dd className="text-slate-800 font-semibold text-right max-w-[60%]">
                                        {spec.nilai}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>

            {/* 3. Petunjuk Perawatan (Care Instructions) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-shadow duration-200">
                <button
                    type="button"
                    onClick={() => toggleTab("care")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-expanded={openTabs.care}
                >
                    <div className="flex items-center gap-2.5">
                        <HeartHandshake className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-slate-800">
                            Petunjuk Perawatan
                        </span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            openTabs.care && "rotate-180 text-primary"
                        )}
                    />
                </button>
                {openTabs.care && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 space-y-1.5">
                        <p>• Cuci menggunakan air dingin atau suhu ruang (maksimal 30°C).</p>
                        <p>• Hindari penggunaan pemutih berbahan klorin yang keras.</p>
                        <p>• Jangan peras terlalu kuat agar struktur kanvas dan bordir tetap terjaga.</p>
                        <p>• Setrika dengan suhu rendah atau gunakan pelapis kain di atas motif grafis.</p>
                    </div>
                )}
            </div>

            {/* 4. Pengiriman & Kebijakan Garansi */}
            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-shadow duration-200">
                <button
                    type="button"
                    onClick={() => toggleTab("shipping")}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-expanded={openTabs.shipping}
                >
                    <div className="flex items-center gap-2.5">
                        <PackageCheck className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-slate-800">
                            Pengiriman & Kebijakan Retur
                        </span>
                    </div>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            openTabs.shipping && "rotate-180 text-primary"
                        )}
                    />
                </button>
                {openTabs.shipping && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 space-y-1.5">
                        <p>• Pesanan sebelum pukul 15.00 WIB dikirim pada hari yang sama.</p>
                        <p>• Pengiriman dikelola otomatis melalui partner Biteship terpercaya.</p>
                        <p>• Penukaran produk berlaku 7 hari sejak status paket dinyatakan tiba.</p>
                        <p>• Wajib menyertakan video unboxing utuh untuk klaim cacat produksi.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
