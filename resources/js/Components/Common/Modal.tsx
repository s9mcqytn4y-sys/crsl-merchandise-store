import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
    position?: 'center' | 'top-right' | 'top';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
    position = 'center',
}: ModalProps) {
    const maxWidths = {
        sm: 'max-w-xs',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    const positions = {
        center: 'items-center justify-center p-4',
        'top-right': 'items-start justify-center sm:justify-end p-4 sm:pt-16 sm:pr-20',
        top: 'items-start justify-center pt-14 px-4',
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className={`flex min-h-full text-center ${positions[position]}`}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <Dialog.Panel
                                className={`w-full ${maxWidths[maxWidth]} transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100`}
                            >
                                {title && (
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                        <Dialog.Title as="h3" className="text-sm font-extrabold text-slate-900">
                                            {title}
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
                                            aria-label="Tutup Modal"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
