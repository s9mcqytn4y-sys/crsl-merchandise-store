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
}

export interface SharedFlash {
    sukses?: string;
    error?: string;
    info?: string;
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
