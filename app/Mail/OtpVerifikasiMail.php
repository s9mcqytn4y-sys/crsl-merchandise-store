<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpVerifikasiMail extends Mailable
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
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #1e293b;'>
                    <h2 style='color: #e52027;'>Kode OTP Verifikasi Akun CRSL Store</h2>
                    <p>Halo <strong>{$this->nama}</strong>,</p>
                    <p>Terima kasih telah mendaftar di CRSL Official Store. Berikut adalah kode verifikasi 6 digit Anda:</p>
                    <div style='background-color: #f8fafc; border: 2px border #cbd5e1; padding: 15px; text-align: center; border-radius: 12px; margin: 20px 0;'>
                        <span style='font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e52027;'>{$this->kodeOtp}</span>
                    </div>
                    <p style='font-size: 12px; color: #64748b;'>Kode OTP ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
                    <p>Salam hangat,<br><strong>Tim CRSL Merchandise Official</strong></p>
                </div>
            ",
        );
    }
}
