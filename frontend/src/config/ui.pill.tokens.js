export const PILL_STYLES = {
  primary: "bg-(--color-primary1)/15 text-(--color-primary1) border-(--color-primary1)/30",
  success: "bg-(--color-success)/15 text-(--color-success) border-(--color-success)/30",
  warning: "bg-(--color-warning)/15 text-(--color-warning) border-(--color-warning)/30",
  error: "bg-(--color-error)/15 text-(--color-error) border-(--color-error)/30",
  info: "bg-(--color-info)/15 text-(--color-info) border-(--color-info)/30",
  neutral: "bg-(--color-border-subtle) text-(--text-secondary) border-(--color-border)",
};

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
