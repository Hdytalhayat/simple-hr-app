'use client'; // Marks this component as a Client Component so we can use hooks and browser APIs

import { useEffect, useState, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import EmployeeForm, { EditableEmployee } from './EmployeeForm';

interface Employee extends EditableEmployee {
  id: string;
}
const initialFormState: EditableEmployee = {
  full_name: '',
  email: '',
  password: '',
  job_title: '',
  department: '',
  role: 'Karyawan',
  employment_status: 'Aktif'
};

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<Employee[]>([]); // Store list of employees
  const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EditableEmployee>(initialFormState);

  // Function to fetch all employees from API
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to load employee data.'); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentEmployee(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setIsEditMode(true);
    setCurrentEmployee({ ...employee });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/employees/${currentEmployee.id}`, currentEmployee);
        toast.success('Employee data updated successfully.');
      } else {
        await api.post('/employees', currentEmployee);
        toast.success('New employee added successfully.');
      }
      closeModal();
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deleting an employee
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Employee deleted successfully.');
        fetchEmployees(); // Reload employee list
      } catch (error) {
        toast.error('Failed to delete employee.');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div>
      {/* Header with title and add employee button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Employee table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">{employee.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.job_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Edit button (functionality to be implemented) */}
                  <button onClick={() => openEditModal(employee)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit className="w-5 h-5" />
                  </button>
                  {/* Delete button */}
                  <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal untuk Tambah/Edit */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}>
        <EmployeeForm
          employee={currentEmployee}
          setEmployee={setCurrentEmployee}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode={isEditMode}
        />
      </Modal>
    </div>
  );
}
