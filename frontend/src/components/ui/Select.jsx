import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn.js";


const SIZE_CLASSES = {
  sm: "h-9 px-3 text-xs rounded-[10px]",       
  md: "h-10 px-3 text-sm rounded-[12px]",        
  lg: "h-11 px-4 text-sm rounded-[14px]",       
};

const VARIANT_CLASSES = {
  neutral: cn(
    "bg-[color:var(--color-neutral2)]",
    "border border-[color:var(--color-neutral3)]",
    "text-[color:var(--color-text)]"
  ),

  primary: cn(
    "bg-[color:var(--color-neutral2)]",
    "border border-[color:var(--color-primary3)]",
    "text-[color:var(--color-text)]"
  ),

  ghost: cn(
    "bg-transparent",
    "border border-[color:var(--color-neutral3)]",
    "text-[color:var(--color-text)]"
  ),
};

const ERROR_CLASSES = cn(
  "border-[color:var(--color-error)]",
  "text-[color:var(--color-error)]"
);

export function Select({
  id,
  label,                     
  placeholder = "Selecciona una opción", 
  helperText,                
  error,                    
  fullWidth = false,       
  size = "md",           
  variant = "neutral",      
  name,
  value,
  onChange,
  options = [],             
  disabled = false,
  required = false,
}) {

const internalId = React.useId();
  const selectId = id ?? internalId;

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral;

  const hasError = Boolean(error);

  return (
    <div
      className={cn(
        "flex flex-col gap-1",           
        fullWidth && "w-full"                   
      )}
    >
      {/* Label opcional */}
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "text-xs font-medium",
            hasError
              ? "text-(--color-error)"
              : "text-(--color-text-secondary)"
          )}
        >
          {label}
          {required && <span className="text-[color:var(--color-error)]"> *</span>}
        </label>
      )}

      {/* Contenedor para el select + ícono de flecha */}
      <div className="relative">
        {/* elemento select nativo */}
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "block w-full appearance-none",
            "outline-none",
            "leading-snug",
            "shadow-sm",
            "transition-colors duration-150",
            sizeClass,
            variantClass,
            disabled &&
              "opacity-60 cursor-not-allowed bg-[color:var(--color-neutral1)]",
            hasError && ERROR_CLASSES,
            !disabled &&
              !hasError &&
              "focus:border-[color:var(--color-primary4)] focus:ring-2 focus:ring-[color:var(--overlay-soft)]",
            !disabled &&
              hasError &&
              "focus:border-[color:var(--color-error)] focus:ring-2 focus:ring-[color:var(--color-error)]/30"
          )}
        >
          {/* placeholder como opción deshabilitada */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* ícono de flecha dropdown (no dependemos de librerías) */}
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 right-3",
            "flex items-center text-xs",
            hasError
              ? "text-[color:var(--color-error)]"
              : "text-[color:var(--color-text-muted)]"
          )}
        >
          ▾
        </span>
      </div>

      {/* helper / error text */}
      {(helperText || error) && (
        <p
          className={cn(
            "text-[0.70rem] mt-0.5",
            hasError
              ? "text-[color:var(--color-error)]"
              : "text-[color:var(--color-text-muted)]"
          )}
        >
          {hasError ? error : helperText}
        </p>
      )}
    </div>
  );
}

Select.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  variant: PropTypes.oneOf(["neutral", "primary", "ghost"]),
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

/* Atajo Variantes */

// select principal para formularios importantes
export const SelectPrimary = (props) => (
  <Select {...props} variant="primary" />
);

// select fantasmal (sin fondo) para filtros en toolbars / headers
export const SelectGhost = (props) => (
  <Select {...props} variant="ghost" />
);

// select compacto, ideal para filtros en tablas
export const SelectSm = (props) => (
  <Select {...props} size="sm" />
);

// select grande (por ejemplo en forms “hero” tipo checkout)
export const SelectLg = (props) => (
  <Select {...props} size="lg" />
);
