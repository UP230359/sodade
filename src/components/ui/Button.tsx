"use client";

import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    joy: "bg-joy text-slate-900 hover:bg-joy/90",
    calm: "bg-calm text-slate-900 hover:bg-calm/90",
    sadness: "bg-sadness text-white hover:bg-sadness/90",
    anger: "bg-anger text-white hover:bg-anger/90",
    anxiety: "bg-anxiety text-white hover:bg-anxiety/90",
    neutral: "bg-neutral text-slate-900 hover:bg-neutral/90",
  };

  return (
    <button
      className={`
        px-5 py-2.5 rounded-full font-medium tracking-wide shadow-xs
        transition-all duration-200 active:scale-98 cursor-pointer
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
