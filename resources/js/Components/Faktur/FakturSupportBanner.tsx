import { ExternalLink, HelpCircle } from "lucide-react";

interface FakturSupportBannerProps {
    isSuccessSettled: boolean;
    isPendingPayment: boolean;
    nomorPesanan: string;
    cleanCsPhone: string;
    onOpenTerms: () => void;
}

export default function FakturSupportBanner({
    isSuccessSettled,
    isPendingPayment,
    nomorPesanan,
    cleanCsPhone,
    onOpenTerms,
}: FakturSupportBannerProps) {
    return (
        <aside
            aria-label="Bantuan Layanan Pelanggan"
            className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 shadow-2xs"
        >
            <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs">
                    <HelpCircle
                        className="w-5 h-5 text-primary stroke-2"
                        aria-hidden="true"
                    />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-slate-900 text-xs sm:text-sm">
                        {isSuccessSettled
                            ? "Ada Pertanyaan Mengenai Pesanan Anda?"
                            : "Mengalami Kendala Pembayaran?"}
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                        {isSuccessSettled
                            ? "Tim CS dan logistik resmi CRSL siap membantu pengecekan paket dan resi."
                            : "Tim Customer Service siap membantu konfirmasi status pembayaran Anda."}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0 shrink-0">
                {isPendingPayment && (
                    <button
                        type="button"
                        onClick={onOpenTerms}
                        className="text-slate-500 hover:text-slate-900 font-bold text-[11px] underline-offset-4 hover:underline rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                    >
                        S&amp;K Pembayaran
                    </button>
                )}

                <a
                    href={`https://wa.me/${cleanCsPhone}?text=${encodeURIComponent(
                        `Halo Tim CS CRSL, saya butuh bantuan terkait faktur pesanan #${nomorPesanan}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer active:scale-95"
                >
                    <span>Chat CS WhatsApp</span>
                    <ExternalLink
                        className="w-3.5 h-3.5 stroke-3"
                        aria-hidden="true"
                    />
                </a>
            </div>
        </aside>
    );
}
