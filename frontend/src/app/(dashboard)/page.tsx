'use client'; // Marks this component as a Client Component, so it can use hooks like useState/useEffect and browser APIs

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth(); // Get the authenticated user from the Auth context

  return (
    <div>
      {/* Greet the logged-in user */}
      <h1 className="text-3xl font-bold mb-4">Selamat Datang, {user?.full_name}!</h1>
      
      {/* Simple description or instruction */}
      <p className="text-gray-600">Ini adalah halaman dashboard utama Anda.</p>
      
      {/* Placeholder for future widgets or statistics */}
      {/* Here we will add dashboard widgets/statistics later */}
    </div>
  );
}
