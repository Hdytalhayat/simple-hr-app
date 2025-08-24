"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Settings, FileText, PlusCircle, XCircle } from "lucide-react";
import Modal from "@/components/Modal";

// Data Types
interface Employee {
  id: string;
  full_name: string;
}
interface DynamicField {
  name: string;
  amount: number;
}
// =================================================================
// MAIN CHANGES ARE IN SalaryForm COMPONENT BELOW
// =================================================================
const SalaryForm = ({
  employeeId,
  onClose,
}: {
  employeeId: string;
  onClose: () => void;
}) => {
  const [basicSalary, setBasicSalary] = useState(0);
  const [allowances, setAllowances] = useState<DynamicField[]>([]);
  const [deductions, setDeductions] = useState<DynamicField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryComponents = async () => {
      try {
        // This endpoint should exist in the backend: GET /api/salary-components/:employeeId
        const response = await api.get(`/salary-components/${employeeId}`);
        const data = response.data;
        if (data) {
          setBasicSalary(data.basic_salary);
          // Transform object to array for state management
          setAllowances(
            Object.entries(data.allowances).map(([name, amount]) => ({
              name,
              amount: Number(amount),
            }))
          );
          setDeductions(
            Object.entries(data.deductions).map(([name, amount]) => ({
              name,
              amount: Number(amount),
            }))
          );
        }
      } catch (error) {
        // It's fine if 404 (no data yet), otherwise show error
        if ((error as any).response?.status !== 404) {
          toast.error("Failed to load salary components.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalaryComponents();
  }, [employeeId]);

  // Generic function to handle changes in dynamic fields
  const handleFieldChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
    type: "allowances" | "deductions"
  ) => {
    const list = type === "allowances" ? [...allowances] : [...deductions];
    const { name, value } = event.target;

    if (name === "amount") {
      list[index].amount = parseFloat(value) || 0;
    } else if (name === "name") {
      list[index].name = value;
    }

    type === "allowances" ? setAllowances(list) : setDeductions(list);
  };
  // Generic function to add a new field
  const handleAddField = (type: "allowances" | "deductions") => {
    const list =
      type === "allowances"
        ? [...allowances, { name: "", amount: 0 }]
        : [...deductions, { name: "", amount: 0 }];
    type === "allowances" ? setAllowances(list) : setDeductions(list);
  };

  // Generic function to remove a field
  const handleRemoveField = (
    index: number,
    type: "allowances" | "deductions"
  ) => {
    const list = type === "allowances" ? [...allowances] : [...deductions];
    list.splice(index, 1);
    type === "allowances" ? setAllowances(list) : setDeductions(list);
  };

  // Handle salary form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Transform back from array to object before sending to API
    const payload = {
      basic_salary: basicSalary,
      allowances: allowances.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: Number(curr.amount) || 0 }),
        {}
      ),
      deductions: deductions.reduce(
        (acc, curr) => ({ ...acc, [curr.name]: Number(curr.amount) || 0 }),
        {}
      ),
    };

    try {
      await api.post(`/salary-components/${employeeId}`, payload);
      toast.success("Salary components saved successfully.");
      onClose();
    } catch (error) {
      toast.error("Failed to save salary components.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p>Loading data...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Basic Salary (Rp)
        </label>
        <input
          type="number"
          value={basicSalary}
          onChange={(e) => setBasicSalary(parseFloat(e.target.value))}
          required
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Dynamic Allowances Section */}
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Allowances
        </label>
        {allowances.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              name="name"
              placeholder="Allowance Name"
              value={item.name}
              onChange={(e) => handleFieldChange(index, e, "allowances")}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (Rp)"
              value={item.amount}
              onChange={(e) => handleFieldChange(index, e, "allowances")}
              className="w-32 px-3 py-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(index, "allowances")}
              className="text-red-500"
            >
              <XCircle />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField("allowances")}
          className="mt-2 text-blue-600 flex items-center text-sm font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add Allowance
        </button>
      </div>

      {/* Dynamic Deductions Section */}
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Deductions
        </label>
        {deductions.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              name="name"
              placeholder="Deduction Name"
              value={item.name}
              onChange={(e) => handleFieldChange(index, e, "deductions")}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (Rp)"
              value={item.amount}
              onChange={(e) => handleFieldChange(index, e, "deductions")}
              className="w-32 px-3 py-2 border rounded-md"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(index, "deductions")}
              className="text-red-500"
            >
              <XCircle />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField("deductions")}
          className="mt-2 text-blue-600 flex items-center text-sm font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add Deduction
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

// Form component to generate a payslip for an employee
const GeneratePayslipForm = ({
  employeeId,
  onClose,
}: {
  employeeId: string;
  onClose: () => void;
}) => {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission to generate payslip
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/payslips/generate", {
        employee_id: employeeId,
        month,
        year,
      });
      toast.success("Payslip generated successfully!");
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate payslip."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Input for month and year */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            min="1"
            max="12"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            required
            className="mt-1 block w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {isLoading ? "Processing..." : "Generate"}
        </button>
      </div>
    </form>
  );
};

export default function AdminPayrollView() {
  const [employees, setEmployees] = useState<Employee[]>([]); // List of all employees
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  ); // Currently selected employee for modal
  const [modalType, setModalType] = useState<"salary" | "generate" | null>(
    null
  ); // Type of modal to show

  // Fetch all employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/employees");
        setEmployees(response.data);
      } catch (error) {
        toast.error("Failed to load employees.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Open modal with selected employee and modal type
  const openModal = (employee: Employee, type: "salary" | "generate") => {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {emp.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-4">
                  {/* Button to open salary form modal */}
                  <button
                    onClick={() => openModal(emp, "salary")}
                    className="text-gray-600 hover:text-blue-700 flex items-center text-sm"
                  >
                    <Settings className="w-4 h-4 mr-1" /> Set Salary
                  </button>
                  {/* Button to open generate payslip modal */}
                  <button
                    onClick={() => openModal(emp, "generate")}
                    className="text-gray-600 hover:text-green-700 flex items-center text-sm"
                  >
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
          title={
            modalType === "salary"
              ? `Set Salary: ${selectedEmployee.full_name}`
              : `Generate Payslip: ${selectedEmployee.full_name}`
          }
        >
          {modalType === "salary" && (
            <SalaryForm employeeId={selectedEmployee.id} onClose={closeModal} />
          )}
          {modalType === "generate" && (
            <GeneratePayslipForm
              employeeId={selectedEmployee.id}
              onClose={closeModal}
            />
          )}
        </Modal>
      )}
    </>
  );
}
