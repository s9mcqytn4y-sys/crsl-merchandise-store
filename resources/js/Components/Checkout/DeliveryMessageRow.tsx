import { MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface DeliveryMessageRowProps {
    message?: string;
    onOpenModal: () => void;
    className?: string;
}

export default function DeliveryMessageRow({
    message = "",
    onOpenModal,
    className,
}: DeliveryMessageRowProps) {
    const hasMessage = Boolean(message && message.trim().length > 0);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpenModal}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenModal();
                }
            }}
            aria-label={
                hasMessage
                    ? `Ubah catatan pengiriman: ${message}`
                    : "Tambah catatan instruksi pengiriman"
            }
            className={cn(
                "p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-1",
                hasMessage
                    ? "border-red-200/80 bg-red-50/30 hover:bg-red-50/50 shadow-2xs"
                    : "border-slate-200/90 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300",
                className,
            )}
        >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                    className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        hasMessage
                            ? "bg-red-100/70 text-[#E52027]"
                            : "bg-white text-slate-400 border border-slate-200/80 group-hover:text-slate-600",
                    )}
                >
                    <MessageSquare className="w-4 h-4 stroke-[2]" />
                </div>

                <div className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">
                        Catatan Pengiriman
                    </span>
                    <p
                        className={cn(
                            "text-xs sm:text-sm font-semibold truncate mt-0.5",
                            hasMessage
                                ? "text-slate-900 font-bold"
                                : "text-slate-500 font-normal",
                        )}
                    >
                        {hasMessage
                            ? `"${message.trim()}"`
                            : "Tinggalkan instruksi pengantaran kurir (Opsional)"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors">
                {hasMessage && (
                    <span className="text-[11px] font-bold text-[#E52027] hidden sm:inline-block">
                        Ubah
                    </span>
                )}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </div>
    );
}
