# Random Quotes API

REST API sederhana untuk mengambil quote secara acak dan menambahkan quote baru. Dibangun dengan **Node.js** dan **Express.js**, dengan penyimpanan data menggunakan file JSON (tanpa database).

---

## Tech Stack

- Node.js
- Express.js
- fs/promises

---

## Cara Install

1. Clone atau ekstrak project ini:
   ```bash
   cd random-quotes-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Opsional) Salin file environment:
   ```bash
   cp .env.example .env
   ```

---

## Cara Menjalankan

- **Mode development** (dengan auto-reload):
  ```bash
  npm run dev
  ```

- **Mode production**:
  ```bash
  npm start
  ```

Server akan berjalan di `http://localhost:3000` (atau port yang ditentukan di `.env`).

---

## Penjelasan Endpoint

### 1. GET /

Menampilkan informasi umum tentang API.

**Response:**
```json
{
  "success": true,
  "name": "Random Quotes API",
  "version": "1.0.0",
  "endpoints": [
    "GET /api/quotes/random",
    "POST /api/quotes"
  ]
}
```

---

### 2. GET /api/quotes/random

Mengambil satu quote secara acak dari koleksi yang tersedia.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "quote": "Terus belajar setiap hari.",
    "author": "Anonymous",
    "category": "Belajar",
    "createdAt": "2026-07-18T10:30:00Z"
  }
}
```

---

### 3. POST /api/quotes

Menambahkan quote baru ke dalam koleksi.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "quote": "Tidak ada kata terlambat untuk belajar.",
  "author": "Anonymous",
  "category": "Motivasi"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quote berhasil ditambahkan.",
  "data": {
    "id": 101,
    "quote": "Tidak ada kata terlambat untuk belajar.",
    "author": "Anonymous",
    "category": "Motivasi",
    "createdAt": "2026-07-18T12:15:00.000Z"
  }
}
```

---

## Contoh Request dengan cURL

### Ambil quote acak
```bash
curl -X GET http://localhost:3000/api/quotes/random
```

### Tambah quote baru
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Kesuksesan adalah hasil dari konsistensi dan kerja keras.",
    "author": "Anonymous",
    "category": "Motivasi"
  }'
```

---

## Daftar Validasi

### Validasi Umum
- Request harus menggunakan header `Content-Type: application/json`
- Ukuran body request maksimal **10 KB**
- Field yang tidak dikenal akan ditolak
- Hanya field `quote`, `author`, dan `category` yang diperbolehkan

### Validasi Quote
- Wajib diisi
- Harus berupa string
- Setelah di-trim tidak boleh kosong
- Minimal **10 karakter**
- Maksimal **300 karakter**
- Tidak boleh hanya angka
- Tidak boleh hanya emoji
- Spasi berlebih akan dihapus (multiple spaces menjadi satu)
- Tidak boleh mengandung HTML tag (`<script>`, `<div>`, dll.)
- Tidak boleh mengandung karakter kontrol

### Validasi Author
- Wajib diisi (jika tidak dikirim atau kosong, default menjadi `"Anonymous"`)
- Harus berupa string
- Minimal **2 karakter**
- Maksimal **50 karakter**
- Akan di-trim otomatis
- Hanya boleh mengandung huruf, angka, spasi, titik, tanda hubung, dan apostrof

### Validasi Category
- Wajib diisi
- Harus berupa string
- Hanya kategori berikut yang diperbolehkan:
  - Motivasi
  - Kehidupan
  - Belajar
  - Inspirasi
  - Kesuksesan
  - Teknologi
  - Programming
  - Persahabatan
  - Cinta
  - Islami
  - Humor
  - Bisnis
  - Produktivitas

### Validasi Tambahan
- Quote duplikat akan ditolak (case-insensitive, mengabaikan spasi berlebih)
- ID di-generate otomatis (ID terbesar + 1)
- `createdAt` ditambahkan otomatis dengan format ISO 8601
- Seluruh input di-trim sebelum disimpan
- Data disimpan dengan format JSON rapi (`JSON.stringify(data, null, 2)`)

---

## Daftar HTTP Status Code

| Status | Keterangan |
|--------|------------|
| 200 OK | Request berhasil |
| 201 Created | Quote baru berhasil ditambahkan |
| 400 Bad Request | Format JSON tidak valid |
| 404 Not Found | Endpoint tidak ditemukan atau tidak ada quote |
| 405 Method Not Allowed | Method HTTP tidak diizinkan |
| 413 Payload Too Large | Body request melebihi 10 KB |
| 415 Unsupported Media Type | Content-Type bukan application/json |
| 422 Unprocessable Entity | Validasi input gagal |
| 500 Internal Server Error | Terjadi kesalahan pada server |

---

## Struktur Project

```
random-quotes-api/
│
├── package.json       # Konfigurasi project dan dependencies
├── server.js          # Entry point aplikasi Express
├── quotes.json        # File penyimpanan data quote (105+ quote)
├── README.md          # Dokumentasi project
├── .gitignore         # File dan folder yang diabaikan Git
└── .env.example       # Contoh file environment variables
```

---

## Catatan

- Data tidak disimpan di memory, melainkan dibaca dari `quotes.json` setiap request dan ditulis kembali saat POST berhasil.
- Gunakan `npm run dev` untuk development agar server otomatis restart saat ada perubahan file.
