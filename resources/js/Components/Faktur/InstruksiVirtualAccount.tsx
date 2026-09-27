import React, { useState } from "react";
import { Copy, Check, Building2, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface InstruksiVirtualAccountProps {
    metodeBayar?: string;
    nomorVa?: string;
    instruksiBayar?: string[];
    nomorPesanan?: string;
    isDevMode?: boolean;
    onRefreshVa?: () => Promise<void> | void;
}

interface BankMeta {
    nama: string;
    simUrl: string;
}

const BANK_CONFIG: Record<string, BankMeta> = {
    bca: {
        nama: "BCA Virtual Account",
        simUrl: "https://simulator.sandbox.midtrans.com/bca/va/index",
    },
    permata: {
        nama: "Permata Virtual Account",
        simUrl: "https://simulator.sandbox.midtrans.com/permata/va/index",
    },
    bni: {
        nama: "BNI Virtual Account",
        simUrl: "https://simulator.sandbox.midtrans.com/bni/va/index",
    },
    bri: {
        nama: "BRI Virtual Account",
        simUrl: "https://simulator.sandbox.midtrans.com/bri/va/index",
    },
    cimb: {
        nama: "CIMB Niaga Virtual Account",
        simUrl: "https://simulator.sandbox.midtrans.com/cimb/va/index",
    },
    mandiri: {
        nama: "Mandiri Bill Payment",
        simUrl: "https://simulator.sandbox.midtrans.com/openapi/mandiri/bill/index",
    },
};

export default function InstruksiVirtualAccount({
    metodeBayar = "Virtual Account",
    nomorVa,
    instruksiBayar,
    isDevMode = false,
    onRefreshVa,
}: InstruksiVirtualAccountProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleCopy = async () => {
        if (!nomorVa) return;
        try {
            await navigator.clipboard.writeText(nomorVa);
            setIsCopied(true);
            toast.success("Nomor Virtual Account berhasil disalin");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor VA");
        }
    };

    const handleSync = async () => {
        if (isSyncing || !onRefreshVa) return;
        setIsSyncing(true);
        try {
            await onRefreshVa();
            toast.success("Data pembayaran diperbarui");
        } catch {
            toast.error("Gagal memperbarui status VA");
        } finally {
            setIsSyncing(false);
        }
    };

    // Deteksi bank metadata
    const lowerMetode = (metodeBayar || "").toLowerCase();
    const matchedBankKey =
        Object.keys(BANK_CONFIG).find((k) => lowerMetode.includes(k)) ||
        (nomorVa?.startsWith("41400") ? "permata" : "bca");

    const bankInfo = BANK_CONFIG[matchedBankKey];
    const displayTitle = metodeBayar || bankInfo.nama;

    const defaultSteps = [
        "Buka aplikasi Mobile Banking atau kunjungi ATM bank terkait.",
        "Pilih menu Transfer atau Pembayaran > Virtual Account.",
        `Masukkan Nomor Virtual Account: ${nomorVa || "(Menunggu pembuatan VA)"}`,
        "Pastikan nama tagihan dan nominal transfer sesuai dengan rincian faktur.",
        "Selesaikan transaksi dan simpan bukti transfer Anda.",
    ];

    const steps =
        instruksiBayar && instruksiBayar.length > 0
            ? instruksiBayar
            : defaultSteps;

    return (
        <div className="space-y-6">
            {/* Box Utama Nomor VA */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                        <Building2
                            className="w-4 h-4 text-slate-600"
                            aria-hidden="true"
                        />
                        <span>{displayTitle}</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 text-[10px] uppercase font-medium">
                        Verifikasi Otomatis
                    </span>
                </div>

                {/* VA Number Container */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Nomor Virtual Account
                        </p>
                        {nomorVa ? (
                            <span className="text-xl sm:text-2xl font-mono font-semibold tracking-wider text-slate-900 select-all block">
                                {nomorVa}
                            </span>
                        ) : (
                            <div className="flex items-center gap-2 text-amber-700 text-xs py-1">
                                <span>Membuat nomor VA...</span>
                                {onRefreshVa && (
                                    <button
                                        type="button"
                                        onClick={handleSync}
                                        disabled={isSyncing}
                                        className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                        title="Segarkan nomor VA"
                                    >
                                        <RefreshCw
                                            className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                                        />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {nomorVa && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                                isCopied
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-900 hover:bg-slate-800 text-white border-transparent shadow-xs"
                            }`}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                                    <span>Salin Nomor VA</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Sandbox Dev Note (Hanya aktif jika isDevMode === true) */}
                {isDevMode && nomorVa && (
                    <aside className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-left space-y-1">
                        <div className="text-xs font-semibold text-sky-950 flex items-center justify-between">
                            <span>Midtrans Sandbox ({bankInfo.nama})</span>
                            <a
                                href={bankInfo.simUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 underline underline-offset-2"
                            >
                                <span>Buka Simulator</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[11px] text-sky-800 leading-relaxed">
                            Mode Sandbox: Salin nomor VA di atas lalu tempel
                            pada form simulator Midtrans untuk menyimulasikan
                            transaksi lunas.
                        </p>
                    </aside>
                )}
            </div>

            {/* Petunjuk Langkah Berurutan */}
            <section
                className="space-y-3 pt-1"
                aria-label="Instruksi Pembayaran"
            >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Petunjuk Pembayaran
                </h3>
                <ol className="space-y-2 text-xs text-slate-600">
                    {steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold shrink-0 mt-0.5 border border-slate-200">
                                {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
