import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, MessageCircle, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white pt-12 sm:pt-16 pb-24 border-t border-slate-900" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-slate-850">
                    {/* Brand Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-sm tracking-wider">
                                CRSL
                            </div>
                            <span className="text-xl font-black text-white tracking-widest font-heading">
                                CRSL STORE
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            Apparel & accessories brand asal Yogyakarta yang terinspirasi dari karakter 5 hewan sahabat unik. Animals as your bestfriends!
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="w-4 h-4 text-[#E52027] shrink-0" />
                            <span>Sleman, D.I. Yogyakarta, Indonesia</span>
                        </div>
                        <div className="pt-2 flex items-center gap-3">
                            <a
                                href="https://instagram.com/crsl.store"
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#E52027] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                                aria-label="Kunjungi Instagram Resmi CRSL"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                </svg>
                            </a>
                            <a
                                href="https://wa.me/6281222222775"
                                target="_blank"
                                rel="noreferrer"
                                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                                aria-label="Chat WhatsApp Customer Support"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Kategori Populer */}
                    <div>
                        <h4 className="font-extrabold text-white mb-4 text-xs sm:text-sm uppercase tracking-wider">
                            Kategori Populer
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            <li>
                                <Link href="/katalog?kategori=backpack-collection" className="hover:text-white transition-colors">
                                    Backpack Collection
                                </Link>
                            </li>
                            <li>
                                <Link href="/katalog?kategori=tumbler-collection" className="hover:text-[#E52027] transition-colors">
                                    Tumbler Series
                                </Link>
                            </li>
                            <li>
                                <Link href="/katalog?kategori=outerwears-collection" className="hover:text-white transition-colors">
                                    Outerwears & Hoodie
                                </Link>
                            </li>
                            <li>
                                <Link href="/katalog?kategori=wallet-accessories" className="hover:text-white transition-colors">
                                    Wallet & Accessories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Bantuan & Layanan */}
                    <div>
                        <h4 className="font-extrabold text-white mb-4 text-xs sm:text-sm uppercase tracking-wider">
                            Bantuan & Layanan
                        </h4>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            <li>
                                <Link href="/lacak" className="hover:text-white transition-colors">
                                    Lacak Pesanan
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://wa.me/6281222222775"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                                >
                                    <span>Chat CS WhatsApp</span>
                                    <ExternalLink className="w-3 h-3 opacity-70" />
                                </a>
                            </li>
                            <li>
                                <Link href="/akun" className="hover:text-white transition-colors">
                                    Akun & Wishlist
                                </Link>
                            </li>
                            <li>
                                <Link href="/katalog" className="hover:text-white transition-colors">
                                    Semua Produk
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Pembayaran & Keaslian */}
                    <div>
                        <h4 className="font-extrabold text-white mb-4 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#E52027]" />
                            <span>Pembayaran Aman</span>
                        </h4>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Mendukung QRIS, Virtual Account BCA, Mandiri, BNI, BRI, serta E-Wallet resmi via Midtrans.
                        </p>
                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs font-bold text-amber-400 flex items-center gap-2.5">
                            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                            <span>100% Original CRSL Merchandise Guaranteed</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <p>
                        &copy; {new Date().getFullYear()} CRSL Official Store. Animals as your Bestfriends. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-slate-400">
                        <Link href="/katalog" className="hover:text-slate-200 transition-colors">Katalog</Link>
                        <span>•</span>
                        <Link href="/akun" className="hover:text-slate-200 transition-colors">Akun</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
