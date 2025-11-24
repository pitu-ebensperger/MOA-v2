import Swal from 'sweetalert2'

const base = (opts) => Swal.fire({
  buttonsStyling: false,
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-html',
    confirmButton: 'swal-btn swal-btn-confirm',
    cancelButton: 'swal-btn swal-btn-cancel'
  },
  ...opts,
});

export const alertInfo = (text, title = 'Información') => base({ icon: 'info', title, text });
export const alertWarning = (text, title = 'Atención') => base({ icon: 'warning', title, text });
export const alertSuccess = (html, title = 'Éxito') => base({ icon: 'success', title, html });
export const alertError = (text, title = 'Error') => base({ icon: 'error', title, text });

export const alertOrderError = (detail, supportEmail = 'contacto@moa.cl') => base({
  icon: 'error',
  title: 'No pudimos crear tu orden',
  html: `<p class='swal-p'>${detail || 'Intenta nuevamente. Si el error persiste comunícate con soporte.'}</p>`,
  footer: `<small class="swal-footer">Soporte: ${supportEmail}</small>`
});

export const alertOrderSuccess = (orderCode) => base({
  icon: 'success',
  title: 'Orden creada',
  html: `Tu código es <strong>${orderCode}</strong>. Te avisaremos al preparar el envío.`,
  confirmButtonText: 'Ver mis órdenes'
});

// Global unexpected application error (MOA style)
export const alertGlobalError = () => base({
  icon: 'error',
  title: '¡Ups! Algo salió mal',
  html: `<div class="swal-global-error">
    <p>Ha ocurrido un error inesperado en la aplicación.</p>
    <p class="swal-global-hint">Nuestro equipo ha sido notificado automáticamente.</p>
  </div>`,
  confirmButtonText: 'Cerrar',
});

// Auth required - removed (use navigate with state instead)
// Example: navigate('/login', { state: { authRequired: true } })
