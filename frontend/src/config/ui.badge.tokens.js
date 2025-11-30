import { cn } from "@/utils/cn.js";

export const BADGE_VARIANTS = {
  primary: cn(
    "bg-[color:var(--color-primary3)]",
    "text-[color:var(--color-white)]"
  ),
  secondary: cn(
    "bg-[color:var(--color-secondary1)]",
    "text-[color:var(--color-white)]"
  ),
  accent: cn(
    "bg-[color:var(--color-primary4)]",
    "text-[color:var(--color-primary2)]"
  ),
  neutral: cn(
    "bg-[color:var(--color-neutral2)]",
    "text-[color:var(--color-text)]",
    "border border-[color:var(--color-neutral3)]"
  ),
  success: cn(
    "bg-[color:var(--color-success)]",
    "text-[color:var(--color-white)]"
  ),
  warning: cn(
    "bg-[color:var(--color-warning)]",
    "text-[color:var(--color-dark)]"
  ),
  error: cn(
    "bg-[color:var(--color-error)]",
    "text-[color:var(--color-white)]"
  ),
  info: cn(
    "bg-[color:var(--color-info)]",
    "text-[color:var(--color-white)]"
  ),
  danger: cn(
    "bg-[color:var(--color-error)]",
    "text-[color:var(--color-white)]"
  ),
  outline: cn(
    "bg-transparent",
    "text-[color:var(--color-primary1)]",
    "border border-[color:var(--color-primary1)]"
  ),
  default: cn(
    "bg-[color:var(--color-neutral2)]",
    "text-[color:var(--text-secondary)]"
  ),
  // Aliases para compatibilidad
  destacado: cn(
    "bg-[color:var(--color-primary3)]",
    "text-[color:var(--color-white)]"
  ),
  nuevo: cn(
    "bg-[color:var(--color-primary3)]",
    "text-[color:var(--color-white)]"
  ),
};

export const BADGE_SIZES = {
  sm: "px-2 py-0.5 text-[0.65rem] leading-tight",
  md: "px-[9.523px] py-1 text-xs leading-[11.13px]",
  lg: "px-3 py-1.5 text-sm leading-normal",
};
