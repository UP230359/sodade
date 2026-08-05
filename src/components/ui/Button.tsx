import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "joy"
  | "calm"
  | "sadness"
  | "anger"
  | "anxiety"
  | "fear"
  | "disgust"
  | "surprise"
  | "trust"
  | "neutral";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    outline: "border-2 border-muted text-foreground hover:border-foreground/30",
    ghost: "bg-transparent text-secondary hover:text-foreground hover:bg-muted/50",
    danger: "bg-anger text-white hover:bg-anger/90",
    joy: "bg-joy text-white hover:bg-joy/90",
    calm: "bg-calm text-white hover:bg-calm/90",
    sadness: "bg-sadness text-white hover:bg-sadness/90",
    anger: "bg-anger text-white hover:bg-anger/90",
    anxiety: "bg-anxiety text-white hover:bg-anxiety/90",
    fear: "bg-fear text-white hover:bg-fear/90",
    disgust: "bg-disgust text-white hover:bg-disgust/90",
    surprise: "bg-surprise text-white hover:bg-surprise/90",
    trust: "bg-trust text-white hover:bg-trust/90",
    neutral: "bg-neutral text-white hover:bg-neutral/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
