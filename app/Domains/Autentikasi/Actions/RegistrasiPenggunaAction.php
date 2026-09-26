<?php

namespace App\Domains\Autentikasi\Actions;

use App\Domains\Autentikasi\Services\AuthService;

class RegistrasiPenggunaAction
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function execute(array $dataInput): array
    {
        return $this->authService->register($dataInput);
    }
}
