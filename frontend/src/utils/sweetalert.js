import Swal from 'sweetalert2';

// Configuración personalizada de SweetAlert2 para MOA
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

// Configuración base con estilos MOA
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

// Instancia de SweetAlert2 personalizada
const moaSwal = Swal.mixin(moaConfig);

// Tipos de alertas predefinidas
export const alerts = {
  /**
   * Muestra una alerta de éxito
   */
  success: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  /**
   * Muestra una alerta de error
   */
  error: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  /**
   * Muestra una alerta de advertencia
   */
  warning: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  /**
   * Muestra una alerta de información
   */
  info: (title, text = '', options = {}) => {
    return moaSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Entendido',
      ...options
    });
  },

  /**
   * Muestra una confirmación con botones Sí/No
   */
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

  /**
   * Muestra una confirmación destructiva (eliminar, etc.)
   */
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

  /**
   * Muestra un loading con mensaje personalizable
   */
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

  /**
   * Cierra cualquier alerta activa
   */
  close: () => {
    return Swal.close();
  },

  /**
   * Alerta de error de red/servidor
   */
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

  /**
   * Alerta de sesión expirada
   */
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

  /**
   * Alerta de permisos insuficientes
   */
  unauthorized: (message = 'Acceso denegado') => {
    return moaSwal.fire({
      icon: 'error',
      title: message,
      text: 'No tienes permisos para realizar esta acción.',
      confirmButtonText: 'Entendido'
    });
  },

  /**
   * Toast notification (esquina superior derecha)
   */
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

// Manejo de errores automático basado en status HTTP
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

// Hook para manejar errores de forma reactiva
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