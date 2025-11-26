import { cn } from "@/utils/cn.js";

/* PILL STYLES   ----------------------------------------------------------------------------*/ 

export const PILL_STYLES = {
  primary: "bg-(--color-primary1)/15 text-(--color-primary1) border-(--color-primary1)/30",
  success: "bg-(--color-success)/15 text-(--color-success) border-(--color-success)/30",
  warning: "bg-(--color-warning)/15 text-(--color-warning) border-(--color-warning)/30",
  error: "bg-(--color-error)/15 text-(--color-error) border-(--color-error)/30",
  info: "bg-(--color-info)/15 text-(--color-info) border-(--color-info)/30",
  neutral: "bg-(--color-border-subtle) text-(--text-secondary) border-(--color-border)",
};

/* BADGE VARIANT ----------------------------------------------------------------------------*/ 
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


/* BUTTON CONFIG -----------------------------------------------------------------------------*/

export const BUTTON_APPEARANCES = ["solid", "soft", "tinted", "outline", "ghost", "ghost2", "link", "text", "bare"];
export const BUTTON_INTENTS = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
  "inverse",
  "muted",
];
export const BUTTON_SIZES = ["xs", "sm", "md", "lg", "xl"];
export const BUTTON_SHAPES = ["default", "rounded", "pill", "square", "circle"];
export const BUTTON_WIDTHS = ["fit", "auto", "full", "stretch"];
export const BUTTON_ALIGNS = ["start", "center", "end"];
export const BUTTON_ELEVATIONS = ["none", "sm", "md", "lg"];
export const BUTTON_ICON_PLACEMENTS = ["start", "end", "only"];

export const DEFAULT_BUTTON_OPTIONS = {
  appearance: "solid",
  intent: "primary",
  size: "md",
  shape: "default",
  width: "fit",
  align: "center",
  elevation: "sm",
  iconPlacement: "start",
};

export const BUTTON_MOTION_EFFECTS = ["lift", "underline", "icon-slide", "expand", "ripple"];

export const BUTTON_LEGACY_VARIANTS = {
  primary: { appearance: "solid", intent: "primary" },
  "primary-round": { appearance: "solid", intent: "primary", shape: "pill" },
  secondary: { appearance: "solid", intent: "secondary" },
  ghost: { appearance: "ghost", intent: "neutral" },
  "card-solid": { appearance: "soft", intent: "neutral", elevation: "md" },
  "card-outline": { appearance: "outline", intent: "neutral" },
  "cta-home": { appearance: "tinted", intent: "inverse", shape: "pill", motion: ["lift", "expand"] },
  "cta-outline": { appearance: "outline", intent: "primary", shape: "pill", motion: "lift" },
  icon: { appearance: "ghost", intent: "neutral", shape: "circle", iconOnly: true },
  "icon-bg": { appearance: "soft", intent: "neutral", shape: "circle" },
  animated: { appearance: "ghost", intent: "inverse", className: "btn-animated" },
  round: { appearance: "soft", intent: "neutral", shape: "pill" },
  drawer: { appearance: "ghost", intent: "neutral", width: "full" },
};

/* CLOSE ICON TOKENS (X) --------------------------------------------------------------------*/ 
// Estandarización de tamaños y estilos para iconos de cierre en modales/drawers
export const CLOSE_ICON_SIZES = {
  sm: 12,   // Tags, chips pequeños
  md: 14,   // Botones inline, tablas
  lg: 16,   // Drawers, dialogs estándar (h-4 w-4)
  xl: 20,   // Modales grandes (h-5 w-5)
};

export const CLOSE_ICON_STYLES = {
  default: "text-neutral-400 hover:text-neutral-600 transition-colors",
  modal: "text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 p-1 rounded-lg hover:bg-neutral-100",
  alert: "text-neutral-500 hover:text-neutral-700 transition-colors",
  primary: "text-(--color-primary1)/60 hover:text-(--color-primary1) transition-colors",
};
