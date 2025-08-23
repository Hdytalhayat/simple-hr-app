'use client';

import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, FileText, Download } from 'lucide-react';
import Modal from '@/components/Modal';

// Define the types used in this component
interface Employee {
  id: string;
  full_name: string;
}

interface SalaryComponent {
  basic_salary: number;
  allowances: Record<string, number>;
  deductions: Record<string, number>;
}

// Form component to set/update salary for an employee
const SalaryForm = ({ employeeId, onClose }: { employeeId: string; onClose: () => void; }) => {
    const [salary, setSalary] = useState<SalaryComponent>({ basic_salary: 0, allowances: {}, deductions: {} });
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission to save salary components
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Example allowances and deductions for demonstration
        const allowances = { "Transport": 500000 };
        const deductions = { "BPJS": 150000 };
        
        try {
            await api.post(`/salary-components/${employeeId}`, { ...salary, allowances, deductions });
            toast.success("Salary components saved successfully.");
            onClose();
        } catch(error) {
            toast.error("Failed to save salary components.");
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Input for basic salary */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Basic Salary (Rp)</label>
                <input
                  type="number"
                  value={salary.basic_salary}
                  onChange={e => setSalary({...salary, basic_salary: parseFloat(e.target.value)})}
                  required
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                />
            </div>
            <p className="text-sm text-gray-500 mb-4">Dynamic allowances & deductions feature will be developed.</p>
            <div className="flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

// Form component to generate a payslip for an employee
const GeneratePayslipForm = ({ employeeId, onClose }: { employeeId: string; onClose: () => void; }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission to generate payslip
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/payslips/generate', { employee_id: employeeId, month, year });
            toast.success("Payslip generated successfully!");
            onClose();
        } catch(error: any) {
            toast.error(error.response?.data?.message || "Failed to generate payslip.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Input for month and year */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Month</label>
                    <input
                      type="number"
                      value={month}
                      onChange={e => setMonth(parseInt(e.target.value))}
                      min="1"
                      max="12"
                      required
                      className="mt-1 block w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={e => setYear(parseInt(e.target.value))}
                      min="2020"
                      required
                      className="mt-1 block w-full px-3 py-2 border rounded-md"
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  {isLoading ? 'Processing...' : 'Generate'}
                </button>
            </div>
        </form>
    );
};

export default function AdminPayrollView() {
  const [employees, setEmployees] = useState<Employee[]>([]); // List of all employees
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // Currently selected employee for modal
  const [modalType, setModalType] = useState<'salary' | 'generate' | null>(null); // Type of modal to show

  // Fetch all employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/employees');
        setEmployees(response.data);
      } catch (error) {
        toast.error('Failed to load employees.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  
  // Open modal with selected employee and modal type
  const openModal = (employee: Employee, type: 'salary' | 'generate') => {
      setSelectedEmployee(employee);
      setModalType(type);
  };
  
  // Close the modal
  const closeModal = () => {
      setSelectedEmployee(null);
      setModalType(null);
  };

  if (isLoading) return <p>Loading...</p>; // Show loading state

  return (
    <>
      {/* Employee table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{emp.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-4">
                  {/* Button to open salary form modal */}
                  <button onClick={() => openModal(emp, 'salary')} className="text-gray-600 hover:text-blue-700 flex items-center text-sm">
                    <Settings className="w-4 h-4 mr-1" /> Set Salary
                  </button>
                  {/* Button to open generate payslip modal */}
                  <button onClick={() => openModal(emp, 'generate')} className="text-gray-600 hover:text-green-700 flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-1" /> Generate Payslip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal for salary setup or payslip generation */}
      {selectedEmployee && (
        <Modal
          isOpen={!!modalType}
          onClose={closeModal}
          title={modalType === 'salary' ? `Set Salary: ${selectedEmployee.full_name}` : `Generate Payslip: ${selectedEmployee.full_name}`}
        >
          {modalType === 'salary' && <SalaryForm employeeId={selectedEmployee.id} onClose={closeModal} />}
          {modalType === 'generate' && <GeneratePayslipForm employeeId={selectedEmployee.id} onClose={closeModal} />}
        </Modal>
      )}
    </>
  );
}
