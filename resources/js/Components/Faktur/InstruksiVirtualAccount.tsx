import { useState } from "react";
import {
    Copy,
    Check,
    Building2,
    ExternalLink,
    RefreshCw,
    Smartphone,
    CreditCard,
    AlertCircle,
} from "lucide-react";
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
    kodeBank: string;
    simUrl: string;
    mBankingName: string;
}

const BANK_CONFIG: Record<string, BankMeta> = {
    bca: {
        nama: "BCA Virtual Account",
        kodeBank: "BCA",
        simUrl: "https://simulator.sandbox.midtrans.com/bca/va/index",
        mBankingName: "BCA Mobile (m-BCA)",
    },
    bni: {
        nama: "BNI Virtual Account",
        kodeBank: "BNI",
        simUrl: "https://simulator.sandbox.midtrans.com/bni/va/index",
        mBankingName: "BNI Mobile Banking",
    },
    bri: {
        nama: "BRI Virtual Account (BRIVA)",
        kodeBank: "BRI",
        simUrl: "https://simulator.sandbox.midtrans.com/bri/va/index",
        mBankingName: "BRImo",
    },
    permata: {
        nama: "Permata Virtual Account",
        kodeBank: "Permata",
        simUrl: "https://simulator.sandbox.midtrans.com/permata/va/index",
        mBankingName: "PermataMobile X",
    },
    cimb: {
        nama: "CIMB Niaga Virtual Account",
        kodeBank: "CIMB",
        simUrl: "https://simulator.sandbox.midtrans.com/cimb/va/index",
        mBankingName: "OCTO Mobile",
    },
};

