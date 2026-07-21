import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral";
  className?: string;
}

export default function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    joy: "bg-joy/10 text-joy border-joy/20",
    calm: "bg-calm/10 text-calm border-calm/20",
    sadness: "bg-sadness/10 text-sadness border-sadness/20",
    anger: "bg-anger/10 text-anger border-anger/20",
    anxiety: "bg-anxiety/10 text-anxiety border-anxiety/20",
    neutral: "bg-neutral/10 text-neutral-dark border-neutral/20",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
