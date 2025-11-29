import React from "react";
import { cn } from "@/utils/cn.js";

const VARIANT_CLASSES = {
  elevated: cn(
    "bg-[color:var(--color-neutral2)]",
    "shadow-[var(--shadow-md)]",
    "border border-transparent"
  ),
  flat: cn(
    "bg-[color:var(--color-neutral2)]",
    "shadow-none",
    "border border-transparent"
  ),
  outlined: cn(
    "bg-[color:var(--color-neutral2)]",
    "shadow-none",
    "border border-[color:var(--color-neutral3)]"
  ),
  ghost: cn(
    "bg-transparent",
    "shadow-none",
    "border border-[color:var(--color-neutral3)]"
  ),
};

const PADDING_CLASSES = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

export function Card({
  children,
  variant = "elevated",
  padding = "md",
  hoverable = false,
  clickable = false,
  onClick,
  className,
  as,
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.elevated;
  const paddingClass = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;

  const isInteractive = Boolean(onClick) || clickable;
  const Component = as || "div";

  return (
    <Component
      className={cn(
        "rounded-[var(--radius-xl)]",
        "transition-all duration-200",
        variantClass,
        paddingClass,
        hoverable && "hover:shadow-[var(--shadow-lg)] hover:translate-y-[-2px]",
        isInteractive && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "border-b border-[color:var(--color-neutral3)]",
        "pb-3 mb-3",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, as, ...rest }) {
  const Component = as || "h3";

  return (
    <Component
      className={cn(
        "text-base font-medium font-sans",
        "text-[color:var(--color-text)]",
        className
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ children, className, ...rest }) {
  return (
    <p
      className={cn(
        "text-sm",
        "text-[color:var(--color-text-secondary)]",
        "mt-1",
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export function CardBody({ children, className, ...rest }) {
  return (
    <div className={cn("text-sm", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        "border-t border-[color:var(--color-neutral3)]",
        "pt-3 mt-3",
        "flex items-center gap-2",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export const CardElevated = (props) => (
  <Card {...props} variant="elevated" />
);

export const CardFlat = (props) => (
  <Card {...props} variant="flat" />
);

export const CardOutlined = (props) => (
  <Card {...props} variant="outlined" />
);

export const CardGhost = (props) => (
  <Card {...props} variant="ghost" />
);

export const CardHoverable = (props) => (
  <Card {...props} hoverable />
);

export const CardClickable = (props) => (
  <Card {...props} clickable hoverable />
);
