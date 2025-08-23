'use client'; // Marks this component as a Client Component so it can use React hooks and browser APIs

import { X } from 'lucide-react';
import { ReactNode } from 'react';

// Props interface for the Modal component
interface ModalProps {
  isOpen: boolean; // Controls whether the modal is visible
  onClose: () => void; // Callback to close the modal
  title: string; // Title displayed at the top of the modal
  children: ReactNode; // Content inside the modal
}

// Reusable modal component
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // If modal is not open, render nothing
  if (!isOpen) return null;

  return (
    // Overlay background
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* Modal content container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        {/* Modal title */}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {/* Modal body/content */}
        {children}
      </div>
    </div>
  );
}
