import * as React from "react";
import { cn } from "@/utils/cn.js";

export const Label = React.forwardRef(({ className, required = false, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-semibold text-(--color-text-secondary)",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-1 text-(--color-error)">*</span>}
  </label>
));
Label.displayName = "Label";

