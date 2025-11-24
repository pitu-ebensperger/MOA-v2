import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import { TrendingUp, Package } from 'lucide-react';
import { useTopProducts } from '@/modules/admin/hooks/useDashboardStats';
import { Price } from '@/components/data-display/Price';
import ChartCard from './ChartCard';

/**
 * Lista de top productos más vendidos
 */
export default function TopProductsList({ periodo = 30, limit = 5 }) {
  const { data, isLoading, isError } = useTopProducts(periodo, limit);

  const maxUnidades = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.max(...data.map(p => p.unidades_vendidas));
  }, [data]);

  if (isError) {
    return (
      <ChartCard title="Top Productos Más Vendidos" subtitle="No se pudo cargar los datos">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-error">Error al cargar productos</p>
        </div>
      </ChartCard>
    );
  }

  if (isLoading) {
    return <ChartCard title="Top Productos Más Vendidos" isLoading />;
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard
        title="Top Productos Más Vendidos"
        subtitle={`Últimos ${periodo} días`}
      >
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--text-muted)">No hay ventas en este período</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Top Productos Más Vendidos"
      subtitle={`Últimos ${periodo} días · ${data.length} productos`}
      actions={
        <div className="rounded-full bg-success/10 p-2">
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
      }
    >
      <div className="space-y-3">
        {data.map((producto, index) => {
          const porcentaje = ((producto.unidades_vendidas / maxUnidades) * 100).toFixed(0);

          return (
            <Motion.div
              key={producto.producto_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center gap-4 rounded-xl border border-(--color-border) bg-(--color-neutral2) p-3 transition-all hover:shadow-md hover:border-[--color-primary1]/30"
            >
              {/* Número */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[--color-primary1]/10 font-bold text-[--color-primary1]">
                {index + 1}
              </div>

              {/* Imagen */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-(--color-border)">
                {producto.img_url ? (
                  <img
                    src={producto.img_url}
                    alt={producto.nombre}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-(--color-neutral3)">
                    <Package className="h-8 w-8 text-(--text-muted)" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-(--text-strong) truncate group-hover:text-[--color-primary1] transition-colors">
                  {producto.nombre}
                </h4>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  {producto.categoria && (
                    <span className="rounded-full bg-[--color-primary1]/10 px-2 py-0.5 text-xs font-medium text-[--color-primary1]">
                      {producto.categoria}
                    </span>
                  )}
                  <span className="text-(--text-muted)">
                    {producto.unidades_vendidas} unidades
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--color-neutral3)">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[--color-primary1] to-[--color-primary2]"
                  />
                </div>
              </div>

              {/* Ingresos */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-(--text-strong) text-lg">
                  <Price priceInCents={producto.ingresos_totales} />
                </p>
                <p className="text-xs text-(--text-muted)">
                  <Price priceInCents={producto.precio_promedio} /> prom.
                </p>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </ChartCard>
  );
}

TopProductsList.propTypes = {
  periodo: PropTypes.number,
  limit: PropTypes.number
};
