<?php

namespace App\Domains\Autentikasi\Actions;

use App\Domains\Autentikasi\Services\AuthService;

class VerifikasiOtpAction
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function execute(string $email, string $otpCode): array
    {
        return $this->authService->verifyOtp($email, $otpCode);
    }
}
