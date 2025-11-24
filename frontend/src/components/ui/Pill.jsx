import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/classNames.js";
import { PILL_STYLES } from "@/config/ui-tokens.js"

const PILL_SIZES = {
  sm: "px-2 py-[3px] text-[11px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

// Pill ---------------------------------------------------
export function Pill({ children, variant = "neutral", size = "md", className = "" }) {
  const resolvedSize = PILL_SIZES[size] ?? PILL_SIZES.md;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        resolvedSize,
        PILL_STYLES[variant] ?? PILL_STYLES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

Pill.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(PILL_STYLES)),
  size: PropTypes.oneOf(Object.keys(PILL_SIZES)),
  className: PropTypes.string,
};

export default Pill;
