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
