import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, X, Clock, PartyPopper, AlarmClock } from "lucide-react";
import { useAuth, isAdminRole } from '@/context/AuthContext.jsx'
import { useRedirectAfterAuth } from '@/modules/auth/hooks/useRedirectAuth.jsx'
import { Button, useToast } from "@/components/ui"
import { API_PATHS } from '@/config/app.routes.js'
import { validateEmail, validatePassword } from '@/utils/validation';


export default function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirect = useRedirectAfterAuth();
  const { info } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Estados de modales independientes (NO dependen de location.state)
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');
  const [expiredFromPath, setExpiredFromPath] = useState('');
  
  // Ref para evitar múltiples ejecuciones del efecto (React 18 StrictMode)
  const hasProcessedState = useRef(false);

  // Detectar estados SOLO UNA VEZ al montar y limpiar inmediatamente
  useEffect(() => {
    // Evitar ejecución múltiple en StrictMode
    if (hasProcessedState.current) return;
    
    // Capturar los estados inmediatamente para evitar que cambien
    const hasState = location.state && Object.keys(location.state).length > 0;
    if (!hasState) return; // No hay nada que procesar
    
    hasProcessedState.current = true;
    
    const sessionExpired = location.state?.expired;
    const authRequired = location.state?.authRequired;
    const registered = location.state?.registered;
    const userName = location.state?.userName;
    const fromPath = location.state?.from?.pathname;

    if (sessionExpired) {
      setShowExpiredModal(true);
      setExpiredFromPath(fromPath || '');
      if (import.meta.env.DEV) console.log('🔍 [LoginPage] Modal de sesión expirada disparado', { fromPath });
    }
    
    if (authRequired) {
      info("Necesitas una cuenta para agregar productos al carrito.", { duration: 4000 });
      // Limpiar state después de procesarlo
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
    
    if (registered) {
      setShowWelcomeModal(true);
      setWelcomeUserName(userName || '');
      // Auto-cerrar después de 5 segundos
      const timer = setTimeout(() => setShowWelcomeModal(false), 5000);
      // Limpiar state después de procesarlo
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // Si hubo cualquier estado pero no se procesó arriba, limpiarlo
    if (sessionExpired || authRequired || registered) {
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← Solo al montar, ignorar cambios de location

  // Body scroll lock cuando hay modales abiertos
  useEffect(() => {
    const hasModal = showWelcomeModal || showExpiredModal;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [showWelcomeModal, showExpiredModal]);


  useEffect(() => {  // Limpiar cualquier estado corrupto al montar
    // Si token pero no usarlo, limpiar todo
    const token = localStorage.getItem('moa.accessToken');
    const user = localStorage.getItem('moa.user');
    if (token && !user) {
      if (import.meta.env.DEV) console.warn('[LoginPage] Token sin usuario detectado, limpiando...');
      localStorage.clear();
    }
  }, []);

  // Estilos de animación
  const styles = `
    @keyframes icon-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes circle-pulse {
      0%, 100% { transform: scale(1); opacity: 0.15; }
      50% { transform: scale(0.9); opacity: 0.15; }
    }
    
    .animate-icon-bounce,
    .animate-circle-pulse {
      transition: all 0.3s ease;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    // Limpiar espacios en blanco de los inputs
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Validaciones de formato
    const nextErrors = {};
    
    // Validar email
    const emailValidation = validateEmail(cleanEmail);
    if (!emailValidation.valid) {
      nextErrors.email = emailValidation.error;
    }
    
    // Validar password
    const passwordValidation = validatePassword(cleanPassword, { minLength: 6 });
    if (!passwordValidation.valid) {
      nextErrors.password = passwordValidation.error;
    }
    
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      setServerError('');
      if (import.meta.env.DEV) console.log('[LoginPage] Intentando login con:', { email: cleanEmail, passwordLength: cleanPassword.length });
      const profile = await login({ email: cleanEmail, password: cleanPassword }); // AuthContext guarda token+user
      redirect({ adminOverride: isAdminRole(profile) });                        // redirige por rol
    } catch (err) {
      console.error('[LoginPage] Error en login:', err);
      const errorMessage = err?.data?.message || err?.message || 'Credenciales inválidas';
      setServerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <style>{styles}</style>
    <div className="page">
    
    {/* Modal de bienvenida (después de registro) - FUERA del contenedor principal */}
    {showWelcomeModal && (
      <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <div 
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar X */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white hover:scale-110 transition-all"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
    
              <div className="bg-gradient-to-br from-[var(--color-primary3)] via-[var(--color-primary1)] to-[var(--color-primary2)] px-8 pt-8 pb-6 text-center modal-header-group group cursor-pointer">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                  <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md animate-circle-pulse" />
                  <PartyPopper className="h-20 w-20 text-white relative z-10 animate-icon-bounce" strokeWidth={1} />
                </div>
                <div className="text-2xl font-serif font-regular text-white mb-0">
                  ¡Bienvenido a MOA{welcomeUserName ? `, ${welcomeUserName.split(' ')[0]}` : ''}!
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
                    className="px-8 hover:bg--color-primary2 hover:shadow-lg transition-all duration-200"
                    size="sm"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
    )}   

    {/* Modal de sesión expirada */}
    {showExpiredModal && (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
        onClick={() => setShowExpiredModal(false)}
      >
        <div 
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar X */}
          <button
            onClick={() => setShowExpiredModal(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* Header con tono amber para advertencia */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 pt-8 pb-6 border-b border-amber-100">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlarmClock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-(--color-primary1) mb-2">
                  Tu sesión ha expirado
                </h3>
                <p className="text-sm text-(--color-text-secondary) leading-relaxed">
                  Por tu seguridad, necesitas volver a iniciar sesión{expiredFromPath ? ` para acceder a ${expiredFromPath}` : ''}.
                </p>
              </div>
            </div>
          </div>
          

          
          {/* Contenido */}
          <div className="px-8 py-6">
            <div className="bg-amber-50/50 rounded-xl p-4 mb-6 border border-amber-100">
              <p className="text-xs text-(--color-text-secondary) text-center">
                Las sesiones expiran después de 24 horas de inactividad para proteger tu cuenta.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 items-center">
              <Button
                onClick={() => setShowExpiredModal(false)}
                shape="pill"
                width="fit"
                size="sm"
                className="px-8 hover:bg--color-primary2 hover:shadow-lg transition-all duration-200"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">

        <div className="bg-white/75 backdrop-blur rounded-xl shadow-sm p-6 md:p-8">
          <header className="text-center mb-6">
            <h1 className="font-serif text-3xl text-(--color-primary1)">Iniciar sesión</h1>
            <p className="text-sm text-(--color-secondary1) mt-1">Bienvenido de vuelta</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail size={18} />
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({...prev, email: ''}));
                }}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                  errors.email 
                    ? 'border-[#cc5f49] focus:border-[#cc5f49] ring-[#cc5f49]/20' 
                    : 'border-neutral-300 focus:border-neutral-500 ring-neutral-200'
                }`}
                placeholder="tu@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-[#cc5f49] mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm text-neutral-700">
                <Lock size={18} />
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({...prev, password: ''}));
                }}
                className={`w-full rounded-lg border px-3 py-2 outline-none transition focus:ring-2 ${
                  errors.password 
                    ? 'border-[#cc5f49] focus:border-[#cc5f49] ring-[#cc5f49]/20' 
                    : 'border-neutral-300 focus:border-neutral-500 ring-neutral-200'
                }`}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-[#cc5f49] mt-1">{errors.password}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-[#cc5f49] -mt-2">{serverError}</p>
            )}
            <div className='flex flex-col items-center justify-center w-full'> 
              <Button
                type="submit"
                shape="pill"
                motion="lift"
                className="font-regular px-5 mt-2 mb-0 mx-0 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
              {submitting ? 'Entrando…' : 'Iniciar sesión'}
            </Button>

                 <div className="mt-3 text-center">
                <Link
                  to={API_PATHS.auth.forgot}
                  className="text-sm text-muted no-underline hover:opacity-100 hover:text-(--color-secondary1) hover:text-medium transition-colors"
                >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            </div>
       
         </form>

          <footer className="text-center mt-6 pt-6 border-t border-neutral-200">
            <p className="text-sm text-(--color-primary1) opacity-80">
              ¿No tienes una cuenta?{' '}
                <Link to={API_PATHS.auth.register} className="underline text-(--color-primary1) hover:opacity-80">
                Regístrate aquí
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </main>
    </div>
    </>
  );
}
