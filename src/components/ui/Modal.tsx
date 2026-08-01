// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Modal.tsx
// ----------------------------------------------------

"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  // Función o bloque: comentario automático en español
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

// Función 'Modal': comentario automático en español
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Función 'useEffect': comentario automático en español
  useEffect(() => {
    // Función 'handleKeyDown': comentario automático en español
    const handleKeyDown = (e: KeyboardEvent) => {
      // Función 'if': comentario automático en español
      if (e.key === "Escape") onClose();
    };
    // Función 'if': comentario automático en español
    if (isOpen) {
      // Función 'addEventListener': comentario automático en español
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Función 'return': comentario automático en español
    return () => {
      // Función 'removeEventListener': comentario automático en español
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Función 'if': comentario automático en español
  if (!isOpen) return null;

  // Render directly via portal; in Next.js client components, document.body is available on client render
  if (typeof window === "undefined") return null;

  // Función 'createPortal': comentario automático en español
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-background border border-neutral/20 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        // Función o bloque: comentario automático en español
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
    </div>,
    document.body
  );
}

