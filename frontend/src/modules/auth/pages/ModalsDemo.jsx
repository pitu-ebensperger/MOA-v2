import { useState } from 'react';
import { PartyPopper, AlarmClock, X, CheckCircle, AlertTriangle, XCircle, Info, Trash2, Clock, AlertCircle, Mail } from "lucide-react";
import { Button } from '@/components/ui/Button.jsx';
import { Alert } from '@/components/ui/Alert.jsx';
import { toast, confirm } from '@/components/ui';
import { alerts } from '@/utils/alerts/index.js';
import { SessionExpirationDialog } from '@/components/auth/SessionExpirationDialog.jsx';

export default function ModalsDemo() {
  // Agregar estilos de animación
  const styles = `
    @keyframes icon-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes circle-pulse {
      0%, 100% { transform: scale(1);}
      50% { transform: scale(0.8); }
    }
    
    .animate-icon-bounce,
    .animate-circle-pulse {
      transition: all 0.5s ease;
    }
    
    .modal-header-group:hover .animate-icon-bounce,
    .modal-content:has(.modal-button-wrapper:hover) .animate-icon-bounce {
      animation: icon-bounce 2s ease-in-out infinite;
      animation-delay: 0.1s;
    }
    
    .modal-header-group:hover .animate-circle-pulse,
    .modal-content:has(.modal-button-wrapper:hover) .animate-circle-pulse {
      animation: circle-pulse 2s ease-in-out infinite;
      animation-delay: 0.1s;
    }
  `;

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  // Valor local para demo (evita ReferenceError cuando se renderiza el texto)
  const expiredFromPath = '';

  return (
    <>
      <style>{styles}</style>
      <div className="page min-h-screen bg-neutral-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-(--color-primary1) mb-3 text-center">
            Demo: Sistema de Alertas y Modales
          </h1>
          <p className="text-center text-(--color-text-secondary) mb-12">
            Componentes de error handling sin límite de tiempo para feedback
          </p>

          {/* ==================== SECCIÓN 1: SWEETALERT2 MODALES ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              {' '}
              SweetAlert2 Modales
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Success Alert */}
                <button
                  onClick={() => alerts.success('¡Operación exitosa!', 'Los cambios se han guardado correctamente')}
                  className="p-6 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg group"
                >
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Success</h3>
                  <p className="text-xs text-neutral-600">Operaciones exitosas</p>
                </button>

                {/* Error Alert */}
                <button
                  onClick={() => alerts.error('Error al guardar', 'No se pudo completar la operación')}
                  className="p-6 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-lg group"
                >
                  <XCircle className="h-10 w-10 mx-auto mb-3 text-red-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Error</h3>
                  <p className="text-xs text-neutral-600">Errores y fallos</p>
                </button>

                {/* Warning Alert */}
                <button
                  onClick={() => alerts.warning('Atención requerida', 'Esta acción requiere tu confirmación')}
                  className="p-6 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg group"
                >
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Warning</h3>
                  <p className="text-xs text-neutral-600">Advertencias</p>
                </button>

                {/* Info Alert */}
                <button
                  onClick={() => alerts.info('Información importante', 'Revisa los detalles antes de continuar')}
                  className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg group"
                >
                  <Info className="h-10 w-10 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Info</h3>
                  <p className="text-xs text-neutral-600">Información general</p>
                </button>

                {/* Confirm Dialog */}
                <button
                  onClick={async () => {
                    const result = await alerts.confirm('¿Continuar con esta acción?', 'Esta acción no se puede deshacer');
                    if (result.isConfirmed) {
                      alerts.success('Confirmado', 'Acción completada');
                    }
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg group"
                >
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Confirm</h3>
                  <p className="text-xs text-neutral-600">Confirmación con cancelar</p>
                </button>

                {/* Confirm Delete */}
                <button
                  onClick={async () => {
                    const result = await alerts.confirmDelete('¿Eliminar este elemento?', 'Esta acción no se puede deshacer');
                    if (result.isConfirmed) {
                      alerts.success('Eliminado', 'Elemento eliminado correctamente');
                    }
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-lg group"
                >
                  <Trash2 className="h-10 w-10 mx-auto mb-3 text-red-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Confirm Delete</h3>
                  <p className="text-xs text-neutral-600">Confirmación destructiva</p>
                </button>

                {/* Unexpected Error Alert */}
                <button
                  onClick={() =>
                    alerts.error(
                      'Error inesperado',
                      'Ha ocurrido un problema en la aplicación. El error se ha reportado automáticamente.'
                    )
                  }
                  className="p-6 bg-white rounded-xl border-2 border-rose-200 hover:border-rose-400 transition-all hover:shadow-lg group"
                >
                  <AlertCircle className="h-10 w-10 mx-auto mb-3 text-rose-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Error inesperado</h3>
                  <p className="text-xs text-neutral-600">Copia global de fallback</p>
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Uso:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">alerts.success()</code> en <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/utils/alerts/index.js</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Usado en checkout, formularios admin, operaciones CRUD
                </p>
              </div>
            </div>
          </section>

          {/* ==================== SECCIÓN 2: TOASTS ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              {' '}
              Toast Notifications
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Toast Success */}
                <button
                  onClick={() => toast.success('Cambios guardados correctamente')}
                  className="p-6 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg group"
                >
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Toast Success</h3>
                  <p className="text-xs text-neutral-600">3 segundos</p>
                </button>

                {/* Toast Error */}
                <button
                  onClick={() => toast.error('Error al procesar la solicitud')}
                  className="p-6 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-lg group"
                >
                  <XCircle className="h-8 w-8 mx-auto mb-3 text-red-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Toast Error</h3>
                  <p className="text-xs text-neutral-600">4 segundos</p>
                </button>

                {/* Toast Info */}
                <button
                  onClick={() => toast.info('Nueva actualización disponible')}
                  className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg group"
                >
                  <Info className="h-8 w-8 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Toast Info</h3>
                  <p className="text-xs text-neutral-600">3 segundos</p>
                </button>

                {/* Toast Warning */}
                <button
                  onClick={() => toast.warning('Verifica los datos ingresados')}
                  className="p-6 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg group"
                >
                  <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-amber-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Toast Warning</h3>
                  <p className="text-xs text-neutral-600">3 segundos</p>
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Uso:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">toast.success()</code> en <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/components/ui/Toast.jsx</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Usado en operaciones rápidas, feedback no bloqueante (top-right)
                </p>
              </div>
            </div>
          </section>

          {/* ==================== SECCIÓN 3: ALERTS INLINE ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              {' '}
              Inline Alerts
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md space-y-4 mb-4">
              <Alert variant="success" title="¡Operación exitosa!" dismissible>
                Los cambios se han guardado correctamente en la base de datos.
              </Alert>

              <Alert variant="error" title="Error de validación" dismissible>
                Por favor, corrige los errores en el formulario antes de continuar.
              </Alert>

              <Alert variant="warning" title="Advertencia de stock" dismissible>
                Este producto tiene pocas unidades disponibles. Considera reponer el inventario.
              </Alert>

              <Alert variant="info" title="Información del sistema" dismissible>
                Se realizará un mantenimiento programado el próximo sábado de 2-4 AM.
              </Alert>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Uso:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">&lt;Alert variant="success"&gt;</code> en <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/components/ui/Alert.jsx</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Usado en formularios, validaciones, mensajes contextuales en la página
                </p>
              </div>
            </div>
          </section>

          {/* ==================== SECCIÓN 4: CONFIRM DIALOGS ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
              {' '}
              Confirm Dialogs
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Danger Confirm */}
                <button
                  onClick={async () => {
                    const result = await confirm.danger({
                      title: '¿Eliminar este producto?',
                      description: 'Esta acción no se puede deshacer. El producto será eliminado permanentemente.',
                      confirmText: 'Sí, eliminar',
                      cancelText: 'Cancelar'
                    });
                    if (result) toast.success('Producto eliminado');
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all hover:shadow-lg group"
                >
                  <Trash2 className="h-10 w-10 mx-auto mb-3 text-red-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Danger</h3>
                  <p className="text-xs text-neutral-600">Acciones destructivas</p>
                </button>

                {/* Warning Confirm */}
                <button
                  onClick={async () => {
                    const result = await confirm.warning({
                      title: '¿Cambiar estado de la orden?',
                      description: 'Esta acción notificará al cliente por email.',
                      confirmText: 'Sí, cambiar',
                      cancelText: 'Cancelar'
                    });
                    if (result) toast.success('Estado actualizado');
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg group"
                >
                  <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-amber-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Warning</h3>
                  <p className="text-xs text-neutral-600">Acciones con impacto</p>
                </button>

                {/* Info Confirm */}
                <button
                  onClick={async () => {
                    const result = await confirm.info({
                      title: '¿Continuar con la acción?',
                      description: 'Se aplicarán los cambios a todos los elementos seleccionados.',
                      confirmText: 'Continuar',
                      cancelText: 'Cancelar'
                    });
                    if (result) toast.success('Cambios aplicados');
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg group"
                >
                  <Info className="h-10 w-10 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Info</h3>
                  <p className="text-xs text-neutral-600">Confirmación general</p>
                </button>

                {/* Forgot Password Info */}
                <button
                  onClick={async () => {
                    await confirm.info({
                      title: 'Correo enviado',
                      description: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
                      confirmText: 'Entendido'
                    });
                  }}
                  className="p-6 bg-white rounded-xl border-2 border-sky-200 hover:border-sky-400 transition-all hover:shadow-lg group"
                >
                  <Mail className="h-10 w-10 mx-auto mb-3 text-sky-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Correo enviado</h3>
                  <p className="text-xs text-neutral-600">Flujo recuperar contraseña</p>
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Uso:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-xs">confirm.danger()</code> en <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/components/ui/ConfirmDialog.jsx</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Usado en acciones críticas que requieren confirmación explícita del usuario
                </p>
              </div>
            </div>
          </section>

          {/* ==================== SECCIÓN 5: MODALES CUSTOM ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
              {' '}
              Modales Personalizados
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Welcome Modal */}
                <button
                  onClick={() => setShowWelcomeModal(true)}
                  className="p-6 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg group"
                >
                  <PartyPopper className="h-10 w-10 mx-auto mb-3 text-orange-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Bienvenida</h3>
                  <p className="text-xs text-neutral-600">Post-registro</p>
                </button>

                {/* Session Expired */}
                <button
                  onClick={() => setShowExpiredModal(true)}
                  className="p-6 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all hover:shadow-lg group"
                >
                  <AlarmClock className="h-10 w-10 mx-auto mb-3 text-amber-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Sesión Expirada</h3>
                  <p className="text-xs text-neutral-600">Token JWT expirado</p>
                </button>

                {/* Session Warning */}
                <button
                  onClick={() => setShowSessionDialog(true)}
                  className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg group"
                >
                  <Clock className="h-10 w-10 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">Aviso Sesión</h3>
                  <p className="text-xs text-neutral-600">Pre-expiración</p>
                </button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Modales:</strong> Implementaciones custom en <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/modules/auth/pages/</code> y <code className="bg-blue-100 px-2 py-1 rounded text-xs">@/components/auth/</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Bienvenida: RegisterPage.jsx | Sesión expirada: AuthContext.jsx | Aviso sesión: SessionExpirationDialog.jsx
                </p>
              </div>
            </div>
          </section>

          {/* ==================== SECCIÓN 6: ERROR BOUNDARY ==================== */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-(--color-primary2) mb-6 flex items-center gap-2">
              <span className="bg-(--color-primary1) text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">6</span>
              {' '}
              Error Boundary
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
              <div className="p-6 bg-red-50 rounded-xl border-2 border-red-200">
                <h3 className="font-semibold text-lg mb-4 text-red-900">Captura Errores de Renderizado</h3>
                <p className="text-sm text-red-800 mb-4">
                  El ErrorBoundary captura errores de renderizado de React y muestra una UI de respaldo amigable con opción de recargar o volver al inicio.
                </p>
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <p className="text-xs text-neutral-600 mb-2"><strong>Ubicación:</strong> <code className="bg-red-100 px-2 py-1 rounded">@/components/error/ErrorBoundary.jsx</code></p>
                  <p className="text-xs text-neutral-600 mb-2"><strong>Uso:</strong> Envuelve toda la app en <code className="bg-red-100 px-2 py-1 rounded">App.jsx</code></p>
                  <p className="text-xs text-neutral-600"><strong>Captura:</strong> Errores síncronos de renderizado, no captura errores asíncronos ni de eventos</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* MODALES RENDERIZADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'none' }}>
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-[#D4704B] transition-all"
          >
            <div className="text-[#D4704B] mb-3"><PartyPopper className="h-10 w-10 mx-auto" /></div>
            <h3 className="font-semibold text-xl mb-2">Modal de Bienvenida</h3>
            <p className="text-sm text-neutral-600">Después de registro exitoso</p>
          </button>

          <button
            onClick={() => setShowExpiredModal(true)}
            className="p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-amber-500 transition-all"
          >
            <div className="text-amber-600 mb-3"><AlarmClock className="h-10 w-10 mx-auto" /></div>
            <h3 className="font-semibold text-lg mb-2">Modal Sesión Expirada</h3>
            <p className="text-sm text-neutral-600">Cuando el token JWT expira</p>
          </button>
        </div>

        {showWelcomeModal && (
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            tabIndex={-1}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setShowWelcomeModal(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowWelcomeModal(false)}
          >
            <div 
              role="document"
              tabIndex={0}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in modal-content"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
    
              <div className="bg-linear-to-br from-(--color-primary3) via-(--color-primary1) to-(--color-primary2) px-8 pt-8 pb-6 text-center modal-header-group group cursor-pointer">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md animate-circle-pulse hover:backdrop-opacity-10" />
                  <PartyPopper className="h-20 w-20 text-white relative z-10 animate-icon-bounce" strokeWidth={1} />
                </div>
                <div id="welcome-modal-title" className="text-2xl font-serif font-regular text-white mb-0">
                  ¡Bienvenido a MOA, María!
                </div>
                <p className="text-white/90 text-regular text-md">
                  Tu cuenta ha sido creada exitosamente
                </p>
              </div>
              
              {/* Contenido */}
              <div className="px-8 py-6">
                <p className="text-center text-(--color-text-secondary) text-sm leading-relaxed mb-6">
                  Ahora puedes iniciar sesión para comenzar a explorar nuestra colección de muebles artesanales y decoración única.
                </p>
                
                <div className="flex flex-col gap-3 items-center modal-button-wrapper group">
                  <Button
                    onClick={() => setShowWelcomeModal(false)}
                    shape="pill"
                    width="fit"
                    className="px-8 hover:bg-color-primary2 hover:shadow-lg transition-all duration-200"
                    size="sm"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}


         {showExpiredModal && (
             <div 
               role="dialog"
               aria-modal="true"
               aria-labelledby="session-expired-title"
               tabIndex={-1}
               className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
               onClick={() => setShowExpiredModal(false)}
               onKeyDown={(e) => e.key === 'Escape' && setShowExpiredModal(false)}
             >
               <div 
                 role="document"
                 tabIndex={0}
                 className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 animate-scale-in"
                 onClick={(e) => e.stopPropagation()}
                 onKeyDown={(e) => e.stopPropagation()}
               >
                 <div className="flex items-start gap-3 mb-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-warning/100 flex items-center justify-center">
                      <AlarmClock className="h-5 w-5 text-warm" />
                    </div>
                   <div className="flex-1">
                     <h3 id="session-expired-title" className="text-lg font-display font-semibold text-(--color-warning) mb-1">
                       Tu sesión expiró
                     </h3>
                     <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                       Por tu seguridad, necesitas volver a iniciar sesión{expiredFromPath ? ` para acceder a ${expiredFromPath}` : ''}.
                     </p>
                   </div>
                   <button
                     onClick={() => setShowExpiredModal(false)}
                     className="shrink-0 p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                     aria-label="Cerrar"
                   >
                     <X className="h-5 w-5" />
                   </button>
                 </div>
                 <div className="flex justify-end">
                   <Button
                     onClick={() => setShowExpiredModal(false)}
                     shape="pill"
                     size="sm"
                     className="px-6"
                   >
                     Entendido
                   </Button>
                 </div>
               </div>
             </div>
           )}

        {/* Session Warning Dialog */}
        <SessionExpirationDialog
          open={showSessionDialog}
          minutesRemaining={5}
          onExtend={() => {
            setShowSessionDialog(false);
            toast.success('Sesión extendida por 24 horas más');
          }}
          onLogout={() => {
            setShowSessionDialog(false);
            toast.info('Sesión cerrada correctamente');
          }}
          onDismiss={() => setShowSessionDialog(false)}
        />
       
      </div>
    </>
  );
}
