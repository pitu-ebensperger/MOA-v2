import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';

export default function ChartCard({
  title,
  subtitle,
  filters,
  actions,
  children,
  className = '',
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-(--color-border) bg-white p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-2 h-6 w-48 rounded bg-gray-200" />
          <div className="mb-6 h-4 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border border-(--color-border) bg-white p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-(--text-strong)">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-(--text-secondary1)">{subtitle}</p>
          )}
        </div>

        {/* Acciones (exportar, etc) */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filtros (tabs de período, etc) */}
      {filters && <div className="mb-6">{filters}</div>}

      {/* Contenido del gráfico */}
      <div>{children}</div>
    </Motion.div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  filters: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool
};
