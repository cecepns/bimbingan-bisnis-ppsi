# Panduan & Materi Metadata Google Play Store
**Aplikasi:** Bimbingan Bisnis PPSI  
**Package Name:** `com.ppsi.aplikasi`  
**Kepatuhan Kebijakan:** Google Play Developer Program Policies (Kebijakan Metadata)

---

## 📌 Ringkasan Masalah & Solusi Penolakan (Rejection Fix)

### Penyebab Penolakan Google Play:
1. **Pelanggaran Kebijakan Metadata:**
   - Adanya penyebutan merek/aplikasi pihak ketiga yang tidak berizin atau kata promosi berlebihan (seperti klaim *No. 1*, *Terbaik*, *Gratis*, ajakan download, atau simbol bintang rating).
   - Judul, deskripsi, atau gambar promosi sebelumnya tidak secara akurat dan menyeluruh mencerminkan fungsi inti aplikasi.
   - Screenshot lama tidak sesuai dengan tampilan dan fungsionalitas nyata di platform Android.

### Solusi yang Diterapkan:
1. **Pembaruan Aset Promosi:**
   - **Ikon Aplikasi:** Dibuat berukuran `512 x 512 px` (format PNG 32-bit) dengan identitas resmi logo PPSI yang bersih tanpa ornamen mencolok.
   - **Grafis Fitur (Feature Graphic):** Berukuran `1024 x 500 px` dengan desain modern gelap, tipografi jelas, fokus pada fungsi aplikasi, tanpa kata promosi dilarang.
   - **Screenshot Aplikasi:** 5 lembar tangkapan layar `1080 x 1920 px` yang menampilkan fitur nyata aplikasi (Login, Dashboard, Kurikulum Materi, Detail Video Pembelajaran, dan Progress Member) lengkap dengan framing elegan.
2. **Metadata Teks Baru (Bebas Pelanggaran):**
   - Judul di bawah batas maksimal 30 karakter.
   - Deskripsi singkat di bawah batas maksimal 80 karakter, fokus pada fungsi inti.
   - Deskripsi lengkap tersusun rapi dengan poin-poin fitur faktual tanpa *keyword stuffing*.

---

## 📋 Data Isian Google Play Console (Copy-Paste Ready)

### 1. Nama Aplikasi / App Title
> **Batas:** Maksimal 30 karakter  
> **Karakter Terpakai:** 21 karakter

```text
Bimbingan Bisnis PPSI
```

*(Alternatif: `PPSI - Bimbingan Bisnis` [23 karakter])*

---

### 2. Deskripsi Singkat / Short Description
> **Batas:** Maksimal 80 karakter  
> **Karakter Terpakai:** 74 karakter

```text
Aplikasi resmi pembelajaran modul dan bimbingan mentoring bisnis member PPSI.
```

---

### 3. Deskripsi Lengkap / Full Description
> **Batas:** Maksimal 4.000 karakter  
> **Karakter Terpakai:** ~1.450 karakter

```text
Bimbingan Bisnis PPSI adalah aplikasi resmi platform pembelajaran digital dan pendampingan bisnis bagi seluruh member PPSI. Aplikasi ini dirancang untuk mempermudah member dalam mengakses kurikulum pelatihan bisnis terstruktur, modul materi aplikatif, serta memantau perkembangan belajar secara berkala langsung dari perangkat ponsel pintar Anda.

Fitur Utama Aplikasi:
• Kurikulum Bisnis Terstruktur: Akses materi pembelajaran bisnis yang disusun bertahap mulai dari tingkat fundamental, riset pasar, strategi pemasaran digital, hingga manajemen finansial bisnis.
• Pembelajaran Video & Modul Interaktif: Simak materi berupa video panduan komprehensif dan rangkuman poin-poin materi praktis yang dapat langsung diterapkan dalam pengembangan bisnis.
• Pemantauan Progress Belajar: Pantau persentase penyelesaian kurikulum Anda dengan visualisasi capaian yang jelas serta riwayat aktivitas pembelajaran harian.
• Akses Akun Mudah & Aman: Masuk ke dalam platform menggunakan Email atau nomor WhatsApp terdaftar secara praktis dengan keamanan akun yang terlindungi.
• Navigasi Cepat & Ringan: Tampilan antarmuka yang bersih, intuitif, dan responsif untuk kenyamanan belajar di mana pun dan kapan pun.

Aplikasi ini dikhususkan bagi para member yang ingin meningkatkan kapasitas kewirausahaan dan memperluas wawasan bisnis melalui kurikulum terstandar dari PPSI.

Untuk informasi keanggotaan dan bantuan teknis, hubungi layanan dukungan kami melalui platform resmi PPSI.
```

