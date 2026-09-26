import React from "react";
import { MessageSquare, ChevronRight } from "lucide-react";

interface DeliveryMessageRowProps {
    message: string;
    onOpenModal: () => void;
}

export default function DeliveryMessageRow({
    message,
    onOpenModal,
}: DeliveryMessageRowProps) {
    return (
        <div
            onClick={onOpenModal}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer bg-slate-50/50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenModal();
                }
            }}
            aria-label="Tinggalkan catatan untuk pengiriman"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700 truncate">
                    {message ? `Catatan: "${message}"` : "Leave a message for delivery (Optional)"}
                </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
    );
}
