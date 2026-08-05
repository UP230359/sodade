"use client";

import CheckInForm from "./CheckInForm";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>

        {/* Form inside modal */}
        <div className="p-8">
          <CheckInForm />
        </div>
      </div>
    </div>
  );
}
