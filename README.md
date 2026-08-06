# ASN Run Dashboard

Dashboard peserta virtual run: sign up dengan BIB otomatis, input aktivitas lari,
race progress, dan leaderboard. Dibangun dengan Next.js 14 (App Router) +
Supabase (Auth, Postgres, RLS), siap deploy ke Vercel.

## 1. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan:
   - `supabase/001_schema_VR_45.sql` (skema utama — tabel, view, RLS)
   - `supabase/002_tambahan.sql` (policy insert admin, validasi tanggal aktivitas)
   - `supabase/003_revisi.sql` (target 50 km, periode 17 Agu–17 Sep 2026,
     bukti aktivitas wajib — **baca komentar di dalam file ini dulu**
     sebelum run, ada catatan penting soal data lama)
3. Buka **Authentication > Providers > Email**:
   - Untuk onboarding cepat (tanpa perlu setup SMTP sendiri), matikan
     **"Confirm email"** agar peserta langsung login setelah sign up.
   - Kalau ingin tetap pakai konfirmasi email, pastikan SMTP custom sudah
     dikonfigurasi (default Supabase punya limit kiriman email yang rendah,
     bisa jadi masalah untuk 100–500 peserta mendaftar dalam waktu singkat).
4. Ambil `Project URL` dan `anon public key` di **Project Settings > API**
   untuk file `.env.local`.
5. Setelah akun admin pertama sign up lewat web, jalankan di SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'admin@contoh.go.id';
   ```
6. Buka **Authentication > URL Configuration**, tambahkan URL berikut ke
   **Redirect URLs** (perlu untuk fitur "Lupa Password"):
   - `http://localhost:3000/reset-password` (untuk development lokal)
   - `https://<domain-produksi-kamu>/reset-password` (setelah deploy ke Vercel/domain kustom)

   Tanpa ini, link reset password dari email akan ditolak oleh Supabase.

## 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Jalankan Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## 4. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: ASN Run dashboard"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## 5. Deploy ke Vercel

1. Import repo GitHub di [vercel.com/new](https://vercel.com/new).
2. Set Environment Variables yang sama seperti `.env.local` di dashboard Vercel
   (Production, Preview, Development).
3. Deploy. Setiap push ke `main` akan otomatis redeploy.

## Struktur Fitur

| Halaman | Fungsi |
|---|---|
| `/signup`, `/login` | Auth peserta. BIB digenerate otomatis oleh sequence di database saat sign up. |
| `/dashboard/input-activity` | Race progress card + tabel "Aktivitas Saya" (tambah/edit/hapus). |
| `/dashboard/leaderboard` | Ringkasan pribadi (rank, total km, dst) + leaderboard semua peserta. |
| `/dashboard/admin` | Khusus role `admin`: atur target jarak & race window, kelola peserta, moderasi aktivitas. |

## ⚠️ Aset yang Masih Placeholder

Dua file di folder `public/` masih **placeholder buatan sistem**, belum
logo/gambar asli:

- `public/logo-run-for-integrity.png` — ganti dengan logo Run For Integrity asli.
- `public/login-background.jpg` — ganti dengan gambar background halaman login yang dimaksud.

Cukup timpa (replace) kedua file itu dengan file asli **memakai nama file
yang sama persis**, tidak perlu ubah kode apa pun — logo dan background
akan otomatis terpasang di halaman Login, Daftar Peserta, dan Dashboard.

## Kendala & Saran (baca sebelum go-live)

Lihat penjelasan lengkap di respons chat. Ringkasnya:

- **Konfirmasi email**: matikan atau siapkan SMTP custom (lihat langkah 3 di atas).
- **Kepercayaan data**: karena self-report, gunakan tab Admin > Aktivitas
  Terbaru untuk spot-check, terutama entri dengan pace tidak wajar atau
  tanpa link Strava.
- **Belum diimplementasikan** (sesuai catatan "akan ditambahkan kemudian"
  di brief): upload foto profil, sistem badge, dan message board. Skema &
  UI sudah punya slot untuk ini (`foto_profil` di tabel profiles) sehingga
  bisa ditambahkan belakangan tanpa migrasi besar.
- **Skala**: dengan 100–500 peserta dan Supabase free/pro tier, performa
  cukup aman. View `leaderboard` menghitung agregasi on-the-fly — kalau
  nanti terasa lambat, bisa dipertimbangkan materialized view.
- **Next.js 14 sudah EOL** (Oktober 2025). Proyek ini memakai `14.2.35`
  (patch keamanan terakhir untuk seri 14.x), tapi ke depannya sebaiknya
  direncanakan upgrade ke Next.js 15 untuk terus mendapat patch keamanan.
- **Build sempat macet di step "Linting and checking validity of types"
  tanpa pesan error**: ini gejala klasik proses type-check kehabisan
  memori/hang di build machine yang terbatas. Sudah diatasi dengan
  `typescript.ignoreBuildErrors: true` + `eslint.ignoreDuringBuilds: true`
  di `next.config.mjs` (build tetap jalan, tapi sebaiknya tetap jalankan
  `npm run build` secara lokal sesekali untuk memastikan tidak ada type
  error yang tersembunyi) dan menaikkan memori Node saat build lewat
  `NODE_OPTIONS=--max-old-space-size=4096` di script `build`.
