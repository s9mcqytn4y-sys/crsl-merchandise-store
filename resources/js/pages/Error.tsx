import { useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Home,
    ArrowLeft,
    MessageCircle,
    ShoppingBag,
    Search,
    AlertCircle,
} from "lucide-react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { cn } from "../lib/utils";

interface ErrorProps {
    status?: number;
    pesan?: string;
    className?: string;
}

const ERROR_CONFIG: Record<
    number,
    { title: string; description: string; emoji: string }
> = {
    404: {
        emoji: "🔍",
        title: "Halaman Tidak Ditemukan",
        description:
            "Halaman atau produk merchandise yang kamu cari mungkin telah dipindahkan, habis, atau URL salah ketik.",
    },
    500: {
        emoji: "⚡",
        title: "Kendala Server Internal",
        description:
            "Server kami sedang mengalami kendala sementara saat memproses data. Tim teknis CRSL sedang menanganinya.",
    },
    503: {
        emoji: "🔧",
        title: "Sedang dalam Pemeliharaan",
        description:
            "Sistem CRSL Store sedang dalam peningkatan performa terjadwal. Mohon kembali beberapa saat lagi.",
    },
    403: {
        emoji: "🚫",
        title: "Akses Dibatasi",
        description:
            "Kamu tidak memiliki izin untuk mengakses halaman atau direktori khusus ini.",
    },
    401: {
        emoji: "🔐",
        title: "Sesi Kedaluwarsa",
        description:
            "Sesi login akun kamu telah berakhir. Silakan masuk kembali untuk melanjutkan transaksi.",
    },
    429: {
        emoji: "⏱️",
        title: "Terlalu Banyak Permintaan",
        description:
            "Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa saat sebelum mencoba kembali.",
    },
};

export default function ErrorPage({
    status = 404,
    pesan,
    className,
}: ErrorProps) {
    const config = ERROR_CONFIG[status] ?? {
        emoji: "❌",
        title: "Terjadi Kendala",
        description:
            "Permintaan transaksi atau halaman tidak dapat diselesaikan saat ini.",
    };

    const title = config.title;
    const description = pesan || config.description;
    const isServerError = status >= 500;

    // Sanitasi nomor telepon CS agar bebas dari karakter non-numerik
    const cleanWaNumber = (SITUS_CONFIG.whatsappCS || "").replace(/\D/g, "");
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanWaNumber}&text=${encodeURIComponent(
        `Halo Tim Support CRSL, saya mengalami kendala ${status} (${title}) saat mengakses website.`,
    )}`;

    // Navigasi kembali yang aman dari loop history kosong
    const handleSafeBack = useCallback(() => {
        if (typeof window !== "undefined" && window.history.length > 2) {
            window.history.back();
        } else {
            router.visit("/");
        }
    }, []);

    return (
        <StorefrontLayout>
            <Head title={`${status} - ${title} | ${SITUS_CONFIG.namaToko}`} />

            <div
                className={cn(
                    "min-h-[78vh] flex items-center justify-center px-4 py-16 select-none",
                    className,
                )}
            >
                <div className="max-w-lg w-full">
                    {/* Kartu Status Galat WAI-ARIA Live Region */}
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden"
                    >
                        {/* Aksen Garis Atas */}
                        <div
                            className={cn(
                                "h-1.5 w-full",
                                isServerError ? "bg-amber-400" : "bg-primary",
                            )}
                        />

                        <div className="px-6 py-9 sm:px-10 text-center space-y-6">
                            {/* Visual & Kode Status */}
                            <div className="space-y-3">
                                <div className="text-5xl sm:text-6xl animate-bounce duration-1000">
                                    {config.emoji}
                                </div>
                                <div>
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase px-3 py-1 rounded-full border font-mono shadow-2xs",
                                            isServerError
                                                ? "text-amber-800 bg-amber-50 border-amber-200"
                                                : "text-primary bg-red-50 border-red-200/80",
                                        )}
                                    >
                                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                                        <span>Status {status}</span>
                                    </span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                    {title}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                                    {description}
                                </p>
                            </div>

                            {/* Garis Pembatas */}
                            <div className="border-t border-slate-100" />

                            {/* Tombol Aksi Utama */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Link
                                    href="/"
                                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer"
                                >
                                    <Home className="w-4 h-4 stroke-[2.2]" />
                                    <span>Ke Beranda</span>
                                </Link>

                                <Link
                                    href="/katalog"
                                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all active:scale-95 cursor-pointer"
                                >
                                    <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                    <span>Jelajahi Katalog</span>
                                </Link>
                            </div>

                            {status === 404 && (
                                <div>
                                    <Link
                                        href="/katalog"
                                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary font-semibold transition-colors"
                                    >
                                        <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                                        <span>
                                            Cari merchandise CRSL lainnya
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Bantuan WhatsApp CS */}
                            <div className="pt-2 border-t border-slate-100">
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-bold transition-colors cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
                                    <span>
                                        Butuh bantuan cepat? Hubungi CS WhatsApp
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Navigasi Riwayat Aman */}
                    <div className="mt-5 flex justify-center">
                        <button
                            type="button"
                            onClick={handleSafeBack}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Kembali ke halaman sebelumnya</span>
                        </button>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
