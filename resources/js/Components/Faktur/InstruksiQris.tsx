import { useState } from "react";
import {
    QrCode,
    Download,
    Copy,
    ExternalLink,
    Check,
    RefreshCw,
    ShieldCheck,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface InstruksiQrisProps {
    qrCodeUrl?: string;
    qrString?: string;
    nomorPesanan: string;
    instruksiBayar?: string[];
    isDevMode?: boolean;
    onRefreshQris?: () => void;
}

const DEFAULT_INSTRUCTIONS = [
    "Buka aplikasi mobile banking atau e-wallet pilihan Anda (BCA Mobile, Livin' by Mandiri, BRImo, BNI, GoPay, OVO, ShopeePay, Dana, dll).",
    "Pilih menu Bayar / Pindai (Scan) QRIS pada halaman utama aplikasi.",
    "Arahkan kamera ponsel ke kode QR di atas, atau pilih dari galeri jika Anda menyimpan gambar QR.",
    "Pastikan nama merchant tertera 'CRSL Official Store' dan total tagihan sesuai rincian faktur.",
    "Konfirmasi pembayaran dengan memasukkan PIN transaksi Anda dan simpan bukti transfer resmi.",
];

export default function InstruksiQris({
    qrCodeUrl,
    qrString,
    nomorPesanan,
    instruksiBayar,
    isDevMode = Boolean(import.meta.env.DEV),
    onRefreshQris,
}: InstruksiQrisProps) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Fallback generator QR jika qrCodeUrl dari gateway tertunda namun qrString sudah tersedia
    const effectiveQrImage =
        !imageError && qrCodeUrl
            ? qrCodeUrl
            : qrString
              ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`
              : null;

    const steps =
        instruksiBayar && instruksiBayar.length > 0
            ? instruksiBayar
            : DEFAULT_INSTRUCTIONS;

    // Amankan nama file dari karakter ilegal "/" pada sistem berkas Windows/macOS/Linux
    const cleanInvoiceNumber = (nomorPesanan || "INV").replace(/\//g, "-");

    const handleCopyQrString = async () => {
        if (!qrString) {
            toast.error("Kode teks QRIS belum tersedia.");
            return;
        }
        try {
            await navigator.clipboard.writeText(qrString);
            setCopied(true);
            toast.success("Teks QRIS berhasil disalin!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin kode teks.");
        }
    };

    const handleDownloadQr = async () => {
        if (!effectiveQrImage || downloading) return;
        setDownloading(true);

        try {
            const response = await fetch(effectiveQrImage, { mode: "cors" });
            if (!response.ok) throw new Error("Gagal mengambil berkas QR.");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `QRIS-${cleanInvoiceNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success("Gambar QRIS berhasil disimpan ke perangkat!");
        } catch {
            // Fallback jika diblokir oleh kebijakan CORS cross-origin
            const fallbackLink = document.createElement("a");
            fallbackLink.href = effectiveQrImage;
            fallbackLink.target = "_blank";
            fallbackLink.rel = "noopener noreferrer";
            fallbackLink.download = `QRIS-${cleanInvoiceNumber}.png`;
            document.body.appendChild(fallbackLink);
            fallbackLink.click();
            document.body.removeChild(fallbackLink);
            toast.info("Gambar dibuka di tab baru. Silakan simpan gambar.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Kartu Display QR Code */}
            <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-slate-50/80 border border-slate-200/90 rounded-2xl max-w-sm mx-auto text-center space-y-4 shadow-2xs">
                {/* Header Verifikasi Nasional */}
                <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 border-b border-slate-200/60 pb-3 w-full">
                    <QrCode
                        className="w-4 h-4 text-[#E52027]"
                        aria-hidden="true"
                    />
                    <span>QRIS Standar Pembayaran Nasional</span>
                </div>

                {/* QR Canvas / Image Container */}
                <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs min-h-[240px] flex items-center justify-center w-full max-w-[240px] relative overflow-hidden">
                    {effectiveQrImage ? (
                        <div className="relative group">
                            <img
                                src={effectiveQrImage}
                                alt={`Kode QRIS Pesanan #${nomorPesanan}`}
                                className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto select-none transition-transform group-hover:scale-[1.02]"
                                loading="eager"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute inset-0 border border-slate-100 rounded-xl pointer-events-none" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                            <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
                            <p className="text-xs font-semibold text-slate-500">
                                Sedang memuat kode QRIS...
                            </p>
                            {onRefreshQris && (
                                <button
                                    type="button"
                                    onClick={onRefreshQris}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#E52027] hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Muat Ulang</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Informasi Merchant & Logo Terpercaya */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Terverifikasi: CRSL Official Store</span>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                    {effectiveQrImage && (
                        <button
                            type="button"
                            onClick={handleDownloadQr}
                            disabled={downloading}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer select-none disabled:opacity-60 active:scale-95"
                            aria-label="Unduh gambar QRIS"
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            ) : (
                                <Download className="w-4 h-4 text-slate-500" />
                            )}
                            <span>
                                {downloading
                                    ? "Menyimpan..."
                                    : "Unduh Gambar QR"}
                            </span>
                        </button>
                    )}

                    {qrString && (
                        <button
                            type="button"
                            onClick={handleCopyQrString}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-200/80 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
                            title="Salin string payload QRIS untuk testing"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-700">
                                        Tersalin
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 text-slate-500" />
                                    <span>Salin Teks QRIS</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Simulator Helper di Mode Testing */}
                {isDevMode && qrString && (
                    <aside className="w-full bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-left space-y-1">
                        <div className="text-[11px] font-bold text-amber-950 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span>Midtrans QRIS Simulator (Dev Mode)</span>
                            </span>
                            <a
                                href="https://simulator.sandbox.midtrans.com/v2/qris/payment"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-bold underline"
                            >
                                <span>Buka Simulator</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                            Salin teks QRIS di atas lalu tempel pada form
                            simulator Midtrans untuk menyimulasikan transaksi
                            lunas seketika.
                        </p>
                    </aside>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs pt-1">
                    Mendukung seluruh m-Banking dan e-Wallet berlogo QRIS di
                    Indonesia. Transaksi diproses otomatis 24 jam.
                </p>
            </div>

            {/* Petunjuk Langkah Berurutan */}
            <section
                className="space-y-3 pt-1"
                aria-label="Instruksi Pembayaran QRIS"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Petunjuk Pembayaran QRIS:
                    </h3>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                    {steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 font-mono">
                                {idx + 1}
                            </span>
                            <span className="leading-relaxed pt-0.5">
                                {step}
                            </span>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}
