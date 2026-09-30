import React, { useState } from "react";
import {
    MessageCircle,
    Send,
    CheckCircle2,
    AlertCircle,
    MessageSquareShare,
} from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import Modal from "../Common/Modal";
import Button from "../Common/Button";

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    produkId: number | string;
    namaProduk: string;
    selectedVariantName?: string;
    productSlug?: string;
}

const CRSL_CS_WHATSAPP = "6281234567890"; // Nomor resmi CS CRSL

export default function InquiryModal({
    isOpen,
    onClose,
    produkId,
    namaProduk,
    selectedVariantName = "",
    productSlug = "",
}: InquiryModalProps) {
    const page = usePage();
    const authUser = (page.props as any)?.auth?.user;
    const [isSuccess, setIsSuccess] = useState(false);

    // Form Inertia terpadu dengan validasi otomatis
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            produk_id: produkId,
            nama_produk: namaProduk,
            varian: selectedVariantName || "Default",
            nama_pengirim: authUser?.nama || "",
            kontak: authUser?.email || authUser?.no_hp || "",
            pesan: "",
        });

    const handleClose = () => {
        if (processing) return;
        reset();
        clearErrors();
        setIsSuccess(false);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = data.pesan.trim();

        if (!trimmed) {
            toast.error("Silakan tulis pertanyaan Anda mengenai produk ini.");
            return;
        }

        post("/api/pesan-produk", {
            preserveScroll: true,
            onSuccess: () => {
                setIsSuccess(true);
                toast.success("Pertanyaan Anda berhasil dikirim ke tim CS!");
                setTimeout(() => {
                    handleClose();
                }, 2000);
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(
                    typeof firstError === "string"
                        ? firstError
                        : "Gagal mengirim pesan. Silakan hubungi CS via WhatsApp.",
                );
            },
        });
    };

    // Alihkan langsung ke WhatsApp resmi CRSL dengan pesan otomatis
    const handleChatWhatsApp = () => {
        const productUrl =
            typeof window !== "undefined" && productSlug
                ? `${window.location.origin}/produk/${productSlug}`
                : "";

        const textMessage = [
            `Halo CS CRSL, saya ingin bertanya tentang produk:`,
            `*${namaProduk}*`,
            selectedVariantName ? `Varian: ${selectedVariantName}` : "",
            productUrl ? `Link: ${productUrl}` : "",
            data.pesan.trim() ? `\nPertanyaan: ${data.pesan.trim()}` : "",
        ]
            .filter(Boolean)
            .join("\n");

        const waUrl = `https://wa.me/${CRSL_CS_WHATSAPP}?text=${encodeURIComponent(textMessage)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tanya Produk CRSL"
            description="Tim CS CRSL siap membantu menjawab detail stok, ukuran, dan bahan produk."
            maxWidth="md"
            closeOnOverlayClick={!processing}
        >
            {isSuccess ? (
                <div className="py-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                            Pesan Berhasil Terkirim!
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Pertanyaan Anda telah kami terima dan akan dibalas
                            melalui kontak yang terdaftar.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Ringkasan Produk yang Ditanyakan */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Produk Terpilih
                        </span>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {namaProduk}
                        </p>
                        {selectedVariantName && (
                            <p className="text-[11px] text-slate-600 font-medium">
                                Varian:{" "}
                                <span className="font-bold text-slate-800">
                                    {selectedVariantName}
                                </span>
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-3.5"
                        noValidate
                    >
                        {/* Kolom Nama & Kontak untuk Pengguna Tamu */}
                        {!authUser && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="inquiry-nama"
                                        className="block text-xs font-bold text-slate-700 mb-1"
                                    >
                                        Nama Anda{" "}
                                        <span className="text-[#E52027]">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="inquiry-nama"
                                        type="text"
                                        disabled={processing}
                                        value={data.nama_pengirim}
                                        onChange={(e) =>
                                            setData(
                                                "nama_pengirim",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Nama lengkap"
                                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 outline-none transition-all"
                                        required
                                    />
                                    {errors.nama_pengirim && (
                                        <p className="text-[10px] text-rose-600 font-semibold mt-1">
                                            {errors.nama_pengirim}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="inquiry-kontak"
                                        className="block text-xs font-bold text-slate-700 mb-1"
                                    >
                                        No. WhatsApp / Email{" "}
                                        <span className="text-[#E52027]">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        id="inquiry-kontak"
                                        type="text"
                                        disabled={processing}
                                        value={data.kontak}
                                        onChange={(e) =>
                                            setData("kontak", e.target.value)
                                        }
                                        placeholder="0812... / email"
                                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 outline-none transition-all"
                                        required
                                    />
                                    {errors.kontak && (
                                        <p className="text-[10px] text-rose-600 font-semibold mt-1">
                                            {errors.kontak}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Textarea Pertanyaan */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="inquiry-pesan"
                                className="block text-xs font-bold text-slate-700"
                            >
                                Pertanyaan Anda{" "}
                                <span className="text-[#E52027]">*</span>
                            </label>
                            <textarea
                                id="inquiry-pesan"
                                rows={4}
                                disabled={processing}
                                value={data.pesan}
                                onChange={(e) =>
                                    setData("pesan", e.target.value)
                                }
                                placeholder="Contoh: Apakah varian ini ready stock dan bisa dikirim hari ini? Apakah bahannya tahan air?"
                                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#E52027]/10 focus:border-[#E52027] outline-none transition-all resize-none disabled:opacity-60"
                                required
                            />
                            {errors.pesan && (
                                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{errors.pesan}</span>
                                </p>
                            )}
                        </div>

                        {/* Aksi Kirim Form & Tombol Batal */}
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={processing}
                                className="flex-1 py-2.5 text-xs font-bold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={processing}
                                disabled={processing || !data.pesan.trim()}
                                leftIcon={<Send className="w-3.5 h-3.5" />}
                                className="flex-1 py-2.5 text-xs font-bold"
                            >
                                Kirim Pesan
                            </Button>
                        </div>
                    </form>

                    {/* Pembatas Saluran Alternatif */}
                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                            <span className="bg-white px-2">
                                Atau chat langsung
                            </span>
                        </div>
                    </div>

                    {/* Tombol Opsi Cepat WhatsApp */}
                    <button
                        type="button"
                        onClick={handleChatWhatsApp}
                        className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    >
                        <MessageSquareShare className="w-4 h-4 text-emerald-600" />
                        <span>Tanya Langsung via WhatsApp CS</span>
                    </button>
                </div>
            )}
        </Modal>
    );
}
