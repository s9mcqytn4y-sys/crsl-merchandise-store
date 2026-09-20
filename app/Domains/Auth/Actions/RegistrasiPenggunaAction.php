<?php

namespace App\Domains\Auth\Actions;

use App\Domains\Auth\Services\AuthService;

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
