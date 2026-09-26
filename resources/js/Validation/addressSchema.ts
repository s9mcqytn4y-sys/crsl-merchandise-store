import { z } from "zod";

export const addressSchema = z.object({
    label: z.string().min(1, "Label alamat wajib diisi."),
    nama_penerima: z
        .string()
        .min(3, "Nama penerima minimal 3 karakter.")
        .max(100, "Nama terlalu panjang."),
    telepon: z
        .string()
        .regex(/^[0-9+()\- ]{9,20}$/, "Nomor telepon tidak valid (minimal 9 digit)."),
    email: z
        .string()
        .email("Format email tidak valid.")
        .max(150, "Email terlalu panjang.")
        .or(z.literal(""))
        .optional(),
    area_id: z.string().nullable().optional(),
    provinsi: z.string(),
    kota: z.string().min(2, "Silakan tentukan kota/kabupaten pengiriman."),
    kecamatan: z.string(),
    kelurahan: z.string().nullable().optional(),
    kode_pos: z.string().min(4, "Kode pos minimal 4 digit."),
    alamat_lengkap: z
        .string()
        .min(8, "Alamat lengkap jalan/nomor rumah minimal 8 karakter."),
    adalah_utama: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
