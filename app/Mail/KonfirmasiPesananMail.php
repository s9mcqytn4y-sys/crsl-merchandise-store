<?php

namespace App\Mail;

use App\Models\Pesanan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KonfirmasiPesananMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Pesanan $pesanan
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Pembayaran Pesanan #' . $this->pesanan->nomor_pesanan . ' - CRSL Official Store',
        );
    }

    public function content(): Content
    {
        $totalFmt = 'Rp ' . number_format($this->pesanan->total, 0, ',', '.');
        $kurirFmt = strtoupper($this->pesanan->kurir ?? 'JNE');

        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;'>
                    <div style='text-align: center; margin-bottom: 24px;'>
                        <span style='font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -1px;'>&lt;CRSL&#x2022;</span>
                    </div>
                    
                    <div style='text-align: center; margin-bottom: 24px;'>
                        <div style='display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 24px; background-color: #ecfdf5; color: #10b981; font-size: 24px;'>&#10003;</div>
                        <h2 style='color: #0f172a; font-size: 20px; font-weight: 800; margin: 12px 0 4px;'>Pembayaran Berhasil Diterima!</h2>
                        <p style='color: #64748b; font-size: 13px; margin: 0;'>Nomor Pesanan: <strong>#{$this->pesanan->nomor_pesanan}</strong></p>
                    </div>

                    <p style='font-size: 14px; line-height: 1.6;'>Terima kasih telah berbelanja di CRSL Official Store. Pembayaran sebesar <strong>{$totalFmt}</strong> telah kami verifikasi dengan sukses.</p>

                    <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;'>
                        <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>Status Pesanan:</td>
                                <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #10b981;'>DIPROSES</td>
                            </tr>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>Metode Pengiriman:</td>
                                <td style='padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a;'>{$kurirFmt}</td>
                            </tr>
                            <tr>
                                <td style='padding: 6px 0; color: #64748b;'>Total Pembayaran:</td>
                                <td style='padding: 6px 0; text-align: right; font-weight: 800; color: #e52027;'>{$totalFmt}</td>
                            </tr>
                        </table>
                    </div>

                    <p style='font-size: 13px; color: #64748b; line-height: 1.5;'>Pesanan Anda sedang disiapkan dengan teliti dan akan segera diserahkan ke pihak ekspedisi untuk pengiriman.</p>
                    
                    <div style='margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;'>
                        &copy; " . date('Y') . " CRSL Official Store. Animals as your Bestfriends!
                    </div>
                </div>
            ",
        );
    }
}
