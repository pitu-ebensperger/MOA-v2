import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import { Truck, Zap, Store, Package } from 'lucide-react';
import { BarChart } from '@/modules/admin/components/charts/BarChart.jsx';
import { Price } from '@/components/data-display/Price.jsx';
import { useShippingMethodStats } from '@/modules/admin/hooks/useDashboardStats.js';

const SHIPPING_METHOD_ICONS = {
  standard: Truck,
  express: Zap,
  retiro: Store
};

const SHIPPING_METHOD_LABELS = {
  standard: 'Standard',
  express: 'Express',
  retiro: 'Retiro en tienda'
};

const SHIPPING_METHOD_COLORS = {
  standard: '#3b82f6',  // blue
  express: '#f59e0b',   // amber
  retiro: '#8b5cf6'     // purple
};

export default function ShippingMethodsChart({ periodo = 30, periodLabel }) {
  const rangeLabel = periodLabel || `Últimos ${periodo} días`;
  const { data, isLoading, isError } = useShippingMethodStats(periodo);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      name: SHIPPING_METHOD_LABELS[item.metodo_despacho] || item.metodo_despacho,
      ordenes: item.cantidad_ordenes,
      ingresos: item.ingresos_totales,
      ingresosEnvio: item.ingresos_envio,
      promedio: item.ticket_promedio,
      porcentaje: item.porcentaje_uso,
      metodo: item.metodo_despacho
    }));
  }, [data]);

  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-6">
        <p className="text-sm text-error">Error al cargar estadísticas de métodos de envío</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-(--text-strong)">Métodos de Envío</h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--text-muted)">No hay datos de métodos de envío en este período</p>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-white p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-(--text-strong)">Métodos de Envío</h3>
        <p className="mt-1 text-sm text-(--text-secondary1)">
          Distribución de pedidos {rangeLabel}
        </p>
      </div>

      {/* Cards superiores */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {chartData.map((item, index) => {
          const IconComponent = SHIPPING_METHOD_ICONS[item.metodo] || Package;
          const color = SHIPPING_METHOD_COLORS[item.metodo] || '#94a3b8';

          return (
            <Motion.div
              key={item.metodo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-(--color-border) bg-(--color-neutral2) p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <IconComponent className="h-5 w-5" style={{ color }} />
                </div>
                <span className="text-2xl font-bold" style={{ color }}>
                  {item.porcentaje}%
                </span>
              </div>
              
              <p className="mb-1 text-sm font-semibold text-(--text-strong)">{item.name}</p>
              <p className="text-xs text-(--text-muted)">{item.ordenes} órdenes</p>
              
              <div className="mt-3 pt-3 border-t border-(--color-border)">
                <p className="text-xs text-(--text-muted)">Ingresos totales</p>
                <p className="mt-1 font-bold text-(--text-strong)">
                  <Price priceInCents={item.ingresos} />
                </p>
                {item.ingresosEnvio > 0 && (
                  <p className="mt-1 text-xs text-success">
                    +<Price priceInCents={item.ingresosEnvio} /> por envío
                  </p>
                )}
              </div>
            </Motion.div>
          );
        })}
      </div>

      {/* Gráfico de barras */}
      <div className="rounded-xl border border-(--color-border) bg-(--color-neutral2) p-4">
        <p className="mb-4 text-sm font-semibold text-(--text-strong)">Comparación de órdenes</p>
        <BarChart
          data={chartData}
          bars={[{ 
            dataKey: "ordenes", 
            name: "Órdenes",
            useMultiColors: true
          }]}
          xAxisKey="name"
          height={200}
          layout="horizontal"
          barSize={40}
          colors={Object.values(SHIPPING_METHOD_COLORS)}
        />
      </div>
    </Motion.div>
  );
}

ShippingMethodsChart.propTypes = {
  periodo: PropTypes.number,
  periodLabel: PropTypes.string,
};
