import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, CheckCircle2, Plus, Trash2, Edit3 } from "lucide-react";
import { router } from "@inertiajs/react";
import { toastNotifikasi } from "../../Utils/toastNotifikasi";

export interface AddressItem {
    id: number;
    label?: string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    area_id?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
    kode_pos?: string;
    alamat_lengkap: string;
    format_lengkap: string;
    adalah_utama: boolean;
}

interface AddressSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    addresses: AddressItem[];
    selectedAddressId: number | null;
    onSelectAddress: (addr: AddressItem) => void;
    onOpenAddModal: () => void;
    onOpenEditModal: (addr: AddressItem) => void;
}

export default function AddressSelectModal({
    isOpen,
    onClose,
    addresses,
    selectedAddressId,
    onSelectAddress,
    onOpenAddModal,
    onOpenEditModal,
}: AddressSelectModalProps) {
    const handleHapusAlamat = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm("Hapus alamat pengiriman ini?")) return;

        router.delete(`/profile/delivery/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toastNotifikasi.sukses("Alamat berhasil dihapus.");
            },
            onError: () => {
                toastNotifikasi.error("Gagal menghapus alamat.");
            },
        });
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-[500px] transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <Dialog.Title className="text-base sm:text-lg font-bold text-slate-900">
                                        Select Delivery Information
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* List Alamat Tersimpan */}
                                <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-xs">
                                            Belum ada alamat tersimpan. Silakan tambah alamat baru.
                                        </div>
                                    ) : (
                                        addresses.map((addr) => {
                                            const isSelected = selectedAddressId === addr.id;

                                            return (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => {
                                                        onSelectAddress(addr);
                                                        onClose();
                                                    }}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                                                        isSelected
                                                            ? "border-slate-800 bg-slate-50/70 shadow-xs"
                                                            : "border-slate-200 bg-white hover:border-slate-300"
                                                    }`}
                                                >
                                                    {/* Top row: Name & Selected indicator */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 pr-6">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-slate-900">
                                                                    {addr.nama_penerima}
                                                                </span>
                                                                {addr.adalah_utama && (
                                                                    <span className="text-[10px] bg-red-50 text-[#E52027] font-bold px-2 py-0.5 rounded-full border border-red-200">
                                                                        Utama
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-slate-600 mt-1 font-medium">
                                                                {addr.telepon}
                                                                {addr.email ? ` · ${addr.email}` : ""}
                                                            </p>

                                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                                {addr.format_lengkap || addr.alamat_lengkap}
                                                            </p>
                                                        </div>

                                                        {/* Checkmark bulat hitam persis Media 5 */}
                                                        {isSelected ? (
                                                            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                                                <CheckCircle2 className="w-4 h-4 fill-slate-900 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                                                        )}
                                                    </div>

                                                    {/* Action buttons: Remove & Edit persis Media 5 */}
                                                    <div className="flex items-center gap-2 mt-3.5 pt-2.5 border-t border-slate-100">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleHapusAlamat(e, addr.id)}
                                                            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                                                        >
                                                            Remove
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenEditModal(addr);
                                                            }}
                                                            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Tombol Merah Pill "+ Add New" persis Media 5 */}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onOpenAddModal();
                                        }}
                                        className="w-full py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-98 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add New</span>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
