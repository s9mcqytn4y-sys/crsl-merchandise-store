<?php

declare(strict_types=1);

namespace App\Domains\Pengiriman\DTOs;

class RajaOngkirRateOption
{
    public function __construct(
        public string $kurirKode,
        public string $kurirNama,
        public string $layananKode,
        public string $layananNama,
        public int $harga,
        public string $etd,
        public string $logoUrl,
        public bool $isMock = false
    ) {}

    /**
     * Parsing dari format respons RajaOngkir API
     * response structure: $result['code'], $result['name'], $cost['service'], $cost['cost'][0]['value']
     */
    public static function fromRajaOngkir(string $courierCode, string $courierName, array $serviceData): self
    {
        $costDetail = $serviceData['cost'][0] ?? [];
        $harga = (int) ($costDetail['value'] ?? 0);
        $etdRaw = (string) ($costDetail['etd'] ?? '2-3');

        // Bersihkan teks etd jika kurir mengembalikan "1-2 HARI"
        $cleanEtd = trim(str_ireplace('hari', '', $etdRaw));
        $etd = !empty($cleanEtd) ? "{$cleanEtd} hari" : '2 - 3 hari';

        $serviceCode = strtolower((string) ($serviceData['service'] ?? 'reg'));

        return new self(
            kurirKode: strtolower($courierCode),
            kurirNama: strtoupper($courierName),
            layananKode: $serviceCode,
            layananNama: (string) ($serviceData['description'] ?? strtoupper($serviceCode)),
            harga: $harga,
            etd: $etd,
            logoUrl: "/assets/ikon/kurir-{$courierCode}.svg",
            isMock: false
        );
    }

    public function toArray(): array
    {
        return [
            'kurir_kode'    => $this->kurirKode,
            'kurir_nama'    => $this->kurirNama,
            'layanan_kode'  => $this->layananKode,
            'layanan_nama'  => $this->layananNama,
            'kurir_layanan' => $this->layananNama,
            'nama'          => "{$this->kurirNama} {$this->layananNama}",
            'layanan'       => $this->layananNama,
            'harga'         => $this->harga,
            'estimasi'      => $this->etd,
            'estimasi_hari' => $this->etd,
            'etd'           => $this->etd,
            'tipe'          => 'standard',
            'ikon'          => $this->logoUrl,
            'logo_url'      => $this->logoUrl,
            'is_mock'       => $this->isMock,
            'sumber'        => 'RajaOngkir API Resmi',
        ];
    }
}
