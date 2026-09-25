import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { Trash2, Pencil, Plus, X, MapPin } from "lucide-react";
import { toast } from "sonner";

export interface AddressItem {
    id: number;
    label?: string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kode_pos?: string;
    alamat_lengkap: string;
    format_lengkap: string;
    adalah_utama: boolean;
}

interface ProfileDeliveryProps {
    user: {
        name?: string;
        email?: string;
    };
    addresses: AddressItem[];
}

export default function ProfileDelivery({ user, addresses = [] }: ProfileDeliveryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AddressItem | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Form fields state
    const [label, setLabel] = useState("Rumah");
    const [namaPenerima, setNamaPenerima] = useState(user?.name || "");
    const [telepon, setTelepon] = useState("");
    const [email, setEmail] = useState(user?.email || "");
    const [provinsi, setProvinsi] = useState("DKI Jakarta");
    const [kota, setKota] = useState("Jakarta Pusat");
    const [kecamatan, setKecamatan] = useState("Johar Baru");
    const [kodePos, setKodePos] = useState("10560");
    const [alamatLengkap, setAlamatLengkap] = useState("");
    const [adalahUtama, setAdalahUtama] = useState(false);
    const [sedangSimpan, setSedangSimpan] = useState(false);

    const bukaModalTambah = () => {
        setEditTarget(null);
        setLabel("Rumah");
        setNamaPenerima(user?.name || "");
        setTelepon("");
        setEmail(user?.email || "");
        setProvinsi("DKI Jakarta");
        setKota("Jakarta Pusat");
        setKecamatan("Johar Baru");
        setKodePos("10560");
        setAlamatLengkap("");
        setAdalahUtama(addresses.length === 0);
        setIsModalOpen(true);
    };

    const bukaModalEdit = (addr: AddressItem) => {
        setEditTarget(addr);
        setLabel(addr.label || "Rumah");
        setNamaPenerima(addr.nama_penerima);
        setTelepon(addr.telepon);
        setEmail(addr.email || user?.email || "");
        setProvinsi(addr.provinsi || "DKI Jakarta");
        setKota(addr.kota || "Jakarta Pusat");
        setKecamatan(addr.kecamatan || "Johar Baru");
        setKodePos(addr.kode_pos || "");
        setAlamatLengkap(addr.alamat_lengkap);
        setAdalahUtama(addr.adalah_utama);
        setIsModalOpen(true);
    };

    const handleHapusAlamat = (id: number) => {
        if (!confirm("Hapus alamat pengiriman ini?")) return;
        setIsDeleting(id);

        router.delete(`/profile/delivery/${id}`, {
            onSuccess: () => {
                toast.success("Alamat berhasil dihapus.");
                setIsDeleting(null);
            },
            onError: () => {
                toast.error("Gagal menghapus alamat.");
                setIsDeleting(null);
            },
            onFinish: () => setIsDeleting(null),
        });
    };

    const handleSimpanAlamat = (e: React.FormEvent) => {
        e.preventDefault();
        setSedangSimpan(true);

        const payload = {
            label,
            nama_penerima: namaPenerima,
            telepon,
            email,
            provinsi,
            kota,
            kecamatan,
            kode_pos: kodePos,
            alamat_lengkap: alamatLengkap,
            adalah_utama: adalahUtama,
        };

        if (editTarget) {
            router.put(`/profile/delivery/${editTarget.id}`, payload, {
                onSuccess: () => {
                    toast.success("Alamat berhasil diperbarui!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: () => {
                    toast.error("Gagal memperbarui alamat. Silakan periksa formulir.");
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        } else {
            router.post("/profile/delivery", payload, {
                onSuccess: () => {
                    toast.success("Alamat baru berhasil ditambahkan!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: () => {
                    toast.error("Gagal menambahkan alamat. Silakan periksa formulir.");
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        }
    };

    return (
        <ProfileLayout activeMenu="delivery">
            <Head title="Addresses - CRSL Official Store" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Buyer - Delivery info
                    </h1>
                </div>

                {/* List Alamat Pengguna (Sesuai Screenshot 5) */}
                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-600">
                                Belum ada alamat pengiriman tersimpan.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Tambahkan alamat agar mempermudah proses checkout pesanan.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="bg-[#F8F9FA] rounded-2xl p-6 relative border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200"
                            >
                                <div className="space-y-1.5 pr-20">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            {addr.nama_penerima}
                                        </h3>
                                        {addr.adalah_utama && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-primary px-2 py-0.5 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-600">
                                        {addr.telepon} {addr.email ? `• ${addr.email}` : ""}
                                    </p>

                                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                                        {addr.alamat_lengkap}
                                    </p>
                                </div>

                                {/* Tombol Aksi Kanan Bawah (Sesuai Screenshot 5: Ikon Hapus & Edit dalam Lingkaran) */}
                                <div className="absolute right-6 bottom-6 flex items-center gap-2">
                                    {/* Delete Button (Lingkaran Merah Muda) */}
                                    <button
                                        type="button"
                                        onClick={() => handleHapusAlamat(addr.id)}
                                        disabled={isDeleting === addr.id}
                                        className="w-8 h-8 rounded-full bg-red-100/70 hover:bg-red-200/80 text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                        aria-label="Hapus alamat"
                                        title="Hapus alamat"
                                    >
                                        <Trash2 className="w-4 h-4 stroke-[2]" />
                                    </button>

                                    {/* Edit Button (Lingkaran Abu-Abu) */}
                                    <button
                                        type="button"
                                        onClick={() => bukaModalEdit(addr)}
                                        className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                        aria-label="Ubah alamat"
                                        title="Ubah alamat"
                                    >
                                        <Pencil className="w-4 h-4 stroke-[2]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Tombol + Add New di Kanan Bawah (Sesuai Screenshot 5) */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={bukaModalTambah}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal Tambah / Edit Alamat */}
            {isModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-address-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
                >
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 id="modal-address-title" className="text-lg font-bold text-slate-900">
                                {editTarget ? "Edit Delivery Address" : "Add Delivery Address"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSimpanAlamat} className="space-y-4 pt-4">
                            {/* Label Alamat */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Label Alamat (Contoh: Rumah, Kantor)
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Rumah"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Nama Penerima */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Nama Penerima *
                                </label>
                                <input
                                    type="text"
                                    value={namaPenerima}
                                    onChange={(e) => setNamaPenerima(e.target.value)}
                                    required
                                    placeholder="Nama Lengkap Penerima"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Telepon & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Nomor Telepon *
                                    </label>
                                    <input
                                        type="tel"
                                        value={telepon}
                                        onChange={(e) => setTelepon(e.target.value)}
                                        required
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@domain.com"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Provinsi, Kota, Kecamatan */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Provinsi
                                    </label>
                                    <input
                                        type="text"
                                        value={provinsi}
                                        onChange={(e) => setProvinsi(e.target.value)}
                                        placeholder="DKI Jakarta"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Kota / Kab
                                    </label>
                                    <input
                                        type="text"
                                        value={kota}
                                        onChange={(e) => setKota(e.target.value)}
                                        placeholder="Jakarta Pusat"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Kecamatan
                                    </label>
                                    <input
                                        type="text"
                                        value={kecamatan}
                                        onChange={(e) => setKecamatan(e.target.value)}
                                        placeholder="Johar Baru"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            {/* Kode Pos */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Kode Pos
                                </label>
                                <input
                                    type="text"
                                    value={kodePos}
                                    onChange={(e) => setKodePos(e.target.value)}
                                    placeholder="10560"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Alamat Lengkap */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Alamat Lengkap *
                                </label>
                                <textarea
                                    value={alamatLengkap}
                                    onChange={(e) => setAlamatLengkap(e.target.value)}
                                    required
                                    rows={3}
                                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            {/* Checkbox Alamat Utama */}
                            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={adalahUtama}
                                    onChange={(e) => setAdalahUtama(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-slate-700">
                                    Jadikan sebagai alamat pengiriman utama
                                </span>
                            </label>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={sedangSimpan}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {sedangSimpan ? "Menyimpan..." : "Simpan Alamat"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
