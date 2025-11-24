import React from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/Dialog.jsx';
import { Button } from '@/components/ui/Button.jsx';

/**
 * Modal que se muestra cuando la sesión está por expirar
 * @param {Object} props
 * @param {boolean} props.open - Si el modal está abierto
 * @param {number} props.minutesRemaining - Minutos restantes
 * @param {Function} props.onExtend - Callback para extender sesión
 * @param {Function} props.onLogout - Callback para hacer logout
 * @param {Function} [props.onDismiss] - Callback para cerrar sin acciones
 */
export const SessionExpirationDialog = ({ 
  open, 
  minutesRemaining, 
  onExtend, 
  onLogout,
  onDismiss,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onDismiss?.();
        }
      }}
    >
      <DialogContent 
        hideCloseButton
        className="relative sm:max-w-md border-0 bg-white/95 p-6 shadow-2xl rounded-[var(--radius-xl)]"
      >
        <DialogClose
          className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/80 text-[color:var(--color-secondary2)] transition-colors hover:bg-white hover:text-[color:var(--color-primary1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary3)]"
          aria-label="Cerrar aviso de sesión"
        >
          <X className="h-4 w-4" />
        </DialogClose>

        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl text-[color:var(--color-primary1)]">Sesión por expirar</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-[color:var(--color-secondary2)]">
            Tu sesión está a punto de expirar por inactividad. Mantente activo para evitar que cerremos tu sesión por seguridad.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-2xl bg-[var(--color-warning-veil)] p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-[color:var(--color-warning)]" />
            <div>
              <p className="text-sm font-medium text-[color:var(--color-secondary2)] uppercase tracking-[0.2rem]">Tiempo restante</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--color-primary1)]">
                {minutesRemaining} {minutesRemaining === 1 ? 'minuto' : 'minutos'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[color:var(--color-secondary2)]">
          <p className="font-medium text-[color:var(--color-primary2)]">¿Deseas continuar con tu sesión actual?</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Si continúas navegando, tu sesión se extenderá automáticamente.</li>
            <li>Si no realizas ninguna acción, cerraremos tu sesión por seguridad.</li>
          </ul>
        </div>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            appearance="ghost"
            intent="neutral"
            size="sm"
            shape="pill"
            onClick={onLogout}
            className="w-full sm:w-auto"
          >
            Cerrar sesión
          </Button>
          <Button
            size="sm"
            shape="pill"
            onClick={onExtend}
            className="w-full sm:w-auto"
          >
            Extender sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
