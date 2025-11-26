import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useSalesEvolution } from '@/modules/admin/hooks/useDashboardStats';
import { Price } from '@/components/data-display/Price';
import ChartCard from './ChartCard';

const PERIOD_PRESETS = [7, 30, 90, 180, 365];

const formatPeriodLabel = (days) => {
  if (days >= 365) {
    const years = days / 365;
    if (Number.isInteger(years)) {
      return years === 1 ? 'Últimos 12 meses' : `Últimos ${years} años`;
    }
    const months = Math.round(days / 30);
    return `Últimos ${months} meses`;
  }
  if (days >= 30) {
    const months = Math.round(days / 30);
    return `Últimos ${months} meses`;
  }
  return `Últimos ${days} días`;
};

const formatButtonLabel = (days) => {
  if (days >= 365) {
    const years = days / 365;
    return Number.isInteger(years) ? `${years}a` : `${Math.round(days / 30)}m`;
  }
  if (days >= 30) {
    return `${Math.round(days / 30)}m`;
  }
  return `${days}d`;
};

/**
 * Gráfico de evolución de ventas (línea + área)
 */
export default function SalesEvolutionChart({ periodo = 30 }) {
  const [activePeriod, setActivePeriod] = useState(periodo);
  const { data, isLoading, isError } = useSalesEvolution(activePeriod);
  const periodOptions = useMemo(() => {
    const options = new Set(PERIOD_PRESETS);
    options.add(periodo);
    return Array.from(options).sort((a, b) => a - b);
  }, [periodo]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      fecha: format(new Date(item.fecha), 'd MMM', { locale: es }),
      fechaCompleta: format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es }),
      ingresos: item.ingresos,
      ordenes: item.num_ordenes
    }));
  }, [data]);

  const totalIngresos = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.ingresos || 0), 0);
  }, [chartData]);

  const totalOrdenes = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.ordenes || 0), 0);
  }, [chartData]);

  // Filtros de período
  const periodFilters = (
    <div className="flex gap-2">
      {periodOptions.map(days => (
        <button
          key={days}
          onClick={() => setActivePeriod(days)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            activePeriod === days
              ? 'bg-[--color-primary1] text-white shadow-md'
              : 'bg-(--color-neutral2) text-(--text-secondary1) hover:bg-(--color-neutral3)'
          }`}
        >
          {formatButtonLabel(days)}
        </button>
      ))}
    </div>
  );

  if (isError) {
    return (
      <ChartCard
        title="Evolución de Ventas"
        subtitle="No se pudo cargar los datos"
        filters={periodFilters}
      >
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-error">Error al cargar estadísticas</p>
        </div>
      </ChartCard>
    );
  }

  if (isLoading) {
    return <ChartCard title="Evolución de Ventas" isLoading />;
  }

  if (chartData.length === 0) {
    return (
      <ChartCard
        title="Evolución de Ventas"
        subtitle={formatPeriodLabel(activePeriod)}
        filters={periodFilters}
      >
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--text-muted)">No hay datos en este período</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Evolución de Ventas"
      subtitle={
        <div className="flex items-center gap-4">
          <span>{formatPeriodLabel(activePeriod)}</span>
          <span className="text-(--text-strong) font-semibold">
            Total: <Price priceInCents={totalIngresos} />
          </span>
          <span className="text-(--text-secondary1)">
            {totalOrdenes} órdenes
          </span>
        </div>
      }
      filters={periodFilters}
      actions={
        <div className="rounded-full bg-success/10 p-2">
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
      }
    >
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#78350f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#78350f" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrdenes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="fecha"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#78350f"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 100000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#059669"
              style={{ fontSize: '12px' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'Ingresos') {
                  return [<Price key="ingresos" priceInCents={value} />, name];
                }
                return [value, name];
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.fecha === label);
                return item ? item.fechaCompleta : label;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-sm font-medium">{value}</span>}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="ingresos"
              name="Ingresos"
              fill="url(#colorIngresos)"
              stroke="#78350f"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ordenes"
              name="Órdenes"
              stroke="#059669"
              strokeWidth={3}
              dot={{ fill: '#059669', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Motion.div>
    </ChartCard>
  );
}

SalesEvolutionChart.propTypes = {
  periodo: PropTypes.number
};