---

## 📁 Daftar File Aset Siap Upload Berdasarkan Form Factor

Semua file aset telah dibuat dan dikelompokkan dengan rapi di:  
`mobile/store-assets/`

### 1. Ikon & Grafis Promosi Toko
| Jenis Aset | Path File | Dimensi | Format | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Ikon Aplikasi** | `mobile/store-assets/icon/app-icon-512.png` | 512 x 512 | PNG 32-bit | Siap Upload |
| **Grafis Fitur (Feature Graphic)** | `mobile/store-assets/feature-graphic/feature-graphic.png` | 1024 x 500 | PNG | Siap Upload |

### 2. Tangkapan Layar Ponsel (Phone Screenshots)
*Folder:* `mobile/store-assets/screenshots/phone/` *(atau `mobile/store-assets/screenshots/`)*  
*Dimensi:* `1080 x 1920 px` (Rasio 9:16)
* `screenshot-1-login.png` — Akses Akun Terintegrasi (Email / No. WhatsApp)
* `screenshot-2-dashboard.png` — Pantau Kemajuan Belajar & Dashboard Terpadu
* `screenshot-3-materials.png` — Kurikulum Modul Bisnis Berjenjang
* `screenshot-4-video-detail.png` — Video Materi & Studi Kasus Praktis
* `screenshot-5-progress.png` — Evaluasi Capaian & Sertifikasi Member

### 3. Tangkapan Layar Tablet 7 Inci (7-inch Tablet Screenshots)
*Folder:* `mobile/store-assets/screenshots/tablet-7inch/`  
*Dimensi:* `2048 x 1536 px` (Rasio 4:3 Landscape)
* `screenshot-1-dashboard-tablet7.png` — Dashboard Terpadu & Responsif di Tablet 7 Inci
* `screenshot-2-materials-tablet7.png` — Katalog Modul Berjenjang & Filter Kategori
* `screenshot-3-video-tablet7.png` — Video Pembelajaran & Agenda Modul Praktis
* `screenshot-4-progress-tablet7.png` — Tracking Milestone Belajar & Sertifikasi

### 4. Tangkapan Layar Tablet 10 Inci (10-inch Tablet Screenshots)
*Folder:* `mobile/store-assets/screenshots/tablet-10inch/`  
*Dimensi:* `2560 x 1600 px` (Rasio 16:10 Landscape)
* `screenshot-1-dashboard-tablet10.png` — Tampilan Dashboard Luas & Maksimal
* `screenshot-2-materials-tablet10.png` — Eksplorasi Kurikulum Komprehensif
* `screenshot-3-video-tablet10.png` — Pemutar Video Pembelajaran Jernih & Catatan Materi
* `screenshot-4-progress-tablet10.png` — Monitoring Capaian & Grafik Aktivitas Mingguan

### 5. Tangkapan Layar Chromebook / Desktop
*Folder:* `mobile/store-assets/screenshots/desktop/`  
*Dimensi:* `1920 x 1080 px` (Rasio 16:9 Landscape Full HD)
* `screenshot-1-dashboard-desktop.png` — Dashboard Terintegrasi di Desktop & Peramban Web
* `screenshot-2-materials-desktop.png` — Eksplorasi Modul Bisnis Grid Luas
* `screenshot-3-video-detail-desktop.png` — Video Tutorial Pembelajaran & Rangkuman Catatan
* `screenshot-4-progress-desktop.png` — Analitik Jam Belajar & Capaian Member

