'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Calendar, LogOut, Briefcase, DollarSign } from 'lucide-react'; 
import { useAuth } from '@/context/AuthContext';

// Define the sidebar navigation links
// Each link has a href, label, icon, and allowed roles
const navLinks = [
  { href: '/karyawan', label: 'Karyawan', icon: Users, roles: ['Admin', 'HR'] },
  { href: '/absensi', label: 'Absensi', icon: Calendar, roles: ['Admin', 'HR', 'Karyawan'] },
  { href: '/cuti', label: 'Cuti', icon: Briefcase, roles: ['Admin', 'HR', 'Karyawan'] },
  { href: '/gaji', label: 'Gaji', icon: DollarSign, roles: ['Admin', 'HR', 'Karyawan'] },
];

export default function Sidebar() {
  const pathname = usePathname(); // Get current path to highlight active link
  const { user, logout } = useAuth(); // Get logged-in user and logout function

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Sidebar header */}
      <div className="p-4 text-2xl font-bold border-b border-gray-700">HR App</div>

      {/* Navigation links */}
      <nav className="flex-1 p-2">
        {navLinks.map((link) =>
          // Only render link if user exists and has allowed role
          user && link.roles.includes(user.role) ? (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center p-3 my-1 rounded-lg transition-colors ${
                pathname.startsWith(link.href) ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              {/* Render the icon */}
              <link.icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          ) : null
        )}
      </nav>

      {/* Logout button at the bottom */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 rounded-lg text-left hover:bg-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
