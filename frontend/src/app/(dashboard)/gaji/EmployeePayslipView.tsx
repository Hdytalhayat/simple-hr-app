'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

// Define the type for a payslip
interface Payslip {
  id: string;
  pay_period_month: number;
  pay_period_year: number;
  net_salary: number;
  generated_at: string;
}

// Month names in Indonesian for display
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function EmployeePayslipView() {
  const [payslips, setPayslips] = useState<Payslip[]>([]); // Store fetched payslips
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch the employee's payslip history on component mount
  useEffect(() => {
    const fetchPayslips = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/payslips/my-history'); // API call to get payslip history
        setPayslips(response.data);
      } catch (error) {
        toast.error('Failed to load payslip history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  // Function to handle downloading a payslip PDF
  const handleDownload = async (payslipId: string, period: string) => {
    toast.loading('Downloading payslip...');
    try {
      const response = await api.get(`/payslips/${payslipId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `slip_gaji_${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success('Payslip downloaded successfully.');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download payslip.');
    }
  };

  if (isLoading) return <p>Loading...</p>; // Show loading state while fetching

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payslips.length > 0 ? payslips.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4 whitespace-nowrap">{monthNames[p.pay_period_month - 1]} {p.pay_period_year}</td>
              <td className="px-6 py-4 whitespace-nowrap">Rp {new Intl.NumberFormat('id-ID').format(p.net_salary)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* Button to download payslip PDF */}
                <button
                  onClick={() => handleDownload(p.id, `${monthNames[p.pay_period_month - 1]}-${p.pay_period_year}`)}
                  className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                  <Download className="w-5 h-5 mr-1" /> Download
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="text-center py-4">No payslip history available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
