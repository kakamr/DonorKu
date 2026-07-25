# Donorku

Aplikasi manajemen donor darah berbasis web
Panel admin untuk mengelola jadwal donor, lokasi donor, data pendonor, riwayat donor, dan stok darah.

## Fitur

- **Autentikasi Admin** — login, lupa password dengan verifikasi OTP, reset password
- **Dashboard** — statistik donor bulanan, ringkasan stok darah, jadwal donor hari ini, distribusi usia pendonor
- **Jadwal Donor** — kelola jadwal donor (tambah/edit/hapus), filter berdasarkan tanggal & pencarian lokasi
- **Lokasi Donor** — kelola lokasi pelaksanaan donor darah
- **Daftar Pendonor** — data pendonor terdaftar, filter golongan darah & tanggal donor
- **Riwayat Donor** — riwayat donor yang sudah selesai, filter tanggal, ekspor ke Excel
- **Stok Darah** — pantau stok darah per golongan dengan indikator status (Aman / Menipis / Kritis)
- **Aturan & Tips** — kelola konten aturan dan tips seputar donor darah
- **Profil Admin** — edit profil dan ubah password

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | [Next.js](https://nextjs.org) 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| ORM | [Prisma](https://www.prisma.io) |
| Database | MySQL / MariaDB |
| Ikon | [lucide-react](https://lucide.dev) |
| Chart | [Recharts](https://recharts.org) |
| Ekspor data | [SheetJS (xlsx)](https://sheetjs.com) |

## Struktur Proyek

```
src/
├─ app/
│  ├─ login/, forgot-password/, reset-password/, verify-email/   # halaman autentikasi
│  ├─ api/                                                       # REST API routes
│  │  ├─ jadwal/, lokasi/, pendonor/, riwayat/, stok-darah/, aturan-tips/, auth/, admin/, ...
│  └─ dashboard/                                                 # halaman-halaman admin (perlu login)
│     ├─ jadwal/, lokasi/, pendonor/, riwayat/, stok-darah/, tips/, profile/
├─ components/                                                   # komponen reusable (Sidebar, DatePickerFilter, Pagination, dst)
└─ lib/                                                          # prisma client, mailer
prisma/
└─ schema.prisma                                                 # skema database
```

## Prasyarat

Sebelum mulai, pastikan sudah terpasang:

- [Node.js](https://nodejs.org) versi 18 ke atas
- npm (atau yarn/pnpm/bun)
- Server **MySQL** atau **MariaDB** yang aktif (lokal maupun remote)

## Cara Menjalankan (Development)

### 1. Clone repository

```bash
git clone <url-repo-anda>
cd donorku
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Lalu isi nilai variabelnya sesuai environment Anda. Contoh isi yang umumnya dibutuhkan proyek ini:

```env
# Koneksi database (dipakai Prisma)
DATABASE_URL="mysql://user:password@localhost:3306/donorku"

# Konfigurasi SMTP (untuk kirim OTP lupa password)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Secret untuk session/JWT
JWT_SECRET=
```

### 4. Setup database

Jalankan migrasi Prisma untuk menyiapkan skema database:

```bash
npx prisma generate
npx prisma migrate dev
```

Atau, kalau ingin memakai data yang sudah ada (import dari dump SQL):

```bash
mysql -u root -p donorku < donorku.sql
```

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Build untuk Production

```bash
npm run build
npm run start
```

## Belajar Lebih Lanjut

- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Dokumentasi Prisma](https://www.prisma.io/docs)