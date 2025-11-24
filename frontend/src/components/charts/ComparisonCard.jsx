import PropTypes from "prop-types";
import { motion as Motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * ComparisonCard - Comparación visual entre dos períodos
 * Muestra valor actual vs anterior con barras de progreso y tendencia
 */
export const ComparisonCard = ({
  title,
  currentLabel = "Actual",
  previousLabel = "Anterior",
  currentValue,
  previousValue,
  formatter = (v) => v?.toLocaleString("es-CL") || "0",
  color = "var(--color-primary1)",
  delay = 0,
}) => {
  const maxValue = Math.max(currentValue || 0, previousValue || 0);
  const currentPercentage = maxValue > 0 ? ((currentValue || 0) / maxValue) * 100 : 0;
  const previousPercentage = maxValue > 0 ? ((previousValue || 0) / maxValue) * 100 : 0;

  const change = currentValue && previousValue ? currentValue - previousValue : 0;
  const changePercentage = previousValue ? (change / previousValue) * 100 : 0;

  let trendIcon = Minus;
  let trendColor = "var(--text-muted)";
  
  if (changePercentage > 0) {
    trendIcon = TrendingUp;
    trendColor = "var(--color-success)";
  } else if (changePercentage < 0) {
    trendIcon = TrendingDown;
    trendColor = "var(--color-error)";
  }

  const TrendIcon = trendIcon;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-3xl bg-white/95 p-6 shadow-(--shadow-sm)"
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-(--text-strong)">{title}</h3>
          <div className="mt-2 flex items-center gap-2">
            <TrendIcon className="h-5 w-5" style={{ color: trendColor }} />
            <span className="text-sm font-semibold" style={{ color: trendColor }}>
              {changePercentage > 0 ? "+" : ""}
              {changePercentage.toFixed(1)}%
            </span>
            <span className="text-xs text-(--text-muted)">vs anterior</span>
          </div>
        </div>
      </div>

      {/* Current period */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-(--text-strong)">{currentLabel}</span>
          <span className="text-lg font-bold text-(--text-strong)">
            {formatter(currentValue)}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-(--color-neutral3)">
          <Motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPercentage}%` }}
            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: color }}
          >
            <Motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
              }}
            />
          </Motion.div>
        </div>
      </div>

      {/* Previous period */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-(--text-secondary1)">{previousLabel}</span>
          <span className="text-base font-semibold text-(--text-secondary1)">
            {formatter(previousValue)}
          </span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-(--color-neutral3)">
          <Motion.div
            initial={{ width: 0 }}
            animate={{ width: `${previousPercentage}%` }}
            transition={{ duration: 1, delay: delay + 0.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full opacity-50"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Difference indicator */}
      {change !== 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.8, duration: 0.4 }}
          className="mt-4 flex items-center justify-between rounded-2xl p-3"
          style={{
            backgroundColor: `color-mix(in srgb, ${trendColor} 10%, transparent)`,
          }}
        >
          <span className="text-xs font-medium text-(--text-secondary1)">Diferencia</span>
          <span className="text-sm font-bold" style={{ color: trendColor }}>
            {change > 0 ? "+" : ""}
            {formatter(change)}
          </span>
        </Motion.div>
      )}
    </Motion.div>
  );
};

ComparisonCard.propTypes = {
  title: PropTypes.string.isRequired,
  currentLabel: PropTypes.string,
  previousLabel: PropTypes.string,
  currentValue: PropTypes.number,
  previousValue: PropTypes.number,
  formatter: PropTypes.func,
  color: PropTypes.string,
  delay: PropTypes.number,
};
