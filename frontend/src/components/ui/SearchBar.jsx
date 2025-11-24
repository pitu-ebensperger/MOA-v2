import { Search, X } from "lucide-react";
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button.jsx'

export function SearchBar({
  isOpen,
  value,
  onChange,
  onSubmit,
  onClose,
  placeholder = '¿Qué estás buscando hoy?',
  buttonLabel = 'Buscar',
}) {
  const inputRef = useRef(null);
  const bodyOverflowRef = useRef('');
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  // Auto-close after 30 seconds as safety measure
  useEffect(() => {
    if (!isOpen) return;
    
    const timeoutId = setTimeout(() => {
      console.warn('🕐 SearchBar auto-closed after 30 seconds for safety');
      onClose?.();
    }, 30000); // 30 segundos
    
    return () => clearTimeout(timeoutId);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!portalTarget) return undefined;
    if (isOpen) {
      bodyOverflowRef.current = portalTarget.style.overflow;
      portalTarget.style.overflow = 'hidden';
    } else {
      portalTarget.style.overflow = bodyOverflowRef.current || '';
    }
    return () => {
      portalTarget.style.overflow = bodyOverflowRef.current || '';
    };
  }, [isOpen, portalTarget]);

  if (!isOpen || !portalTarget) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center px-4">
      <div
        className="absolute inset-0 z-10 bg-black/30 cursor-pointer"
        onClick={(e) => {
          // Solo cerrar si se hace clic directamente en el backdrop
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
        aria-label="Cerrar buscador"
      />

      <form
        onSubmit={onSubmit}
        className="relative z-20 mt-32 flex w-full max-w-2xl items-center gap-3 rounded-full bg-white px-6 py-3 shadow-2xl"
      >
        <Search className="h-5 w-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className="w-full border-none bg-transparent text-base text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-0 active:outline-none active:ring-0"
          value={value}
          onChange={onChange}
        />
        <Button
          type="submit"
          shape="pill"
          size="sm"
          motion="lift"
          className="font-semibold"
        >
          {buttonLabel}
        </Button>
        
        {/* Botón de cerrar visible */}
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
          aria-label="Cerrar buscador"
        >
          <X className="h-4 w-4" />
        </button>
      </form>
    </div>,
    portalTarget
  );
}
