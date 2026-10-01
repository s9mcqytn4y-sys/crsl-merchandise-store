import { useState } from "react";
import {
    Copy,
    Check,
    Landmark,
    RefreshCw,
    ExternalLink,
    Smartphone,
    CreditCard,
    Info,
} from "lucide-react";
import { toast } from "sonner";

interface InstruksiMandiriBillProps {
    kodeBiller?: string;
    billKey?: string;
    instruksiBayar?: string[];
    isDevMode?: boolean;
    isRefreshing?: boolean;
    onRefreshBill?: () => void;
}

export default function InstruksiMandiriBill({
    kodeBiller = "70012",
    billKey,
    instruksiBayar = [],
    isDevMode = Boolean(import.meta.env.DEV),
    isRefreshing = false,
    onRefreshBill,
}: InstruksiMandiriBillProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"livin" | "atm">("livin");

    const handleCopy = async (
        val: string,
        fieldName: string,
        label: string,
    ) => {
        if (!val || val === "-") return;
        try {
            await navigator.clipboard.writeText(val);
            setCopiedField(fieldName);
            toast.success(`${label} berhasil disalin!`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error("Gagal menyalin ke clipboard.");
        }
    };

    const hasBillKey = Boolean(billKey && billKey !== "-");

    // Petunjuk Tab Livin' by Mandiri
    const defaultLivinSteps = [
        "Buka aplikasi Livin' by Mandiri di ponsel Anda, lalu login ke akun Anda.",
        "Pada halaman utama, pilih menu Bayar lalu cari penyedia jasa Multi Payment.",
        `Pilih atau masukkan Kode Perusahaan / Biller Code: ${kodeBiller} (CRSL / Midtrans).`,
        `Masukkan Nomor Pelanggan / Bill Key: ${hasBillKey ? billKey : "(Menunggu tagihan terbit)"}.`,
        "Periksa kesesuaian rincian nama dan total tagihan, lalu masukkan PIN Livin' Anda untuk menyelesaikan transaksi.",
    ];

    // Petunjuk Tab ATM Mandiri
    const defaultAtmSteps = [
        "Masukkan kartu ATM Mandiri Anda ke mesin ATM, lalu ketik PIN Anda.",
        "Pilih menu Bayar/Beli > Pembayaran Lainnya > Multi Payment.",
        `Masukkan Kode Perusahaan: ${kodeBiller}, kemudian tekan Benar.`,
        `Ketik Nomor Pelanggan / Bill Key: ${hasBillKey ? billKey : "---"}, lalu tekan Benar.`,
        "Konfirmasi item tagihan yang muncul di layar ATM, lalu tekan tombol Angka 1 dan pilih YA untuk membayar.",
        "Simpan struk transaksi ATM sebagai bukti transfer yang sah.",
    ];

    const stepsToDisplay =
        instruksiBayar.length > 0
            ? instruksiBayar
            : activeTab === "livin"
              ? defaultLivinSteps
              : defaultAtmSteps;

    return (
        <div className="space-y-5">
            {/* Kartu Utama Data Tagihan Mandiri */}
            <div className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
                {/* Header Sub-Metode */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/70 pb-3">
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                            <Landmark className="w-3.5 h-3.5" />
                        </span>
                        <span>Mandiri Bill Payment (E-Channel)</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] uppercase font-bold tracking-wide">
                        Verifikasi Otomatis
                    </span>
                </div>

                {/* Grid Nomor Biller & Bill Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Biller Code */}
                    <div className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Kode Perusahaan (Biller)</span>
                            <button
                                type="button"
                                onClick={() =>
                                    handleCopy(
                                        kodeBiller,
                                        "biller",
                                        "Kode Perusahaan",
                                    )
                                }
                                className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold"
                                aria-label="Salin Kode Perusahaan"
                            >
                                {copiedField === "biller" ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">
                                            Tersalin
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Salin</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-lg font-mono font-bold text-slate-900 select-all tracking-wider">
                            {kodeBiller}
                        </div>
                    </div>

                    {/* Bill Key (Nomor Tagihan) */}
                    <div className="p-4 bg-white border border-slate-200/90 rounded-xl space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>Nomor Tagihan (Bill Key)</span>
                            {hasBillKey && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopy(
                                            billKey!,
                                            "billKey",
                                            "Nomor Tagihan",
                                        )
                                    }
                                    className="text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold"
                                    aria-label="Salin Nomor Tagihan"
                                >
                                    {copiedField === "billKey" ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-emerald-700">
                                                Tersalin
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Salin</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {hasBillKey ? (
                            <div className="text-lg font-mono font-bold text-slate-900 select-all tracking-wider break-all sm:break-normal">
                                {billKey}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1.5 animate-pulse">
                                    <Info className="w-3.5 h-3.5 shrink-0" />
                                    <span>Menunggu penerbitan tagihan...</span>
                                </span>
                                {onRefreshBill && (
                                    <button
                                        type="button"
                                        onClick={onRefreshBill}
                                        disabled={isRefreshing}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold text-primary hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        <RefreshCw
                                            className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                                        />
                                        <span>Segarkan</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Banner Developer Simulator (Hanya Muncul saat isDevMode = true) */}
                {isDevMode && (
                    <div className="w-full bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-left space-y-1">
                        <div className="text-[11px] font-bold text-blue-950 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                <span>
                                    Midtrans Mandiri Simulator (Dev Mode)
                                </span>
                            </span>
                            <a
                                href="https://simulator.sandbox.midtrans.com/mandiri/bill/index"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 font-bold hover:underline"
                            >
                                <span>Buka Simulator</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                            Masukkan Kode Perusahaan (
                            <strong>{kodeBiller}</strong>) dan Bill Key (
                            <strong>{billKey || "---"}</strong>) pada simulator
                            sandbox untuk simulasi pembayaran lunas instan.
                        </p>
                    </div>
                )}
            </div>

            {/* Tab Pemilihan Kanal Petunjuk Pembayaran */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Petunjuk Pembayaran Mandiri:
                    </h3>

                    {/* Navigasi Tab */}
                    {instruksiBayar.length === 0 && (
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs">
                            <button
                                type="button"
                                onClick={() => setActiveTab("livin")}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    activeTab === "livin"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Livin' by Mandiri</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("atm")}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    activeTab === "atm"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>ATM Mandiri</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Daftar Langkah Berurut */}
                <ol className="space-y-2.5 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                    {stepsToDisplay.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                                {idx + 1}
                            </span>
                            <span className="leading-relaxed pt-0.5">
                                {step}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
