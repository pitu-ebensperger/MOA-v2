import { useMemo } from "react";
import { confirm } from "./confirmDialogService.js";

export function useConfirm() {
  return useMemo(() => ({
    confirm,
    confirmDelete: confirm.delete,
    confirmWarning: confirm.warning,
    confirmInfo: confirm.info,
  }), []);
}
