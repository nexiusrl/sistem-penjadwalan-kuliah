# Verifikasi Fungsi Peran Pengguna (Role Functionality)

## Goal
Memverifikasi dan memastikan alur otentikasi serta fungsionalitas dashboard dari masing-masing peran (Admin, Dosen, Mahasiswa) berjalan dengan benar sesuai skema hak akses.

## Tasks
- [ ] Task 1: Jalankan server lokal & bersihkan data sesi → Verify: Jalankan `npm start`, buka browser di `http://localhost:3000`, pastikan diarahkan ke login dan `localStorage` kosong.
- [ ] Task 2: Uji otentikasi & hak akses Admin → Verify: Login dengan `admin@sisjad.ac.id` / `admin123`. Pastikan menu Kalender Mingguan, Data Master, dan Permohonan Jadwal muncul, serta tombol "Tambah Jadwal" aktif.
- [ ] Task 3: Uji manipulasi data master & penjadwalan oleh Admin → Verify: Tambahkan 1 Dosen, 1 Ruangan, 1 MK di menu Data Master, lalu tambahkan jadwal kuliah baru di Kalender Mingguan.
- [ ] Task 4: Uji pendaftaran & otentikasi Dosen Baru → Verify: Lakukan registrasi akun baru bermutu Dosen (misal Nama: `Dr. Budi`, Email: `dosen@sisjad.ac.id`, Password: `dosen123`). Login, pastikan dialihkan ke dashboard dengan menu Data Master tersembunyi.
- [ ] Task 5: Uji filter jadwal & pengajuan request oleh Dosen → Verify: Di dashboard Dosen, pastikan kalender mingguan hanya menampilkan kelas milik `Dr. Budi`. Kirim 1 permohonan geser jadwal (pastikan nama Dosen Pemohon terkunci).
- [ ] Task 6: Uji pendaftaran & otentikasi Mahasiswa → Verify: Registrasikan akun Mahasiswa baru, login, dan pastikan tampilan kalender bersifat read-only (tanpa tombol Tambah/Edit) serta kolom panel bentrok di sebelah kanan disembunyikan.
- [ ] Task 7: Uji alur persetujuan permohonan geser jadwal → Verify: Login kembali sebagai Admin, buka menu Permohonan Jadwal, klik "Setujui" pada request dari `Dr. Budi`, dan pastikan status request berubah menjadi "Disetujui" di kedua sisi.

## Done When
- [ ] Ketiga peran pengguna berhasil masuk dan mendapatkan hak akses menu yang sesuai.
- [ ] Alur pengajuan jadwal baru oleh Admin dan permohonan geser jadwal oleh Dosen berhasil diproses secara end-to-end tanpa error.

## Notes
* Database JSON `db.json` dapat dilihat secara langsung di editor untuk memverifikasi penyimpanan data setiap kali operasi CRUD atau registrasi berhasil dilakukan.
