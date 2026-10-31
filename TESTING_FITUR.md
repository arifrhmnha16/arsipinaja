# 🧪 Panduan Pengujian Fitur ArsipinAja (Feature Testing Guide)
> **Platform**: ArsipinAja — Ruang Arsip Kuliah & Tugas Berdua  
> **Aestetik**: 100% Blue Family Palette Retro-Neo-Brutalist (Royal Blue, Deep Navy, Sky Blue, Ice Blue)  
> **Status**: Full-Stack Live Integration (Firebase Auth, Cloud Firestore, Cloudflare R2, Telegram Bot API)

Dokumen ini memandu langkah demi langkah pengujian seluruh fitur aplikasi web **ArsipinAja** secara komprehensif, mulai dari alur partner berdua, manajemen berkas & materi kuliah, integrasi bot Telegram, hingga panel kelola akun berdua.

---

## 📋 Daftar Isi
1. [Persiapan Lingkungan & Akun Uji](#1-persiapan-lingkungan--akun-uji)
2. [Skenario Pengujian Modul](#2-skenario-pengujian-modul)
   - [Modul A: Autentikasi & Ruang Berdua](#modul-a-autentikasi--ruang-berdua)
   - [Modul B: Dashboard Kuliah Kita](#modul-b-dashboard-kuliah-kita)
   - [Modul C: Arsip Materi & Dokumen (Archive)](#modul-c-arsip-materi--dokumen-archive)
   - [Modul D: Manajemen Tugas & Deadline (Tasks)](#modul-d-manajemen-tugas--deadline-tasks)
   - [Modul E: Kalender & Jadwal Kuliah (Calendar)](#modul-e-kalender--jadwal-kuliah-calendar)
   - [Modul F: Item Favorit (Favorites)](#modul-f-item-favorit-favorites)
   - [Modul G: Materi Dibagikan Berdua (Shared)](#modul-g-materi-dibagikan-berdua-shared)
   - [Modul H: Tempat Sampah (Trash & Recovery)](#modul-h-tempat-sampah-trash--recovery)
   - [Modul I: Integrasi Telegram Bot & Pengaturan](#modul-i-integrasi-telegram-bot--pengaturan)
   - [Modul J: Kelola Akun Ruang Berdua (Admin Panel)](#modul-j-kelola-akun-ruang-berdua-admin-panel)
3. [Matriks Checklist Pengujian (Testing Matrix)](#3-matriks-checklist-pengujian-testing-matrix)
4. [Petunjuk Troubleshooting](#4-petunjuk-troubleshooting)

---

## 1. Persiapan Lingkungan & Akun Uji

### A. Menjalankan Aplikasi
Buka terminal pada direktori proyek:
```powershell
npm run dev
```
Akses di browser: `http://localhost:5173`

### B. Jenis Akun Pengujian
| Role | Format Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin (Pemilik Ruang)** | Email admin (contoh: `admin@arsipinaja.id`) | Password Firebase Auth Anda | Dashboard, Arsip Materi, Tugas, Kalender, Pengaturan + **Kelola Akun Berdua** |
| **Partner (User)** | Email partner (contoh: `partner@arsipinaja.id`) | Password Firebase Auth Anda | Akses penuh arsip materi kuliah bersama, tugas & deadline, kalender, pengaturan bot Telegram |

---

## 2. Skenario Pengujian Modul

---

### Modul A: Autentikasi & Ruang Berdua
* **Halaman**: `/login`

#### Uji A1: Login Akun Partner
1. Buka halaman login di `http://localhost:5173/login`.
2. Masukkan email partner dan password yang valid.
3. Klik tombol **Masuk ke ArsipinAja**.
4. **Hasil yang diharapkan**: Muncul toast sukses, diarahkan otomatis ke `/dashboard`. Desain konsisten keluarga biru lembut tanpa warna bertabrakan.

#### Uji A2: Login Akun Admin (Pemilik Ruang)
1. Buka kembali `/login`.
2. Masukkan email admin dan password yang valid.
3. Klik tombol **Masuk ke ArsipinAja**.
4. **Hasil yang diharapkan**: Diarahkan ke `/admin`. Menu **Kelola Akun** aktif di bagian bawah Sidebar.

#### Uji A3: Validasi Form & Proteksi Rute (Route Guard)
1. Coba klik login dengan form kosong -> Tombol/form menolak dengan notifikasi error yang jelas.
2. Salin URL `/admin` dan coba buka menggunakan akun non-admin -> Sistem menampilkan jendela peringatan *"Akses Dibatasi - Khusus Admin Ruang Berdua"*.
3. Klik tombol **Keluar** (Logout) pada sudut kiri bawah Sidebar -> Sesi Firebase Auth berakhir dan diarahkan kembali ke `/login`.

---

### Modul B: Dashboard Kuliah Kita
* **Halaman**: `/dashboard`

#### Uji B1: Elemen Hero & Salam Dinamis
1. Periksa judul sapaan di banner biru atas.
2. **Hasil yang diharapkan**: Menampilkan sapaan sesuai jam lokal WIB (*"Selamat Pagi/Siang/Sore/Malam, [Nama]!"*).
3. Tertera label *"Ruang Berdua"*.

#### Uji B2: Ringkasan Metrik & Deadline Terdekat
1. Periksa 4 kartu ringkasan: Dokumen Tersimpan, Folder Materi, Tugas Aktif, dan Selesai.
2. Pastikan kartu deadline terdekat menampilkan tugas yang paling mendekati waktu saat ini.
3. Klik tombol cepat **Upload Dokumen**, **Tambah Tugas**, atau **Buat Folder** -> Membuka halaman tujuan secara langsung.

---

### Modul C: Arsip Materi & Dokumen (Archive)
* **Halaman**: `/archive`

#### Uji C1: Manajemen Folder Kuliah
1. Klik tombol **Folder Baru**.
2. Masukkan nama folder (contoh: *Algoritma Pemrograman*).
3. Pilih tag warna biru yang diinginkan.
4. Klik **Buat Folder** -> Folder baru muncul di daftar.

#### Uji C2: Upload Dokumen Kuliah (Cloudflare R2)
1. Buka salah satu folder.
2. Klik tombol **Upload File**.
3. Pilih atau *drag & drop* berkas materi kuliah (PDF, slide, gambar, atau dokumen).
4. Klik **Mulai Upload** -> Progress bar aktif dan file tersimpan ke Cloudflare R2 / arsip.

#### Uji C3: Pratinjau (Preview) & Unduh Dokumen
1. Klik salah satu file gambar atau PDF pada daftar arsip -> Modal pratinjau biru terbuka.
2. Klik tombol **Unduh Dokumen** -> File terunduh ke komputer lokal.

#### Uji C4: Ubah Nama (Rename) & Pindah Folder
1. Klik ikon pensil pada folder atau menu file.
2. Ubah nama item -> Nama terupdate seketika di Firestore.
3. Klik menu titik tiga -> **Pindahkan Folder** -> Pilih folder tujuan.

---

### Modul D: Manajemen Tugas & Deadline (Tasks)
* **Halaman**: `/tasks`

#### Uji D1: Buat Tugas Kuliah Baru
1. Klik tombol **Tambah Tugas Baru**.
2. Isi Judul Tugas, Mata Kuliah, Tanggal Deadline, Jam (WIB), dan Prioritas.
3. Tambahkan beberapa item checklist tugas.
4. Klik **Buat Tugas** -> Tugas tercatat di daftar.

#### Uji D2: Interaksi Checklist & Status Tugas
1. Centang salah satu checklist tugas -> Persentase progress bar bertambah secara proporsional.
2. Ganti status tugas menjadi *In Progress* atau *Completed*.

#### Uji D3: Tes Kirim Pengingat Telegram Bot
1. Klik ikon kirim (pesawat kertas) pada kartu tugas.
2. **Hasil yang diharapkan**: Bot Telegram mengirimkan ringkasan tugas dan deadline langsung ke ponsel Anda.

---

### Modul E: Kalender & Jadwal Kuliah (Calendar)
* **Halaman**: `/calendar`

#### Uji E1: Tampilan Jadwal & Deadline
1. Kalender menampilkan seluruh deadline tugas dalam bentuk pill warna biru retro.
2. Klik salah satu tanggal pada kalender -> Panel samping menampilkan seluruh tugas pada tanggal tersebut.
3. Klik tombol **Hari Ini** -> Kalender langsung kembali ke bulan dan tanggal hari ini.

---

### Modul F: Item Favorit (Favorites)
* **Halaman**: `/favorites`

#### Uji F1: Bintang Dokumen & Folder
1. Tandai folder atau file materi dengan bintang di halaman Arsip.
2. Buka menu **Dokumen Favorit** -> Item terpilih muncul di daftar favorit dengan bintang sky blue yang elegan.

---

### Modul G: Materi Dibagikan Berdua (Shared)
* **Halaman**: `/shared`

#### Uji G1: Berbagi Berkas Kuliah Berdua
1. Bagikan file ke email partner.
2. Buka menu **Materi Bersama** pada akun partner -> File muncul dan siap diunduh/dibuka bareng.

---

### Modul H: Tempat Sampah (Trash & Recovery)
* **Halaman**: `/trash`

#### Uji H1: Hapus Sementara & Pulihkan
1. Hapus salah satu file atau folder dari halaman Arsip.
2. Buka menu **Tempat Sampah** -> File berada di daftar sampah.
3. Klik tombol **Pulihkan** -> File kembali ke folder asalnya di halaman Arsip.

---

### Modul I: Integrasi Telegram Bot & Pengaturan
* **Halaman**: `/settings`

#### Uji I1: Hubungkan Akun Telegram & Tes Notifikasi
1. Buka menu **Pengaturan** -> tab **Bot Telegram** (`/settings?tab=telegram`).
2. Klik tombol **Hubungkan Telegram**.
3. Buka link bot di Telegram: [https://t.me/ArsipinAjaBot](https://t.me/ArsipinAjaBot) lalu klik tombol **START** (atau kirim pesan apa saja).
4. Di jendela modal ArsipinAja, pilih salah satu:
   * **Cara Otomatis**: Klik tombol **Deteksi Akun Telegram Otomatis**. Sistem akan langsung membaca Chat ID akun Telegram Anda dan mengirimkan pesan konfirmasi.
   * **Cara Manual**: Masukkan Chat ID Telegram Anda (didapat dari bot `@userinfobot`), lalu klik **Simpan & Tes**.
5. Setelah terhubung, klik tombol **Tes Kirim Pesan** di Pengaturan atau buka menu **Tugas** dan klik ikon pesawat kertas pada tugas untuk menguji notifikasi pengingat deadline.

---

### Modul J: Kelola Akun Ruang Berdua (Admin Panel)
* **Halaman**: `/admin`

#### Uji J1: Statistik Ruang Berdua
1. Login menggunakan akun admin.
2. Buka menu **Kelola Akun** di Sidebar.
3. Periksa 4 kartu ringkasan serasi bernuansa biru: Total Akun, Akun Aktif, Storage R2 Digunakan, dan Status Ruang Berdua.

#### Uji J2: Tambah Akun Partner (Dengan Password)
1. Klik tombol **Tambah Akun Partner**.
2. Masukkan Nama Partner, Email, dan Kata Sandi (Password) baru (minimal 6 karakter).
3. Klik ikon mata untuk melihat/sembunyikan kata sandi.
4. Klik **Simpan & Buat Akun** -> Akun tercatat di Firebase Auth & Firestore, dan partner dapat langsung login menggunakan email & kata sandi tersebut.

#### Uji J3: Reset Password Akun Partner
1. Klik tombol **Reset Pass** pada baris partner.
2. **Hasil yang diharapkan**: Muncul modal dengan password sementara berkontras tinggi yang dapat langsung disalin.

#### Uji J4: Nonaktifkan & Aktifkan Kembali Akses
1. Klik tombol **Nonaktifkan** pada baris partner -> Tombol berubah menjadi **Aktifkan** dengan warna kontras Deep Navy dan Royal Blue yang jelas terbaca.

#### Uji J5: Hapus Akun Partner (Permanen)
1. Klik tombol **Hapus** (ikon tempat sampah merah) pada baris partner.
2. Muncul modal konfirmasi peringatan *"Hapus Akun Partner"*.
3. Klik **Ya, Hapus Akun** -> Akun dihapus permanen dari Firestore, daftar akun tersegarkan otomatis, dan akun tersebut tidak lagi dapat mengakses aplikasi.

---

## 3. Matriks Checklist Pengujian (Testing Matrix)

| No | Modul | Fitur yang Diuji | Status | Catatan Hasil |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Auth | Login Email/Password Partner & Admin | [ ] | |
| 2 | Auth | Proteksi Rute `/admin` khusus Admin | [ ] | |
| 3 | Dashboard | Sapaan waktu dinamis WIB & Ringkasan Berdua | [ ] | |
| 4 | Dashboard | Navigasi tombol aksi cepat | [ ] | |
| 5 | Archive | Buat Folder materi kuliah bertingkat | [ ] | |
| 6 | Archive | Upload dokumen materi ke Cloudflare R2 | [ ] | |
| 7 | Archive | Unduh & Pratinjau berkas modal | [ ] | |
| 8 | Archive | Ubah nama (rename) & Pindah folder | [ ] | |
| 9 | Tasks | Buat tugas kuliah + jam WIB + checklist | [ ] | |
| 10 | Tasks | Progress checklist bertambah dinamis | [ ] | |
| 11 | Tasks | Kirim tes pengingat deadline ke Telegram Bot | [ ] | |
| 12 | Calendar | Tampilan jadwal kuliah & tanggal terpilih | [ ] | |
| 13 | Favorites | Bintang folder & dokumen materi | [ ] | |
| 14 | Shared | Akses berkas materi yang dibagikan berdua | [ ] | |
| 15 | Trash | Pulihkan file dari tempat sampah | [ ] | |
| 16 | Settings | Pengaturan profil & Bot Telegram | [ ] | |
| 17 | Admin | Statistik pemakaian R2 & Kelola akun berdua | [ ] | |
| 18 | Admin | Reset password partner & tombol status kontras | [ ] | |

---

## 4. Petunjuk Troubleshooting

1. **Permission Denied pada Firestore**:
   * Pastikan Anda sudah login terlebih dahulu.
   * Pastikan file `firestore.rules` terbaru sudah diterapkan di Firebase Console.

2. **Gagal Upload ke Cloudflare R2**:
   * Periksa tab *Network* di DevTools browser (F12).
   * Jika worker offline, sistem otomatis beralih ke penyimpanan lokal browser IndexedDB sehingga file tetap dapat di-preview dan di-download tanpa kendala.

3. **Notifikasi Telegram Tidak Masuk**:
   * Pastikan Anda sudah memulai chat dengan bot terlebih dahulu (`/start`) di aplikasi Telegram.
