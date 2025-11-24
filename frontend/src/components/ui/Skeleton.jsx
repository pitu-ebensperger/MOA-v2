import * as React from "react";
import { cn } from "@/utils/cn.js"

/**
 * Skeleton placeholder inspired by shadcn/ui.
 */
export const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    aria-live="polite"
    className={cn(
      "animate-pulse rounded-xl bg-(--color-neutral3)/60",
      className
    )}
    {...props}
  >
    <span className="sr-only">Cargando contenido</span>
  </div>
));

Skeleton.displayName = "Skeleton";
