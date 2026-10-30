# ArsipinAja 🎓📂
> **"Biar Kuliah Nggak Berantakan."**  
> *Academic Document Archive & Task Management Platform untuk Mahasiswa.*

ArsipinAja adalah platform multi-user berbasis web untuk mahasiswa yang mengintegrasikan pengarsipan dokumen kuliah bertingkat (Google Drive-style), pemantau deadline tugas interaktif, kalender akademik, dan sistem pengingat otomatis ke smartphone via **Telegram Bot API**.

Aplikasi didesain khusus mengacu pada identitas visual **Nyonyo Channel Retro Graphic Design**: typography playful & rounded, palet warna berani (*Primary Yellow*, *Vibrant Green*, *Accent Pink*, *Sky Blue*, *Cream*), border brutalist tebal, browser window chrome, hard shadow, dan pembatas checkerboard retro.

---

## 🎨 Visual Identity & Design Tokens

Mengacu langsung pada visual referensi:
- **Primary Yellow**: `#FFE500`
- **Primary Green**: `#00A968`
- **Accent Pink**: `#F381A6`
- **Accent Blue**: `#3989C5`
- **Cream Surface**: `#FFF0D9`
- **Background**: `#FFF9EF`
- **Border & Text**: `#171717` (2px - 3px solid outline)
- **Hard Shadow**: `4px 4px 0px #171717` (`shadow-retro`)

---

## 🚀 Tech Stack

### Frontend:
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Brutalist/Retro Tokens
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Forms & Validation**: React Hook Form + Zod
- **Date Handling**: date-fns (Asia/Jakarta / WIB)

### Backend & Cloud Services:
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Cloud Firestore
- **File Storage**: Cloudflare R2 Object Storage
- **Serverless API**: Cloudflare Workers (`workers/storage-worker/`)
- **Notification Scheduler & Webhook**: Cloudflare Workers Cron Trigger + Telegram Bot API (`workers/notification-worker/`)
- **Offline / Local Fallback**: IndexedDB Blob persistence engine (menjamin preview & download file berfungsi 100% saat pengujian lokal)

---

## 📂 Struktur Proyek

```
arsipinaja/
├── public/                 # Favicon dan static assets
├── src/
│   ├── components/
│   │   ├── layout/         # AppLayout, Sidebar, Header
│   │   └── ui/             # WindowCard, RetroButton, RetroModal, Mascots, Breadcrumbs
│   ├── contexts/           # AuthContext, ToastContext
│   ├── pages/
│   │   ├── admin/          # Admin Dashboard (User & Storage Management)
│   │   ├── archive/        # Smart Academic Archive (Folders, Files, Upload, Preview)
│   │   ├── auth/           # Login Page
│   │   ├── calendar/       # Calendar Page (Month/Week/Day Deadline View)
│   │   ├── dashboard/      # Main Dashboard
│   │   ├── favorites/      # Starred Documents & Folders
│   │   ├── settings/       # Profile, Telegram Connect Flow & Preferences
│   │   ├── shared/         # Classmate Shared Documents
│   │   └── trash/          # Trash (Restore & Permanent Delete)
│   ├── services/
│   │   ├── auth/           # AuthService
│   │   ├── firebase/       # Firebase Config & App Init
│   │   ├── firestore/      # ArchiveService & TaskService
│   │   ├── storage/        # StorageService & IndexedDB Blob Store
│   │   └── telegram/       # TelegramService (6-digit verification & reminders)
│   ├── types/              # TypeScript Models & Interfaces
│   ├── routes/             # AppRoutes & ProtectedRoute Guard
│   ├── App.tsx             # Provider Wrapping
│   └── main.tsx            # Entry Point
├── workers/
│   ├── storage-worker/     # Cloudflare Worker for R2 API
│   └── notification-worker/# Cloudflare Worker for Telegram Cron & Webhook
├── firestore.rules         # Production Firestore Security Rules
├── .env.example            # Environment Variables Template
└── package.json
```

---

## ⚡ Cara Menjalankan Aplikasi Secara Lokal

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npx vite --port 5173
```
Buka browser di: [http://localhost:5173](http://localhost:5173)

### 3. Akun Demo untuk Pengujian Cepat
Pada halaman login, tersedia tombol akses instan 1-klik:
- **Akun Mahasiswa**: `budi.santoso@mahasiswa.ac.id` (Password: `password123`)
  - Semester 3 Teknik Informatika
  - Akses folder perkuliahan Semester 1 & 2
  - Manajemen tugas, checklist, dan kalender
- **Akun Administrator**: `admin@arsipinaja.id` (Password: `password123`)
  - Manajemen seluruh akun mahasiswa (buat akun, nonaktifkan, reset password)
  - Statistik kuota storage Cloudflare R2
  - Batasan isolasi zero-knowledge terhadap dokumen pribadi mahasiswa

---

## 🔧 Konfigurasi Layanan Eksternal (Production Setup)

### 1. Konfigurasi Firebase (`.env`)
Salin file `.env.example` menjadi `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=arsipinaja.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=arsipinaja-prod
VITE_FIREBASE_STORAGE_BUCKET=arsipinaja-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

Deploy aturan keamanan Firestore:
```bash
firebase deploy --only firestore:rules
```

### 2. Konfigurasi Cloudflare R2 & Storage Worker
1. Buat bucket di Cloudflare Dashboard: `arsipinaja-documents`.
2. Masuk ke folder `workers/storage-worker/`:
   ```bash
   cd workers/storage-worker
   npx wrangler secret put FIREBASE_PROJECT_ID
   npx wrangler deploy
   ```
3. Masukkan URL Worker yang didapat ke `.env`:
   ```env
   VITE_CLOUDFLARE_WORKER_URL=https://arsipinaja-storage-worker.<subdomain>.workers.dev
   ```

### 3. Konfigurasi Telegram Bot API & Notification Worker
1. Hubungi `@BotFather` di Telegram, buat bot baru (contoh: `@ArsipinAjaBot`), dan simpan Bot Token.
2. Masuk ke folder `workers/notification-worker/`:
   ```bash
   cd workers/notification-worker
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler deploy
   ```
3. Set Webhook Telegram ke worker:
   ```bash
   curl -F "url=https://arsipinaja-notification-worker.<subdomain>.workers.dev" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
   ```
4. Di aplikasi web:
   - Buka menu **Settings** -> **Bot Telegram**.
   - Klik **Hubungkan Telegram** untuk mendapatkan 6-digit kode verifikasi unik (masa berlaku 15 menit).
   - Kirimkan kode tersebut ke bot Telegram. Status akan langsung berubah menjadi **TERHUBUNG**!

---

## 🔒 Fitur Keamanan & Reliabilitas
- **Zero Public Registration**: Seluruh akun mahasiswa dibuat resmi oleh Administrator Kampus via server.
- **Data Isolation**: Firestore Security Rules membatasi akses baca/tulis hanya pada `userId` pemilik dokumen.
- **Private Cloudflare R2**: Tidak ada bucket publik; seluruh download & preview divalidasi melalui token.
- **Zero Broken Buttons**: Mode offline lokal menggunakan IndexedDB Blobs sehingga upload, download, dan preview file bekerja langsung tanpa dependensi luar yang terputus.

---
*ArsipinAja © 2026 — Biar Kuliah Nggak Berantakan.*
