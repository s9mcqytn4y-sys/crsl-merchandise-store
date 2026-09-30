import React, { useMemo } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    X,
    MapPin,
    Plus,
    Check,
    Phone,
    Mail,
    Building2,
    ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface DeliveryAddress {
    id: number | string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    alamat_lengkap: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
    kode_pos?: string;
    biteship_area_id?: string;
    is_primary?: boolean;
    catatan?: string;
}

interface ModalKelolaAlamatProps {
    isOpen?: boolean;
    onClose: () => void;
    addresses?: DeliveryAddress[];
    selectedAddressId?: number | string | null;
    onSelectAddress?: (address: DeliveryAddress) => void;
    onAddNewAddress?: () => void;
    className?: string;
}

export default function ModalKelolaAlamat({
    isOpen = false,
    onClose,
    addresses = [],
    selectedAddressId = null,
    onSelectAddress,
    onAddNewAddress,
    className,
}: ModalKelolaAlamatProps) {
    const isVisible = Boolean(isOpen);

    const sortedAddresses = useMemo(() => {
        if (!Array.isArray(addresses)) return [];
        return [...addresses].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
        });
    }, [addresses]);

    const handleSelect = (addr: DeliveryAddress) => {
        if (onSelectAddress) {
            onSelectAddress(addr);
            onClose();
        }
    };

    return (
        <Transition show={isVisible} as={React.Fragment}>
            <Dialog
                as="div"
                id="modal-kelola-alamat"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Viewport Kontainer Modal */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200/90 flex flex-col max-h-[calc(100dvh-3rem)]">
                                {/* Header Modal */}
                                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-black text-slate-900 tracking-tight"
                                            >
                                                Pilih Alamat Pengiriman
                                            </DialogTitle>
                                            <p className="text-[11px] text-slate-500">
                                                Gunakan alamat tersimpan untuk
                                                mempercepat checkout
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                                        aria-label="Tutup jendela daftar alamat"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body: Daftar Alamat */}
                                <div className="p-4 sm:p-5 space-y-3 overflow-y-auto no-scrollbar overscroll-contain flex-1">
                                    {sortedAddresses.length === 0 ? (
                                        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-3xl space-y-3 bg-slate-50/50">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                <Building2 className="w-6 h-6 stroke-[1.5]" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                                                    Belum Ada Alamat Tersimpan
                                                </h4>
                                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                    Alamat pengiriman Anda akan
                                                    otomatis tersimpan saat
                                                    menyelesaikan pesanan
                                                    pertama kali.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        sortedAddresses.map((addr) => {
                                            const isSelected =
                                                selectedAddressId === addr.id;

                                            return (
                                                <div
                                                    key={addr.id}
                                                    onClick={() =>
                                                        handleSelect(addr)
                                                    }
                                                    className={cn(
                                                        "group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer space-y-2 text-xs",
                                                        isSelected
                                                            ? "border-[#E52027] bg-red-50/20 ring-2 ring-[#E52027]/20 shadow-2xs"
                                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                                                    )}
                                                >
                                                    {/* Baris Atas: Nama Penerima, Badge Utama, & Telepon */}
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-2">
                                                            <strong className="font-black text-slate-900 text-sm">
                                                                {
                                                                    addr.nama_penerima
                                                                }
                                                            </strong>
                                                            {addr.is_primary && (
                                                                <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                    Utama
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-slate-600 font-mono font-bold flex items-center gap-1">
                                                                <Phone className="w-3 h-3 text-slate-400" />
                                                                {addr.telepon}
                                                            </span>

                                                            {isSelected && (
                                                                <div className="w-5 h-5 rounded-full bg-[#E52027] text-white flex items-center justify-center shadow-xs">
                                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Alamat Lengkap */}
                                                    <p className="leading-relaxed text-slate-600 text-xs">
                                                        {addr.alamat_lengkap}
                                                    </p>

                                                    {/* Rincian Administratif & Kode Pos */}
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
                                            );
                                        })
                                    )}
                                </div>

                                {/* Footer Modal: Tambah Alamat Baru & Tutup */}
                                <div className="p-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-between gap-3">
                                    {onAddNewAddress ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onAddNewAddress();
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E52027] hover:text-[#CC1C22] transition-colors cursor-pointer py-1.5 px-2 -ml-2 rounded-xl hover:bg-red-50"
                                        >
                                            <Plus className="w-4 h-4 stroke-[2.5]" />
                                            <span>Tambah Alamat Baru</span>
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                    >
                                        Tutup
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
