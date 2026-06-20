# SISJAD - Sistem Penjadwalan Kuliah

SISJAD (Sistem Penjadwalan Kuliah) adalah aplikasi berbasis web modern untuk mengelola jadwal perkuliahan secara otomatis dan dinamis. Sistem ini dirancang untuk mempermudah program studi dalam menyusun jadwal kuliah bebas bentrok dengan memanfaatkan algoritma pelacak bentrok otomatis (*Constraint Solver*).

---

## 🚀 Fitur Utama

1. **Manajemen Data Master (CRUD)**:
   * **Dosen**: Pendaftaran dosen beserta kode singkat unik.
   * **Ruangan**: Pengaturan ruangan kelas (Teori/Praktikum) beserta kapasitas kursi.
   * **Mata Kuliah**: Pengisian data mata kuliah (SKS, Kode MK, Hari Kuliah, serta Jam Mulai & Jam Selesai kustom).
2. **Penjadwalan Kuliah Otomatis**:
   * **Input Jadwal Terikat MK**: Admin dapat menjadwalkan kelas dengan memilih mata kuliah, dosen, dan ruangan. Hari dan jam otomatis terkunci (read-only) mengikuti pengaturan master mata kuliah.
   * **Deteksi Bentrok Cerdas**: Sistem secara real-time mendeteksi bentrok ruangan atau dosen yang mengajar di jam yang sama (*Hard Conflict*).
   * **Genetic Algorithm Resolver**: Algoritma cerdas yang dapat menyelesaikan bentrok jadwal secara otomatis hanya dengan sekali klik (memindahkan ruangan secara dinamis tanpa merusak jam/hari kuliah).
3. **Sistem Peran & Otorisasi Keamanan (Role-Based Access Control)**:
   * Hak akses dipisahkan secara ketat untuk **Admin**, **Dosen**, dan **Mahasiswa** baik di tingkat tampilan frontend maupun validasi API backend.
4. **Pengajuan Perubahan Jadwal**:
   * Dosen dapat mengajukan permohonan pemindahan jadwal perkuliahan kepada Admin Prodi dengan proteksi pencegahan pemalsuan nama dosen (*spoofing protection*).
5. **Kalender Timetable Dinamis**:
   * Baris slot waktu pada tabel kalender disusun secara dinamis mengikuti rentang waktu kustom apa pun yang diatur pada mata kuliah master terdaftar.

---

## 🛠️ Stack Teknologi

* **Frontend**: HTML5, Vanilla CSS, Bootstrap 5.3, Bootstrap Icons
* **Backend**: Node.js, Express.js
* **Database**: JSON-based Database (menggunakan file `db.json` lokal)

---

## 📦 Langkah Instalasi & Menjalankan Aplikasi

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 16 atau lebih tinggi) di komputer Anda.

### Langkah-langkah
1. **Clone atau Ekstrak Proyek**:
   Unduh source code proyek ini ke direktori lokal Anda.

2. **Instal Dependensi**:
   Buka terminal di direktori proyek dan jalankan perintah berikut:
   ```bash
   npm install
   ```

3. **Jalankan Server**:
   Jalankan server Express menggunakan perintah:
   ```bash
   npm start
   ```

4. **Buka Aplikasi**:
   Buka browser Anda dan akses tautan berikut:
   [http://localhost:3000](http://localhost:3000)

---

## 🔑 Kredensial Akun Default

Gunakan kredensial berikut untuk masuk ke sistem sesuai peran masing-masing:

| Peran (Role) | Alamat Email | Kata Sandi (Password) | Nama Akun |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sisjad.ac.id` | `admin123` | Administrator |
| **Dosen** | `dosen@sisjad.ac.id` | `dosen123` | Dr. Budi |
| **Mahasiswa** | `mhs@sisjad.ac.id` | `mhs123` | Mahasiswa |

*Catatan: Detail kredensial di atas juga dapat Anda temukan pada berkas [USER.md](USER.md).*

---

## 📂 Struktur Direktori Proyek

```text
├── css/
│   └── styles.css          # Styling kustom (desain glassmorphism & tema kampus)
├── js/
│   ├── dashboard.js        # Logika dashboard, AJAX, & GA conflict solver
│   └── login.js            # Logika otentikasi login & registrasi akun baru
├── dashboard.html          # Panel utama (Dashboard jadwal, master data, request)
├── db.json                 # Penyimpanan database JSON lokal (ignored in git)
├── index.html              # Halaman login & registrasi utama (Landing Page)
├── package.json            # Konfigurasi dependensi Node.js
├── server.js               # Server API backend Express.js dengan middleware peran
├── USER.md                 # Dokumentasi kredensial pengguna bawaan
└── README.md               # Dokumentasi umum panduan proyek ini (file ini)
```
