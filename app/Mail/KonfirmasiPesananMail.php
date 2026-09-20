<?php

namespace App\Mail;

use App\Models\Pesanan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KonfirmasiPesananMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pesanan $pesanan
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Pembayaran Pesanan #' . $this->pesanan->nomor_pesanan,
        );
    }

    public function content(): Content
    {
        $totalFmt = 'Rp ' . number_format($this->pesanan->total, 0, ',', '.');

        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>
                    <h2 style='color: #10b981;'>Pembayaran Pesanan Berhasil!</h2>
                    <p>Terima kasih, pembayaran pesanan Anda <strong>#{$this->pesanan->nomor_pesanan}</strong> sebesar <strong>{$totalFmt}</strong> telah kami terima.</p>
                    <p>Pesanan Anda saat ini sedang disiapkan dan diproses untuk pengiriman kurir.</p>
                    <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin: 20px 0;'>
                        <p style='margin: 0; font-size: 13px;'>Status Pesanan: <strong style='color: #10b981;'>DIPROSES / AKAN DIKIRIM</strong></p>
                    </div>
                    <p>Salam hangat,<br><strong>Tim CRSL Merchandise Official</strong></p>
                </div>
            ",
        );
    }
}
