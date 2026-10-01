import React, { useState, Fragment } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { X, Check, Plus, Trash2, Edit3, MapPin, Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { toastNotifikasi } from "../../Utils/toastNotifikasi";
import { cn } from "../../lib/utils";

export interface AddressItem {
    id: number | string;
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
    format_lengkap?: string;
    adalah_utama?: boolean;
}

interface AddressSelectModalProps {
    isOpen?: boolean;
    onClose: () => void;
    addresses?: AddressItem[];
    selectedAddressId?: number | string | null;
    onSelectAddress: (addr: AddressItem) => void;
    onOpenAddModal: () => void;
    onOpenEditModal: (addr: AddressItem) => void;
    className?: string;
}

export default function AddressSelectModal({
    isOpen = false,
    onClose,
    addresses = [],
    selectedAddressId = null,
    onSelectAddress,
    onOpenAddModal,
    onOpenEditModal,
    className,
}: AddressSelectModalProps) {
    const isVisible = Boolean(isOpen);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleHapusAlamat = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (
            !window.confirm(
                "Apakah Anda yakin ingin menghapus alamat pengiriman ini?",
            )
        ) {
            return;
        }

        setDeletingId(id);
        router.delete(`/profile/delivery/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toastNotifikasi.sukses("Alamat pengiriman berhasil dihapus.");
            },
            onError: () => {
                toastNotifikasi.error("Gagal menghapus alamat pengiriman.");
            },
            onFinish: () => {
                setDeletingId(null);
            },
        });
    };

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-pilih-alamat"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Layer */}
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

                {/* Kontainer Modal Tengah */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-[520px] transform overflow-hidden rounded-3xl bg-white p-5 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/90 flex flex-col max-h-[calc(100dvh-3rem)]">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
                                            >
                                                Pilih Alamat Pengiriman
                                            </DialogTitle>
                                            <p className="text-[11px] text-slate-500">
                                                Tentukan alamat tujuan
                                                pengiriman pesanan Anda
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                        aria-label="Tutup jendela daftar alamat"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* List Alamat Tersimpan */}
                                <div className="py-4 space-y-3 overflow-y-auto no-scrollbar overscroll-contain flex-1 pr-0.5">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                                            <p className="text-xs font-bold text-slate-700">
                                                Belum Ada Alamat Tersimpan
                                            </p>
                                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                Tambahkan alamat pengiriman baru
                                                untuk melanjutkan transaksi
                                                belanja Anda.
                                            </p>
                                        </div>
                                    ) : (
                                        addresses.map((addr) => {
                                            const isSelected =
                                                selectedAddressId === addr.id;
                                            const isDeleting =
                                                deletingId === addr.id;

                                            return (
                                                <div
                                                    key={addr.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-pressed={isSelected}
                                                    onClick={() => {
                                                        onSelectAddress(addr);
                                                        onClose();
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (
                                                            e.key === "Enter" ||
                                                            e.key === " "
                                                        ) {
                                                            e.preventDefault();
                                                            onSelectAddress(
                                                                addr,
                                                            );
                                                            onClose();
                                                        }
                                                    }}
                                                    className={cn(
                                                        "p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]",
                                                        isSelected
                                                            ? "border-[#E52027] bg-red-50/20 ring-2 ring-[#E52027]/20 shadow-2xs"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
                                                    )}
                                                >
                                                    {/* Baris Atas: Nama Penerima, Badge Label/Utama, & Check Indicator */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 pr-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-black text-sm text-slate-900">
                                                                    {
                                                                        addr.nama_penerima
                                                                    }
                                                                </span>

                                                                {addr.label && (
                                                                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-wider">
                                                                        {
                                                                            addr.label
                                                                        }
                                                                    </span>
                                                                )}

                                                                {addr.adalah_utama && (
                                                                    <span className="text-[10px] bg-red-50 text-[#E52027] font-black px-2 py-0.5 rounded-md border border-red-200 uppercase tracking-wider">
                                                                        Utama
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-slate-600 mt-1 font-mono font-bold">
                                                                {addr.telepon}
                                                                {addr.email
                                                                    ? ` • ${addr.email}`
                                                                    : ""}
                                                            </p>

                                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                                {
                                                                    addr.alamat_lengkap
                                                                }
                                                            </p>

                                                            {/* Rincian Administratif Biteship */}
                                                            {(addr.kecamatan ||
                                                                addr.kota ||
                                                                addr.provinsi) && (
                                                                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 flex-wrap pt-0.5">
                                                                    {addr.kecamatan && (
                                                                        <span>
                                                                            Kec.{" "}
                                                                            {
                                                                                addr.kecamatan
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {addr.kota && (
                                                                        <>
                                                                            <span>
                                                                                •
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    addr.kota
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {addr.provinsi && (
                                                                        <>
                                                                            <span>
                                                                                •
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    addr.provinsi
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {addr.kode_pos && (
                                                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                                                                            {
                                                                                addr.kode_pos
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Indikator Pilihan Centang Merah */}
                                                        {isSelected ? (
                                                            <div className="w-5 h-5 rounded-full bg-[#E52027] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                                <Check className="w-3 h-3 stroke-[3]" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0 mt-0.5" />
                                                        )}
                                                    </div>

                                                    {/* Tombol Aksi Hapus & Ubah */}
                                                    <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            onClick={(e) =>
                                                                handleHapusAlamat(
                                                                    e,
                                                                    addr.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-rose-200 cursor-pointer disabled:opacity-50"
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                            <span>Hapus</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onOpenEditModal(
                                                                    addr,
                                                                );
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                            <span>Ubah</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Tombol Tambah Alamat Baru */}
                                <div className="pt-2 shrink-0 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onOpenAddModal();
                                        }}
                                        className="w-full min-h-[46px] py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4 stroke-[2.5]" />
                                        <span>Tambah Alamat Baru</span>
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
