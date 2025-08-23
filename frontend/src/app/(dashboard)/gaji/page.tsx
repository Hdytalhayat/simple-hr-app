'use client';

import { useAuth } from '@/context/AuthContext';
import AdminPayrollView from './AdminPayrollView';
import EmployeePayslipView from './EmployeePayslipView';

// Main Payroll Page
export default function GajiPage() {
  const { user } = useAuth(); // Get authenticated user
  const isAdminView = user?.role === 'Admin' || user?.role === 'HR'; // Determine if the user is an admin or HR

  return (
    <div>
      {/* Page title changes based on user role */}
      <h1 className="text-3xl font-bold mb-6">
        {isAdminView ? 'Payroll Management' : 'Payslip History'}
      </h1>

      {/* Render the appropriate view based on role */}
      {isAdminView ? <AdminPayrollView /> : <EmployeePayslipView />}
    </div>
  );
}
