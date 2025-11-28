import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, HelpCircle, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn.js";
import { Button } from "./Button";

class ConfirmDialogManager {
  constructor() {
    this.dialog = null;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.dialog);
    }
  }

  show(config) {
    return new Promise((resolve) => {
      this.dialog = {
        ...config,
        onConfirm: () => {
          resolve(true);
          this.hide();
        },
        onCancel: () => {
          resolve(false);
          this.hide();
        },
      };
      this.notify();
    });
  }

  hide() {
    this.dialog = null;
    this.notify();
  }
}

export const confirmDialogManager = new ConfirmDialogManager();


const VARIANT_CONFIG = {
  danger: {
    icon: Trash2,
    iconBgClass: "bg-[color:var(--color-error)]/10",
    iconColorClass: "text-[color:var(--color-error)]",
    confirmButtonVariant: "danger",
    confirmText: "Eliminar",
  },
  warning: {
    icon: AlertTriangle,
    iconBgClass: "bg-[color:var(--color-warning)]/10",
    iconColorClass: "text-[color:var(--color-warning)]",
    confirmButtonVariant: "warning",
    confirmText: "Continuar",
  },
  info: {
    icon: HelpCircle,
    iconBgClass: "bg-[color:var(--color-secondary2)]/10",
    iconColorClass: "text-[color:var(--color-secondary2)]",
    confirmButtonVariant: "primary",
    confirmText: "Aceptar",
  },
};

function ConfirmDialogContent({ dialog }) {
  const [isExiting, setIsExiting] = useState(false);
  const config = VARIANT_CONFIG[dialog.variant] || VARIANT_CONFIG.info;
  const IconComponent = dialog.icon || config.icon;

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => {
      dialog.onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      dialog.onConfirm();
    }, 200);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !dialog.persistent) {
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-(--z-modal) flex items-center justify-center p-4",
        "transition-all duration-200",
        isExiting ? "opacity-0" : "opacity-100"
      )}
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-(--overlay-dark)" />

      {/* Dialog */}
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-2xl",
          "w-full max-w-md p-6",
          "transition-all duration-300",
          isExiting
            ? "opacity-0 scale-95 translate-y-4"
            : "opacity-100 scale-100 translate-y-0"
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Ícono */}
        {IconComponent && (
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
              config.iconBgClass
            )}
          >
            <IconComponent className={cn("w-6 h-6", config.iconColorClass)} />
          </div>
        )}

        {/* Título */}
        <h2
          id="dialog-title"
          className="text-lg font-semibold text-center text-(--color-text) mb-2"
        >
          {dialog.title || "¿Estás seguro?"}
        </h2>

        {/* Descripción */}
        {dialog.description && (
          <p
            id="dialog-description"
            className="text-sm text-center text-(--color-text-secondary) mb-6"
          >
            {dialog.description}
          </p>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          {dialog.showCancel !== false && (
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              {dialog.cancelText || "Cancelar"}
            </Button>
          )}
          <Button
            variant={config.confirmButtonVariant}
            onClick={handleConfirm}
            className="flex-1"
          >
            {dialog.confirmText || config.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

//Contenedor --------------------------------------------------------------------
export function ConfirmDialogContainer() {
  const [dialog, setDialog] = useState(null);

  React.useEffect(() => {
    return confirmDialogManager.subscribe(setDialog);
  }, []);

  if (!dialog) return null;

  return createPortal(<ConfirmDialogContent dialog={dialog} />, document.body);
}

export const confirm = {
  delete: (title, description = "Esta acción no se puede deshacer") => {
    return confirmDialogManager.show({
      variant: "danger",
      title: title || "¿Eliminar elemento?",
      description,
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });
  },

  warning: (title, description, options = {}) => {
    return confirmDialogManager.show({
      variant: "warning",
      title,
      description,
      confirmText: "Continuar",
      cancelText: "Cancelar",
      ...options,
    });
  },

  info: (title, description, options = {}) => {
    return confirmDialogManager.show({
      variant: "info",
      title,
      description,
      confirmText: "Aceptar",
      showCancel: false,
      ...options,
    });
  },

  custom: (options) => confirmDialogManager.show(options),
};
