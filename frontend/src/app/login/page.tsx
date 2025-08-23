'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  // State for email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to show loading indicator while logging in
  const [isLoading, setIsLoading] = useState(false);

  // Get login function from AuthContext
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    setIsLoading(true);
    try {
      // Call backend API to login
      const response = await api.post('/auth/login', { email, password });
      toast.success('Login successful!');
      // Save token and user info in AuthContext & localStorage
      login(response.data.token, response.data.user);
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Login failed, please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Login card container */}
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login HR App</h2>
        {/* Login form */}
        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="nama@perusahaan.com"
              required
            />
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading} // Disable while loading
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
