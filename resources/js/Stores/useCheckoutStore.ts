import { create } from "zustand";

export interface AddressItem {
    id: number | string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    alamat_lengkap: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos: string;
    area_id?: string;
    is_utama?: boolean;
}

export type CheckoutModalType =
    | "address_select"
    | "address_form"
    | "voucher_select"
    | "delivery_message"
    | null;

interface CheckoutState {
    // Modal Management (Discriminated State)
    activeModal: CheckoutModalType;
    editingAddress: AddressItem | null;

    // Backward Compatibility Flags (Derived State Helpers)
    isAddressModalOpen: boolean;
    isNewAddressModalOpen: boolean;
    isVoucherModalOpen: boolean;
    isMessageModalOpen: boolean;

    // Dropship
    isDropship: boolean;
    dropshipSender: string;
    dropshipPhone: string;

    // Delivery message & notes
    deliveryMessage: string;

    // Loyalty points
    useLoyaltyPoints: boolean;
}

interface CheckoutActions {
    // Modal Actions
    openModal: (modal: CheckoutModalType, data?: AddressItem | null) => void;
    closeModal: () => void;

    // Shorthand Modal Actions (Menjaga Kompatibilitas dengan Komponen Existing)
    openAddressModal: () => void;
    closeAddressModal: () => void;
    openNewAddressModal: (addrToEdit?: AddressItem | null) => void;
    closeNewAddressModal: () => void;
    openVoucherModal: () => void;
    closeVoucherModal: () => void;
    openMessageModal: () => void;
    closeMessageModal: () => void;

    // Dropship Actions
    setIsDropship: (val: boolean) => void;
    setDropshipSender: (val: string) => void;
    setDropshipPhone: (val: string) => void;

    // Delivery Message Actions
    setDeliveryMessage: (msg: string) => void;

    // Loyalty Points Actions
    setUseLoyaltyPoints: (val: boolean) => void;

    // Reset Action (Wajib dipanggil saat transaksi checkout selesai / navigasi keluar)
    resetCheckoutState: () => void;
}

export type CheckoutStore = CheckoutState & CheckoutActions;

const initialCheckoutState: CheckoutState = {
    activeModal: null,
    editingAddress: null,
    isAddressModalOpen: false,
    isNewAddressModalOpen: false,
    isVoucherModalOpen: false,
    isMessageModalOpen: false,
    isDropship: false,
    dropshipSender: "",
    dropshipPhone: "",
    deliveryMessage: "",
    useLoyaltyPoints: false,
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
    ...initialCheckoutState,

    // Core Unified Modal Handler
    openModal: (modal, data = null) =>
        set({
            activeModal: modal,
            editingAddress: data,
            isAddressModalOpen: modal === "address_select",
            isNewAddressModalOpen: modal === "address_form",
            isVoucherModalOpen: modal === "voucher_select",
            isMessageModalOpen: modal === "delivery_message",
        }),

    closeModal: () =>
        set({
            activeModal: null,
            editingAddress: null,
            isAddressModalOpen: false,
            isNewAddressModalOpen: false,
            isVoucherModalOpen: false,
            isMessageModalOpen: false,
        }),

    // Shorthand API Wrappers (Zero Breaking Changes untuk Pembayaran.tsx)
    openAddressModal: () =>
        set({
            activeModal: "address_select",
            isAddressModalOpen: true,
            isNewAddressModalOpen: false,
            isVoucherModalOpen: false,
            isMessageModalOpen: false,
        }),
    closeAddressModal: () =>
        set({ activeModal: null, isAddressModalOpen: false }),

    openNewAddressModal: (addrToEdit = null) =>
        set({
            activeModal: "address_form",
            editingAddress: addrToEdit,
            isNewAddressModalOpen: true,
            isAddressModalOpen: false,
            isVoucherModalOpen: false,
            isMessageModalOpen: false,
        }),
    closeNewAddressModal: () =>
        set({
            activeModal: null,
            isNewAddressModalOpen: false,
            editingAddress: null,
        }),

    openVoucherModal: () =>
        set({
            activeModal: "voucher_select",
            isVoucherModalOpen: true,
            isAddressModalOpen: false,
            isNewAddressModalOpen: false,
            isMessageModalOpen: false,
        }),
    closeVoucherModal: () =>
        set({ activeModal: null, isVoucherModalOpen: false }),

    openMessageModal: () =>
        set({
            activeModal: "delivery_message",
            isMessageModalOpen: true,
            isAddressModalOpen: false,
            isNewAddressModalOpen: false,
            isVoucherModalOpen: false,
        }),
    closeMessageModal: () =>
        set({ activeModal: null, isMessageModalOpen: false }),

    // Mutator Forms & Checkout Options
    setIsDropship: (val) => set({ isDropship: val }),
    setDropshipSender: (val) => set({ dropshipSender: val }),
    setDropshipPhone: (val) => set({ dropshipPhone: val }),

    setDeliveryMessage: (msg) => set({ deliveryMessage: msg }),

    setUseLoyaltyPoints: (val) => set({ useLoyaltyPoints: val }),

    // Reset Store
    resetCheckoutState: () => set(initialCheckoutState),
}));
