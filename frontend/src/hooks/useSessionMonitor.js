import { useEffect, useState, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useSessionMonitor = ({ 
  token, 
  onExpired, 
  onWarning,
  warningMinutes = 5 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const warningShownRef = useRef(false);
  const expiredHandledRef = useRef(false);

  const getTokenExpiration = useCallback((jwt) => {
    if (!jwt) return null;
    
    try {
      const decoded = jwtDecode(jwt);
      if (!decoded.exp) return null;
      
      // exp está en segundos, convertir a ms
      const expirationTime = decoded.exp * 1000;
      const now = Date.now();
      const remaining = expirationTime - now;
      
      return {
        expirationTime,
        remaining,
        isExpired: remaining <= 0,
        shouldWarn: remaining <= warningMinutes * 60 * 1000 && remaining > 0
      };
    } catch (error) {
      console.error('[useSessionMonitor] Error decodificando token:', error);
      return null;
    }
  }, [warningMinutes]);

  // Monitorear el token cada 30 segundos
  useEffect(() => {
    if (!token) {
      setTimeRemaining(null);
      setIsExpired(false);
      setShowWarning(false);
      warningShownRef.current = false;
      expiredHandledRef.current = false;
      return undefined;
    }

    const checkToken = () => {
      const tokenInfo = getTokenExpiration(token);
      
      if (!tokenInfo) {
        setTimeRemaining(null);
        return;
      }

      setTimeRemaining(tokenInfo.remaining);

      // Token expirado
      if (tokenInfo.isExpired && !expiredHandledRef.current) {
        expiredHandledRef.current = true;
        setIsExpired(true);
        setShowWarning(false);
        
        if (onExpired) {
          onExpired();
        }
        return;
      }

      // Mostrar warning una sola vez
      if (tokenInfo.shouldWarn && !warningShownRef.current && !expiredHandledRef.current) {
        warningShownRef.current = true;
        setShowWarning(true);
        
        if (onWarning) {
          onWarning(Math.ceil(tokenInfo.remaining / 1000 / 60)); // minutos restantes
        }
      }
    };

    // Check inicial
    checkToken();

    // Check cada 30 segundos
    const interval = setInterval(checkToken, 30000);

    return () => clearInterval(interval);
  }, [token, getTokenExpiration, onExpired, onWarning]);

  // Formatear tiempo restante para display
  const formatTimeRemaining = useCallback(() => {
    if (!timeRemaining || timeRemaining <= 0) return '0m';
    
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    
    return `${seconds}s`;
  }, [timeRemaining]);

  return {
    timeRemaining,
    isExpired,
    showWarning,
    formattedTime: formatTimeRemaining(),
    minutesRemaining: timeRemaining ? Math.ceil(timeRemaining / 1000 / 60) : 0
  };
};
