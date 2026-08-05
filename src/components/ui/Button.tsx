import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "joy" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {

  // Base uniform button styling
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // Map standard layout states to global CSS variables
  const variants = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    outline: "border-2 border-muted text-foreground hover:border-foreground/30",
    ghost: "bg-transparent text-secondary hover:text-foreground hover:bg-muted/50",
    joy: "bg-joy text-white hover:bg-joy/90",
    danger: "bg-anger text-white hover:bg-anger/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
