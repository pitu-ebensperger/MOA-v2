import { useState } from 'react';

export function ImageWithFallback({ 
  src, 
  fallback = '/placeholder.png', 
  alt = '', 
  className = '',
  onError,
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (event) => {
    if (!hasError && fallback && imgSrc !== fallback) {
      if (import.meta.env.DEV) console.warn(`[ImageWithFallback] Error cargando imagen: ${imgSrc}, usando fallback`);
      setImgSrc(fallback);
      setHasError(true);
    }

    // Callback personalizado
    if (typeof onError === 'function') {
      onError(event);
    }

    // Log en producción
    if (import.meta.env.PROD) {
      // TODO: Sentry.captureMessage(`Image load error: ${src}`);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}

export function ImageWithLoader({ 
  src, 
  fallback = '/placeholder.png',
  alt = '', 
  className = '',
  loaderClassName = 'animate-pulse bg-gray-200',
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (!hasError && fallback && imgSrc !== fallback) {
      setImgSrc(fallback);
      setHasError(true);
      setIsLoading(true); // Mostrar loader mientras carga el fallback
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 ${loaderClassName}`} />
      )}
      <img 
        src={imgSrc} 
        alt={alt} 
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
