import React from "react";
import { ToastContainer } from "./Toast";
import { ConfirmDialogContainer } from "./ConfirmDialog";

/**
 * MessageProvider - Proveedor del sistema de mensajería
 * 
 * Este componente debe ser agregado una vez en el nivel raíz de la aplicación
 * para habilitar el sistema unificado de toasts y confirmaciones.
 * 
 * @example
 * // En App.jsx o layout principal:
 * import { MessageProvider } from '@/components/ui'
 * 
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <MessageProvider />
 *     </>
 *   )
 * }
 */
export function MessageProvider() {
  return (
    <>
      <ToastContainer />
      <ConfirmDialogContainer />
    </>
  );
}
