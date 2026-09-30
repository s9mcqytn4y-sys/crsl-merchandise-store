import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AddressItem {
    id: number | string;
    label?: string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    area_id?: string;
    biteship_area_id?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
    kode_pos?: string;
    alamat_lengkap: string;
    format_lengkap?: string;
    adalah_utama?: boolean;
}

interface CheckoutState {
    // 1. Modal States (UI Only - Tidak Dipersist)
    isAddressModalOpen: boolean;
    isNewAddressModalOpen: boolean;
    isVoucherModalOpen: boolean;
    isMessageModalOpen: boolean;
    editingAddress: AddressItem | null;

    // 2. Checkout Form Draft States
    isDropship: boolean;
    dropshipSender: string;
    dropshipPhone: string;
    deliveryMessage: string;
    useLoyaltyPoints: boolean;

    // 3. Modal Actions
    openAddressModal: () => void;
    closeAddressModal: () => void;
    openNewAddressModal: (addrToEdit?: AddressItem | null) => void;
    closeNewAddressModal: () => void;
    openVoucherModal: () => void;
    closeVoucherModal: () => void;
    openMessageModal: () => void;
    closeMessageModal: () => void;
    setEditingAddress: (address: AddressItem | null) => void;

    // 4. Form Actions
    setIsDropship: (val: boolean) => void;
    setDropshipSender: (val: string) => void;
    setDropshipPhone: (val: string) => void;
    setDeliveryMessage: (val: string) => void;
    setUseLoyaltyPoints: (val: boolean | ((prev: boolean) => boolean)) => void;

    // 5. Reset Action
    resetCheckoutState: () => void;
}

const initialFormState = {
    isDropship: false,
    dropshipSender: "",
    dropshipPhone: "",
    deliveryMessage: "",
    useLoyaltyPoints: false,
};

export const useCheckoutStore = create<CheckoutState>()(
    persist(
        (set) => ({
            // Inisialisasi Modal
            isAddressModalOpen: false,
            isNewAddressModalOpen: false,
            isVoucherModalOpen: false,
            isMessageModalOpen: false,
            editingAddress: null,

            // Inisialisasi Form
            ...initialFormState,

            // Action Modals
            openAddressModal: () => set({ isAddressModalOpen: true }),
            closeAddressModal: () => set({ isAddressModalOpen: false }),

            openNewAddressModal: (addrToEdit = null) =>
                set({
                    isNewAddressModalOpen: true,
                    editingAddress: addrToEdit ?? null,
                }),

            closeNewAddressModal: () =>
                set({
                    isNewAddressModalOpen: false,
                    editingAddress: null,
                }),

            openVoucherModal: () => set({ isVoucherModalOpen: true }),
            closeVoucherModal: () => set({ isVoucherModalOpen: false }),

            openMessageModal: () => set({ isMessageModalOpen: true }),
            closeMessageModal: () => set({ isMessageModalOpen: false }),

            setEditingAddress: (address) => set({ editingAddress: address }),

            // Action Form Handlers
            setIsDropship: (val) => set({ isDropship: val }),
            setDropshipSender: (val) => set({ dropshipSender: val }),
            setDropshipPhone: (val) => set({ dropshipPhone: val }),
            setDeliveryMessage: (val) => set({ deliveryMessage: val }),

            setUseLoyaltyPoints: (val) =>
                set((state) => ({
                    useLoyaltyPoints:
                        typeof val === "function"
                            ? val(state.useLoyaltyPoints)
                            : val,
                })),

            // Reset Seluruh State Checkout (Dijalankan saat sukses checkout / faktur baru)
            resetCheckoutState: () =>
                set({
                    isAddressModalOpen: false,
                    isNewAddressModalOpen: false,
                    isVoucherModalOpen: false,
                    isMessageModalOpen: false,
                    editingAddress: null,
                    ...initialFormState,
                }),
        }),
        {
            name: "crsl_checkout_draft_v2",
            storage: createJSONStorage(() => sessionStorage),
            // Hanya persistenkan nilai form di sessionStorage, jangan simpan flag modal UI
            partialize: (state) => ({
                isDropship: state.isDropship,
                dropshipSender: state.dropshipSender,
                dropshipPhone: state.dropshipPhone,
                deliveryMessage: state.deliveryMessage,
                useLoyaltyPoints: state.useLoyaltyPoints,
            }),
        },
    ),
);
