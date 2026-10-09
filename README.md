# Delcom Cash Flow — Nuxt

SPA pencatatan arus kas yang dibuat dengan Nuxt 4, TypeScript, Pinia, Tailwind CSS v4, dan Delcom Open API.

## Persiapan

- [Bun](https://bun.sh/) versi 1.2 atau lebih baru.
- Akun Delcom Open API untuk masuk dan mencatat transaksi.

## Instalasi dan pengembangan

```bash
bun install
bun run dev
```

Buka `http://localhost:3000`. Perintah pertama mengunduh dependensi berdasarkan `bun.lock`.

## Konfigurasi

Pengaturan bawaan berada di `.env.example`:

```env
APP_PORT=3000
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
```

Untuk API atau port lain, salin `.env.example` menjadi `.env` lokal dan ubah nilainya. Jangan commit kredensial atau token. Token masuk tersimpan di `localStorage` peramban.

## Integrasi Delcom Open API

Aplikasi mengirim permintaan langsung dari peramban ke `VITE_DELCOM_BASEURL`. Masuk, daftar, dan pemulihan sesi menggunakan endpoint autentikasi/pengguna; operasi transaksi, statistik, profil, foto, dan kata sandi memakai endpoint Delcom yang sesuai. Permintaan terlindungi otomatis menyertakan access token sebagai Bearer token, sedangkan unggah foto dikirim sebagai `multipart/form-data`.

Buat akun melalui halaman **Daftar sekarang** atau masuk dengan akun Delcom yang sudah ada. Keterangan transaksi wajib diisi agar sesuai kontrak API. API memerlukan koneksi internet; kegagalan jaringan, kredensial, atau validasi ditampilkan di antarmuka. Jangan memasukkan token atau kata sandi API ke berkas konfigurasi maupun commit.

## Perintah

```bash
bun run dev
bun run typecheck
bun run test
bun run test:coverage
bun run build
bun run start
```

`bun run test:coverage` memverifikasi 100% coverage untuk API helper, helper format/notifikasi, dan composable input. `bun run start` menjalankan versi hasil build menggunakan nilai `APP_PORT` dari `.env`.

## Fitur

- Daftar/masuk, validasi input, pemulihan sesi, rute terproteksi, dan logout melalui Delcom API.
- Ringkasan pemasukan, pengeluaran, saldo per sumber, statistik mingguan, pencarian, dan filter transaksi.
- Tambah, lihat, ubah, dan hapus transaksi; termasuk reset seluruh transaksi dengan konfirmasi.
- Direktori pengguna, pengaturan profil, unggah foto, dan ubah kata sandi.
- Responsif, antarmuka berbahasa Indonesia, serta format Rupiah dan tanggal lokal.
