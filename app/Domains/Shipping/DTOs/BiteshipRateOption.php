<?php

namespace App\Domains\Shipping\DTOs;

class BiteshipRateOption
{
    public function __construct(
        public string $kurirKode,
        public string $kurirNama,
        public string $layananKode,
        public string $layananNama,
        public float $harga,
        public string $estimasiHari,
        public ?string $logoUrl = null,
    ) {}

    public static function fromArray(array $data): self
    {
        $courierCode = strtolower($data['courier_code'] ?? 'jne');
        $serviceCode = strtolower($data['courier_service_code'] ?? 'reg');

        return new self(
            kurirKode: $courierCode,
            kurirNama: $data['courier_name'] ?? strtoupper($courierCode),
            layananKode: $serviceCode,
            layananNama: $data['courier_service_name'] ?? strtoupper($serviceCode),
            harga: (float)($data['price'] ?? 0),
            estimasiHari: (string)($data['duration'] ?? '2-3 Hari'),
            logoUrl: "/assets/ikon/shipment-{$courierCode}.svg",
        );
    }

    public function toArray(): array
    {
        return [
            'kurir_kode' => $this->kurirKode,
            'kurir_nama' => $this->kurirNama,
            'layanan_kode' => $this->layananKode,
            'layanan_nama' => $this->layananNama,
            'harga' => $this->harga,
            'estimasi_hari' => $this->estimasiHari,
            'logo_url' => $this->logoUrl,
            'ikon' => $this->logoUrl,
        ];
    }
}
