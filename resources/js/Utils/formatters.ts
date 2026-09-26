/**
 * CRSL Store v2 - Shared Utility Formatters
 * Centralized currency, date, and string formatters to prevent code duplication.
 */

// Inisialisasi singleton formatter di level modul untuk efisiensi CPU & memori
const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

/**
 * Format angka numerik ke format Rupiah standar Indonesia (misal: "Rp 197.100").
 */
export const formatRupiah = (num: number | null | undefined): string => {
    if (typeof num !== "number" || isNaN(num)) {
        return rupiahFormatter.format(0);
    }
    return rupiahFormatter.format(num);
};

// Inisialisasi date formatter terpusat
const idDateFormatter = new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

/**
 * Format string tanggal ISO/SQL ke format lokal Indonesia (misal: "18 September 2026").
 * @param dateString String tanggal atau objek Date
 * @param fallback Nilai kembalian jika tanggal null/tidak valid (default: "-")
 */
export const formatDateID = (
    dateInput: string | Date | null | undefined,
    fallback = "-",
): string => {
    if (!dateInput) return fallback;

    const parsedDate =
        dateInput instanceof Date ? dateInput : new Date(dateInput);

    // Cek apakah tanggal valid
    if (isNaN(parsedDate.getTime())) {
        return fallback;
    }

    return idDateFormatter.format(parsedDate);
};

/**
 * Sanitasi string dasar untuk mencegah tag HTML mentah dan membersihkan spasi berlebih.
 */
export const sanitizeString = (str: string | null | undefined): string => {
    if (!str || typeof str !== "string") return "";
    return str.trim().replace(/[<>]/g, "");
};

/**
 * Format angka diskon ke persentase bulat (misal: 10).
 */
export const hitungPersentaseDiskon = (
    hargaDasar: number,
    hargaDiskon: number,
): number => {
    if (hargaDasar <= 0 || hargaDiskon >= hargaDasar) return 0;
    return Math.round(((hargaDasar - hargaDiskon) / hargaDasar) * 100);
};
