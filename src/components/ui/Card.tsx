import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-background border border-neutral/20 rounded-2xl shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
