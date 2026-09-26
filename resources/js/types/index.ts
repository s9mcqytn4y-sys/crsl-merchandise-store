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
