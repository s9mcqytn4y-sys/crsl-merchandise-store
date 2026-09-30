import { useState, useEffect, useCallback, useRef } from "react";
import { router } from "@inertiajs/react";

export interface UsePaymentStatusPollingOptions {
    intervalMs?: number;
    maxDurationMs?: number;
    onSettled?: (status: string) => void;
    onHold?: (status: string, pesan?: string) => void;
    onError?: (err: Error) => void;
    autoReloadInertia?: boolean;
}

export const TERMINAL_SUCCESS_STATUSES = ["akan_dikirim", "dikirim", "selesai"];
export const TERMINAL_FAILURE_STATUSES = [
    "dibatalkan",
    "expire",
    "expired",
    "failed",
];
export const HOLD_STATUSES = [
    "menunggu_verifikasi_manual",
    "challenge",
    "suspect_underpaid",
];

export const ALL_TERMINAL_STATUSES = [
    ...TERMINAL_SUCCESS_STATUSES,
    ...TERMINAL_FAILURE_STATUSES,
    ...HOLD_STATUSES,
];

export function usePaymentStatusPolling(
    nomorPesanan: string,
    initialStatus: string = "belum_bayar",
    options: UsePaymentStatusPollingOptions = {},
) {
    const {
        intervalMs = 4000,
        maxDurationMs = 900000, // 15 menit (cukup untuk polling aktif QRIS / VA)
        onSettled,
        onHold,
        onError,
        autoReloadInertia = true,
    } = options;

    const [status, setStatus] = useState<string>(initialStatus.toLowerCase());
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    // Simpan callback ke ref agar re-render parent tidak me-reset interval
    const onSettledRef = useRef(onSettled);
    const onHoldRef = useRef(onHold);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onSettledRef.current = onSettled;
        onHoldRef.current = onHold;
        onErrorRef.current = onError;
    }, [onSettled, onHold, onError]);

    // Sinkronisasi jika initialStatus dari Inertia berubah
    useEffect(() => {
        if (initialStatus) {
            setStatus(initialStatus.toLowerCase());
        }
    }, [initialStatus]);

    const isSettled = ALL_TERMINAL_STATUSES.includes(status);
    const isSuccess = TERMINAL_SUCCESS_STATUSES.includes(status);
    const isHold = HOLD_STATUSES.includes(status);

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

            const data = await res.json();

            // Tangani baik saat sukses: true maupun saat transaksi di-hold (sukses: false)
            if (data?.status) {
                const statusBaru = String(data.status).toLowerCase();
                const pesan = data?.pesan || null;

                setStatus(statusBaru);
                if (pesan) setStatusMessage(pesan);

                // 1. Kasus Status Tertahan / Verifikasi Manual CS
                if (HOLD_STATUSES.includes(statusBaru)) {
                    isSettledRef.current = true;
                    onHoldRef.current?.(statusBaru, pesan);
                    if (autoReloadInertia) {
                        router.reload({ only: ["pesanan"] });
                    }
                    return;
                }

                // 2. Kasus Status Terminal Sukses / Gagal
                const settledBaru = ALL_TERMINAL_STATUSES.includes(statusBaru);
                if (settledBaru && !isSettledRef.current) {
                    isSettledRef.current = true;
                    onSettledRef.current?.(statusBaru);
                    if (autoReloadInertia) {
                        router.reload({ only: ["pesanan"] });
                    }
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
    }, [nomorPesanan, autoReloadInertia]);

    // Lifecycle Polling
    useEffect(() => {
        if (isSettled || !nomorPesanan) return;

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
        statusMessage,
        isSettled,
        isSuccess,
        isHold,
        isChecking,
        cekStatusManual,
    };
}
