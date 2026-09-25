<?php

use App\Http\Controllers\AkunController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\BundleController;
use App\Http\Controllers\KatalogController;
use App\Http\Controllers\KeranjangController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

// Storefront Beranda
Route::get('/', [BerandaController::class, 'index'])->name('beranda');

// Paket Bundle BTS (crsl-store.id/bundles/{id}/{slug})
Route::get('/bundles/{id}/{slug?}', [BundleController::class, 'show'])->name('bundles.show');
Route::redirect('/paket/{id}/{slug?}', '/bundles/{id}/{slug?}', 301);

// Katalog & Detail Produk (crsl-store.id/products/{slug})
Route::get('/katalog', [KatalogController::class, 'index'])->name('katalog');
Route::get('/products/{slug}', [KatalogController::class, 'detail'])->name('products.detail');
Route::get('/produk/{slug}', [KatalogController::class, 'detail'])->name('produk.detail');

// Manajemen Keranjang Belanja (Session)
Route::post('/keranjang', [KeranjangController::class, 'tambah'])->name('keranjang.tambah');
Route::put('/keranjang/{id}', [KeranjangController::class, 'perbarui'])->name('keranjang.perbarui');
Route::delete('/keranjang/{id}', [KeranjangController::class, 'hapus'])->name('keranjang.hapus');
Route::delete('/keranjang', [KeranjangController::class, 'kosongkan'])->name('keranjang.kosongkan');

// Pembayaran & Pesanan Baru (Mendukung /pembayaran dan /checkout)
Route::get('/pembayaran', [PembayaranController::class, 'index'])->name('pembayaran.index');
Route::post('/pembayaran', [PembayaranController::class, 'proses'])->name('pembayaran.proses');
Route::get('/checkout', [PembayaranController::class, 'index'])->name('checkout');
Route::post('/checkout', [PembayaranController::class, 'proses'])->name('checkout.proses');

// Faktur & Lacak Pesanan
Route::get('/faktur/{nomorPesanan}', [PesananController::class, 'faktur'])->name('faktur');
Route::get('/lacak', [PesananController::class, 'lacak'])->name('lacak');

// Akun Pelanggan & Wishlist (crsl-store.id/account & /profile/myinfo)
Route::redirect('/akun', '/account', 301);
Route::get('/account', [AkunController::class, 'index'])->name('account');
Route::redirect('/profil/myinfo', '/profile/myinfo', 301);
Route::get('/profile/myinfo', [AkunController::class, 'myinfo'])->name('profile.myinfo');
Route::post('/profil/perbarui', [AkunController::class, 'perbaruiProfil'])->name('profil.perbarui');
Route::post('/wishlist/toggle', [AkunController::class, 'toggleWishlist'])->name('wishlist.toggle');

// API Wilayah & Biteship Shipping
Route::get('/api/wilayah/cari', [WilayahController::class, 'cari'])->name('api.wilayah.cari');
Route::post('/api/wilayah/ongkir', [WilayahController::class, 'ongkir'])->name('api.wilayah.ongkir');

// API Voucher, Webhook Midtrans & Status Realtime
Route::post('/api/voucher/validasi', [PembayaranController::class, 'validasiVoucher'])->name('api.voucher.validasi');
Route::post('/api/midtrans/webhook', [MidtransWebhookController::class, 'handle'])->name('api.midtrans.webhook');
Route::post('/api/webhooks/midtrans', [MidtransWebhookController::class, 'handle'])->name('api.webhooks.midtrans');
Route::get('/api/pesanan/{nomorPesanan}/status', [PesananController::class, 'cekStatusRealtime'])->name('api.pesanan.status');

// Autentikasi & Akun
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/otp/verifikasi', [AuthController::class, 'verifyOtp'])->name('otp.verifikasi');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/profil/hapus-akun', [AuthController::class, 'hapusAkun'])->name('profil.hapus-akun');
