# Frontend - Simple HR Web App

This is the user interface (UI) for a simple Human Resources (HR) application, built with Next.js, React, and TypeScript. The application is designed to interact with the [HR Backend API](https://github.com/USERNAME/REPO-NAME/tree/main/backend) to provide a modern, responsive, and intuitive user experience.

<!-- TODO: Add application screenshots here, such as the login page and dashboard -->

<!-- ![Dashboard Screenshot](link_to_screenshot.png) -->

## ✅ Key Features

The app provides different interfaces based on the user’s role:

#### For All Employees:

* **Secure Login:** Login page to access the system.
* **Personal Dashboard:** Welcome page and summary view.
* **Real-time Attendance:** Features to **Check-in** and **Check-out**.
* **Leave Requests:** Interactive form for requesting leave or permission.
* **Leave History:** View the status and history of leave requests (Pending, Approved, Rejected).
* **Salary History:** View a list of monthly payslips and download them in **PDF** format.

#### For Admin & HR Only:

* All features available to employees, plus:
* **Employee Management:** Add, view, edit, and delete (CRUD) employee data via interactive modals.
* **Statistics Dashboard:** Displays key summary data such as total employees and attendance status.
* **Attendance Reports:** View daily attendance recaps for all employees with date filters.
* **Export Reports:** Download attendance reports in **CSV** format.
* **Leave Management:** Approve or reject leave requests submitted by employees.
* **Salary Management:** Manage salary components per employee and generate monthly payslips.

## 🛠️ Tech Stack

* **Framework:** Next.js (with App Router)
* **UI Library:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Global State Management:** React Context API
* **API Calls:** Axios
* **Notifications:** `react-hot-toast`
* **Icons:** `lucide-react`

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended).
* [Git](https://git-scm.com/).
* **IMPORTANT:** The **HR Backend API must be running** for this frontend to function. Make sure you’ve followed the setup instructions in the [Backend README](https://github.com/USERNAME/REPO-NAME/tree/main/backend).

### 1. Installation

Clone this repository to your local machine:

```bash
git clone https://github.com/Hdytalhayat/simple-hr-app.git
cd simple-hr-app/frontend
```

Install all required dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file inside the `frontend` directory. This file will contain the URL where your backend API is running.

```env
# frontend/.env.local

# URL where your backend API is running
# Make sure the port matches your backend (default: 3001)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Run the Application

Once the backend is running and `.env.local` is configured, start the frontend development server:

```bash
npm run dev
```

The app will run and be accessible at **[http://localhost:3000](http://localhost:3000)**.

---

## 📂 Project Folder Structure

The project folder structure is designed to be scalable and maintainable.

```
frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/      # Route Group for protected pages
│   │   │   ├── absensi/
│   │   │   ├── cuti/
│   │   │   ├── gaji/
│   │   │   ├── karyawan/
│   │   │   ├── layout.tsx    # Layout with Sidebar
│   │   │   └── page.tsx      # Main dashboard page
│   │   ├── login/            # Public route for login
│   │   └── layout.tsx        # Root layout with AuthProvider
│   │
│   ├── components/           # Reusable UI components (Modal, Sidebar)
│   │
│   ├── context/              # Global State (AuthContext)
│   │
│   └── lib/                  # Utilities (Axios config)
│
└── ... (config files)
```

### Structure Explanation:

* **`src/app/(dashboard)`**: Uses Next.js *Route Groups* to apply layout and route protection to all pages that require login, without affecting the URL.
* **`src/components`**: Contains generic UI components reusable across multiple pages, e.g., `Modal.tsx`.
* **`src/context`**: `AuthContext.tsx` manages global user authentication state so components can access login status.
* **`src/lib`**: `api.ts` provides a centralized Axios instance that automatically attaches the JWT token to each API request, keeping component code clean.

---

## 🔗 Backend Connection

This frontend is *headless*, meaning it cannot function without the backend. All data is fetched and manipulated via API calls to the backend server. The connection is configured through the `NEXT_PUBLIC_API_URL` variable in the `.env.local` file.
