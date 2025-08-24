# Backend API - Simple HR Web App

This is the backend API for a simple Human Resources (HR) web application, designed for startups and SMEs. Built with Node.js, Express, TypeScript, and PostgreSQL, this API provides core functionalities for human resource management.

## ✅ Key Features

* **Employee Management:** Full CRUD operations for employee data.
* **Authentication & Authorization:** Secure login system using JWT with roles (Admin, HR, Employee).
* **Attendance Management:** Endpoints for check-in, check-out, and attendance summaries.
* **Leave Management:** System for submitting and approving leave requests.
* **Payroll Management:** Set salary components and generate monthly payslips.
* **Document Management:** Upload and manage employee documents (ID card, contract, etc.).
* **Reports & Export:** Ability to download payslips in **PDF** format and attendance reports in **CSV** format.
* **Email Notifications:** Automatic email notifications for leave status updates and payslip availability.
* **Seeder:** Script to automatically create the first Admin user.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **Authentication:** JSON Web Token (JWT)
* **Password Hashing:** Bcrypt.js
* **File Uploads:** Multer
* **PDF Generation:** `pdfkit`
* **CSV Generation:** `csv-writer`
* Email Service: Nodemailer
* **Database Driver:** `node-postgres` (pg)

---

## 🚀 Getting Started

### Prerequisites

Ensure your machine has the following software installed:

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [PostgreSQL](https://www.postgresql.org/download/) (Database Server)
* [Git](https://git-scm.com/) (Version Control)
* A PostgreSQL GUI such as [pgAdmin](https://www.pgadmin.org/) or [DBeaver](https://dbeaver.io/) (Highly recommended)

### 1. Installation

Clone this repository to your local machine:

```bash
git clone https://github.com/Hdytalhayat/simple-hr-app.git
cd simple-hr-app/backend
```

Install all required dependencies:

```bash
npm install
```

### 2. Database Configuration

1. Open pgAdmin or DBeaver.
2. Create a new database, for example, `hr_app_db`.
3. Execute the SQL schema below on the new database to create all required tables.

#### Complete SQL Schema

```sql
-- Employees & Users Table
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

-- Attendance Table
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

-- Leave Requests Table
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

-- Salary Components Table
CREATE TABLE salary_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    allowances JSONB,
    deductions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payslip History Table
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

-- Employee Documents Table
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Environment Variables Configuration

Create a `.env` file inside the `backend` directory. Copy the contents from `.env.example` (if available) or use the template below and fill in your local configuration values.

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=hr_app_db
DB_PASSWORD=your_database_password
DB_PORT=5432

# Server Configuration
PORT=3001

# JWT Configuration
# Use a long, random string for this
JWT_SECRET_KEY=this_is_a_very_long_and_secure_secret_key

# Email Configuration (Nodemailer with Gmail)
# For production, use a transactional email service like SendGrid, Mailgun, etc.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_digit_gmail_app_password

# Admin Seeder Credentials (Optional, but recommended)
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=change_to_a_strong_password
```

### 4. Running Admin Seeder

Once the database and `.env` file are ready, run the seeder script to create the first Admin user. This is crucial to be able to log in to the system.

```bash
npm run seed:admin
```

---

## ධ Running the Application

### Development Mode

Run the server in development mode with hot-reload (automatically restarts on code changes):

```bash
npm run dev
```

The server will run at `http://localhost:3001` (or the port specified in `.env`).

### Production Mode

For production, first build TypeScript code into JavaScript:

```bash
npm run build
```

This will create a `dist` directory containing compiled JavaScript files. Then run the server from that directory:

```bash
npm run start
```

---

## 🗺️ API Endpoints Documentation

All endpoints below use the `/api` prefix.

| Method                | Endpoint                    | Description                            | Access              |
| --------------------- | --------------------------- | -------------------------------------- | ------------------- |
| **Authentication**    |                             |                                        |                     |
| `POST`                | `/auth/login`               | Login to obtain JWT.                   | Public              |
| **Employees**         |                             |                                        |                     |
| `POST`                | `/employees`                | Create a new employee.                 | Admin/HR            |
| `GET`                 | `/employees`                | Get all employees.                     | Admin/HR            |
| `GET`                 | `/employees/:id`            | Get details of one employee.           | Admin/HR            |
| `PUT`                 | `/employees/:id`            | Update employee data.                  | Admin/HR            |
| `DELETE`              | `/employees/:id`            | Delete an employee.                    | Admin/HR            |
| **Attendance**        |                             |                                        |                     |
| `POST`                | `/attendance/check-in`      | Employee check-in.                     | Employee            |
| `PATCH`               | `/attendance/check-out`     | Employee check-out.                    | Employee            |
| `GET`                 | `/attendance/today`         | Today's attendance status.             | Employee            |
| `GET`                 | `/attendance/history`       | Personal attendance history.           | Employee            |
| `GET`                 | `/attendance/report`        | Attendance summary for all employees.  | Admin/HR            |
| `GET`                 | `/attendance/report/export` | Export attendance report (CSV).        | Admin/HR            |
| **Leave Requests**    |                             |                                        |                     |
| `POST`                | `/leave/request`            | Submit a leave request.                | Employee            |
| `GET`                 | `/leave/my-requests`        | Personal leave request history.        | Employee            |
| `GET`                 | `/leave/all-requests`       | All leave requests (for approval).     | Admin/HR            |
| `PATCH`               | `/leave/:id/status`         | Approve/deny leave requests.           | Admin/HR            |
| **Salary & Payslips** |                             |                                        |                     |
| `POST`                | `/salary-components/:id`    | Set salary components for an employee. | Admin/HR            |
| `POST`                | `/payslips/generate`        | Generate payslip for an employee.      | Admin/HR            |
| `GET`                 | `/payslips/my-history`      | Personal payslip history.              | Employee            |
| `GET`                 | `/payslips/:id/download`    | Download payslip (PDF).                | Employee & Admin/HR |
| **Documents**         |                             |                                        |                     |
| `POST`                | `/documents/upload/:id`     | Upload document for an employee.       | Admin/HR            |
| `GET`                 | `/documents/:id`            | List documents of an employee.         | Admin/HR            |
