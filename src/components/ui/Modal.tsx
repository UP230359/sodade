"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by mounting the portal only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when pressing the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop: Clicking outside the modal closes it */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 
        Modal Container: 
        max-h-[90vh] and overflow-y-auto ensure that if the phone is held horizontally 
        (landscape), the user can scroll down to the submit button.
      */}
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Close Button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-secondary hover:text-foreground hover:bg-muted rounded-full transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="p-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
