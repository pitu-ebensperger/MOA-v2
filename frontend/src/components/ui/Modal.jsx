import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { cn } from "@/utils/cn.js";

export function Modal({
  open,
  onClose,
  title,
  children,
  placement = "center",
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  bodyClassName,
  footer,
  footerClassName,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const panelRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
      setIsExiting(false);
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setIsExiting(false);
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnOverlayClick) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeOnOverlayClick, handleClose]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleClose();
    }
  };

  const handlePanelClick = (event) => event.stopPropagation();

  if (!open && !isExiting) return null;

  const containerClass = cn(
    "fixed inset-0 z-[var(--z-modal)] flex p-4",
    placement === "right" ? "items-stretch justify-end" : "items-center justify-center"
  );

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full",
  };

  const panelClasses = cn(
    "relative bg-white w-full",
    "transition-all duration-300 ease-out",
    placement === "right"
      ? cn(
          "h-full max-w-[520px]",
          isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        )
      : cn(
          "rounded-[var(--radius-xl)] shadow-2xl",
          sizeClasses[size] || sizeClasses.md,
          isExiting
            ? "scale-95 translate-y-4 opacity-0"
            : "scale-100 translate-y-0 opacity-100"
        ),
    className
  );

  return (
    <div className={containerClass} aria-modal="true" role="dialog">
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-(--overlay-dark) transition-opacity duration-200",
          isExiting ? "opacity-0" : "opacity-100"
        )}
        onClick={handleOverlayClick}
      />

      {/* Panel */}
      <div ref={panelRef} className={panelClasses} onClick={handlePanelClick}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between gap-4",
              "px-6 py-4 border-b border-(--color-border)",
              headerClassName
            )}
          >
            <div className="min-w-0 flex-1">
              {typeof title === "string" ? (
                <h2 className="text-lg font-semibold text-(--color-text) truncate">
                  {title}
                </h2>
              ) : (
                title
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  "shrink-0 p-2 rounded-full",
                  "text-(--color-text-secondary)",
                  "hover:bg-(--color-neutral3)/30",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-(--color-primary1)/40"
                )}
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            "overflow-y-auto",
            placement === "right"
              ? "h-[calc(100%-80px)]"
              : "max-h-[calc(100vh-12rem)]",
            "px-6 py-4",
            bodyClassName
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "px-6 py-4 border-t border-(--color-border)",
              "flex items-center justify-end gap-3",
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  placement: PropTypes.oneOf(["center", "right"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  showCloseButton: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
};