### 6. Tangkapan Layar Android XR (Spatial Computing / Headset)
*Folder:* `mobile/store-assets/screenshots/android-xr/`  
*Dimensi:* `1920 x 1080 px` (Rasio 16:9 Spasial Imersif)
* `screenshot-1-spatial-dashboard.png` — Dashboard Spasial Android XR Multi-Window
* `screenshot-2-spatial-materials.png` — Kurikulum Spasial Berjenjang di Layar Virtual
* `screenshot-3-virtual-theater-video.png` — Virtual Cinema Pemutar Video Pembelajaran
* `screenshot-4-spatial-progress.png` — Visualisasi 3D Milestone Belajar & Sertifikasi

---

## ⚙️ Petunjuk Upload di Google Play Console

1. Buka [Google Play Console](https://play.google.com/console) > pilih aplikasi **PPSI** (`com.ppsi.aplikasi`).
2. Masuk ke **Pertumbuhan (Grow)** > **Keberadaan di Play Store (Store presence)** > **Halaman listing utama Play Store (Main store listing)**.
3. Perbarui informasi teks:
   - **Detail aplikasi:** Salin Judul, Deskripsi Singkat, dan Deskripsi Lengkap dari panduan ini.
   - **Ikon aplikasi:** Upload `mobile/store-assets/icon/app-icon-512.png`.
   - **Grafis fitur:** Upload `mobile/store-assets/feature-graphic/feature-graphic.png`.
4. Unggah tangkapan layar pada masing-masing tab yang tersedia di Play Console:
   - **Tab Ponsel (Phone):** Upload 5 file dari `mobile/store-assets/screenshots/phone/`.
   - **Tab Tablet 7 inci (7-inch tablet):** Upload 4 file dari `mobile/store-assets/screenshots/tablet-7inch/`.
   - **Tab Tablet 10 inci (10-inch tablet):** Upload 4 file dari `mobile/store-assets/screenshots/tablet-10inch/`.
   - **Tab Chromebook / Desktop:** Upload 4 file dari `mobile/store-assets/screenshots/desktop/`.
   - **Tab Android XR:** Upload 4 file dari `mobile/store-assets/screenshots/android-xr/`.
5. Klik tombol **Simpan (Save)** di kanan bawah.

---

## 🚀 Petunjuk Upload Rilis Baru (Menyelesaikan Masalah API 36 & 16 KB)

Peringatan target API 36 dan ukuran halaman memori 16 KB muncul karena rilis yang saat ini aktif di jalur produksi Play Store masih versi lama (API 35). Rilis update baru tidak sempat aktif karena pengajuan sebelumnya tertahan penolakan metadata.

File App Bundle baru (`.aab`) telah berhasil di-build dan siap diunggah:
* **File AAB:** `mobile/store-assets/release/app-release-v1.3.1-build6.aab`  
  *(Atau file asli di: `mobile/android/app/build/outputs/bundle/release/app-release.aab`)*
* **Target SDK:** 36 (Android 16)
* **Compile SDK:** 36
* **Build Tools:** 36.0.0
* **NDK:** 27.1.12297006 (mendukung arsitektur 16 KB page size)
* **Version Code:** `6`
* **Version Name:** `1.3.1`

### Langkah Upload di Play Console:
1. Di Google Play Console, buka menu **Rilis (Release)** > **Produksi (Production)** (atau jalur tempat rilis Anda berada).
2. Klik tombol **Buat rilis baru (Create new release)** di kanan atas.
3. Pada bagian **App bundle**, unggah file `app-release-v1.3.1-build6.aab`.
4. Berikan Catatan Rilis (Release Notes):
   ```text
   • Pembaruan kepatuhan sistem Android 16 (API 36).
   • Peningkatan kompatibilitas memori 16 KB dan stabilitas aplikasi.
   • Pembaruan modul pembelajaran dan optimasi navigasi aplikasi.
   ```
5. Klik **Berikutnya (Next)**, tinjau ringkasan rilis, lalu klik **Mulai peluncuran ke Produksi (Start rollout to Production)**.
6. Kirim rilis untuk ditinjau bersamaan dengan pembaruan metadata listing di atas.
7. Setelah rilis disetujui, Google Play otomatis mengirim notifikasi bahwa aplikasi telah memenuhi seluruh kebijakan dan peringatan API 36 & 16 KB akan hilang secara permanen.
