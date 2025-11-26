import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { alerts } from '@/utils/alerts.js';
import { observability } from '@/services/observability.js';

// Serialización defensiva: evita que React DevTools (override de console.error)
// intente convertir a primitivo objetos Proxy / complejos que disparan
// "Cannot convert object to primitive value".
const safeSerializeError = (err) => {
  if (!err) return null;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause && typeof err.cause === 'object' ? safeSerializeError(err.cause) : err.cause || null,
    };
  }
  if (typeof err === 'object') {
    try {
      return JSON.parse(JSON.stringify(err));
    } catch (_) {
      try {
        return { stringified: String(err) };
      } catch (_) {
        return { stringified: '[Unserializable Error Object]' };
      }
    }
  }
  try {
    return { value: String(err) };
  } catch (_) {
    return { value: '[Unserializable]' };
  }
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError() {
    // Actualiza el state para mostrar la UI de error
    return { 
      hasError: true,
      errorId: Math.random().toString(36).substring(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Captura detalles del error
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log del error para debugging - MÁS VISIBLE
    const safe = safeSerializeError(error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🔴 ErrorBoundary caught an error (sanitized):');
    console.error('Error (safe):', safe);
    console.error('Message:', safe?.message || error?.message);
    console.error('Stack:', safe?.stack || error?.stack);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Enviar error a servicio de monitoreo (opcional)
    this.logErrorToService(error, errorInfo);

    // Mostrar notificación de error si no es un error crítico
    if (!this.props.silent) {
      alerts.error(
        'Error inesperado',
        'Ha ocurrido un problema en la aplicación. El error se ha reportado automáticamente.'
      );
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Aquí podrías enviar el error a un servicio como Sentry, LogRocket, etc.
    const isDevelopment = import.meta.env.DEV;
    
    if (!isDevelopment) {
      observability.captureException(error, {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = `
Error ID: ${errorId}
Mensaje: ${error?.message || 'Error desconocido'}
Página: ${window.location.href}
Navegador: ${navigator.userAgent}
Hora: ${new Date().toLocaleString()}

Stack trace:
${error?.stack || 'No disponible'}

Component stack:
${errorInfo?.componentStack || 'No disponible'}
    `.trim();

    const mailtoLink = `mailto:soporte@moa.cl?subject=Reporte de Error - ID: ${errorId}&body=${encodeURIComponent(errorDetails)}`;
    window.open(mailtoLink, '_blank');
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;
      const { error, errorInfo, errorId } = this.state;

      // Si se proporciona un componente fallback personalizado
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            onReload={this.handleReload}
            onGoHome={this.handleGoHome}
            onReport={this.handleReportError}
          />
        );
      }

      // Componente de error por defecto
      return (
        <div className="min-h-screen bg-linear-to-b from-[#FAFAF9] to-[#F3F1EB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Ícono de error */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-primary mb-4">
              ¡Ups! Algo salió mal
            </h1>

            {/* Descripción */}
            <p className="text-primary mb-6 leading-relaxed">
              Ha ocurrido un error inesperado en la aplicación. 
              Nuestro equipo ha sido notificado automáticamente.
            </p>

            {/* ID del error */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                ID del Error
              </span>
              <p className="font-mono text-sm text-[#443114] mt-1">
                {errorId}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-[#443114] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#5A4A2E] transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar página
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full bg-gray-100 text-[#443114] px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>

            {/* Enlace de reporte */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={this.handleReportError}
                className="text-sm text-[#6B5B47] hover:text-[#443114] transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
              >
                <Bug className="w-4 h-4" />
                Reportar este error
              </button>
            </div>

            {/* Detalles técnicos (solo en desarrollo) */}
            {showDetails && import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-[#8B7355] hover:text-[#443114] mb-2">
                  Detalles técnicos
                </summary>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {error?.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {error?.stack}
                    </pre>
                  </div>
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
