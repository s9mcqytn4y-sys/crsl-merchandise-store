/**
 * types/index.ts - Kontrak type terpusat untuk CRSL Store v2
 * 
 * Mencakup: Shared Props, Domain Entities, Webhook Payloads, Admin Types
 */

// -----------------------------------------------------------------------
// SHARED INERTIA PAGE PROPS
// -----------------------------------------------------------------------

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    telepon?: string | null;
    avatar?: string | null;
    birth_day?: string | null;
    birth_month?: string | null;
    birth_year?: string | null;
    email_verified_at?: string | null;
    role?: string;
    poin?: number;
    loyalty_points?: number;
}

export interface SharedFlash {
    sukses?: string;
    error?: string;
    info?: string;
    warning?: string;
}

export interface PesananBelumBayarShared {
    nomor_pesanan: string;
    total: number;
    batas_waktu: string;
    metode: string;
}

export interface SharedPageProps {
    auth?: {
        user?: AuthUser | null;
    };
    flash?: SharedFlash;
    pesanan_belum_bayar?: PesananBelumBayarShared | null;
    [key: string]: unknown;
}

// -----------------------------------------------------------------------
// DOMAIN ENTITIES - KATALOG
// -----------------------------------------------------------------------

export interface EntitasKategori {
    id: number;
    nama: string;
    slug: string;
    emoji?: string | null;
    urutan?: number;
    aktif?: boolean;
}

export interface EntitasGambarProduk {
    id?: number | string;
    produk_id?: number;
    url: string;
    alt_teks?: string;
    urutan?: number;
    is_utama?: boolean;
}

export interface EntitasProdukVarian {
    id: number | string;
    produk_id?: number;
    sku?: string;
    nama_varian?: string;
    tipe_varian?: string;
    warna?: string;
    warna_hex?: string;
    ukuran?: string;
    harga_tambahan?: number;
    stok?: number;
    gambar_varian?: string | null;
    aktif?: boolean;
}

export interface EntitasProduk {
    id: number;
    kategori_id?: number;
    nama: string;
    slug: string;
    deskripsi?: string;
    harga_dasar: number;
    harga_diskon?: number | null;
    stok_total?: number;
    berat_gram?: number;
    tipe_produk?: "reguler" | "pre_order" | "bundle" | string;
    estimasi_po?: string | null;
    status_stok?: "tersedia" | "habis" | string;
    terjual?: number;
    is_best_seller?: boolean;
    gambar_utama?: string | null;
    gambar_sekunder?: string | null;
    video_url?: string | null;
    aktif?: boolean;
    kategori?: EntitasKategori | string;
    varian?: EntitasProdukVarian[];
    gambar?: EntitasGambarProduk[];
}

// -----------------------------------------------------------------------
// DOMAIN ENTITIES - KERANJANG
// -----------------------------------------------------------------------

export interface EntitasItemKeranjang {
    id: string;
    produk_id: number;
    varian_id?: number | string;
    nama_produk: string;
    harga: number;
    harga_asli?: number;
    gambar?: string | null;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
    berat_gram?: number;
}

// -----------------------------------------------------------------------
// DOMAIN ENTITIES - VOUCHER & LOYALITAS
// -----------------------------------------------------------------------

export interface EntitasVoucher {
    id: number;
    kode: string;
    judul: string;
    tipe: "persen" | "nominal" | "ongkir";
    nilai: number;
    min_belanja: number;
    kuota?: number;
    berlaku_sampai?: string;
    aktif?: boolean;
}

export interface EntitasTierLoyalitas {
    id: number;
    nama: string;
    min_poin: number;
    max_poin?: number;
    benefit?: string;
}

export interface EntitasPenggunaLoyalitas {
    pengguna_id: number;
    poin: number;
    tier?: EntitasTierLoyalitas;
}

// -----------------------------------------------------------------------
// DOMAIN ENTITIES - ALAMAT & WILAYAH
// -----------------------------------------------------------------------

export interface EntitasAlamatPengguna {
    id: number;
    pengguna_id?: number;
    label?: string;
    nama_penerima: string;
    telepon: string;
    alamat_lengkap: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kode_pos: string;
    biteship_area_id?: string;
    is_utama?: boolean;
}

export interface PreferensiPengguna {
    negara: string;
    bahasa: string;
    mata_uang: string;
}

// -----------------------------------------------------------------------
// DOMAIN ENTITIES - PESANAN
// -----------------------------------------------------------------------

export type StatusPesanan =
    | "belum_bayar"
    | "akan_dikirim"
    | "dikirim"
    | "selesai"
    | "dibatalkan"
    | "expire"
    | "expired"
    | "failed"
    | "menunggu_verifikasi_manual"
    | "challenge"
    | "suspect_underpaid";

