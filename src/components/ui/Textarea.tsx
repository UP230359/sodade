// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Textarea.tsx
// ----------------------------------------------------

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

// Función 'Textarea': comentario automático en español
export default function Textarea({ label, className = "", ...props }: TextareaProps) {
  // Función 'return': comentario automático en español
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-secondary">{label}</label>}
      <textarea
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

