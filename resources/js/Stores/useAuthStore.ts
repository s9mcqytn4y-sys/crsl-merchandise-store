import { create } from 'zustand';

export type AuthTab = 'login' | 'register' | 'otp';

interface AuthState {
    isOpen: boolean;
    activeTab: AuthTab;
    email: string;
    nama: string;
    openAuthModal: (tab?: AuthTab) => void;
    closeAuthModal: () => void;
    setActiveTab: (tab: AuthTab) => void;
    setEmail: (email: string) => void;
    setNama: (nama: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isOpen: false,
    activeTab: 'login',
    email: '',
    nama: '',
    openAuthModal: (tab = 'login') => set({ isOpen: true, activeTab: tab }),
    closeAuthModal: () => set({ isOpen: false }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setEmail: (email) => set({ email }),
    setNama: (nama) => set({ nama }),
}));
