import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import { CreditCard, Banknote, Smartphone, Wallet, MessageSquareHeart, CircleDollarSign, TrendingUp } from 'lucide-react';
import { PieChart } from '@/components/charts/PieChart.jsx';
import { Price } from '@/components/data-display/Price.jsx';
import { usePaymentMethodStats } from '@/modules/admin/hooks/useDashboardStats.js';

const PAYMENT_METHOD_ICONS = {
  transferencia: Banknote,
  webpay: Smartphone,
  tarjeta_credito: CreditCard,
  tarjeta_debito: Wallet,
  paypal: MessageSquareHeart,
  efectivo: CircleDollarSign
};

const PAYMENT_METHOD_LABELS = {
  transferencia: 'Transferencia',
  webpay: 'Webpay',
  tarjeta_credito: 'T. Crédito',
  tarjeta_debito: 'T. Débito',
  paypal: 'PayPal',
  efectivo: 'Efectivo'
};

const PAYMENT_METHOD_COLORS = {
  transferencia: '#3b82f6', // blue
  webpay: '#8b5cf6',        // purple
  tarjeta_credito: '#ec4899', // pink
  tarjeta_debito: '#14b8a6',  // teal
  paypal: '#10b981',      // green
  efectivo: '#f59e0b'        // amber
};

export default function PaymentMethodsChart({ periodo = 30, periodLabel }) {
  const rangeLabel = periodLabel || `Últimos ${periodo} días`;
  const { data, isLoading, isError } = usePaymentMethodStats(periodo);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      name: PAYMENT_METHOD_LABELS[item.metodo_pago] || item.metodo_pago,
      value: item.ingresos_totales,
      cantidad: item.cantidad_ordenes,
      promedio: item.ticket_promedio,
      porcentaje: item.porcentaje_uso,
      metodo: item.metodo_pago,
      color: PAYMENT_METHOD_COLORS[item.metodo_pago] || '#94a3b8'
    }));
  }, [data]);

  const totalIngresos = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [chartData]);

  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-6">
        <p className="text-sm text-error">Error al cargar estadísticas de métodos de pago</p>
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
        <h3 className="mb-4 text-lg font-semibold text-(--text-strong)">Ingresos por Método de Pago</h3>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-(--text-muted)">No hay datos de métodos de pago en este período</p>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-(--text-strong)">Ingresos por Método de Pago</h3>
          <p className="mt-1 text-sm text-(--text-secondary1)">
            {rangeLabel} · Total: <Price priceInCents={totalIngresos} />
          </p>
        </div>
        <div className="rounded-full bg-success/10 p-2">
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
      </div>

      {/* Gráfico de torta */}
      <div className="mb-6 flex justify-center">
        <PieChart
          data={chartData}
          height={280}
          innerRadius={60}
          outerRadius={100}
          showLegend={false}
          showLabels={false}
          tooltipFormatter={(value) => <Price priceInCents={value} />}
        />
      </div>

      {/* Tabla detallada */}
      <div className="space-y-2">
        {chartData.map((item, index) => {
          const IconComponent = PAYMENT_METHOD_ICONS[item.metodo] || CreditCard;
          
          return (
            <Motion.div
              key={item.metodo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 rounded-xl border border-(--color-border) bg-(--color-neutral2) p-3 transition-all hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <IconComponent className="h-5 w-5" style={{ color: item.color }} />
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-(--text-strong)">{item.name}</p>
                <p className="text-xs text-(--text-muted)">{item.cantidad} órdenes · {item.porcentaje}%</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold" style={{ color: item.color }}>
                  <Price priceInCents={item.value} />
                </p>
                <p className="text-xs text-(--text-muted)">
                  Prom: <Price priceInCents={item.promedio} />
                </p>
              </div>
            </Motion.div>
          );
        })}
      </div>
    </Motion.div>
  );
}

PaymentMethodsChart.propTypes = {
  periodo: PropTypes.number,
  periodLabel: PropTypes.string,
};
