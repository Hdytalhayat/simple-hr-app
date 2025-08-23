---

# Backend API - Web App HR Sederhana

Ini adalah backend API untuk aplikasi Human Resources (HR) sederhana, dirancang untuk startup dan UKM. Dibangun dengan Node.js, Express, TypeScript, dan PostgreSQL, API ini menyediakan fungsionalitas inti untuk manajemen sumber daya manusia.

## ✅ Fitur Utama

-   **Manajemen Karyawan:** Operasi CRUD penuh untuk data karyawan.
-   **Autentikasi & Otorisasi:** Sistem login aman berbasis JWT dengan peran (Admin, HR, Karyawan).
-   **Manajemen Absensi:** Endpoint untuk check-in, check-out, dan rekapitulasi kehadiran.
-   **Manajemen Cuti:** Sistem pengajuan dan persetujuan (approval) untuk cuti dan izin.
-   **Manajemen Gaji (Payroll):** Pengaturan komponen gaji dan generasi slip gaji bulanan.
-   **Manajemen Dokumen:** Upload dan kelola dokumen karyawan (KTP, kontrak, dll.).
-   **Laporan & Ekspor:** Kemampuan untuk mengunduh slip gaji dalam format **PDF** dan laporan absensi dalam format **CSV**.
-   **Seeder:** Skrip untuk membuat pengguna Admin pertama secara otomatis.

## 🛠️ Tech Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Bahasa:** TypeScript
-   **Database:** PostgreSQL
-   **Autentikasi:** JSON Web Token (JWT)
-   **Hashing Password:** Bcrypt.js
-   **File Uploads:** Multer
-   **Generasi PDF:** `pdfkit`
-   **Generasi CSV:** `csv-writer`
-   **Driver Database:** `node-postgres` (pg)

---

## 🚀 Memulai

### Prasyarat

