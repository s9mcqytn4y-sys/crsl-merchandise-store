import React, { useState } from "react";
import { QrCode, Download, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

interface InstruksiQrisProps {
    qrCodeUrl?: string;
    qrString?: string;
    nomorPesanan: string;
    instruksiBayar?: string[];
    isDevMode?: boolean;
}

const DEFAULT_INSTRUCTIONS = [
    "Buka aplikasi mobile banking atau e-wallet (BCA, Livin', GoPay, OVO, ShopeePay, Dana, dll).",
    "Pilih fitur Bayar / Pindai QRIS pada aplikasi Anda.",
    "Arahkan kamera ke kode QR di atas atau unggah tangkapan layar kode QR.",
    "Periksa kembali nama merchant CRSL dan nominal tagihan sebelum konfirmasi pembayaran.",
];

export default function InstruksiQris({
    qrCodeUrl,
    qrString,
    nomorPesanan,
    instruksiBayar,
    isDevMode = false,
}: InstruksiQrisProps) {
    if (!qrCodeUrl) return null;

    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const steps =
        instruksiBayar && instruksiBayar.length > 0
            ? instruksiBayar
            : DEFAULT_INSTRUCTIONS;

    const handleCopyQrString = async () => {
        if (!qrString) {
            toast.error("Kode QR String tidak tersedia");
            return;
        }
        try {
            await navigator.clipboard.writeText(qrString);
            setCopied(true);
            toast.success("Kode QR string berhasil disalin");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin kode");
        }
    };

    const handleDownloadQr = async () => {
        try {
            setDownloading(true);
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `QRIS-${nomorPesanan}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Gambar QRIS berhasil diunduh");
        } catch {
            // Fallback jika CORS memblokir fetch blob langsung
            window.open(qrCodeUrl, "_blank", "noopener,noreferrer");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Kartu Display QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-center space-y-4">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <QrCode
                        className="w-4 h-4 text-slate-600"
                        aria-hidden="true"
                    />
                    <span>Pembayaran QRIS Nasional</span>
                </div>

                {/* QR Canvas Container */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <img
                        src={qrCodeUrl}
                        alt={`Kode QRIS Pesanan #${nomorPesanan}`}
                        className="w-52 h-52 object-contain mx-auto"
                        loading="eager"
                    />
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={handleDownloadQr}
                        disabled={downloading}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer select-none disabled:opacity-60"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                            {downloading ? "Mengunduh..." : "Simpan QR"}
                        </span>
                    </button>

                    {isDevMode && qrString && (
                        <button
                            type="button"
                            onClick={handleCopyQrString}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-200/80 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">
                                        Tersalin
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Salin Payload</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Sandbox Dev Note (Hanya tampil di mode dev/test) */}
                {isDevMode && qrString && (
                    <aside className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-left space-y-1">
                        <div className="text-[11px] font-semibold text-amber-900 flex items-center justify-between">
                            <span>Sandbox Simulator</span>
                            <a
                                href="https://simulator.sandbox.midtrans.com/v2/qris/payment"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 underline underline-offset-2"
                            >
                                <span>Buka</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-normal">
                            Gunakan opsi <strong>Salin Payload</strong> untuk
                            paste ke simulator Midtrans.
                        </p>
                    </aside>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
                    Dapat dipindai melalui aplikasi BCA, Livin', BRImo, GoPay,
                    ShopeePay, OVO, Dana, dan seluruh penyedia QRIS.
                </p>
            </div>

            {/* Petunjuk Langkah Berurutan */}
            <section
                className="space-y-3 pt-1"
                aria-label="Instruksi Pembayaran"
            >
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Langkah Pembayaran
                </h3>
                <ol className="space-y-2.5 text-xs text-slate-600">
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
