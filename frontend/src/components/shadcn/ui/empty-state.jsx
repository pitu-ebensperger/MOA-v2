import { forwardRef } from "react";

import { cn } from "@/utils/cn.js";

const baseStyles =
  "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--background)]/70 px-6 py-10 text-center text-sm text-[var(--muted-foreground)]";

export const EmptyPlaceholder = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn(baseStyles, className)} {...props}>
    {children}
  </div>
));
EmptyPlaceholder.displayName = "EmptyPlaceholder";

export const EmptyPlaceholderIcon = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("text-[var(--color-primary1)]", className)} {...props}>
    {children}
  </div>
));
EmptyPlaceholderIcon.displayName = "EmptyPlaceholderIcon";

export const EmptyPlaceholderTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-[var(--text-strong)]", className)}
    {...props}
  >
    {children}
  </h3>
));
EmptyPlaceholderTitle.displayName = "EmptyPlaceholderTitle";

export const EmptyPlaceholderDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[var(--text-secondary1)]", className)} {...props}>
    {children}
  </p>
));
EmptyPlaceholderDescription.displayName = "EmptyPlaceholderDescription";
