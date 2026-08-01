// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Select.tsx
// ----------------------------------------------------

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
}

// Función 'Select': comentario automático en español
export default function Select({ label, options, className = "", ...props }: SelectProps) {
  // Función 'return': comentario automático en español
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-secondary">{label}</label>}
      <select
        className={`
          w-full px-4 py-2.5 rounded-xl border border-neutral/30
          bg-background text-foreground
          focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20
          transition-all duration-150 appearance-none
          ${className}
        `}
        {...props}
      >
        // Función 'map': comentario automático en español
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

