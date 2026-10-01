import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { router } from "@inertiajs/react";

export interface UserProfile {
    id: number;
    nama: string;
    name?: string;
    email: string;
    telepon?: string | null;
    phone?: string | null;
    avatar?: string | null;
    foto?: string | null;
    poin?: number;
    loyalty_points?: number;
    total_belanja?: number;
    role?: string;
    email_verified_at?: string | null;
}

type AuthModalTab = "login" | "register" | "forgot_password";

interface AuthState {
    // 1. Data User & Status Autentikasi
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // 2. State Modal Autentikasi Global (FLAT - tidak gunakan getter)
    isLoginModalOpen: boolean;
    isRegisterModalOpen: boolean;
    isForgotPasswordModalOpen: boolean;
    redirectAfterAuthUrl: string | null;

    // 3. Properti Komputasi Tersinkron (bukan getter/accessor)
    isOpen: boolean;          // true jika salah satu modal auth terbuka
    activeTab: AuthModalTab;  // tab aktif saat ini

    // 4. Modal Actions
    openLoginModal: (redirectUrl?: string) => void;
    closeLoginModal: () => void;
    openRegisterModal: (redirectUrl?: string) => void;
    closeRegisterModal: () => void;
    openForgotPasswordModal: () => void;
    closeForgotPasswordModal: () => void;
    switchModal: (target: AuthModalTab) => void;

    // Action Terpadu untuk AuthModal di StorefrontLayout
    openAuthModal: (tab?: AuthModalTab, redirectUrl?: string) => void;
    closeAuthModal: () => void;

    // 5. User Actions & Sinkronisasi
    setUser: (user: UserProfile | null) => void;
    updateUserPoin: (poin: number) => void;
    syncFromInertia: (authPropUser: unknown) => void;
    logout: (redirectTo?: string) => void;
}

/**
 * Helper menghitung derived state dari flag modal.
 * Dipanggil di dalam setiap action yang mengubah modal flags.
 */
