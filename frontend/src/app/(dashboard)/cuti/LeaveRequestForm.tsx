'use client';

import { FormEvent } from 'react';

// Define the shape of the leave request form data
export interface LeaveFormData {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface LeaveRequestFormProps {
  formData: LeaveFormData;                   // Current form state
  setFormData: (data: LeaveFormData) => void; // Function to update form state
  onSubmit: (e: FormEvent) => void;          // Submit handler
  isLoading: boolean;                         // Loading state for submit button
}

export default function LeaveRequestForm({ formData, setFormData, onSubmit, isLoading }: LeaveRequestFormProps) {
  // Handle input/select/textarea changes and update the form state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* Leave type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Leave Type</label>
          <select 
            name="leave_type" 
            value={formData.leave_type} 
            onChange={handleChange} 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="Cuti Tahunan">Annual Leave</option>
            <option value="Sakit">Sick Leave</option>
            <option value="Izin Khusus">Special Permission</option>
          </select>
        </div>

        {/* Date selection: start and end */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
              type="date" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input 
              type="date" 
              name="end_date" 
              value={formData.end_date} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
            />
          </div>
        </div>

        {/* Reason textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea 
            name="reason" 
            value={formData.reason} 
            onChange={handleChange} 
            required 
            rows={3} 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          ></textarea>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-6 flex justify-end">
        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Sending...' : 'Submit Leave Request'}
        </button>
      </div>
    </form>
  );
}
