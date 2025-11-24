import Swal from 'sweetalert2';


const moaStyles = {
  popup: 'moa-swal-popup',
  header: 'moa-swal-header', 
  title: 'moa-swal-title',
  content: 'moa-swal-content',
  actions: 'moa-swal-actions',
  confirmButton: 'moa-swal-confirm',
  cancelButton: 'moa-swal-cancel',
  denyButton: 'moa-swal-deny',
};

const moaConfig = {
  customClass: moaStyles,
  background: '#FAFAF9',
  color: '#443114',
  confirmButtonColor: '#443114',
  cancelButtonColor: '#8B7355',
  denyButtonColor: '#B91C1C',
  width: '28rem',
  padding: '2rem',
  showCloseButton: true,
  showClass: {
    popup: 'animate__animated animate__fadeInUp animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutDown animate__faster'
  }
};

const moaSwal = Swal.mixin(moaConfig);

// Primary API (recommended)  ------------------------------------------------------------------------------------------------------------------------

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

  confirm: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      ...options
    });
  },

  confirmDelete: (title = '¿Estás seguro?', text = 'Esta acción no se puede deshacer', options = {}) => {
    return moaSwal.fire({
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#B91C1C',
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
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  close: () => Swal.close(),

  networkError: (message = 'Error de conexión', details = 'Verifica tu conexión a internet e intenta de nuevo') => {
    return moaSwal.fire({
      icon: 'error',
      title: message,
      text: details,
      confirmButtonText: 'Reintentar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    });
  },

  sessionExpired: () => {
    return moaSwal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      confirmButtonText: 'Ir a login',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  },

  unauthorized: (message = 'Acceso denegado') => {
    return moaSwal.fire({
      icon: 'error',
      title: message,
      text: 'No tienes permisos para realizar esta acción.',
      confirmButtonText: 'Entendido'
    });
  },

  toast: {
    success: (message) => {
      return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#443114',
        color: '#FAFAF9',
        customClass: {
          popup: 'moa-toast moa-toast-success'
        }
      }).fire({
        icon: 'success',
        title: message
      });
    },

    error: (message) => {
      return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#B91C1C',
        color: '#FAFAF9',
        customClass: {
          popup: 'moa-toast moa-toast-error'
        }
      }).fire({
        icon: 'error',
        title: message
      });
    },

    info: (message) => {
      return Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1E40AF',
        color: '#FAFAF9',
        customClass: {
          popup: 'moa-toast moa-toast-info'
        }
      }).fire({
        icon: 'info',
        title: message
      });
    }
  }
};

// Legacy API (deprecated - use alerts.* instead)  ---------------------------------

export const alertInfo = (text, title = 'Información') => alerts.info(title, text);
export const alertWarning = (text, title = 'Atención') => alerts.warning(title, text);
export const alertSuccess = (html, title = 'Éxito') => moaSwal.fire({ icon: 'success', title, html });
export const alertError = (text, title = 'Error') => alerts.error(title, text);

export const alertOrderError = (detail, supportEmail = 'contacto@moa.cl') => moaSwal.fire({
  icon: 'error',
  title: 'No pudimos crear tu orden',
  html: `<p class='swal-p'>${detail || 'Intenta nuevamente. Si el error persiste comunícate con soporte.'}</p>`,
  footer: `<small class="swal-footer">Soporte: ${supportEmail}</small>`
});

export const alertOrderSuccess = (orderCode) => moaSwal.fire({
  icon: 'success',
  title: 'Orden creada',
  html: `Tu código es <strong>${orderCode}</strong>. Te avisaremos al preparar el envío.`,
  confirmButtonText: 'Ver mis órdenes'
});

export const alertGlobalError = () => moaSwal.fire({
  icon: 'error',
  title: '¡Ups! Algo salió mal',
  html: `<div class="swal-global-error">
    <p>Ha ocurrido un error inesperado en la aplicación.</p>
    <p class="swal-global-hint">Nuestro equipo ha sido notificado automáticamente.</p>
  </div>`,
  confirmButtonText: 'Cerrar',
});

// API Error Handler --------------------------------------------------------------------------------------------------

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);

  const status = error?.response?.status || error?.status;
  const message = error?.response?.data?.message || error?.message || 'Error desconocido';

  switch (status) {
    case 400:
      return alerts.error(
        customMessage || 'Solicitud inválida',
        'Los datos enviados no son válidos. Por favor, verifica la información.'
      );

    case 401:
      return alerts.sessionExpired();

    case 403:
      return alerts.unauthorized(customMessage || 'Acceso denegado');

    case 404:
      return alerts.error(
        customMessage || 'No encontrado',
        'El recurso solicitado no existe.'
      );

    case 409:
      return alerts.error(
        customMessage || 'Conflicto',
        'Ya existe un elemento con estos datos.'
      );

    case 422:
      return alerts.error(
        customMessage || 'Datos inválidos',
        message || 'Por favor, verifica los datos ingresados.'
      );

    case 429:
      return alerts.warning(
        'Demasiadas solicitudes',
        'Has realizado demasiadas solicitudes. Espera un momento antes de intentar nuevamente.'
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return alerts.error(
        customMessage || 'Error del servidor',
        'Estamos experimentando problemas técnicos. Por favor, intenta más tarde.'
      );

    default:
      if (!navigator.onLine) {
        return alerts.networkError();
      }
      
      return alerts.error(
        customMessage || 'Error inesperado',
        message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
      );
  }
};


// React Hook -------------------------------------------------------------------------------------------------------------------------------------------------

export const useErrorHandler = () => {
  const handleError = (error, customMessage = null) => {
    return handleApiError(error, customMessage);
  };

  const handleSuccess = (message, details = '') => {
    return alerts.success(message, details);
  };

  const showLoading = (title, text) => {
    return alerts.loading(title, text);
  };

  const hideLoading = () => {
    return alerts.close();
  };

  return {
    handleError,
    handleSuccess,
    showLoading,
    hideLoading,
    alerts
  };
};

export default moaSwal;
