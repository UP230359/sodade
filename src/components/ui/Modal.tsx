"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-background border border-neutral/20 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral/10">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="text-secondary hover:text-foreground transition-colors cursor-pointer text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