Pastikan perangkat Anda sudah terinstal perangkat lunak berikut:
-   [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
-   [PostgreSQL](https://www.postgresql.org/download/) (Server Database)
-   [Git](https://git-scm.com/) (Version Control)
-   Sebuah GUI untuk PostgreSQL seperti [pgAdmin](https://www.pgadmin.org/) atau [DBeaver](https://dbeaver.io/) (Sangat direkomendasikan)

### 1. Instalasi

Clone repositori ini ke mesin lokal Anda:
```bash
git clone https://github.com/USERNAME/NAMA-REPO.git
cd NAMA-REPO/backend
```

Instal semua dependensi yang dibutuhkan:
```bash
npm install
```

### 2. Konfigurasi Database

1.  Buka pgAdmin atau DBeaver.
2.  Buat database baru dengan nama, misalnya, `hr_app_db`.
3.  Jalankan skema SQL di bawah ini pada database yang baru Anda buat untuk membuat semua tabel yang diperlukan.

#### Skema SQL Lengkap```sql
-- Tabel Karyawan & Pengguna
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    job_title VARCHAR(100),
    department VARCHAR(100),
    employment_status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    "role" VARCHAR(50) NOT NULL DEFAULT 'Karyawan',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Absensi
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (employee_id, attendance_date)
);

-- Tabel Pengajuan Cuti
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    approved_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Komponen Gaji
CREATE TABLE salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    allowances JSONB,
    deductions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Riwayat Slip Gaji
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_month INT NOT NULL,
    pay_period_year INT NOT NULL,
    basic_salary NUMERIC(15, 2) NOT NULL,
    total_allowances NUMERIC(15, 2) NOT NULL,
    total_deductions NUMERIC(15, 2) NOT NULL,
    net_salary NUMERIC(15, 2) NOT NULL,
    details JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (employee_id, pay_period_month, pay_period_year)
);

-- Tabel Dokumen Karyawan
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di dalam direktori `backend`. Salin konten dari `.env.example` (jika ada) atau gunakan templat di bawah ini dan isi nilainya sesuai dengan konfigurasi lokal Anda.

```env
# Konfigurasi Database
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=hr_app_db
DB_PASSWORD=password_database_anda
DB_PORT=5432

# Konfigurasi Server
PORT=3001

# Konfigurasi JWT
# Gunakan string yang sangat acak dan panjang untuk ini
JWT_SECRET_KEY=ini_adalah_kunci_rahasia_yang_sangat_aman_dan_panjang

# Kredensial untuk Seeder Admin (Opsional, tapi direkomendasikan)
ADMIN_EMAIL=admin@perusahaan.com
ADMIN_PASSWORD=ganti_dengan_password_yang_kuat
```

### 4. Menjalankan Seeder Admin

Setelah database dan `.env` siap, jalankan skrip seeder untuk membuat pengguna Admin pertama. Ini adalah langkah penting agar Anda bisa login ke sistem.

```bash
npm run seed:admin
```

---

## ධ Menjalankan Aplikasi

### Mode Development
Untuk menjalankan server dalam mode development dengan hot-reload (otomatis restart saat ada perubahan kode):
```bash
npm run dev
```
Server akan berjalan di `http://localhost:3001` (atau port yang Anda tentukan di `.env`).

### Mode Produksi
Untuk production, pertama-tama build kode TypeScript menjadi JavaScript:
```bash
npm run build
```
Perintah ini akan membuat direktori `dist` yang berisi file JavaScript hasil kompilasi. Kemudian, jalankan server dari direktori tersebut:
```bash
npm run start
```

---

## 🗺️ Dokumentasi API Endpoints

Semua endpoint di bawah ini memiliki prefix `/api`.

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| **Authentication** | | | |
| `POST` | `/auth/login` | Login untuk mendapatkan JWT. | Publik |
| **Employees** | | | |
| `POST` | `/employees` | Membuat karyawan baru. | Admin/HR |
| `GET` | `/employees` | Mendapatkan semua karyawan. | Admin/HR |
| `GET` | `/employees/:id` | Mendapatkan detail satu karyawan. | Admin/HR |
| `PUT` | `/employees/:id` | Memperbarui data karyawan. | Admin/HR |
| `DELETE` | `/employees/:id` | Menghapus karyawan. | Admin/HR |
| **Attendance** | | | |
| `POST` | `/attendance/check-in` | Karyawan melakukan check-in. | Karyawan |
| `PATCH` | `/attendance/check-out`| Karyawan melakukan check-out. | Karyawan |
| `GET` | `/attendance/today` | Status absensi hari ini. | Karyawan |
| `GET` | `/attendance/history` | Riwayat absensi pribadi. | Karyawan |
| `GET` | `/attendance/report` | Rekap absensi semua karyawan. | Admin/HR |
| `GET` | `/attendance/report/export` | Ekspor laporan absensi (CSV). | Admin/HR |
| **Leave Requests** | | | |
| `POST` | `/leave/request` | Karyawan mengajukan cuti. | Karyawan |
| `GET` | `/leave/my-requests` | Riwayat pengajuan cuti pribadi. | Karyawan |
| `GET` | `/leave/all-requests` | Semua pengajuan cuti (untuk approval).| Admin/HR |
| `PATCH` | `/leave/:id/status` | Menyetujui/menolak pengajuan cuti. | Admin/HR |
| **Salary & Payslips** | | | |
| `POST` | `/salary-components/:id` | Menetapkan komponen gaji karyawan. | Admin/HR |
| `POST` | `/payslips/generate` | Generate slip gaji untuk karyawan. | Admin/HR |
| `GET` | `/payslips/my-history` | Riwayat slip gaji pribadi. | Karyawan |
| `GET` | `/payslips/:id/download` | Download slip gaji (PDF). | Karyawan & Admin/HR |
| **Documents** | | | |
| `POST` | `/documents/upload/:id` | Upload dokumen untuk karyawan. | Admin/HR |
| `GET` | `/documents/:id` | Daftar dokumen milik karyawan. | Admin/HR |
