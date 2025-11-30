class ToastManager {
  constructor() {
    this.toasts = [];
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
      listener(this.toasts);
    }
  }

  show(toast) {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  dismiss(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  dismissAll() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: (message, options = {}) => {
    return toastManager.show({
      variant: "success",
      message,
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toastManager.show({
      variant: "error",
      message,
      duration: 4000,
      ...options,
    });
  },

  warning: (message, options = {}) => {
    return toastManager.show({
      variant: "warning",
      message,
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toastManager.show({
      variant: "info",
      message,
      ...options,
    });
  },

  custom: (options) => toastManager.show(options),
  dismiss: (id) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
};
