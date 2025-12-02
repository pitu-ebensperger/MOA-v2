import Swal from 'sweetalert2';

const moaConfig = {
  customClass: {
    popup: 'moa-swal-popup',
    title: 'moa-swal-title',
    confirmButton: 'moa-swal-confirm',
    cancelButton: 'moa-swal-cancel',
  },
  background: '#FAFAF9',
  color: '#443114',
  confirmButtonColor: '#443114',
  cancelButtonColor: '#8B7355',
  width: '28rem',
  padding: '2rem',
  showCloseButton: true,
};

const moaSwal = Swal.mixin(moaConfig);

export const alerts = {
  success: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  error: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  warning: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  info: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  loading: (title = 'Procesando...', text = 'Por favor espera un momento') => {
    return moaSwal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
  },

  close: () => Swal.close(),

  networkError: (message = 'Error de conexión', details = 'Verifica tu conexión a internet') => {
    return moaSwal.fire({
      icon: 'error',
      title: message,
      text: details,
      confirmButtonText: 'Reintentar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    });
  },

  toast: {
    success: (message) => Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#443114',
      color: '#FAFAF9',
    }).fire({ icon: 'success', title: message }),

    error: (message) => Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#B91C1C',
      color: '#FAFAF9',
    }).fire({ icon: 'error', title: message }),
  }
};

export const handleApiError = (error, customMessage = null) => {
  const status = error?.response?.status || error?.status;
  const message = error?.response?.data?.message || error?.message;

  if (status >= 500) {
    return alerts.error(customMessage || 'Error del servidor', 'Intenta más tarde.');
  }
  if (status === 429) {
    return alerts.warning('Demasiadas solicitudes', 'Espera un momento.');
  }
  if (!navigator.onLine) {
    return alerts.networkError();
  }
  
  return alerts.error(customMessage || 'Error', message || 'Intenta nuevamente.');
};

export const alertOrderSuccess = (orderCode) => {
  return moaSwal.fire({
    icon: 'success',
    title: '¡Orden confirmada!',
    html: `Tu orden <strong>#${orderCode}</strong> ha sido creada exitosamente.<br>Recibirás un correo de confirmación.`,
    confirmButtonText: 'Ver mis órdenes',
  });
};

export const alertOrderError = (message, supportEmail = 'soporte@moa.cl') => {
  return moaSwal.fire({
    icon: 'error',
    title: 'Error al procesar la orden',
    html: `${message}<br><br>Si el problema persiste, contacta a <a href="mailto:${supportEmail}">${supportEmail}</a>`,
    confirmButtonText: 'Entendido',
  });
};

export const alertGlobalError = () => {
  return moaSwal.fire({
    icon: 'error',
    title: 'Error inesperado',
    text: 'Ocurrió un problema al procesar tu solicitud. Por favor, intenta nuevamente más tarde.',
    confirmButtonText: 'Entendido',
  });
};
