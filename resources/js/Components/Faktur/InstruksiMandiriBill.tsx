import React, { useState } from "react";
import { Copy, Check, Landmark, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface InstruksiMandiriBillProps {
    kodeBiller?: string;
    billKey?: string;
    instruksiBayar?: string[];
}

export default function InstruksiMandiriBill({
    kodeBiller = "70012",
    billKey,
    instruksiBayar = [],
}: InstruksiMandiriBillProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (val: string, fieldName: string, label: string) => {
        if (!val) return;
        try {
            await navigator.clipboard.writeText(val);
            setCopiedField(fieldName);
            toast.success(`${label} tersalin ke papan klip!`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error("Gagal menyalin teks.");
        }
    };

    const defaultInstructions = [
        "Buka aplikasi Livin' by Mandiri atau ATM Mandiri terdekat.",
        "Pilih menu Pembayaran / Bayar > Multi Payment.",
        `Masukkan Kode Perusahaan / Biller Code: ${kodeBiller}`,
        `Masukkan Nomor Pelanggan / Bill Key: ${billKey || "-"}`,
        "Pastikan data tagihan sesuai dan konfirmasi PIN untuk membayar.",
    ];

    const instructions =
        instruksiBayar.length > 0 ? instruksiBayar : defaultInstructions;

    return (
        <div className="space-y-6">
            <div className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-primary" />
                        Mandiri Bill Payment (E-Channel)
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] uppercase font-bold">
                        Otomatis Terverifikasi
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Biller Code */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Kode Perusahaan</span>
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(
                                        kodeBiller,
                                        "biller",
                                        "Kode Perusahaan",
                                    )
                                }
                                className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                                {copiedField === "biller" ? (
                                    <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-600">
                                            Salin
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        <span>Salin</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-base font-mono font-black text-slate-900">
                            {kodeBiller}
                        </div>
                    </div>

                    {/* Bill Key */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Nomor Tagihan (Bill Key)</span>
                            {billKey && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopy(
                                            billKey,
                                            "billKey",
                                            "Bill Key",
                                        )
                                    }
                                    className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                    {copiedField === "billKey" ? (
                                        <>
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            <span className="text-emerald-600">
                                                Salin
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" />
                                            <span>Salin</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="text-base font-mono font-black text-slate-900 truncate">
                            {billKey || "-"}
                        </div>
                    </div>
                </div>

                <div className="w-full bg-blue-50/70 border border-blue-200/60 rounded-xl p-2.5 text-left space-y-1">
                    <div className="text-[11px] font-bold text-blue-950 flex items-center justify-between">
                        <span>Midtrans Sandbox Mandiri Simulator:</span>
                        <a
                            href="https://simulator.sandbox.midtrans.com/mandiri/bill/index"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-700 hover:underline font-bold"
                        >
                            Buka Simulator Mandiri <span className="text-[9px]">↗</span>
                        </a>
                    </div>
                    <p className="text-[10px] text-blue-800 leading-snug">
                        Salin Kode Biller ({kodeBiller}) dan Bill Key ({billKey}) ke simulator Mandiri Bill untuk menguji pembayaran.
                    </p>
                </div>
            </div>

            <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Petunjuk Pembayaran Mandiri Bill:
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
