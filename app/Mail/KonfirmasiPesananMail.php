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
        $isLocal = app()->isLocal() || config('services.midtrans.is_production') === false;

        $sandboxBanner = $isLocal ? "
            <div style='background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; color: #92400e; line-height: 1.4;'>
                <strong>Sandbox Testing Mode:</strong> Email ini dikirim otomatis oleh simulator sistem integrasi CRSL Store v2 (Midtrans Sandbox / Local Development).
            </div>
        " : "";

        return new Content(
            htmlString: "
                <div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0f172a; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);'>
                    {$sandboxBanner}
                    
                    <div style='text-align: center; margin-bottom: 28px;'>
                        <span style='font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px;'>CRSL STORE</span>
                        <div style='font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;'>Animals as your bestfriends</div>
                    </div>
                    
                    <div style='text-align: center; margin-bottom: 28px;'>
                        <div style='display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 26px; background-color: #ecfdf5; color: #10b981; font-size: 26px; font-weight: bold;'>&#10003;</div>
                        <h2 style='color: #0f172a; font-size: 22px; font-weight: 800; margin: 16px 0 6px;'>Pembayaran Berhasil Diverifikasi!</h2>
                        <p style='color: #64748b; font-size: 13px; margin: 0;'>Nomor Invoice: <strong>#{$this->pesanan->nomor_pesanan}</strong></p>
                    </div>

                    <p style='font-size: 14px; line-height: 1.6; color: #334155;'>Halo Adopter CRSL, pembayaran pesanan Anda sebesar <strong style='color: #0f172a;'>{$totalFmt}</strong> telah kami terima secara langsung melalui payment gateway resmi Midtrans.</p>

                    <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 24px 0;'>
                        <table style='width: 100%; font-size: 13px; border-collapse: collapse;'>
                            <tr>
                                <td style='padding: 8px 0; color: #64748b;'>Status Pesanan:</td>
                                <td style='padding: 8px 0; text-align: right; font-weight: 800; color: #10b981;'>SIAP DIKIRIM (PAID)</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px 0; color: #64748b;'>Jasa Ekspedisi:</td>
                                <td style='padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a;'>{$kurirFmt}</td>
                            </tr>
                            <tr>
                                <td style='padding: 8px 0; color: #64748b;'>Total Transaksi:</td>
                                <td style='padding: 8px 0; text-align: right; font-weight: 900; color: #e52027; font-size: 15px;'>{$totalFmt}</td>
                            </tr>
                        </table>
                    </div>

                    <div style='text-align: center; margin: 28px 0;'>
                        <a href='" . url('/faktur/' . urlencode($this->pesanan->nomor_pesanan)) . "' style='display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;'>Lihat Faktur & Lacak Pengiriman &rarr;</a>
                    </div>

                    <p style='font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 0;'>Pesanan Anda sedang dipersiapkan oleh tim fulfillment CRSL di Sleman, D.I. Yogyakarta. Nomor resi pengiriman akan otomatis terbit saat paket diserahkan ke kurir.</p>
                    
                    <div style='margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;'>
                        &copy; " . date('Y') . " CRSL Official Store. Sleman, D.I. Yogyakarta, Indonesia.
                    </div>
                </div>
            ",
        );
    }
}
