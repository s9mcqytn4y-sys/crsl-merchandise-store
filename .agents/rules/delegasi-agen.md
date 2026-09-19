# Aturan Delegasi Agen (Agent Delegation Rules) - CRSL Merchandise Store

Panduan alokasi peran, manajemen jendela konteks (context window), dan efisiensi eksekusi agen.

## 1. Prinsip Pembagian Peran
- **Tugas Arsitektur & Perencanaan Besar**: Libatkan persona `arsitek` untuk memetakan dampak perubahan skema database atau restrukturisasi modul sebelum menulis kode.
- **Tinjauan Kualitas & Keamanan**: Gunakan persona `peninjau-kode` dan `peninjau-keamanan` sebelum menyelesaikan tugas yang menyentuh logika pembayaran, autentikasi, atau input formulir.
- **Investigasi Error Rumit**: Delegasikan diagnosis ke persona `penyelesai-error` untuk menemukan akar masalah secara presisi tanpa coba-coba yang merusak kode lain.
- **Tugas Sederhana & Langsung**: Tangani secara langsung tanpa overhead delegasi berlebih untuk perbaikan tipografi, styling CSS minor, atau penyesuaian teks.

## 2. Pengelolaan Efisiensi Token dengan RTK
- **Gunakan RTK CLI Proxy**: Selalu prioritaskan perintah terminal yang dioptimasi oleh RTK untuk menghemat 60-90% token output (misalnya `rtk git status`, `rtk git diff`, `rtk gain`).
- **Prinsip "Fix Terkecil yang Aman"**: Implementasikan perubahan seminimal mungkin yang menyelesaikan masalah tanpa mengubah kode yang sudah berfungsi stabil di sekitarnya.

## 3. Disiplin Membaca Konteks
- Sebelum menulis kode atau merancang fitur baru, periksa Knowledge Items (KI) atau berkas `.agents/GEMINI.md`.
- Jika menemui ketidakjelasan spesifikasi yang memiliki dampak arsitektural besar, lakukan konfirmasi melalui wawancara terarah atau rencana implementasi tertulis.
