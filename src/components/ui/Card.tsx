// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Card.tsx
// ----------------------------------------------------

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

// Función 'Card': comentario automático en español
export default function Card({ children, className = "" }: CardProps) {
  // Función 'return': comentario automático en español
  return (
    <div className={`bg-background border border-neutral/20 rounded-2xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

