import React from "react";
import { ToastContainer } from "./Toast";
import { ConfirmDialogContainer } from "./ConfirmDialog";

export function MessageProvider() {
  return (
    <>
      <ToastContainer />
      <ConfirmDialogContainer />
    </>
  );
}
