import { useMemo } from "react";
import { toast } from "./toastService.js";

export function useToast() {
  return useMemo(() => ({
    toast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  }), []);
}
