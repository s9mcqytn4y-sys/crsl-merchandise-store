import React, { useState } from "react";
import { Copy, Check, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface InstruksiVirtualAccountProps {
    metodeBayar?: string;
    nomorVa?: string;
    instruksiBayar?: string[];
}

export default function InstruksiVirtualAccount({
    metodeBayar = "Virtual Account",
    nomorVa,
    instruksiBayar = [],
}: InstruksiVirtualAccountProps) {
    const [isCopied, setIsCopied] = useState<boolean>(false);

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

    const defaultInstructions = [
        "Buka aplikasi Mobile Banking atau kunjungi ATM bank terkait.",
        "Pilih menu Transfer > Virtual Account / Pembayaran Virtual Account.",
        `Masukkan Nomor Virtual Account: ${nomorVa || "-"}`,
        "Pastikan nama tagihan dan nominal sesuai jumlah yang tertera.",
        "Selesaikan transaksi dan simpan bukti transfer Anda.",
    ];

    const instructions =
        instruksiBayar.length > 0 ? instruksiBayar : defaultInstructions;

    return (
        <div className="space-y-6">
            <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-primary" />
                        {metodeBayar}
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase font-bold">
                        Otomatis Terverifikasi
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <span className="text-lg sm:text-xl font-mono font-black tracking-wider text-slate-900 select-all">
                        {nomorVa || "Nomor VA Tidak Tersedia"}
                    </span>
                    {nomorVa && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
                            aria-label="Salin nomor VA"
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {nomorVa && (
                    <div className="w-full bg-blue-50/70 border border-blue-200/60 rounded-xl p-2.5 text-left space-y-1">
                        <div className="text-[11px] font-bold text-blue-950 flex items-center justify-between">
                            <span>Midtrans Sandbox VA Simulator:</span>
                            {(() => {
                                const lower = metodeBayar.toLowerCase();
                                let simUrl = "https://simulator.sandbox.midtrans.com/bca/va/index";
                                if (lower.includes("bni")) simUrl = "https://simulator.sandbox.midtrans.com/bni/va/index";
                                else if (lower.includes("bri")) simUrl = "https://simulator.sandbox.midtrans.com/bri/va/index";
                                else if (lower.includes("permata")) simUrl = "https://simulator.sandbox.midtrans.com/permata/va/index";
                                else if (lower.includes("cimb")) simUrl = "https://simulator.sandbox.midtrans.com/cimb/va/index";
                                return (
                                    <a
                                        href={simUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:underline font-bold"
                                    >
                                        Buka Simulator Bank <span className="text-[9px]">↗</span>
                                    </a>
                                );
                            })()}
                        </div>
                        <p className="text-[10px] text-blue-800 leading-snug">
                            Salin Nomor VA di atas lalu masukkan ke simulator bank resmi Midtrans untuk simulasi bayar instan.
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Petunjuk Pembayaran Virtual Account:
                </h3>
                <ol className="space-y-2 text-xs text-slate-600">
                    {instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
