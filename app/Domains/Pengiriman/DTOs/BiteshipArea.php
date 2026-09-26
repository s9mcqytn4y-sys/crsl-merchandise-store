<?php

namespace App\Domains\Pengiriman\DTOs;

class BiteshipArea
{
    public function __construct(
        public string $id,
        public string $nama,
        public string $negara,
        public string $provinsi,
        public string $kota,
        public string $kecamatan,
        public ?string $kelurahan = null,
        public ?string $kodePos = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? '',
            nama: $data['name'] ?? '',
            negara: $data['country_name'] ?? 'Indonesia',
            provinsi: $data['administrative_division_level_1_name'] ?? '',
            kota: $data['administrative_division_level_2_name'] ?? '',
            kecamatan: $data['administrative_division_level_3_name'] ?? '',
            kelurahan: $data['administrative_division_level_4_name'] ?? null,
            kodePos: (string)($data['postal_code'] ?? ''),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'negara' => $this->negara,
            'provinsi' => $this->provinsi,
            'kota' => $this->kota,
            'kecamatan' => $this->kecamatan,
            'kelurahan' => $this->kelurahan,
            'kode_pos' => $this->kodePos,
        ];
    }
}