export interface EntitasItemPesanan {
    id: number;
    pesanan_id: number;
    produk_id: number;
    varian_id?: number | null;
    nama_produk: string;
    sku?: string;
    harga: number;
    jumlah: number;
    subtotal: number;
    gambar?: string | null;
    ukuran?: string | null;
    warna?: string | null;
}

export interface EntitasPesananPembayaran {
    id: number;
    pesanan_id: number;
    metode: string;
    midtrans_status?: string | null;
    midtrans_transaction_id?: string | null;
    snap_token?: string | null;
    va_number?: string | null;
    bank?: string | null;
    qr_code_url?: string | null;
    waktu_bayar?: string | null;
    batas_waktu?: string | null;
    payment_payload?: Record<string, unknown> | null;
}

export interface EntitasPesananPengiriman {
    id: number;
    pesanan_id: number;
    kurir?: string | null;
    layanan?: string | null;
    nomor_resi?: string | null;
    biteship_order_id?: string | null;
    status_pengiriman?: string | null;
    tracking_url?: string | null;
    ongkir: number;
    json_payload?: Record<string, unknown> | null;
}

export interface EntitasPesanan {
    id: number;
    nomor_pesanan: string;
    pengguna_id?: number | null;
    nama_penerima: string;
    email_penerima: string;
    telepon_penerima: string;
    alamat_lengkap: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kode_pos?: string;
    biteship_area_id?: string;
    status: StatusPesanan;
    subtotal: number;
    diskon_voucher: number;
    diskon_poin: number;
    ongkir: number;
    total: number;
    kode_voucher?: string | null;
    catatan?: string | null;
    is_dropship?: boolean;
    dropship_pengirim?: string | null;
    dropship_telepon?: string | null;
    created_at: string;
    updated_at: string;
    items?: EntitasItemPesanan[];
    pembayaran?: EntitasPesananPembayaran | null;
    pengiriman?: EntitasPesananPengiriman | null;
}

// -----------------------------------------------------------------------
// WEBHOOK PAYLOADS - MIDTRANS
// -----------------------------------------------------------------------

export type MidtransTransactionStatus =
    | "capture"
    | "settlement"
    | "pending"
    | "deny"
    | "cancel"
    | "expire"
    | "failure"
    | "refund"
    | "partial_refund"
    | "authorize";

export type MidtransFraudStatus = "accept" | "challenge" | "deny";

export interface MidtransWebhookPayload {
    transaction_time: string;
    transaction_status: MidtransTransactionStatus;
    transaction_id: string;
    status_message: string;
    status_code: string;
    signature_key: string;
    settlement_time?: string;
    payment_type: string;
    order_id: string;
    merchant_id: string;
    gross_amount: string;
    fraud_status?: MidtransFraudStatus;
    currency: string;
    acquirer?: string;
    issuer?: string;
    // QRIS / GoPay
    qr_string?: string;
    // Bank Transfer / VA
    va_numbers?: Array<{ bank: string; va_number: string }>;
    biller_code?: string;
    bill_key?: string;
    // Payload tambahan dari berbagai payment channel
    [key: string]: unknown;
}

// -----------------------------------------------------------------------
// WEBHOOK PAYLOADS - BITESHIP
// -----------------------------------------------------------------------

export type BiteshipOrderStatus =
    | "confirmed"
    | "allocated"
    | "picking_up"
    | "picked"
    | "dropping_off"
    | "return_in_transit"
    | "delivered"
    | "rejected"
    | "returned"
    | "cancelled"
    | "on_hold";

export interface BiteshipWebhookPayload {
    event: string;
    order_id: string;
    driver_name?: string;
    driver_phone?: string;
    live_tracking_url?: string;
    note?: string;
    order_status?: BiteshipOrderStatus;
    waybill_id?: string;
    courier?: {
        company: string;
        name: string;
        type: string;
        link?: string;
    };
    [key: string]: unknown;
}

// -----------------------------------------------------------------------
// ADMIN / CMS PAGE PROPS (Foundation)
// -----------------------------------------------------------------------

export interface AdminDashboardStats {
    total_pesanan: number;
    pesanan_belum_bayar: number;
    pesanan_akan_dikirim: number;
    pesanan_selesai: number;
    total_pendapatan: number;
    total_produk: number;
    produk_habis_stok: number;
    total_pengguna: number;
    pengguna_baru_bulan_ini: number;
}

export interface AdminSharedPageProps extends SharedPageProps {
    admin?: AuthUser;
    stats?: AdminDashboardStats;
    sidebarOpen?: boolean;
}

// -----------------------------------------------------------------------
// API RESPONSE WRAPPER
// -----------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
    sukses: boolean;
    pesan?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface PesananStatusResponse {
    sukses: boolean;
    status: StatusPesanan;
    pesan?: string;
    nomor_pesanan?: string;
}
