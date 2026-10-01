<?php

declare(strict_types=1);

namespace App\Domains\Pengiriman\Jobs;

use App\Domains\Pengiriman\Services\BiteshipService;
use App\Models\ItemPesanan;
use App\Models\Pesanan;
use App\Models\PesananPengiriman;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AlokasiPengirimanBiteshipJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Jumlah percobaan maksimal jika terjadi error koneksi.
     */
    public int $tries = 3;

    /**
     * Timeout eksekusi per job (detik).
     */
    public int $timeout = 30;

    public function __construct(
        // PERBAIKAN: Ubah tipe data int menjadi string untuk mengakomodasi UUID pesanan
        public string $pesananId
    ) {}

    /**
     * Menjamin 1 pesanan hanya memiliki 1 job alokasi aktif di antrean.
     */
    public function uniqueId(): string
    {
        return $this->pesananId;
    }

    /**
     * Jeda waktu eksponensial antar percobaan (10 detik, 30 detik, 60 detik).
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function handle(BiteshipService $biteshipService): void
    {
        $pesanan = Pesanan::with(['pengguna'])->find($this->pesananId);
        if (!$pesanan) {
            Log::warning("[Biteship Job] Pesanan ID {$this->pesananId} tidak ditemukan.");
            return;
        }

        $pengiriman = PesananPengiriman::where('pesanan_id', $pesanan->id)->first();
        if (!$pengiriman) {
            Log::warning("[Biteship Job] Data pengiriman untuk Pesanan {$pesanan->nomor_pesanan} tidak ditemukan.");
            return;
        }

        // Guard Idempotensi: Lewati jika order Biteship sudah berhasil dibooking sebelumnya
        if (!empty($pengiriman->biteship_order_id) && $pengiriman->tracking_status !== 'allocated') {
            Log::info("[Biteship Job] Pesanan {$pesanan->nomor_pesanan} sudah memiliki waybill: {$pengiriman->nomor_resi}");
            return;
        }

        $savedAddress = is_array($pengiriman->json_payload) ? $pengiriman->json_payload : [];

        $items = ItemPesanan::where('pesanan_id', $pesanan->id)
            ->with('produk')
            ->get()
            ->map(function ($item) {
                $berat = (int) ($item->produk->berat_gram ?? 250);
                return [
                    'name'     => $item->nama_produk,
                    'value'    => (int) $item->harga,
                    'quantity' => $item->jumlah,
                    'weight'   => $berat > 0 ? $berat : 250,
                ];
            })
            ->toArray();

        $dataBiteship = [
            'area_id'           => $savedAddress['area_id'] ?? $savedAddress['biteship_area_id'] ?? 'IDNP5IDNC412IDND5043IDZ55281',
            'nama_penerima'     => $savedAddress['nama_penerima'] ?? ($pesanan->pengguna->name ?? 'Pelanggan'),
            'telepon'           => $savedAddress['telepon'] ?? '081234567890',
            'alamat_lengkap'    => $savedAddress['alamat_lengkap'] ?? '',
            'kode_pos'          => $savedAddress['kode_pos'] ?? '55281',
            'kurir'             => strtolower($pengiriman->kurir ?? 'jne'),
            'layanan'           => strtolower($pengiriman->layanan ?? 'reg'),
            'items'             => $items,
            'is_dropship'       => (bool) $pesanan->is_dropship,
            'dropship_pengirim' => $pesanan->dropship_pengirim,
            'dropship_telepon'  => $pesanan->dropship_telepon,
        ];

        $resBiteship = $biteshipService->buatOrderPengiriman($dataBiteship);

        if (empty($resBiteship['sukses'])) {
            throw new \RuntimeException($resBiteship['pesan'] ?? 'Gagal membuat order pengiriman di Biteship');
        }

        $pengiriman->biteship_order_id = $resBiteship['biteship_order_id'] ?? null;
        $pengiriman->biteship_tracking_id = $resBiteship['biteship_tracking_id'] ?? null;
        $pengiriman->biteship_waybill_id = $resBiteship['biteship_waybill_id'] ?? $resBiteship['waybill_id'] ?? null;
        $pengiriman->tracking_url = $resBiteship['tracking_url'] ?? null;
        $pengiriman->nomor_resi = !empty($resBiteship['waybill_id'])
            ? $resBiteship['waybill_id']
            : (strtoupper($pengiriman->kurir ?? 'JNE') . '-' . date('Ymd') . '-' . strtoupper(Str::random(6)));
        $pengiriman->tracking_status = $resBiteship['status'] ?? 'allocated';
        $pengiriman->json_payload = array_merge($savedAddress, ['biteship_response' => $resBiteship]);
        $pengiriman->save();

        Log::info("[Biteship Job Success] Resi {$pengiriman->nomor_resi} (Tracking ID: {$pengiriman->biteship_tracking_id}) berhasil diterbitkan untuk {$pesanan->nomor_pesanan}");
    }

    /**
     * Fallback jika seluruh retry gagal dilakukan.
     */
    public function failed(?Throwable $exception): void
    {
        Log::critical("[Biteship Job Dead-Letter] Gagal alokasi kurir untuk Pesanan ID {$this->pesananId}: " . $exception?->getMessage());
    }
}
