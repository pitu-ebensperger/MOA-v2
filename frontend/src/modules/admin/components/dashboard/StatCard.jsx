import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CountUp from 'react-countup';

/**
 * Componente de tarjeta para mostrar estadísticas clave (KPIs)
 * con animación, ícono y comparativa de período
 */
export default function StatCard({
  label,
  value,
  previousValue,
  change,
  trend = 'neutral',
  icon: Icon,
  period = 'vs mes anterior',
  prefix = '',
  suffix = '',
  decimals = 0,
  isLoading = false,
  colorScheme = 'primary'
}) {
  // Calcular cambio si no se proporciona explícitamente
  const calculatedChange = useMemo(() => {
    if (change !== undefined) return change;
    if (previousValue && previousValue !== 0) {
      return ((value - previousValue) / previousValue) * 100;
    }
    return 0;
  }, [change, value, previousValue]);

  // Determinar tendencia automáticamente si no se proporciona
  const calculatedTrend = useMemo(() => {
    if (trend !== 'neutral') return trend;
    if (calculatedChange > 0) return 'up';
    if (calculatedChange < 0) return 'down';
    return 'neutral';
  }, [trend, calculatedChange]);

  // Colores según scheme
  const colorClasses = {
    primary: {
      bg: 'bg-[--color-primary1]/10',
      icon: 'text-[--color-primary1]',
      border: 'border-[--color-primary1]/20'
    },
    success: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-200'
    },
    info: {
      bg: 'bg-sky-50',
      icon: 'text-sky-600',
      border: 'border-sky-200'
    },
    warning: {
      bg: 'bg-amber-50',
      icon: 'text-amber-600',
      border: 'border-amber-200'
    }
  };

  const colors = colorClasses[colorScheme] || colorClasses.primary;

  const TrendIcon = calculatedTrend === 'up' ? TrendingUp : calculatedTrend === 'down' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
          <div className="mb-2 h-8 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-(--color-border) bg-white p-6 transition-all hover:shadow-lg hover:shadow-[--color-primary1]/5"
    >
      {/* Gradiente de fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-(--color-primary1)/[0.02] opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        {/* Contenido principal */}
        <div className="flex-1">
          {/* Label */}
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-(--text-secondary1)">
            {label}
          </p>

          {/* Valor principal con animación */}
          <div className="mb-3 flex items-baseline gap-1">
            {prefix && <span className="text-2xl font-bold text-(--text-strong)">{prefix}</span>}
            <span className="font-display text-3xl font-bold text-(--text-strong)">
              <CountUp
                end={typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.-]/g, ''))}
                duration={1.5}
                decimals={decimals}
                separator=","
                prefix={prefix && typeof value === 'string' ? '' : prefix}
              />
            </span>
            {suffix && <span className="text-xl font-semibold text-(--text-secondary1)">{suffix}</span>}
          </div>

          {/* Cambio y período */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                calculatedTrend === 'up'
                  ? 'bg-emerald-50 text-emerald-600'
                  : calculatedTrend === 'down'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-50 text-gray-600'
              }`}
            >
              <TrendIcon className="size-3" />
              <span>
                {calculatedChange > 0 && '+'}
                {calculatedChange.toFixed(1)}%
              </span>
            </div>
            <span className="text-(--text-muted)">{period}</span>
          </div>
        </div>

        {/* Ícono */}
        {Icon && (
          <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-3 transition-transform group-hover:scale-110`}>
            <Icon className={`size-6 ${colors.icon}`} />
          </div>
        )}
      </div>
    </Motion.div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  previousValue: PropTypes.number,
  change: PropTypes.number,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  icon: PropTypes.elementType,
  period: PropTypes.string,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  decimals: PropTypes.number,
  isLoading: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['primary', 'success', 'info', 'warning'])
};
