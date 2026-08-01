// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Input.tsx
// ----------------------------------------------------

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// Función 'Input': comentario automático en español
export default function Input({ label, className = "", ...props }: InputProps) {
  // Función 'return': comentario automático en español
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-secondary">{label}</label>}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl border border-neutral/30 
          bg-background text-foreground placeholder:text-secondary/50
          focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20
          transition-all duration-150
          ${className}
        `}
        {...props}
      />
    </div>
  );
}

