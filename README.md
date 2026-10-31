# ArsipinAja 💙📂
> **"Biar Kuliah & Belajar Kita Berdua Nggak Berantakan."**  
> *Private Couple Study Archive & Task Management Platform.*

ArsipinAja adalah platform arsip materi kuliah dan manajemen tugas yang dibuat khusus untuk kita berdua. Memungkinkan menyimpan slide dosen, PDF buku, catatan kuliah, mengatur tugas bersama, memantau deadline tugas kuliah, dan menerima pengingat otomatis langsung ke smartphone via **Telegram Bot API**.

Aplikasi didesain menggunakan identitas retro-neo-brutalist dengan **100% Keluarga Warna Biru** (Royal Blue, Deep Navy, Retro Sky Blue, Electric Cyan, Soft Ice Blue), border tegas, hard shadow retro, dan tipografi yang modern serta nyaman dipandang.

---

## 🎨 Visual Identity & Blue Family Design Tokens

Mengacu pada palet warna serasi keluarga biru:
- **Primary Royal Blue**: `#2563EB`
- **Deep Navy**: `#1E3A8A`
- **Retro Sky Blue**: `#38BDF8`
- **Electric Cyan**: `#0EA5E9`
- **Soft Ice Blue**: `#E0F2FE`
- **Canvas Background**: `#F0F7FF`
- **Border & Ink**: `#171717` (2px - 3px solid brutalist outline)
- **Hard Shadow**: `4px 4px 0px #171717` (`shadow-retro`) / `shadow-retro-navy`

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

## 🧪 Panduan Pengujian Fitur
Seluruh panduan langkah demi langkah pengujian fitur (Mahasiswa & Admin) beserta checklist uji dapat dibaca di:
👉 **[PANDUAN_PENGUJIAN_FITUR.md](file:///d:/personal%20project/arsipinaja/TESTING_FITUR.md)**

---
*ArsipinAja © 2026 — Biar Kuliah Nggak Berantakan.*
