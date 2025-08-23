import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast'; // Import Toaster for toast notifications

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HR App Sederhana', // App title
  description: 'Aplikasi HR untuk Startup dan UKM', // App description
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire app with AuthProvider for authentication context */}
        <AuthProvider>
          {/* Toaster component to show toast notifications at top-center */}
          <Toaster position="top-center" />
          
          {/* Render all child components */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
