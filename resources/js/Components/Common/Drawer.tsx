import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    side?: 'left' | 'right';
    children: React.ReactNode;
}

export default function Drawer({
    isOpen,
    onClose,
    title,
    side = 'right',
    children,
}: DrawerProps) {
    const isRight = side === 'right';

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 overflow-hidden" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className={`pointer-events-none fixed inset-y-0 flex max-w-full ${
                                isRight ? 'right-0 pl-10' : 'left-0 pr-10'
                            }`}
                        >
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom={isRight ? 'translate-x-full' : '-translate-x-full'}
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo={isRight ? 'translate-x-full' : '-translate-x-full'}
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col">
                                    {title && (
                                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                            <h2 className="text-sm font-extrabold">{title}</h2>
                                            <button
                                                onClick={onClose}
                                                className="p-1 text-slate-400 hover:text-white rounded-full transition-colors"
                                                aria-label="Tutup Drawer"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-y-auto p-4">{children}</div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
