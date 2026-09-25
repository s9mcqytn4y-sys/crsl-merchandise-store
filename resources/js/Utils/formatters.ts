/**
 * CRSL Store v2 - Shared Utility Formatters
 * Centralized currency, date, and string formatters to prevent code duplication.
 */

export const formatRupiah = (num: number | null | undefined): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(num || 0);
};

export const formatDateID = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Hari Ini';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const sanitizeString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
};