export default function InstruksiVirtualAccount({
    metodeBayar = "Virtual Account",
    nomorVa,
    instruksiBayar,
    isDevMode = Boolean(import.meta.env.DEV),
    onRefreshVa,
}: InstruksiVirtualAccountProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<"mbanking" | "atm">("mbanking");

    const handleCopy = async () => {
        if (!nomorVa) return;
        try {
            await navigator.clipboard.writeText(nomorVa);
            setIsCopied(true);
            toast.success("Nomor Virtual Account berhasil disalin!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor Virtual Account.");
        }
    };

    const handleSync = async () => {
        if (isSyncing || !onRefreshVa) return;
        setIsSyncing(true);
        try {
            await onRefreshVa();
            toast.success("Nomor Virtual Account berhasil diperbarui!");
        } catch {
            toast.error("Gagal memperbarui nomor VA.");
        } finally {
            setIsSyncing(false);
        }
    };

    // Deteksi Bank Metadata secara dinamis
    const lowerMetode = (metodeBayar || "").toLowerCase();
    const matchedBankKey =
        Object.keys(BANK_CONFIG).find((k) => lowerMetode.includes(k)) ||
        (nomorVa?.startsWith("41400") ? "permata" : "bca");

    const bankInfo = BANK_CONFIG[matchedBankKey] || BANK_CONFIG.bca;
    const displayTitle = metodeBayar || bankInfo.nama;
    const hasWaybill = Boolean(nomorVa && nomorVa.trim() !== "");

    // Template Petunjuk Spesifik per Bank (Jika API tidak menyediakan instruksi kustom)
    const getBankSpecificSteps = (
        bankKey: string,
        channel: "mbanking" | "atm",
    ): string[] => {
        const vaText = hasWaybill ? nomorVa : "(Menunggu nomor VA)";

        if (bankKey === "bca") {
            return channel === "mbanking"
                ? [
                      "Buka aplikasi BCA Mobile di ponsel Anda, lalu pilih menu m-BCA dan masukkan Kode Akses.",
                      "Pilih menu m-Transfer > BCA Virtual Account.",
                      `Masukkan Nomor Virtual Account: ${vaText}, lalu pilih Send.`,
                      "Pastikan nama tagihan CRSL Store dan nominal transfer sesuai rincian faktur.",
                      "Masukkan PIN m-BCA Anda untuk memproses dan mengonfirmasi pembayaran.",
                  ]
                : [
                      "Masukkan kartu ATM BCA dan 6 digit PIN ATM Anda.",
                      "Pilih menu Transaksi Lainnya > Transfer > Ke Rekening BCA Virtual Account.",
                      `Masukkan Nomor Virtual Account: ${vaText}, lalu pilih Benar.`,
                      "Periksa rincian konfirmasi tagihan di layar ATM, lalu pilih Ya.",
                      "Simpan struk transaksi ATM sebagai bukti pembayaran yang sah.",
                  ];
        }

        if (bankKey === "bri") {
            return channel === "mbanking"
                ? [
                      "Buka aplikasi BRImo dan login dengan akun Anda.",
                      "Pilih menu Tagihan / Pembayaran > BRIVA (Virtual Account).",
                      `Masukkan Nomor BRIVA: ${vaText}, lalu pilih Lanjutkan.`,
                      "Konfirmasi rincian tagihan pesanan, lalu pilih Bayar.",
                      "Masukkan PIN BRImo Anda untuk menyelesaikan transaksi.",
                  ]
                : [
                      "Masukkan kartu ATM BRI dan PIN ATM Anda.",
                      "Pilih menu Transaksi Lain > Pembayaran > Lainnya > BRIVA.",
                      `Ketik Nomor BRIVA: ${vaText}, lalu pilih Benar.`,
                      "Periksa nominal dan nama tagihan, lalu pilih Ya untuk membayar.",
                      "Ambil dan simpan struk ATM sebagai bukti transaksi resmi.",
                  ];
        }

        if (bankKey === "bni") {
            return channel === "mbanking"
                ? [
                      "Buka aplikasi BNI Mobile Banking dan masukkan User ID serta MPIN.",
                      "Pilih menu Pembayaran > Virtual Account Billing.",
                      `Pilih Rekening Debet, lalu masukkan Nomor Virtual Account: ${vaText}.`,
                      "Periksa kecocokan tagihan pesanan di layar konfirmasi.",
                      "Ketik Password Transaksi BNI Anda untuk menyelesaikan pembayaran.",
                  ]
                : [
                      "Masukkan kartu ATM BNI dan PIN kartu Anda.",
                      "Pilih menu Menu Lainnya > Transfer > Virtual Account Billing.",
                      `Masukkan Nomor Virtual Account: ${vaText}, lalu pilih Benar.`,
                      "Konfirmasi data pembayaran yang tampil di layar, lalu pilih Ya.",
                      "Simpan struk pembayaran ATM Anda.",
                  ];
        }

        // Default Bank Lain / Permata / CIMB
        return channel === "mbanking"
            ? [
                  `Buka aplikasi Mobile Banking (${bankInfo.mBankingName}) di ponsel Anda.`,
                  "Pilih menu Transfer atau Pembayaran > Tagihan Virtual Account.",
                  `Ketik Nomor Virtual Account: ${vaText}.`,
                  "Pastikan nama merchant CRSL Official Store dan total tagihan cocok.",
                  "Konfirmasi transaksi dengan PIN Mobile Banking Anda.",
              ]
            : [
                  "Masukkan kartu ATM pada mesin ATM terdekat dan ketik PIN Anda.",
                  "Pilih menu Pembayaran / Transfer > Virtual Account.",
                  `Ketik Nomor Virtual Account: ${vaText}, lalu pilih Lanjutkan.`,
                  "Periksa kesesuaian rincian tagihan pesanan di layar ATM.",
                  "Pilih Ya untuk membayar dan simpan struk pembayaran.",
              ];
    };

    const stepsToDisplay =
        instruksiBayar && instruksiBayar.length > 0
            ? instruksiBayar
            : getBankSpecificSteps(matchedBankKey, activeTab);

    return (
        <div className="space-y-5">
            {/* Box Utama Nomor VA */}
            <div className="p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
                {/* Header Sub-Metode Bank */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/70 pb-3">
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-50 text-[#E52027] flex items-center justify-center shrink-0">
                            <Building2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        <span>{displayTitle}</span>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] uppercase font-bold tracking-wide">
                        Verifikasi Otomatis
                    </span>
                </div>

                {/* Kontainer Nomor Virtual Account */}
                <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Nomor Virtual Account
                        </p>
                        {hasWaybill ? (
                            <span className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-slate-900 select-all block break-all tabular-nums">
                                {nomorVa}
                            </span>
                        ) : (
                            <div className="flex items-center gap-2.5 text-amber-700 text-xs py-1">
                                <span className="flex items-center gap-1.5 font-semibold animate-pulse">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Sedang menerbitkan nomor VA...</span>
                                </span>
                                {onRefreshVa && (
                                    <button
                                        type="button"
                                        onClick={handleSync}
                                        disabled={isSyncing}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#E52027] hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                        title="Segarkan nomor VA"
                                    >
                                        <RefreshCw
                                            className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                                        />
                                        <span>Segarkan</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {hasWaybill && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            aria-label={`Salin nomor Virtual Account ${nomorVa}`}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer select-none shrink-0 ${
                                isCopied
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-200"
                                    : "bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.98] text-white"
                            }`}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">
                                        Tersalin
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Salin Nomor VA</span>
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Banner Sandbox Simulator (Hanya Muncul saat isDevMode = true) */}
                {isDevMode && hasWaybill && (
                    <aside className="bg-sky-50/80 border border-sky-200 rounded-xl p-3 text-left space-y-1">
                        <div className="text-xs font-bold text-sky-950 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                                <span>
                                    Midtrans {bankInfo.nama} Simulator (Dev
                                    Mode)
                                </span>
                            </span>
                            <a
                                href={bankInfo.simUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline"
                            >
                                <span>Buka Simulator</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[11px] text-sky-800 leading-relaxed">
                            Salin nomor VA di atas (<strong>{nomorVa}</strong>)
                            lalu tempelkan pada simulator Midtrans untuk
                            menyimulasikan transaksi lunas seketika.
                        </p>
                    </aside>
                )}
            </div>

            {/* Tab Pemilihan Kanal Petunjuk Pembayaran */}
            <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Petunjuk Pembayaran {bankInfo.kodeBank}:
                    </h3>

                    {/* Navigasi Tab Kanal (m-Banking vs ATM) */}
                    {(!instruksiBayar || instruksiBayar.length === 0) && (
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab("mbanking")}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    activeTab === "mbanking"
                                        ? "bg-white text-slate-900 shadow-2xs"
                                        : "text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>{bankInfo.mBankingName}</span>
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
                                <span>ATM {bankInfo.kodeBank}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Daftar Langkah Berurut */}
                <ol
                    className="space-y-2.5 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
                    aria-label={`Instruksi pembayaran ${bankInfo.nama}`}
                >
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
