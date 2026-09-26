import { useState, useEffect, useCallback, useRef } from "react";

export interface UsePaymentStatusPollingOptions {
    intervalMs?: number;
    maxDurationMs?: number;
    onSettled?: (status: string) => void;
    onError?: (err: Error) => void;
}

const TERMINAL_SUCCESS_STATUSES = ["akan_dikirim", "dikirim", "selesai"];
const TERMINAL_FAILURE_STATUSES = ["dibatalkan", "expire", "expired", "failed"];
const ALL_TERMINAL_STATUSES = [
    ...TERMINAL_SUCCESS_STATUSES,
    ...TERMINAL_FAILURE_STATUSES,
];

export function usePaymentStatusPolling(
    nomorPesanan: string,
    initialStatus: string = "belum_bayar",
    options: UsePaymentStatusPollingOptions = {},
) {
    const {
        intervalMs = 4000,
        maxDurationMs = 120000, // 2 Menit
        onSettled,
        onError,
    } = options;

    const [status, setStatus] = useState<string>(initialStatus);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    // Simpan callback ke ref agar perubahan fungsi di parent tidak memicu re-render/reset effect
    const onSettledRef = useRef(onSettled);
    const onErrorRef = useRef(onError);
    useEffect(() => {
        onSettledRef.current = onSettled;
        onErrorRef.current = onError;
    }, [onSettled, onError]);

    // Sinkronisasi jika initialStatus dari Inertia berubah
    useEffect(() => {
        if (initialStatus) {
            setStatus(initialStatus.toLowerCase());
        }
    }, [initialStatus]);

    const isSettled = ALL_TERMINAL_STATUSES.includes(status.toLowerCase());
    const isSuccess = TERMINAL_SUCCESS_STATUSES.includes(status.toLowerCase());

    const isSettledRef = useRef<boolean>(isSettled);
    useEffect(() => {
        isSettledRef.current = isSettled;
    }, [isSettled]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isFetchingRef = useRef<boolean>(false);

    const cekStatusManual = useCallback(async () => {
        if (!nomorPesanan || isFetchingRef.current || isSettledRef.current)
            return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        isFetchingRef.current = true;
        setIsChecking(true);

        try {
            const res = await fetch(
                `/api/pesanan/${encodeURIComponent(nomorPesanan)}/status`,
                {
                    headers: { Accept: "application/json" },
                    signal: controller.signal,
                },
            );

            if (!res.ok) {
                throw new Error(`HTTP error ${res.status}`);
            }

            const data = await res.json();

            if (data?.sukses && data?.status) {
                const statusBaru = String(data.status).toLowerCase();
                setStatus(statusBaru);

                const settledBaru = ALL_TERMINAL_STATUSES.includes(statusBaru);
                if (settledBaru && !isSettledRef.current) {
                    isSettledRef.current = true;
                    onSettledRef.current?.(statusBaru);
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === "AbortError") return;
                onErrorRef.current?.(err);
            }
        } finally {
            isFetchingRef.current = false;
            setIsChecking(false);
        }
    }, [nomorPesanan]);

    // Lifecycle interval polling terisolasi
    useEffect(() => {
        if (isSettled || !nomorPesanan) {
            return;
        }

        const startTime = Date.now();

        const timer = setInterval(() => {
            if (isSettledRef.current) {
                clearInterval(timer);
                return;
            }

            const elapsed = Date.now() - startTime;
            if (elapsed >= maxDurationMs) {
                clearInterval(timer);
                return;
            }

            cekStatusManual();
        }, intervalMs);

        return () => {
            clearInterval(timer);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [nomorPesanan, intervalMs, maxDurationMs, isSettled, cekStatusManual]);

    return {
        status,
        isSettled,
        isSuccess,
        isChecking,
        cekStatusManual,
    };
}
