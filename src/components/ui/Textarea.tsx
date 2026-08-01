// components/ui/Textarea.tsx
import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-secondary">{label}</label>}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border border-neutral/30
            bg-background text-foreground placeholder:text-secondary/50
            focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20
            transition-all duration-150 resize-y
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;