import { useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { PieChart } from '@/components/charts/PieChart.jsx';
import { Package, Truck, CheckCircle } from 'lucide-react';
import { useOrdersByStatus } from '@/modules/admin/hooks/useDashboardStats';
import ChartCard from './ChartCard';

const STATUS_CONFIG = {
  preparacion: {
    label: 'En Preparación',
    color: '#f97316', // orange
    icon: Package
  },
  enviado: {
    label: 'Enviado',
    color: '#3b82f6', // blue
    icon: Truck
  },
  entregado: {
    label: 'Entregado',
    color: '#10b981', // green
    icon: CheckCircle
  }
};

/**
 * Gráfico de distribución de órdenes por estado de envío
 */
export default function OrderStatusDistribution() {
  const { data, isLoading, isError } = useOrdersByStatus();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => {
      const config = STATUS_CONFIG[item.estado_envio] || {
        label: item.estado_envio,
        color: '#94a3b8'
      };

      return {
        name: config.label,
        value: item.cantidad,
        porcentaje: item.porcentaje,
        estado: item.estado_envio,
        color: config.color
      };
    });
  }, [data]);

  const totalOrdenes = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [chartData]);

  if (isError) {
    return (
      <ChartCard title="Estado de Órdenes" subtitle="No se pudo cargar los datos">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-error">Error al cargar estadísticas</p>
        </div>
      </ChartCard>
    );
  }

  if (isLoading) {
    return <ChartCard title="Estado de Órdenes" isLoading />;
  }

  if (chartData.length === 0) {
    return (
      <ChartCard title="Estado de Órdenes" subtitle="Distribución por estado de envío">
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--text-muted)">No hay órdenes registradas</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Estado de Órdenes"
      subtitle={`Total: ${totalOrdenes} órdenes activas`}
    >
      <div className="flex flex-col items-center">
        {/* Gráfico de donut */}
        <div className="mb-6">
          <PieChart
            data={chartData}
            height={240}
            innerRadius={70}
            outerRadius={100}
            showLegend={false}
            showLabels={false}
          />
        </div>

        {/* Leyenda con íconos */}
        <div className="w-full space-y-2">
          {chartData.map((item, index) => {
            const IconComponent = STATUS_CONFIG[item.estado]?.icon || Package;

            return (
              <Motion.div
                key={item.estado}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border border-(--color-border) bg-(--color-neutral2) p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconComponent className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-(--text-strong)">{item.name}</p>
                    <p className="text-sm text-(--text-muted)">{item.value} órdenes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.porcentaje}%
                  </p>
                </div>
              </Motion.div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}
