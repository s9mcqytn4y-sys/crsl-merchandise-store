<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Services\AuthService;

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
