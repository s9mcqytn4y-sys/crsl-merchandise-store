import { z } from "zod";

// Helper regex nomor handphone standar Indonesia
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
const postalCodeRegex = /^[0-9]{5}$/;

// Skema Item Pembelian dalam Order
export const orderItemSchema = z.object({
    id: z.union([z.number(), z.string()], {
        required_error: "ID produk wajib diisi.",
    }),
    varian_id: z.union([z.number(), z.string()]).nullish(),
    nama: z.string().min(1, "Nama produk tidak boleh kosong."),
    harga: z.number().nonnegative("Harga produk tidak boleh negatif."),
    jumlah: z.number().int().positive("Jumlah pembelian minimal 1 pcs."),
    ukuran: z.string().nullish(),
    warna: z.string().nullish(),
    sku: z.string().nullish(),
});

// Skema Lengkap Form Checkout Pesanan
export const checkoutFormSchema = z
    .object({
        // Data Kontak Penerima
        nama_lengkap: z
            .string({ required_error: "Nama lengkap penerima wajib diisi." })
            .trim()
            .min(3, "Nama lengkap penerima minimal 3 karakter.")
            .max(100, "Nama terlalu panjang (maksimal 100 karakter)."),
        email: z
            .string({ required_error: "Alamat email wajib diisi." })
            .trim()
            .email("Format alamat email tidak valid.")
            .max(150, "Email terlalu panjang."),
        telepon: z
            .string({ required_error: "Nomor handphone wajib diisi." })
            .trim()
            .transform((val) => val.replace(/[\s\-()]/g, ""))
            .refine((val) => phoneRegex.test(val), {
                message:
                    "Nomor HP tidak valid. Gunakan format standar (contoh: 08123456789).",
            }),

        // Data Alamat Pengiriman
        alamat_lengkap: z
            .string({
                required_error: "Alamat lengkap pengiriman wajib diisi.",
            })
            .trim()
            .min(8, "Alamat lengkap jalan/nomor rumah minimal 8 karakter.")
            .max(300, "Alamat terlalu panjang (maksimal 300 karakter)."),
        biteship_area_id: z
            .string()
            .trim()
            .min(1, "Area pengiriman Biteship wajib dipilih.")
            .nullish(),
        provinsi: z
            .string({ required_error: "Provinsi tujuan wajib diisi." })
            .trim()
            .min(2, "Provinsi tidak valid."),
        kota: z
            .string({ required_error: "Kota/Kabupaten tujuan wajib diisi." })
            .trim()
            .min(2, "Kota/Kabupaten wajib diisi."),
        kecamatan: z
            .string({ required_error: "Kecamatan tujuan wajib diisi." })
            .trim()
            .min(2, "Kecamatan tujuan wajib diisi."),
        kelurahan: z.string().trim().nullish(),
        kode_pos: z
            .string({ required_error: "Kode pos wajib diisi." })
            .trim()
            .refine((val) => postalCodeRegex.test(val), {
                message: "Kode pos harus terdiri dari 5 digit angka.",
            }),

        // Kurir & Logistik
        kurir: z
            .string({ required_error: "Layanan kurir wajib dipilih." })
            .trim()
            .min(1, "Silakan pilih layanan kurir pengiriman."),
        layanan_kurir: z.string().trim().default("reguler"),
        ongkir: z.number().nonnegative("Ongkos kirim tidak valid."),
        asuransi_pengiriman: z.boolean().default(false),
        biaya_asuransi: z.number().nonnegative().default(0),

        // Metode Pembayaran (Midtrans / Gateway)
        metode_pembayaran: z
            .string({ required_error: "Metode pembayaran wajib dipilih." })
            .trim()
            .min(1, "Silakan pilih metode pembayaran."),

        // Ringkasan Keuangan
        subtotal: z.number().positive("Subtotal pesanan harus lebih dari 0."),
        total: z.number().nonnegative("Total pembayaran tidak valid."),
        kode_voucher: z.string().trim().nullish(),
        use_loyalty_point: z.boolean().default(false),
        catatan: z
            .string()
            .trim()
            .max(300, "Pesan pengiriman maksimal 300 karakter.")
            .nullish(),

        // Dropship Flag & Detail
        is_dropship: z.boolean().default(false),
        dropship_pengirim: z.string().trim().nullish(),
        dropship_telepon: z.string().trim().nullish(),

        // Keranjang Item
        items: z
            .array(orderItemSchema)
            .min(1, "Keranjang belanja tidak boleh kosong."),

        // Direct Checkout Meta
        buy_now_item: z.record(z.unknown()).nullish(),
    })
    // Validasi Independen: Nama Pengirim Dropship
    .refine(
        (data) => {
            if (data.is_dropship) {
                return Boolean(
                    data.dropship_pengirim &&
                    data.dropship_pengirim.trim().length >= 3,
                );
            }
            return true;
        },
        {
            message: "Nama pengirim dropship minimal 3 karakter.",
            path: ["dropship_pengirim"],
        },
    )
    // Validasi Independen: Nomor Handphone Dropship
    .refine(
        (data) => {
            if (data.is_dropship) {
                if (!data.dropship_telepon) return false;
                const cleanPhone = data.dropship_telepon.replace(
                    /[\s\-()]/g,
                    "",
                );
                return phoneRegex.test(cleanPhone);
            }
            return true;
        },
        {
            message:
                "Nomor HP pengirim dropship tidak valid (contoh: 08123456789).",
            path: ["dropship_telepon"],
        },
    );

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type OrderItemPayload = z.infer<typeof orderItemSchema>;
