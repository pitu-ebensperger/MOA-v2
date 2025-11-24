/**
 * Canonical className utility for MOA
 * 
 * Uses clsx for conditional classes + tailwind-merge for conflict resolution
 * 
 * @example
 * cn('base-class', condition && 'conditional-class', 'text-red-500')
 * 
 * This is the single source of truth for className merging.
 * Use this instead of:
 * - Direct clsx imports
 * - cx from ui-helpers
 * - Manual string concatenation
 */
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

// Legacy alias for backwards compatibility (deprecated)
// TODO: Remove after migration to cn is complete
export const cx = (...classes) => classes.filter(Boolean).join(" ");
