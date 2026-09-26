import { toast } from "sonner";

/**
 * Modul Terpadu Notifikasi Toast untuk CRSL Store.
 * Menjamin konsistensi umpan balik visual, pesan ramah pengguna, dan durasi tampil.
 */
export const toastNotifikasi = {
    sukses: (pesan: string, deskripsi?: string) => {
        toast.success(pesan, {
            description: deskripsi,
            duration: 3500,
        });
    },

    error: (pesan: string, deskripsi?: string) => {
        toast.error(pesan, {
            description: deskripsi,
            duration: 4500,
        });
    },

    peringatan: (pesan: string, deskripsi?: string) => {
        toast.warning(pesan, {
            description: deskripsi,
            duration: 4000,
        });
    },

    info: (pesan: string, deskripsi?: string) => {
        toast.info(pesan, {
            description: deskripsi,
            duration: 3500,
        });
    },

    memuat: (pesan: string) => {
        return toast.loading(pesan);
    },

    tutup: (toastId?: string | number) => {
        toast.dismiss(toastId);
    },
};
