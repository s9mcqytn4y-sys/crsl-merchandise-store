import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Home, HelpCircle } from "lucide-react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface ErrorProps {
    status?: number;
    pesan?: string;
}

export default function ErrorPage({ status = 404, pesan }: ErrorProps) {
    const titleMap: Record<number, string> = {
        404: "Halaman Tidak Ditemukan",
        500: "Kendala Server Internal",
        403: "Akses Dibatasi",
        401: "Sesi Tidak Terotorisasi",
    };

    const descriptionMap: Record<number, string> = {
        404: "Halaman atau tautan yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL salah ketik.",
        500: "Server kami sedang mengalami kendala sementara saat memproses permintaan ini. Tim teknis sedang menanganinya.",
        403: "Anda tidak memiliki izin akses untuk membuka halaman atau direktori ini.",
        401: "Sesi login Anda telah berakhir atau belum terautentikasi. Silakan masuk kembali.",
    };

    const title = titleMap[status] || "Terjadi Kendala";
    const description = pesan || descriptionMap[status] || "Permintaan tidak dapat diselesaikan saat ini.";

    return (
        <StorefrontLayout>
            <Head title={`${status} - ${title}`} />

            <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
                <div className="max-w-md w-full text-center space-y-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl">
                    <div className="w-20 h-20 rounded-3xl bg-red-50 text-primary mx-auto flex items-center justify-center font-black text-3xl shadow-inner">
                        {status}
                    </div>

                    <div className="space-y-2">
                        <span className="text-[11px] font-black tracking-wider uppercase text-primary bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            Status {status}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                            {description}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full transition-all duration-150 active:scale-95 shadow-md cursor-pointer"
                        >
                            <Home className="w-4 h-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <Link
                            href="/katalog"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full transition-all duration-150 active:scale-95 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Katalog Produk</span>
                        </Link>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <a
                            href={`https://api.whatsapp.com/send?phone=${SITUS_CONFIG.whatsappCS}&text=${encodeURIComponent(`Halo CS CRSL, saya mengalami kendala error ${status} pada website.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors"
                        >
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Butuh bantuan? Hubungi CS WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
