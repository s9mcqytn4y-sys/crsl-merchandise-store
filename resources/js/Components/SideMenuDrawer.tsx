import React from 'react';
import { Link } from '@inertiajs/react';
import { Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Search } from 'lucide-react';

interface SideMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const MENU_ITEMS = [
    { title: 'BTS Collection 👛', href: '/katalog?kategori=back-to-school-essentials', isHighlight: true },
    { title: 'All Products', href: '/katalog', isHighlight: false },
    { title: 'All Day Promo 🔥', href: '/katalog?kategori=discounts', isHighlight: true },
    { title: 'Backpacks', href: '/katalog?kategori=backpack-collection', isHighlight: false },
    { title: 'Slingbags', href: '/katalog?kategori=slingbag-collection', isHighlight: false },
    { title: 'Tumbler Collection', href: '/katalog?kategori=tumbler-collection', isHighlight: false },
    { title: 'Tops', href: '/katalog?kategori=tops-collection', isHighlight: false },
    { title: 'Bottoms', href: '/katalog?kategori=bottoms-collection', isHighlight: false },
    { title: 'Outerwears', href: '/katalog?kategori=outerwears-collection', isHighlight: false },
    { title: 'Footwears', href: '/katalog?kategori=footwear-collection', isHighlight: false },
    { title: 'Headwears', href: '/katalog?kategori=headwear-collection', isHighlight: false },
    { title: 'Wallet & Accessories', href: '/katalog?kategori=wallet-accessories', isHighlight: false },
    { title: "What's Poppin'", href: '/katalog?kategori=whats-poppin', isHighlight: false },
];

export default function SideMenuDrawer({ isOpen, onClose }: SideMenuDrawerProps) {
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
                        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-xs bg-white shadow-2xl flex flex-col">
                                    {/* Drawer Header */}
                                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-sm">
                                                CRSL
                                            </div>
                                            <span className="font-extrabold text-sm text-slate-900 tracking-wider">CRSL MENU</span>
                                        </div>
                                        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Menu List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-1 text-xs font-semibold">
                                        {MENU_ITEMS.map((item, idx) => (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                onClick={onClose}
                                                className={`block py-2.5 px-3 rounded-xl transition-all ${
                                                    item.isHighlight
                                                        ? 'text-[#E52027] font-extrabold hover:bg-red-50'
                                                        : 'text-slate-800 hover:bg-slate-100'
                                                }`}
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
                                        Animals as your Bestfriends! • CRSL v2
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
