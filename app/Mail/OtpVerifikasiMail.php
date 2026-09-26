<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpVerifikasiMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $nama,
        public string $kodeOtp
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode OTP Verifikasi Akun CRSL Official Store',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;'>
                    <div style='text-align: center; margin-bottom: 24px;'>
                        <span style='font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -1px;'>&lt;CRSL&#x2022;</span>
                    </div>
                    <h2 style='color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 12px;'>Kode OTP Verifikasi Akun</h2>
                    <p style='font-size: 14px; line-height: 1.6;'>Halo <strong>{$this->nama}</strong>,</p>
                    <p style='font-size: 14px; line-height: 1.6;'>Terima kasih telah mendaftar di CRSL Official Store. Masukkan kode OTP 6-digit berikut untuk memverifikasi akun Anda:</p>
                    
                    <div style='background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 18px; text-align: center; border-radius: 14px; margin: 24px 0;'>
                        <span style='font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #e52027; font-family: monospace;'>{$this->kodeOtp}</span>
                    </div>

                    <p style='font-size: 13px; color: #64748b; line-height: 1.5;'>Kode OTP ini berlaku selama <strong>5 menit</strong>. Jangan pernah membagikan kode ini kepada siapa pun demi keamanan akun Anda.</p>
                    
                    <div style='margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;'>
                        &copy; " . date('Y') . " CRSL Official Store. Animals as your Bestfriends!
                    </div>
                </div>
            ",
        );
    }
}
