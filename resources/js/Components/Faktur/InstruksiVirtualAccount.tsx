import React, { useState } from "react";
import { Copy, Check, Building2, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { router } from "@inertiajs/react";

interface InstruksiVirtualAccountProps {
    metodeBayar?: string;
    nomorVa?: string;
    instruksiBayar?: string[];
    nomorPesanan?: string;
}

export default function InstruksiVirtualAccount({
    metodeBayar = "Virtual Account",
    nomorVa,
    instruksiBayar = [],
    nomorPesanan,
}: InstruksiVirtualAccountProps) {
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const handleCopy = async () => {
        if (!nomorVa) return;
        try {
            await navigator.clipboard.writeText(nomorVa);
            setIsCopied(true);
            toast.success("Nomor Virtual Account tersalin ke papan klip!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor VA.");
        }
    };

    const handleSyncVa = () => {
        if (isSyncing || !nomorPesanan) return;
        setIsSyncing(true);
        router.reload({
            only: ["pesanan"],
            onFinish: () => {
                setIsSyncing(false);
                toast.success("Data pembayaran telah diperbarui.");
            },
        });
    };

    const defaultInstructions = [
        "Buka aplikasi Mobile Banking atau kunjungi ATM bank terkait.",
        "Pilih menu Transfer > Virtual Account / Pembayaran Virtual Account.",
        `Masukkan Nomor Virtual Account: ${nomorVa || "-"}`,
        "Pastikan nama tagihan dan nominal transfer sesuai dengan rincian faktur.",
        "Selesaikan transaksi dan simpan struk atau bukti transfer Anda.",
    ];

    const rawInstructions =
        instruksiBayar && instruksiBayar.length > 0
            ? instruksiBayar
            : defaultInstructions;

    // Pastikan jika step berisi 'Nomor Virtual Account:', tampilkan nomor VA yang aktif
    const instructions = rawInstructions.map((step) => {
        if (
            nomorVa &&
            (step.trim().endsWith("Nomor Virtual Account:") ||
                step.trim().endsWith("Virtual Account :"))
        ) {
            return `${step.trim()} ${nomorVa}`;
        }
        return step;
    });

    const lowerMetode = (metodeBayar || "").toLowerCase();
    let simUrl = "https://simulator.sandbox.midtrans.com/bca/va/index";
    let bankNamaSingkat = "BCA";
    let displayedMetode = metodeBayar;

    // Deteksi cerdas: jika nomor VA berawalan 41400 (standar prefix Permata Midtrans)
    if (nomorVa?.startsWith("41400") || lowerMetode.includes("permata")) {
        simUrl = "https://simulator.sandbox.midtrans.com/permata/va/index";
        bankNamaSingkat = "Permata";
        displayedMetode = "Permata Virtual Account";
    } else if (lowerMetode.includes("bni")) {
        simUrl = "https://simulator.sandbox.midtrans.com/bni/va/index";
        bankNamaSingkat = "BNI";
    } else if (lowerMetode.includes("bri")) {
        simUrl = "https://simulator.sandbox.midtrans.com/bri/va/index";
        bankNamaSingkat = "BRI";
    } else if (lowerMetode.includes("cimb")) {
        simUrl = "https://simulator.sandbox.midtrans.com/cimb/va/index";
        bankNamaSingkat = "CIMB Niaga";
    }

    return (
        <div className="space-y-6">
            <div className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span>{displayedMetode}</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] tracking-wide uppercase font-black">
                        Otomatis Terverifikasi
                    </span>
                </div>

                {/* Nomor VA Display Box */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Nomor Virtual Account
                        </p>
                        {nomorVa ? (
                            <span className="text-xl sm:text-2xl font-mono font-black tracking-wider text-slate-900 select-all block">
                                {nomorVa}
                            </span>
                        ) : (
                            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm py-1">
                                <span>Menghubungkan nomor VA...</span>
                                <button
                                    type="button"
                                    onClick={handleSyncVa}
                                    disabled={isSyncing}
                                    className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                                    title="Segarkan nomor VA"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        )}
                    </div>

                    {nomorVa && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 min-h-10.5"
                            aria-label="Salin nomor VA"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-300">Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-slate-300" />
                                    <span>Salin Nomor VA</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Midtrans Sandbox Simulator Card */}
                {nomorVa && (
                    <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-left space-y-1.5">
                        <div className="text-xs font-bold text-sky-950 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                                Midtrans Sandbox Simulator ({bankNamaSingkat})
                            </span>
                            <a
                                href={simUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 hover:underline font-bold"
                            >
                                Buka Simulator <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[11px] text-sky-800 leading-relaxed">
                            Mode Pengujian: Salin nomor VA di atas, lalu buka simulator bank resmi Midtrans untuk memverifikasi simulasi pembayaran secara instan tanpa biaya riil.
                        </p>
                    </div>
                )}
            </div>

            {/* Petunjuk Langkah Demi Langkah */}
            <div className="space-y-3 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Petunjuk Pembayaran:
                </h3>
                <ol className="space-y-2.5">
                    {instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
