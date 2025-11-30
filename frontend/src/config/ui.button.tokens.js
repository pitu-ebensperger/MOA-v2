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
