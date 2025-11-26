import React from "react";
import ReactDOM from "react-dom";
import { cn } from "@/utils/cn.js";


const VARIANT_CLASSES = {
  dark: {
    bg: "bg-[color:var(--color-dark)]",
    text: "text-[color:var(--color-text-on-dark)]",
    arrow: "var(--color-dark)",
  },
  neutral: {
    bg: "bg-[color:var(--color-neutral4)]",
    text: "text-[color:var(--color-text)]",
    arrow: "var(--color-neutral4)",
  },
  light: {
    bg: "bg-[color:var(--color-neutral1)]",
    text: "text-[color:var(--color-text)]",
    arrow: "var(--color-neutral1)",
  },
  primary: {
    bg: "bg-[color:var(--color-primary1)]",
    text: "text-[color:var(--color-text-on-dark)]",
    arrow: "var(--color-primary1)",
  },
};

export function Tooltip({
  label,           
  children,  
  position = "right", 
  variant = "dark", 
  shape = "default", // "default" | "pill"
  showArrow = true,
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef(null);

  const variantConfig = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.dark;
  const tooltipId = React.useId();
  const isValidElement = React.isValidElement(children);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    const offsetVertical = 16; // Distancia para top (no tapa contenido)
    const offsetBottom = 32; // Distancia mayor para bottom (más separado)
    const offsetHorizontal = 12; // Distancia para left/right

    switch (position) {
      case "top":
        top = rect.top - offsetVertical;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + offsetBottom;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - offsetHorizontal;
        break;
      case "right":
      default:
        top = rect.top + rect.height / 2;
        left = rect.right + offsetHorizontal;
        break;
    }

    setCoords({ top, left });
  }, [position]);

  const handleMouseEnter = React.useCallback(() => {
    setIsVisible(true);
    updatePosition();
  }, [updatePosition]);

  const handleMouseLeave = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleFocus = React.useCallback(() => {
    setIsVisible(true);
    updatePosition();
  }, [updatePosition]);

  const handleBlur = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  const trigger = isValidElement
    ? React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        "aria-describedby": cn(children.props?.["aria-describedby"], tooltipId),
      })
    : children;

  const getArrowStyles = () => {
    const arrowColor = variantConfig.arrow;
    
    switch (position) {
      case "top":
        return {
          borderTopColor: arrowColor,
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        };
      case "bottom":
        return {
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: arrowColor,
          borderLeftColor: "transparent",
        };
      case "left":
        return {
          borderTopColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: arrowColor,
        };
      case "right":
      default:
        return {
          borderTopColor: "transparent",
          borderRightColor: arrowColor,
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        };
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0 border-[6px] border-solid";

    switch (position) {
      case "top":
        return cn(baseClasses, "top-full left-1/2 -translate-x-1/2");
      case "bottom":
        return cn(baseClasses, "bottom-full left-1/2 -translate-x-1/2");
      case "left":
        return cn(baseClasses, "left-full top-1/2 -translate-y-1/2");
      case "right":
      default:
        return cn(baseClasses, "right-full top-1/2 -translate-y-1/2");
    }
  };

  const isPillShape = shape === "pill";
  const shouldShowArrow = showArrow && !isPillShape;

  const tooltipContent = isVisible && typeof document !== "undefined" ? ReactDOM.createPortal(
    <span
      id={tooltipId}
      role="tooltip"
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: position === "top" || position === "bottom" 
          ? "translate(-50%, -100%)" 
          : position === "left" 
          ? "translate(-100%, -50%)" 
          : "translateY(-50%)",
      }}
      className={cn(
        "pointer-events-none z-(--z-tooltip) whitespace-nowrap relative",
        isPillShape
          ? "rounded-full px-4 py-2 text-[0.8rem] leading-tight shadow-md border border-white/25 backdrop-blur-sm"
          : "rounded-md px-3 py-2 text-[0.75rem] leading-snug shadow-lg",
        "opacity-0 invisible",
        "transition-all duration-150 ease-out",
        isVisible && "opacity-100 visible",
        variantConfig.bg,
        variantConfig.text,
        !isPillShape && variant === "light" && "border border-(--color-border)",
        isPillShape && variant !== "light" && "border border-white/10"
      )}
    >
      {label}
      {shouldShowArrow && <span className={getArrowClasses()} style={getArrowStyles()} />}
    </span>,
    document.body
  ) : null;

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  );
}


export const TooltipDark = (props) => (
  <Tooltip {...props} variant="dark" />
);

export const TooltipNeutral = (props) => (
  <Tooltip {...props} variant="neutral" />
);

export const TooltipLight = (props) => (
  <Tooltip {...props} variant="light" />
);

export const TooltipPrimary = (props) => (
  <Tooltip {...props} variant="primary" />
);
