'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, Download } from 'lucide-react';

// Define type for employee attendance
interface Attendance {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
}

// Define type for attendance report (admin view)
interface AttendanceReport extends Attendance {
  full_name: string;
  department: string;
}

// Format time from a string to 'HH:MM'
const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Employee view: display today's attendance and check-in/out buttons
const EmployeeAttendanceView = () => {
    const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch today's attendance for the logged-in employee
    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get('/attendance/today');
            setTodayAttendance(response.data);
        } catch (error) {
            console.error('Failed to fetch today\'s attendance', error);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    // Handle check-in
    const handleCheckIn = async () => {
        setIsLoading(true);
        try {
            await api.post('/attendance/check-in');
            toast.success('Check-in successful!');
            fetchTodayAttendance();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to check in.');
        } finally {
            setIsLoading(false);
        }
    };
      
    // Handle check-out
    const handleCheckOut = async () => {
        setIsLoading(true);
        try {
            await api.patch('/attendance/check-out');
            toast.success('Check-out successful!');
            fetchTodayAttendance();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to check out.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render employee attendance UI
    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-center">
            <p className="text-lg text-gray-600">{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-5xl font-bold my-4">{currentTime.toLocaleTimeString('id-ID')}</p>
            
            {/* Show check-in and check-out times */}
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

            {/* Show check-in button if not yet checked in */}
            {!todayAttendance?.check_in_time && (
              <button onClick={handleCheckIn} disabled={isLoading} className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center text-lg hover:bg-green-600 disabled:bg-green-300">
                <LogIn className="mr-2" /> Check-in
              </button>
            )}

            {/* Show check-out button if checked in but not yet checked out */}
            {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
              <button onClick={handleCheckOut} disabled={isLoading} className="w-full bg-red-500 text-white py-3 rounded-lg flex items-center justify-center text-lg hover:bg-red-600 disabled:bg-red-300">
                <LogOut className="mr-2" /> Check-out
              </button>
            )}

            {/* Message if both check-in and check-out are done */}
            {todayAttendance?.check_out_time && (
                <p className="text-green-600 font-semibold mt-4">Thank you, your attendance is complete for today.</p>
            )}
        </div>
    );
};

// Admin view: display attendance report and export CSV
const AdminAttendanceView = () => {
  const [reportData, setReportData] = useState<AttendanceReport[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attendance report for selected date
  const fetchReport = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/attendance/report?date=${date}`);
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to load attendance report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);
  
  // Export CSV for selected date
  const handleExport = async () => {
    toast.loading('Preparing download...');
    try {
        const response = await api.get(`/attendance/report/export?startDate=${selectedDate}&endDate=${selectedDate}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.dismiss();
        toast.success("Report downloaded successfully.");
    } catch (error) {
        toast.dismiss();
        toast.error("Failed to download report.");
    }
  };

  // Render admin attendance report table
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <label htmlFor="report-date" className="mr-2 font-medium">Select Date:</label>
                <input type="date" id="report-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg" />
            </div>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
                <Download className="w-5 h-5 mr-2" />
                Export CSV
            </button>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((row) => (
                        <tr key={row.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{row.full_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatTime(row.check_in_time)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatTime(row.check_out_time)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
    
// Main Attendance Page: show either employee view or admin view
export default function AbsensiPage() {
  const { user } = useAuth();
  const isAdminView = user?.role === 'Admin' || user?.role === 'HR';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{isAdminView ? 'Employee Attendance Report' : 'Attendance'}</h1>
      {isAdminView ? <AdminAttendanceView /> : <EmployeeAttendanceView />}
    </div>
  );
}
