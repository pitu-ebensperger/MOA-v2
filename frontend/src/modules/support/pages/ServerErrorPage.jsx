import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Server, 
  RefreshCw, 
  Home, 
  Wifi, 
  AlertTriangle,
  Clock,
  Mail
} from "lucide-react";
import { alerts } from '@/utils/alerts.js';

export const ServerErrorPage = ({
  errorCode = 500,
  errorMessage = 'Error interno del servidor',
  showRetry = true,
  customTitle = null,
  customDescription = null,
}) => {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryTimer, setRetryTimer] = useState(0);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer para retry automático
  useEffect(() => {
    if (retryTimer > 0) {
      const timer = setTimeout(() => {
        setRetryTimer(retryTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryTimer]);

  // Configuración basada en el código de error
  const errorConfig = {
    500: {
      icon: Server,
      title: 'Error del servidor',
      description: 'Estamos experimentando problemas técnicos. Nuestro equipo ya está trabajando en una solución.',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      canRetry: true
    },
    502: {
      icon: Server,
      title: 'Servidor no disponible',
      description: 'El servidor no está respondiendo en este momento. Por favor, intenta más tarde.',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      canRetry: true
    },
    503: {
      icon: Server,
      title: 'Servicio no disponible',
      description: 'El servicio está temporalmente fuera de línea por mantenimiento.',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      canRetry: true
    },
    504: {
      icon: Clock,
      title: 'Tiempo de respuesta agotado',
      description: 'El servidor está tardando demasiado en responder. Por favor, intenta nuevamente.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      canRetry: true
    },
    0: { // Error de red/sin conexión
      icon: Wifi,
      title: 'Sin conexión',
      description: 'No se puede conectar al servidor. Verifica tu conexión a internet.',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      canRetry: true
    }
  };

  const config = errorConfig[errorCode] || errorConfig[500];
  const Icon = config.icon;

  const handleRetry = async () => {
    if (retryTimer > 0) return;

    setRetryCount(prev => prev + 1);
    
    // Mostrar loading
    alerts.loading('Reintentando...', 'Verificando conexión con el servidor');

    try {
      // Hacer una petición de prueba para verificar conectividad
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache',
        timeout: 5000
      });

      alerts.close();

      if (response.ok) {
        alerts.toast.success('Conexión restablecida');
        // Recargar la página o navegar de vuelta
        globalThis.location.reload();
      } else {
        throw new Error('Server still unavailable');
      }
    } catch {
      alerts.close();
      
      if (retryCount >= 3) {
        alerts.error(
          'No se pudo conectar',
          'Después de varios intentos, aún no podemos conectar con el servidor. Por favor, contacta soporte.'
        );
      } else {
        // Implementar retry con backoff exponencial
        const backoffTime = Math.min(2 ** retryCount * 3, 30);
        setRetryTimer(backoffTime);
        
        alerts.warning(
          'Reintento fallido',
          `Intentando nuevamente en ${backoffTime} segundos...`
        );
      }
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    const errorDetails = `
Error Code: ${errorCode}
Error Message: ${errorMessage}
URL: ${globalThis.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
Online Status: ${isOnline ? 'Online' : 'Offline'}
Retry Count: ${retryCount}
    `.trim();

    const mailtoLink = `mailto:soporte@moa.cl?subject=Error del Servidor - Código ${errorCode}&body=${encodeURIComponent(errorDetails)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#FAFAF9] to-[#F3F1EB] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícono de error */}
        <div className={`mx-auto w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mb-6`}>
          <Icon className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-[#443114] mb-4">
          {customTitle || config.title}
        </h1>

        {/* Descripción */}
        <p className="text-[#6B5B47] mb-6 leading-relaxed">
          {customDescription || config.description}
        </p>

        {/* Estado de conexión */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
          isOnline 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} />
          {isOnline ? 'Conexión detectada' : 'Sin conexión a internet'}
        </div>

        {/* Información del error */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Código:</span>
              <p className="text-[#443114] font-mono">{errorCode}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Reintentos:</span>
              <p className="text-[#443114]">{retryCount}</p>
            </div>
          </div>
          {errorMessage !== config.description && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-500 font-medium text-sm">Detalle:</span>
              <p className="text-[#443114] text-sm mt-1">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          {showRetry && config.canRetry && (
            <button
              onClick={handleRetry}
              disabled={retryTimer > 0 || !isOnline}
              className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                retryTimer > 0 || !isOnline
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#443114] text-white hover:bg-[#5A4A2E] hover:transform hover:-translate-y-0.5'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${retryTimer > 0 ? 'animate-spin' : ''}`} />
              {retryTimer > 0 ? `Reintentando en ${retryTimer}s` : 'Reintentar conexión'}
            </button>
          )}

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-[#443114] px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </button>

          {retryCount >= 2 && (
            <button
              onClick={handleContactSupport}
              className="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contactar soporte
            </button>
          )}
        </div>

        {/* Mensaje adicional para errores persistentes */}
        {retryCount >= 3 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-amber-800 text-sm">
                  Problema persistente detectado
                </h4>
                <p className="text-amber-700 text-sm mt-1">
                  Estamos experimentando problemas técnicos prolongados. 
                  Nuestro equipo ha sido notificado y está trabajando en una solución.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            ID de sesión: {Date.now().toString(36)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;

ServerErrorPage.propTypes = {
  errorCode: PropTypes.number,
  errorMessage: PropTypes.string,
  showRetry: PropTypes.bool,
  customTitle: PropTypes.string,
  customDescription: PropTypes.string,
};

