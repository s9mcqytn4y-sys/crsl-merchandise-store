import React from 'react';
import { Award, Package, Heart, Trash2 } from 'lucide-react';
import { formatRupiah } from '../../../Utils/formatters';

interface ProfileCardProps {
    user: any;
    loyalitas: any;
    activeTab: 'orders' | 'wishlist';
    ordersCount: number;
    wishlistCount: number;
    onSelectTab: (tab: 'orders' | 'wishlist') => void;
    onOpenDeleteModal: () => void;
}

export default function ProfileCard({
    user,
    loyalitas,
    activeTab,
    ordersCount,
    wishlistCount,
    onSelectTab,
    onOpenDeleteModal,
}: ProfileCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#E52027] text-white flex items-center justify-center font-black text-2xl shadow-md">
                    {user.name?.[0] || user.nama?.[0] || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate">
                        {user.name || user.nama || 'CRSL Bestie'}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                        {user.email || 'bestie@crslstore.com'}
                    </p>
                    <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        🌟 {loyalitas.tier_nama || 'New Freen Member'}
                    </span>
                </div>
            </div>

            {/* Loyalty Stats Box */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl space-y-2 border border-slate-700">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-400" /> Saldo Poin CRSL:
                    </span>
                    <span className="font-extrabold text-amber-400 text-sm">
                        {loyalitas.poin || 250} Poin
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-700">
                    <span>Total Belanja:</span>
                    <span className="font-bold text-white">
                        {formatRupiah(loyalitas.total_belanja || 350000)}
                    </span>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
                <button
                    onClick={() => onSelectTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                        activeTab === 'orders'
                            ? 'bg-[#E52027] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Riwayat Pesanan
                    </span>
                    <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                        {ordersCount}
                    </span>
                </button>

                <button
                    onClick={() => onSelectTab('wishlist')}
                    className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between transition-all ${
                        activeTab === 'wishlist'
                            ? 'bg-[#E52027] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Wishlist Produk
                    </span>
                    <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                        {wishlistCount}
                    </span>
                </button>
            </div>

            {/* Delete Account Button */}
            <div className="pt-4 border-t border-slate-100">
                <button
                    onClick={onOpenDeleteModal}
                    className="w-full text-rose-600 hover:bg-rose-50 border border-rose-200 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                    <Trash2 className="w-4 h-4" /> Delete My Account
                </button>
            </div>
        </div>
    );
}
