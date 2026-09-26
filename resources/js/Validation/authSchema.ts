import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email wajib diisi.")
        .email("Format alamat email tidak valid."),
    password: z
        .string()
        .min(6, "Kata sandi minimal 6 karakter."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        nama: z
            .string()
            .min(3, "Nama lengkap minimal 3 karakter.")
            .max(100, "Nama terlalu panjang."),
        email: z
            .string()
            .min(1, "Email wajib diisi.")
            .email("Format alamat email tidak valid."),
        password: z
            .string()
            .min(8, "Kata sandi minimal 8 karakter."),
        password_confirmation: z
            .string()
            .min(8, "Konfirmasi kata sandi minimal 8 karakter."),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Konfirmasi kata sandi tidak cocok.",
        path: ["password_confirmation"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;
