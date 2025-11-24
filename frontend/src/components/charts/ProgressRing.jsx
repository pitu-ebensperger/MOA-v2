import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";

/**
 * ProgressRing - Anillo de progreso circular animado
 * Ideal para mostrar porcentajes, completitud, o métricas circulares
 */
export const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 12,
  color = "var(--color-primary1)",
  backgroundColor = "var(--color-neutral3)",
  showPercentage = true,
  label,
  value,
  animate = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <Motion.div
            initial={animate ? { opacity: 0, scale: 0.5 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold text-(--text-strong)"
            style={{ color }}
          >
            {Math.round(progress)}%
          </Motion.div>
        )}
        
        {value && !showPercentage && (
          <Motion.div
            initial={animate ? { opacity: 0, scale: 0.5 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl font-bold text-(--text-strong)"
            style={{ color }}
          >
            {value}
          </Motion.div>
        )}

        {label && (
          <Motion.div
            initial={animate ? { opacity: 0, y: 5 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-1 text-xs text-(--text-muted)"
          >
            {label}
          </Motion.div>
        )}
      </div>
    </div>
  );
};

ProgressRing.propTypes = {
  progress: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  showPercentage: PropTypes.bool,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  animate: PropTypes.bool,
};
