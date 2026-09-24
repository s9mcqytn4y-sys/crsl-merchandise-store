<?php

use App\Http\Controllers\AkunController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BerandaController;
use App\Http\Controllers\KatalogController;
use App\Http\Controllers\KeranjangController;
use App\Http\Controllers\MidtransWebhookController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PesananController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

// Storefront Beranda
Route::get('/', [BerandaController::class, 'index'])->name('beranda');

// Katalog & Detail Produk
Route::get('/katalog', [KatalogController::class, 'index'])->name('katalog');
Route::get('/produk/{slug}', [KatalogController::class, 'detail'])->name('produk.detail');

// Manajemen Keranjang Belanja (Session)
Route::post('/keranjang', [KeranjangController::class, 'tambah'])->name('keranjang.tambah');
Route::put('/keranjang/{id}', [KeranjangController::class, 'perbarui'])->name('keranjang.perbarui');
Route::delete('/keranjang/{id}', [KeranjangController::class, 'hapus'])->name('keranjang.hapus');
Route::delete('/keranjang', [KeranjangController::class, 'kosongkan'])->name('keranjang.kosongkan');

// Pembayaran & Pesanan Baru
Route::get('/pembayaran', [PembayaranController::class, 'index'])->name('pembayaran.index');
Route::post('/pembayaran', [PembayaranController::class, 'proses'])->name('pembayaran.proses');

// Faktur & Lacak Pesanan
Route::get('/faktur/{nomorPesanan}', [PesananController::class, 'faktur'])->name('faktur');
Route::get('/lacak', [PesananController::class, 'lacak'])->name('lacak');

// Akun Pelanggan & Wishlist (Mendukung path /akun dan /account)
Route::get('/akun', [AkunController::class, 'index'])->name('akun');
Route::get('/account', [AkunController::class, 'index'])->name('account');
Route::post('/wishlist/toggle', [AkunController::class, 'toggleWishlist'])->name('wishlist.toggle');

// API Wilayah & Biteship Shipping
Route::get('/api/wilayah/cari', [WilayahController::class, 'cari'])->name('api.wilayah.cari');
Route::post('/api/wilayah/ongkir', [WilayahController::class, 'ongkir'])->name('api.wilayah.ongkir');

// API Voucher, Webhook Midtrans & Status Realtime
Route::post('/api/voucher/validasi', [PembayaranController::class, 'validasiVoucher'])->name('api.voucher.validasi');
Route::post('/api/midtrans/webhook', [MidtransWebhookController::class, 'handle'])->name('api.midtrans.webhook');
Route::get('/api/pesanan/{nomorPesanan}/status', [PesananController::class, 'cekStatusRealtime'])->name('api.pesanan.status');

// Autentikasi & Akun
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/otp/verifikasi', [AuthController::class, 'verifyOtp'])->name('otp.verifikasi');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
Route::post('/profil/hapus-akun', [AuthController::class, 'hapusAkun'])->name('profil.hapus-akun');
