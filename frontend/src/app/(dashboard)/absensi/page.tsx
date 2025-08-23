'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut } from 'lucide-react';

// Define the Attendance type to match the API response
interface Attendance {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

export default function AbsensiPage() {
  const { user } = useAuth(); // Get the authenticated user
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null); // Today's attendance record
  const [isLoading, setIsLoading] = useState(false); // Loading state for check-in/check-out
  const [currentTime, setCurrentTime] = useState(new Date()); // Current date and time for live clock

  // Update currentTime every second to show a live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer); // Clean up interval on unmount
  }, []);

  // Fetch today's attendance from API
  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Failed to load today attendance');
    }
  };

  // Fetch attendance once on component mount
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Handle check-in action
  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await api.post('/attendance/check-in');
      toast.success('Check-in successful!');
      fetchTodayAttendance(); // Refresh attendance data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out action
  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await api.patch('/attendance/check-out');
      toast.success('Check-out successful!');
      fetchTodayAttendance(); // Refresh attendance data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Check-out failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format time string for display
  const formatTime = (dateString: string | null | undefined) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  // Render the attendance page
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>

      {/* Attendance card */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
        {/* Current date and time */}
        <p className="text-lg text-gray-600">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="text-5xl font-bold my-4">{currentTime.toLocaleTimeString('id-ID')}</p>
        
        {/* Check-in and Check-out times */}
        <div className="grid grid-cols-2 gap-4 my-6 text-center">
            <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="text-xl font-semibold">{formatTime(todayAttendance?.check_in_time)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="text-xl font-semibold">{formatTime(todayAttendance?.check_out_time)}</p>
            </div>
        </div>

        {/* Check-in button, shown only if not checked in yet */}
        {!todayAttendance?.check_in_time && (
          <button onClick={handleCheckIn} disabled={isLoading} className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center text-lg hover:bg-green-600 disabled:bg-green-300">
            <LogIn className="mr-2" /> Check-in
          </button>
        )}

        {/* Check-out button, shown only if checked in but not yet checked out */}
        {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
          <button onClick={handleCheckOut} disabled={isLoading} className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center text-lg hover:bg-red-600 disabled:bg-red-300">
            <LogOut className="mr-2" /> Check-out
          </button>
        )}

        {/* Message if both check-in and check-out are completed */}
        {todayAttendance?.check_out_time && (
            <p className="text-green-600 font-semibold mt-4">Thank you, your attendance for today is complete.</p>
        )}
      </div>

      {/* Future improvement: add a table to show attendance history */}
    </div>
  );
}
