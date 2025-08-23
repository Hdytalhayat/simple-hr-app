'use client'; // Marks this component as a Client Component to allow hooks and browser APIs

import { FormEvent } from 'react';

// Define the type for an employee that can be edited or created
export interface EditableEmployee {
  id?: string; // Optional for new employees
  full_name: string;
  email: string;
  password?: string; // Optional because password may not be edited
  job_title: string;
  department: string;
  role: 'Admin' | 'HR' | 'Karyawan';
  employment_status: 'Aktif' | 'Tidak Aktif';
}

// Props for the EmployeeForm component
interface EmployeeFormProps {
  employee: EditableEmployee; // Employee data
  setEmployee: (employee: EditableEmployee) => void; // Setter function to update employee state
  onSubmit: (e: FormEvent) => void; // Callback for form submission
  isLoading: boolean; // Loading state for submission
  isEditMode: boolean; // Determines if the form is in edit mode
}

// Reusable form component for creating or editing employees
export default function EmployeeForm({
  employee,
  setEmployee,
  onSubmit,
  isLoading,
  isEditMode,
}: EmployeeFormProps) {
  // Generic change handler for inputs and selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            value={employee.full_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={employee.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Password Input (only for create mode) */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={employee.password || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        )}

        {/* Job Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Jabatan</label>
          <input
            type="text"
            name="job_title"
            value={employee.job_title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Department Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Departemen</label>
          <input
            type="text"
            name="department"
            value={employee.department}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Peran (Role)</label>
          <select
            name="role"
            value={employee.role}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="Karyawan">Karyawan</option>
            <option value="HR">HR</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Employment Status Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="employment_status"
            value={employee.employment_status}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
