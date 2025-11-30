import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn.js";
import { BADGE_VARIANTS, BADGE_SIZES } from "@/config/ui.badge.tokens.js"

// BADGE
export function Badge({ 
  children, 
  variant = "primary", 
  size = "md",
  className, 
  ...props 
}) {
  const variantClass = BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.primary;
  const sizeClass = BADGE_SIZES[size] ?? BADGE_SIZES.md;

  return (
    <span
      className={cn(
        "w-fit inline-flex items-center justify-center",
        "rounded-3xl",
        "font-sans font-medium tracking-[1.5871px] uppercase",
        "transition-colors duration-150",
        sizeClass,
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(BADGE_VARIANTS)),
  size: PropTypes.oneOf(Object.keys(BADGE_SIZES)),
  className: PropTypes.string,
};

export default Badge;
