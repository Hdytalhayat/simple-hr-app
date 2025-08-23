'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LeaveRequestForm, { LeaveFormData } from './LeaveRequestForm';

// Define the type for a leave request
interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak'; // Pending, Approved, Rejected
  full_name?: string; // Optional: employee name, needed for admin view
}

// Initial state for the leave request form
const initialFormState: LeaveFormData = {
  leave_type: 'Cuti Tahunan',
  start_date: '',
  end_date: '',
  reason: '',
};

// Function to format date strings into a readable format
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

// Component to display leave status with colored badge
const LeaveStatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Disetujui: 'bg-green-100 text-green-800',
    Ditolak: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

export default function CutiPage() {
  const { user } = useAuth(); // Get the authenticated user
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [isLoading, setIsLoading] = useState(false); // Loading state for API requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]); // Leave request data
  const [formData, setFormData] = useState<LeaveFormData>(initialFormState); // Form state for new requests

  // Fetch leave requests based on user role
  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      // Admin/HR sees all requests, regular employee sees only their own
      const endpoint =
        user?.role === 'Admin' || user?.role === 'HR' ? '/leave/all-requests' : '/leave/my-requests';
      const response = await api.get(endpoint);
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error('Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leave requests whenever the user changes or page loads
  useEffect(() => {
    if (user) fetchLeaveRequests();
  }, [user]);

  // Handle submission of a new leave request
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/leave/request', formData);
      toast.success('Leave request submitted successfully.');
      setIsModalOpen(false);
      setFormData(initialFormState); // Reset form
      fetchLeaveRequests(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating the status of a leave request (Admin/HR only)
  const handleUpdateStatus = async (id: string, status: 'Disetujui' | 'Ditolak') => {
    if (window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
      try {
        await api.patch(`/leave/${id}/status`, { status });
        toast.success(`Request successfully ${status.toLowerCase()}.`);
        fetchLeaveRequests(); // Refresh list
      } catch (error) {
        toast.error('Failed to update request status.');
      }
    }
  };

  const isAdminView = user?.role === 'Admin' || user?.role === 'HR'; // Flag for admin/HR view

  return (
    <div>
      {/* Page header: title and "Submit Leave" button for employees */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isAdminView ? 'Leave Management' : 'Leave & Permission Request'}
        </h1>
        {!isAdminView && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Submit Leave
          </button>
        )}
      </div>

      {/* Table showing leave request history */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isAdminView && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveRequests.map((req) => (
              <tr key={req.id}>
                {isAdminView && <td className="px-6 py-4 whitespace-nowrap">{req.full_name}</td>}
                <td className="px-6 py-4 whitespace-nowrap">{req.leave_type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(req.start_date)} - {formatDate(req.end_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LeaveStatusBadge status={req.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Admin/HR can approve or reject pending requests */}
                  {isAdminView && req.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'Disetujui')}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <CheckCircle />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'Ditolak')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for submitting a new leave request */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Leave Request Form">
        <LeaveRequestForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
