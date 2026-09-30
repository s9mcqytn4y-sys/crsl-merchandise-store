import { useState, Fragment } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { AlertCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { toastNotifikasi } from "../Utils/toastNotifikasi";
import { cn } from "../lib/utils";

interface ProfileAccountProps {
    user: {
        name?: string;
        email?: string;
    };
    className?: string;
}

export default function ProfileAccount({
    user,
    className,
}: ProfileAccountProps) {
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const isDeleteButtonEnabled = deleteConfirmationText.trim() === "DELETE";

    const handleHapusAkun = () => {
        if (!isDeleteButtonEnabled) {
            setDeleteError(
                "Ketikkan kata DELETE dengan huruf kapital untuk konfirmasi.",
            );
            return;
        }

        setIsDeleting(true);
        setDeleteError("");

        router.post(
            "/profile/account/hapus",
            { konfirmasi: deleteConfirmationText.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toastNotifikasi.sukses("Akun Anda berhasil dinonaktifkan.");
                    setIsDeleting(false);
                    setIsConfirmDeleteOpen(false);
                },
                onError: (errors: any) => {
                    const pesanError =
                        errors?.konfirmasi ||
                        errors?.error ||
                        "Gagal menonaktifkan akun. Pastikan tidak ada transaksi yang sedang berjalan.";
                    setDeleteError(pesanError);
                    setIsDeleting(false);
                },
                onFinish: () => setIsDeleting(false),
            },
        );
    };

    return (
        <ProfileLayout activeMenu="account">
            <Head title="Pengaturan Akun - CRSL Official Store" />

            <div className={cn("space-y-6 select-none", className)}>
                {/* Header Informasi Akun */}
                <div className="pb-4 border-b border-slate-100">
                    <span className="text-xs font-black text-[#E52027] uppercase tracking-wider">
                        Keamanan & Privasi
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                        Informasi Akun Pembeli
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Kelola status akun aktif dan kontrol kepemilikan data
                        pribadi Anda di CRSL Store.
                    </p>
                </div>

                {/* Seksi Zona Berbahaya (Hapus Akun) */}
                <div className="p-5 sm:p-6 rounded-3xl border border-rose-200/80 bg-rose-50/20 space-y-4 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                Hapus Akun Permanen
                            </h2>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                                Seluruh data riwayat transaksi, saldo Koin CRSL,
                                level member loyalty, serta daftar wishlist Anda
                                akan dihapus secara permanen dan tidak dapat
                                dipulihkan kembali.
                            </p>
                        </div>
                    </div>

                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteConfirmationText("");
                                setDeleteError("");
                                setIsConfirmDeleteOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-rose-300 hover:border-rose-400 bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                        >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                            <span>Hapus Akun Saya</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Akun Berstandar WAI-ARIA Headless UI */}
            <Transition show={isConfirmDeleteOpen} as={Fragment}>
                <Dialog
                    as="div"
                    id="modal-hapus-akun"
                    className="relative z-50 select-none"
                    onClose={() => !isDeleting && setIsConfirmDeleteOpen(false)}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95 -translate-y-2"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 -translate-y-2"
                            >
                                <DialogPanel className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-left transition-all space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-black text-slate-900 tracking-tight"
                                            >
                                                Konfirmasi Penghapusan Akun
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
                                                Tindakan ini bersifat permanen.
                                                Ketik kata konfirmasi di bawah
                                                ini untuk melanjutkan
                                                penghapusan akun{" "}
                                                <strong>{user?.email}</strong>.
                                            </DialogDescription>
                                        </div>
                                    </div>

                                    {/* Kolom Validasi Input Ketik DELETE */}
                                    <div className="space-y-1.5 pt-2">
                                        <label
                                            htmlFor="input-delete-confirmation"
                                            className="block text-xs font-bold text-slate-700"
                                        >
                                            Ketik{" "}
                                            <span className="font-mono text-[#E52027] font-bold">
                                                DELETE
                                            </span>{" "}
                                            untuk mengonfirmasi:
                                        </label>
                                        <input
                                            id="input-delete-confirmation"
                                            type="text"
                                            value={deleteConfirmationText}
                                            onChange={(e) => {
                                                setDeleteConfirmationText(
                                                    e.target.value,
                                                );
                                                if (deleteError)
                                                    setDeleteError("");
                                            }}
                                            placeholder="DELETE"
                                            autoFocus
                                            aria-invalid={Boolean(deleteError)}
                                            aria-describedby={
                                                deleteError
                                                    ? "delete-error-msg"
                                                    : undefined
                                            }
                                            className={cn(
                                                "w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none transition-all shadow-2xs placeholder:font-normal placeholder:text-slate-400",
                                                deleteError
                                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                    : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                                            )}
                                        />
                                        {deleteError && (
                                            <p
                                                id="delete-error-msg"
                                                role="alert"
                                                className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-0.5 animate-in fade-in"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{deleteError}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsConfirmDeleteOpen(false)
                                            }
                                            disabled={isDeleting}
                                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            Batal
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleHapusAkun}
                                            disabled={
                                                !isDeleteButtonEnabled ||
                                                isDeleting
                                            }
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                                                isDeleteButtonEnabled &&
                                                    !isDeleting
                                                    ? "bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 shadow-red-500/20"
                                                    : "bg-slate-300",
                                            )}
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>
                                                        Menghapus Akun...
                                                    </span>
                                                </>
                                            ) : (
                                                <span>Ya, Hapus Akun</span>
                                            )}
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </ProfileLayout>
    );
}
