'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define the type for a leave request
interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak'; // Pending, Approved, Rejected
}

// Component to display leave status with colored badge
const LeaveStatusBadge = ({ status }: { status: LeaveRequest['status'] }) => {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Disetujui: 'bg-green-100 text-green-800',
    Ditolak: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
};

export default function CutiPage() {
  const { user } = useAuth(); // Get the authenticated user
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  // TODO: Add more state for leave requests, form inputs, loading, etc.

  // TODO: Add functions to fetch leave requests, submit a new request, etc.

  // Render the leave request page
  return (
    <div>
      {/* Page header with title and "Add Leave" button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leave & Permission Requests</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Submit Leave
        </button>
      </div>

      {/* TODO: Render a table or list of leave requests here */}

      {/* Modal for submitting a new leave request */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Leave Request Form">
        {/* TODO: Build leave request form inside the modal */}
        <p>Form will go here</p>
      </Modal>
    </div>
  );
}
