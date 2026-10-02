import { Fragment } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { ShieldAlert, X } from "lucide-react";

interface ModalTermsPembayaranProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalTermsPembayaran({
    isOpen,
    onClose,
}: ModalTermsPembayaranProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                id="modal-terms-pembayaran"
                className="relative z-50 select-none"
                onClose={onClose}
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
                            <DialogPanel className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200/90 text-left transition-all space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0">
                                            <ShieldAlert className="w-4 h-4 stroke-2" />
                                        </div>
                                        <DialogTitle
                                            as="h3"
                                            className="font-black text-sm sm:text-base text-slate-900 tracking-tight"
                                        >
                                            Syarat &amp; Ketentuan Pembayaran
                                        </DialogTitle>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Tutup jendela syarat dan ketentuan"
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <X className="w-4 h-4 stroke-2" />
                                    </button>
                                </div>

                                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1 no-scrollbar font-medium">
                                    <p>
                                        1. Pesanan yang belum diselesaikan dicadangkan selama{" "}
                                        <strong className="text-slate-900 font-bold font-mono">
                                            24 jam
                                        </strong>{" "}
                                        sejak faktur terbit.
                                    </p>
                                    <p>
                                        2. Khusus metode{" "}
                                        <strong className="text-slate-900 font-bold">
                                            QRIS
                                        </strong>
                                        , masa aktif pindai adalah{" "}
                                        <strong className="text-slate-900 font-bold font-mono">
                                            15 menit
                                        </strong>
                                        . Anda dapat memperbarui kode jika waktu habis tanpa
                                        membatalkan order.
                                    </p>
                                    <p>
                                        3. Penggantian metode pembayaran dapat dilakukan kapan saja
                                        sebelum transaksi berstatus lunas.
                                    </p>
                                    <p>
                                        4. Jika pesanan dibatalkan, kuota voucher diskon dan Koin
                                        Loyalitas otomatis dikembalikan ke akun Anda.
                                    </p>
                                    <p>
                                        5. Pesanan yang sudah lunas langsung dialokasikan ke antrean
                                        gudang dan tidak dapat dibatalkan sepihak.
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-all text-xs shadow-xs hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                                    >
                                        Saya Mengerti
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
