import React, { useState } from "react";
import { QrCode, Download, CheckCircle2, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

interface InstruksiQrisProps {
    qrCodeUrl?: string;
    qrString?: string;
    nomorPesanan: string;
    instruksiBayar?: string[];
}

export default function InstruksiQris({
    qrCodeUrl,
    qrString,
    nomorPesanan,
    instruksiBayar = [],
}: InstruksiQrisProps) {
    if (!qrCodeUrl) return null;

    const [disalin, setDisalin] = useState(false);

    const salinQrString = () => {
        if (!qrString) {
            toast.error("Kode QR String tidak tersedia");
            return;
        }
        navigator.clipboard.writeText(qrString);
        setDisalin(true);
        toast.success("Kode QR String berhasil disalin ke clipboard!");
        setTimeout(() => setDisalin(false), 2500);
    };

    const defaultInstructions = [
        "Buka aplikasi e-wallet atau mobile banking pilihan Anda (GoPay, ShopeePay, BCA, Livin', OVO, Dana).",
        "Pilih menu Bayar / Scan QRIS.",
        "Arahkan kamera ke QR Code di atas atau upload tangkapan layar QR.",
        "Periksa nominal pembayaran dan selesaikan transaksi sebelum waktu kedaluwarsa.",
    ];

    const instructions =
        instruksiBayar.length > 0 ? instruksiBayar : defaultInstructions;

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 border border-slate-200/70 rounded-2xl max-w-sm mx-auto text-center space-y-3.5">
                <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-primary" />
                    Pindai QRIS Standar Nasional (NMID)
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <img
                        src={qrCodeUrl}
                        alt="Kode QRIS Midtrans"
                        className="w-52 h-52 object-contain mx-auto"
                        loading="eager"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <a
                        href={qrCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`QRIS-${nomorPesanan}.png`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Unduh Gambar QRIS
                    </a>

                    {qrString && (
                        <button
                            type="button"
                            onClick={salinQrString}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/15 border border-primary/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                            {disalin ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-primary" />
                            )}
                            {disalin ? "Tersalin!" : "Salin QR String"}
                        </button>
                    )}
                </div>

                {qrString && (
                    <div className="w-full bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-left space-y-1.5 mt-2">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center justify-between">
                            <span>Midtrans Simulator Test:</span>
                            <a
                                href="https://simulator.sandbox.midtrans.com/v2/qris/payment"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:underline"
                            >
                                Buka Simulator <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-snug">
                            Di simulator sandbox, gunakan tombol <strong>"Salin QR String"</strong> di atas lalu paste ke kolom input simulator (bukan URL gambar) untuk simulasi bayar.
                        </p>
                    </div>
                )}

                <p className="text-[11px] text-slate-500 leading-tight">
                    Kompatibel dengan GoPay, ShopeePay, OVO, Dana, LinkAja, BCA,
                    Livin' by Mandiri, BRImo, dan seluruh aplikasi QRIS.
                </p>
            </div>

            <div className="space-y-2.5 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tata Cara Pembayaran QRIS:
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
