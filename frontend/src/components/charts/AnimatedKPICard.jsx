import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion as Motion, useSpring, useTransform } from "framer-motion";

/**
 * AnimatedKPICard - Card con número animado que cuenta hasta el valor final
 * Muestra indicador de tendencia, comparación con período anterior, y animación de entrada
 */
export const AnimatedKPICard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  trend,
  suffix = "",
  prefix = "",
  color = "var(--color-primary1)",
  loading = false,
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    stiffness: 80,
    damping: 20,
    mass: 1,
  });

  const rounded = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    const numericValue = typeof value === "number" ? value : Number.parseFloat(value) || 0;
    
    // Animate from previous value to current
    spring.set(numericValue);

    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [value, spring, rounded]);

  // Calculate trend percentage
  const trendPercentage = previousValue && value
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const trendDirection = trendPercentage >= 0 ? "up" : "down";
  const trendColor = trendPercentage >= 0 ? color : "var(--color-error)";

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, boxShadow: "var(--shadow-lg)" }}
      className="group relative overflow-hidden rounded-3xl bg-white/95 p-6 shadow-sm transition-all"
    >
      {/* Gradient background decoration */}
      <div
        className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${color} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-(--text-secondary1)">{title}</p>
          </div>
          {Icon && (
            <Motion.div
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.5, ease: "backOut" }}
              className="rounded-2xl p-3"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
              }}
            >
              <Icon className="h-6 w-6" style={{ color }} />
            </Motion.div>
          )}
        </div>

        {/* Animated Value */}
        {loading ? (
          <div className="h-10 w-32 animate-pulse rounded-xl bg-(--color-neutral3)" />
        ) : (
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1, duration: 0.4 }}
            className="mb-3"
          >
            <div className="text-2xl font-bold text-(--text-strong)">
              {prefix}
              {displayValue.toLocaleString("es-CL")}
              {suffix}
            </div>
          </Motion.div>
        )}

        {/* Trend Indicator */}
        {!loading && previousValue && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.3, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <Motion.div
              animate={{
                y: trendDirection === "up" ? [-2, 0, -2] : [2, 0, 2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-1"
              style={{ color: trendColor }}
            >
              {trendDirection === "up" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className="text-sm font-semibold">
                {Math.abs(trendPercentage).toFixed(1)}%
              </span>
            </Motion.div>
            <span className="text-xs text-(--text-muted)">vs anterior</span>
          </Motion.div>
        )}

        {/* Mini sparkline progress */}
        {trend && (
          <Motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: delay + 0.4, duration: 0.6 }}
            className="mt-3 h-1 w-full overflow-hidden rounded-full bg-(--color-neutral3)"
          >
            <Motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                width: `${Math.min(Math.abs(trendPercentage), 100)}%`,
                backgroundColor: trendColor,
              }}
            />
          </Motion.div>
        )}
      </div>
    </Motion.div>
  );
};

AnimatedKPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  previousValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.elementType,
  trend: PropTypes.bool,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  color: PropTypes.string,
  loading: PropTypes.bool,
  delay: PropTypes.number,
};