function deriveAuthUI(
    isLoginOpen: boolean,
    isRegisterOpen: boolean,
    isForgotOpen: boolean,
): Pick<AuthState, "isOpen" | "activeTab"> {
    return {
        isOpen: isLoginOpen || isRegisterOpen || isForgotOpen,
        activeTab: isRegisterOpen
            ? "register"
            : isForgotOpen
              ? "forgot_password"
              : "login",
    };
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // State Awal User
            user: null,
            isAuthenticated: false,
            isLoading: false,

            // State Modal UI (In-Memory, FLAT)
            isLoginModalOpen: false,
            isRegisterModalOpen: false,
            isForgotPasswordModalOpen: false,
            redirectAfterAuthUrl: null,

            // Derived state awal (flat, bukan getter)
            isOpen: false,
            activeTab: "login" as AuthModalTab,

            // Modal Actions Spesifik
            openLoginModal: (redirectUrl) =>
                set({
                    isLoginModalOpen: true,
                    isRegisterModalOpen: false,
                    isForgotPasswordModalOpen: false,
                    redirectAfterAuthUrl: redirectUrl || null,
                    ...deriveAuthUI(true, false, false),
                }),

            closeLoginModal: () =>
                set({
                    isLoginModalOpen: false,
                    redirectAfterAuthUrl: null,
                    ...deriveAuthUI(false, get().isRegisterModalOpen, get().isForgotPasswordModalOpen),
                }),

            openRegisterModal: (redirectUrl) =>
                set({
                    isRegisterModalOpen: true,
                    isLoginModalOpen: false,
                    isForgotPasswordModalOpen: false,
                    redirectAfterAuthUrl: redirectUrl || null,
                    ...deriveAuthUI(false, true, false),
                }),

            closeRegisterModal: () =>
                set({
                    isRegisterModalOpen: false,
                    redirectAfterAuthUrl: null,
                    ...deriveAuthUI(get().isLoginModalOpen, false, get().isForgotPasswordModalOpen),
                }),

            openForgotPasswordModal: () =>
                set({
                    isForgotPasswordModalOpen: true,
                    isLoginModalOpen: false,
                    isRegisterModalOpen: false,
                    ...deriveAuthUI(false, false, true),
                }),

            closeForgotPasswordModal: () =>
                set({
                    isForgotPasswordModalOpen: false,
                    ...deriveAuthUI(get().isLoginModalOpen, get().isRegisterModalOpen, false),
                }),

            switchModal: (target) =>
                set({
                    isLoginModalOpen: target === "login",
                    isRegisterModalOpen: target === "register",
                    isForgotPasswordModalOpen: target === "forgot_password",
                    ...deriveAuthUI(
                        target === "login",
                        target === "register",
                        target === "forgot_password",
                    ),
                }),

            // Action Seragam untuk Komponen StorefrontLayout
            openAuthModal: (tab = "login", redirectUrl) => {
                const isLogin = tab === "login";
                const isRegister = tab === "register";
                const isForgot = tab === "forgot_password";
                set({
                    isLoginModalOpen: isLogin,
                    isRegisterModalOpen: isRegister,
                    isForgotPasswordModalOpen: isForgot,
                    redirectAfterAuthUrl: redirectUrl || null,
                    ...deriveAuthUI(isLogin, isRegister, isForgot),
                });
            },

            closeAuthModal: () =>
                set({
                    isLoginModalOpen: false,
                    isRegisterModalOpen: false,
                    isForgotPasswordModalOpen: false,
                    redirectAfterAuthUrl: null,
                    ...deriveAuthUI(false, false, false),
                }),

            // Sinkronisasi Data Profil Pengguna
            setUser: (user) => {
                if (!user) {
                    set({ user: null, isAuthenticated: false });
                    return;
                }

                const u = user as unknown as Record<string, unknown>;
                const normalized: UserProfile = {
                    id: Number(u.id),
                    nama: String(u.nama || u.name || "Pelanggan CRSL"),
                    name: String(u.name || u.nama || "Pelanggan CRSL"),
                    email: String(u.email),
                    telepon: (u.telepon || u.phone || null) as string | null,
                    phone: (u.phone || u.telepon || null) as string | null,
                    avatar: (u.avatar || u.foto || null) as string | null,
                    foto: (u.foto || u.avatar || null) as string | null,
                    poin: Number(u.poin ?? u.loyalty_points ?? 0),
                    loyalty_points: Number(u.loyalty_points ?? u.poin ?? 0),
                    total_belanja: Number(u.total_belanja ?? 0),
                    role: String(u.role || "customer"),
                    email_verified_at: (u.email_verified_at ?? null) as string | null,
                };

                set({ user: normalized, isAuthenticated: true });
            },

            // Pembaruan Saldo Poin Loyalitas
            updateUserPoin: (poinBaru) => {
                const currentUser = get().user;
                if (!currentUser) return;

                set({
                    user: {
                        ...currentUser,
                        poin: poinBaru,
                        loyalty_points: poinBaru,
                    },
                });
            },

            // Sinkronisasi Otomatis dari Props Inertia ($page.props.auth.user)
            syncFromInertia: (authPropUser) => {
                if (authPropUser) {
                    get().setUser(authPropUser as UserProfile);
                } else {
                    set({ user: null, isAuthenticated: false });
                }
            },

            // Logout Resmi
            logout: (redirectTo = "/") => {
                set({ user: null, isAuthenticated: false });
                router.post(
                    "/logout",
                    {},
                    {
                        onSuccess: () => {
                            if (redirectTo) {
                                router.visit(redirectTo);
                            }
                        },
                    },
                );
            },
        }),
        {
            name: "crsl_auth_state_v2",
            storage: createJSONStorage(() => localStorage),
            // Hanya persistenkan data user dan isAuthenticated
            // Semua flag modal UI wajib in-memory
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            // Rehydrate: pastikan derived state konsisten setelah hydration
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isOpen = false;
                    state.activeTab = "login";
                    state.isLoginModalOpen = false;
                    state.isRegisterModalOpen = false;
                    state.isForgotPasswordModalOpen = false;
                }
            },
        },
    ),
);
