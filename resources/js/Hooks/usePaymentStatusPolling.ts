import { useState, useEffect, useCallback, useRef } from 'react';

export interface UsePaymentStatusPollingOptions {
    intervalMs?: number;
    onSettled?: (status: string) => void;
    onError?: (err: Error) => void;
}

export function usePaymentStatusPolling(
    nomorPesanan: string,
    initialStatus: string = 'belum_bayar',
    options: UsePaymentStatusPollingOptions = {}
) {
    const { intervalMs = 4000, onSettled, onError } = options;

    const [status, setStatus] = useState<string>(initialStatus);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const settledRef = useRef<boolean>(
        ['akan_dikirim', 'dikirim', 'selesai'].includes(initialStatus.toLowerCase())
    );

    const cekStatusManual = useCallback(async () => {
        if (!nomorPesanan) return;
        setIsChecking(true);
        try {
            const res = await fetch(`/api/pesanan/${encodeURIComponent(nomorPesanan)}/status`, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }
            const data = await res.json();
            if (data.sukses && data.status) {
                const statusBaru = data.status.toLowerCase();
                setStatus(statusBaru);

                const sudahLunas = ['akan_dikirim', 'dikirim', 'selesai'].includes(statusBaru);
                if (sudahLunas && !settledRef.current) {
                    settledRef.current = true;
                    if (onSettled) {
                        onSettled(statusBaru);
                    }
                }
            }
        } catch (err) {
            if (onError && err instanceof Error) {
                onError(err);
            }
        } finally {
            setIsChecking(false);
        }
    }, [nomorPesanan, onSettled, onError]);

    useEffect(() => {
        // Jika sudah settled atau nomor pesanan kosong, tidak perlu polling
        if (settledRef.current || !nomorPesanan) return;

        const timer = setInterval(() => {
            if (!settledRef.current) {
                cekStatusManual();
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [nomorPesanan, intervalMs, cekStatusManual]);

    return {
        status,
        isSettled: settledRef.current || ['akan_dikirim', 'dikirim', 'selesai'].includes(status.toLowerCase()),
        isChecking,
        cekStatusManual,
    };
}
