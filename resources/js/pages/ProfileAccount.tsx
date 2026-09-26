import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { AlertCircle } from "lucide-react";
import { toastNotifikasi } from "../Utils/toastNotifikasi";

interface ProfileAccountProps {
    user: {
        name?: string;
        email?: string;
    };
}

export default function ProfileAccount({ user }: ProfileAccountProps) {
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const isDeleteButtonEnabled = deleteConfirmationText.trim() === "DELETE";

    const handleHapusAkun = () => {
        if (!isDeleteButtonEnabled) {
            setDeleteError("Ketikkan kata DELETE dengan tepat untuk konfirmasi penghapusan.");
            return;
        }
        setIsDeleting(true);
        setDeleteError("");
        router.post(
            "/profile/account/hapus",
            { konfirmasi: deleteConfirmationText.trim() },
            {
                onSuccess: () => {
                    toastNotifikasi.sukses("Akun berhasil dinonaktifkan.");
                    setIsDeleting(false);
                    setIsConfirmDeleteOpen(false);
                },
                onError: (errors: any) => {
                    const pesanError = errors?.konfirmasi || errors?.error || "Gagal menghapus akun karena masih terdapat transaksi aktif.";
                    setDeleteError(pesanError);
                    setIsDeleting(false);
                },
                onFinish: () => setIsDeleting(false),
            }
        );
    };

    return (
        <ProfileLayout activeMenu="account">
            <Head title="Account - CRSL Official Store" />

            <div className="space-y-6">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Buyer - Account Information
                </h1>

                {/* Section Delete My Account (Sesuai Screenshot 4) */}
                <div className="space-y-4 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            setDeleteConfirmationText("");
                            setIsConfirmDeleteOpen(true);
                        }}
                        className="px-5 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Delete My Account
                    </button>

                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                        You will lose all your data in our webstore and will not be able to recover your order history, voucher balance, loyalty tier, or purchase records.
                    </p>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Akun */}
            {isConfirmDeleteOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-delete-account-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
                >
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 space-y-5">
                        <div className="space-y-2">
                            <h3 id="modal-delete-account-title" className="text-xl font-bold text-slate-900">
                                Konfirmasi Hapus Akun
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus akun Anda secara permanen? Seluruh riwayat transaksi dan poin keanggotaan akan hilang dan tidak dapat dipulihkan.
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="block text-xs font-semibold text-slate-700">
                                Ketik <span className="font-mono text-red-600 font-bold">DELETE</span> untuk melanjutkan:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmationText}
                                onChange={(e) => {
                                    setDeleteConfirmationText(e.target.value);
                                    if (deleteError) setDeleteError("");
                                }}
                                placeholder="DELETE"
                                autoFocus
                                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-mono text-slate-800 focus:outline-none transition-all ${
                                    deleteError
                                        ? "border-red-500 bg-red-50/20 ring-1 ring-red-400"
                                        : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-400"
                                }`}
                            />
                            {deleteError && (
                                <p className="text-xs font-medium text-red-600 pl-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {deleteError}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsConfirmDeleteOpen(false)}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleHapusAkun}
                                disabled={!isDeleteButtonEnabled || isDeleting}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-full shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
