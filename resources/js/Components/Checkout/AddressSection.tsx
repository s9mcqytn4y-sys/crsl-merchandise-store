import React from "react";
import { AddressItem } from "./AddressSelectModal";
import { AlertCircle, Gift } from "lucide-react";
import ShippingAreaSelector, { AreaOption } from "../ShippingAreaSelector";
import DropshipSection from "./DropshipSection";

interface AddressSectionProps {
    user: { id: number; name: string; email: string; telepon?: string } | null;
    selectedAddress: AddressItem | null;
    onOpenSelectModal: () => void;
    onOpenAuthModal: () => void;
    formData: {
        nama_penerima: string;
        email: string;
        telepon: string;
        alamat_lengkap: string;
        kode_pos: string;
        area_id: string;
        is_dropship: boolean;
        dropship_pengirim: string;
        dropship_telepon: string;
    };
    onFieldChange: (field: string, value: any) => void;
    errors: Record<string, string>;
    selectedAreaText?: string;
    onAreaSelect: (area: AreaOption) => void;
}

export default function AddressSection({
    user,
    selectedAddress,
    onOpenSelectModal,
    onOpenAuthModal,
    formData,
    onFieldChange,
    errors,
    selectedAreaText,
    onAreaSelect,
}: AddressSectionProps) {
    const isLoggedInWithAddress = Boolean(user && selectedAddress);

    return (
        <section aria-labelledby="address-heading" className="space-y-4">
            <h2 id="address-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Alamat Pengiriman
            </h2>

            {/* Case A: User Logged in with selected address */}
            {isLoggedInWithAddress && selectedAddress ? (
                <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                                    {selectedAddress.nama_penerima}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-600 font-mono">
                                    {selectedAddress.telepon}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                                    {selectedAddress.format_lengkap || selectedAddress.alamat_lengkap}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onOpenSelectModal}
                                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#E52027] transition-colors shrink-0 underline underline-offset-4 cursor-pointer pt-0.5"
                            >
                                Ubah
                            </button>
                        </div>
                    </div>

                    {/* Modular Dropship Section */}
                    <DropshipSection
                        isDropship={formData.is_dropship}
                        onToggleDropship={(val) => onFieldChange("is_dropship", val)}
                        dropshipSender={formData.dropship_pengirim}
                        onSenderChange={(val) => onFieldChange("dropship_pengirim", val)}
                        dropshipPhone={formData.dropship_telepon}
                        onPhoneChange={(val) => onFieldChange("dropship_telepon", val)}
                        senderError={errors.dropship_pengirim}
                        phoneError={errors.dropship_telepon}
                    />
                </div>
            ) : (
                /* Case B: Guest / Not Logged In / No Address */
                <div className="space-y-4">
                    {/* Login Banner Promo */}
                    {!user && (
                        <div className="flex items-center justify-between p-3.5 bg-red-50/70 border border-red-100 rounded-xl">
                            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-red-800 font-medium">
                                <Gift className="w-4 h-4 text-red-600 shrink-0" />
                                <span>Exclusive rewards are waiting for you!</span>
                            </div>
                            <button
                                type="button"
                                onClick={onOpenAuthModal}
                                className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 underline underline-offset-2 shrink-0 cursor-pointer"
                            >
                                Sign in
                            </button>
                        </div>
                    )}

                    {/* Contact Information Form */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                            Contact Information
                        </h3>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Email Address (Untuk Konfirmasi Pesanan) *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => onFieldChange("email", e.target.value)}
                                placeholder="nama@email.com"
                                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-all ${
                                    errors.email
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-slate-800"
                                }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address Form */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                            Shipping Address
                        </h3>

                        {/* Nama Penerima */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Recipient Name *
                            </label>
                            <input
                                type="text"
                                value={formData.nama_penerima}
                                onChange={(e) => onFieldChange("nama_penerima", e.target.value)}
                                placeholder="Recipient Full Name"
                                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-all ${
                                    errors.nama_penerima
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-slate-800"
                                }`}
                            />
                            {errors.nama_penerima && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.nama_penerima}
                                </p>
                            )}
                        </div>

                        {/* Telepon Penerima */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Recipient Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={formData.telepon}
                                onChange={(e) => onFieldChange("telepon", e.target.value)}
                                placeholder="+62 812..."
                                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-all font-mono ${
                                    errors.telepon
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-slate-800"
                                }`}
                            />
                            {errors.telepon && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.telepon}
                                </p>
                            )}
                        </div>

                        {/* Country Static Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Country
                            </label>
                            <select
                                disabled
                                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-slate-50 text-slate-700 rounded-xl"
                            >
                                <option>Indonesia</option>
                            </select>
                        </div>

                        {/* Sub-district, District, City Selector (Single clean label, no double label!) */}
                        <div>
                            <ShippingAreaSelector
                                onSelectArea={onAreaSelect}
                                label="Cari Lokasi / Wilayah Pengiriman (Kecamatan / Kota / Kode Pos)"
                                error={errors.area_id}
                            />
                            {selectedAreaText && (
                                <p className="mt-2 text-xs text-slate-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                                    <span className="font-semibold">Lokasi Terpilih:</span> {selectedAreaText}
                                </p>
                            )}
                            {errors.area_id && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.area_id}
                                </p>
                            )}
                        </div>

                        {/* Detail Alamat Lengkap */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Address Details (Nama Jalan, No. Rumah, RT/RW, Patokan) *
                            </label>
                            <textarea
                                rows={3}
                                value={formData.alamat_lengkap}
                                onChange={(e) => onFieldChange("alamat_lengkap", e.target.value)}
                                placeholder="Contoh: Jl. Kaliurang Km 5 No. 12, RT 02/RW 04, Belakang Apotek"
                                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-all ${
                                    errors.alamat_lengkap
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-slate-800"
                                }`}
                            />
                            {errors.alamat_lengkap && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.alamat_lengkap}
                                </p>
                            )}
                        </div>

                        {/* Kode Pos */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Kode Pos *
                            </label>
                            <input
                                type="text"
                                maxLength={5}
                                value={formData.kode_pos}
                                onChange={(e) => onFieldChange("kode_pos", e.target.value)}
                                placeholder="55281"
                                className={`w-32 px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none transition-all font-mono ${
                                    errors.kode_pos
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-slate-800"
                                }`}
                            />
                            {errors.kode_pos && (
                                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.kode_pos}
                                </p>
                            )}
                        </div>

                        {/* Modular Dropship Section for Guest Form */}
                        <DropshipSection
                            isDropship={formData.is_dropship}
                            onToggleDropship={(val) => onFieldChange("is_dropship", val)}
                            dropshipSender={formData.dropship_pengirim}
                            onSenderChange={(val) => onFieldChange("dropship_pengirim", val)}
                            dropshipPhone={formData.dropship_telepon}
                            onPhoneChange={(val) => onFieldChange("dropship_telepon", val)}
                            senderError={errors.dropship_pengirim}
                            phoneError={errors.dropship_telepon}
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
