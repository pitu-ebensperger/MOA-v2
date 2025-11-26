import { useState, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import {
  Activity,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Truck,
  BarChart3,
  Clock,
  Target,
  Tag,
  Box,
  Sofa,
  Armchair,
  Lightbulb,
  Sparkles,
  Home,
} from "lucide-react";

import { useAdminDashboard } from "@/modules/admin/hooks/useAdminDashboard.js";
import { Button } from "@/components/ui/Button.jsx";
import { StatusPill } from "@/components/ui/StatusPill.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs.jsx";
import { BarChart } from "@/components/charts/BarChart.jsx";
import { AreaChart } from "@/components/charts/AreaChart.jsx";
import { PieChart } from "@/components/charts/PieChart.jsx";
import { AnimatedKPICard } from "@/components/charts/AnimatedKPICard.jsx";
import { SparklineChart } from "@/components/charts/SparklineChart.jsx";
import { ProgressRing } from "@/components/charts/ProgressRing.jsx";
import { ComparisonCard } from "@/components/charts/ComparisonCard.jsx";
import { formatCurrencyCLP } from "@/utils/formatters/currency.js";
import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import PaymentMethodsChart from "@/modules/admin/components/PaymentMethodsChart.jsx";
import ShippingMethodsChart from "@/modules/admin/components/ShippingMethodsChart.jsx";
import StatCard from "@/modules/admin/components/dashboard/StatCard.jsx";
import SalesEvolutionChart from "@/modules/admin/components/dashboard/SalesEvolutionChart.jsx";
import TopProductsList from "@/modules/admin/components/dashboard/TopProductsList.jsx";
import OrderStatusDistribution from "@/modules/admin/components/dashboard/OrderStatusDistribution.jsx";
import { useDashboardKPIs } from "@/modules/admin/hooks/useDashboardStats.js";
import { ROUTES } from "@/routes/routes.js";

// Icon mapping outside component to prevent recreation
const CATEGORY_ICON_MAP = {
  muebles: Sofa,
  sillas: Armchair,
  mesas: Box,
  decoracion: Sparkles,
  iluminacion: Lightbulb,
  accesorios: Home,
};

const CATEGORY_COLORS = [
  'var(--color-primary1)',
  'var(--color-secondary1)',
  'var(--color-primary2)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-secondary2)'
];

// Componente de Card envolvente para gráficos
const ChartCard = ({ title, subtitle, children, loading, action, className = "" }) => (
  <Motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`rounded-2xl bg-white p-4 sm:p-6 ${className}`}
  >
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-(--text-strong)">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-(--text-secondary1)">{subtitle}</p>}
      </div>
      {action}
    </div>

    {loading ? (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    ) : (
      children
    )}
  </Motion.div>
);

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.bool,
  action: PropTypes.node,
  className: PropTypes.string,
};

// Componente de KPIs del Overview con nuevos StatCards
const OverviewKPIs = () => {
  const { data: kpis, isLoading } = useDashboardKPIs(30);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Ingresos Totales"
        value={formatCurrencyCLP(kpis?.ingresos?.value || 0)}
        previousValue={kpis?.ingresos?.previousValue}
        icon={DollarSign}
        period="últimos 30 días"
        colorScheme="success"
        isLoading={isLoading}
      />

      <StatCard
        label="Órdenes"
        value={kpis?.ordenes?.value || 0}
        previousValue={kpis?.ordenes?.previousValue}
        icon={ShoppingCart}
        period="últimos 30 días"
        colorScheme="primary"
        isLoading={isLoading}
      />

      <StatCard
        label="Clientes"
        value={kpis?.clientes?.value || 0}
        previousValue={kpis?.clientes?.previousValue}
        icon={Users}
        period="últimos 30 días"
        colorScheme="info"
        isLoading={isLoading}
      />

      <StatCard
        label="Ticket Promedio"
        value={formatCurrencyCLP(kpis?.aov?.value || 0)}
        previousValue={kpis?.aov?.previousValue}
        icon={TrendingUp}
        period="últimos 30 días"
        colorScheme="warning"
        isLoading={isLoading}
      />
    </div>
  );
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [categoryMetric, setCategoryMetric] = useState("revenue"); // 'revenue' | 'orders'
  const { data: dashboardData, isLoading, isError, refetch } = useAdminDashboard();

  const metrics = useMemo(() => dashboardData?.metrics || {}, [dashboardData]);
  const sales = useMemo(() => dashboardData?.sales || {}, [dashboardData]);
  const conversion = useMemo(() => dashboardData?.conversion || {}, [dashboardData]);
  const stock = useMemo(() => dashboardData?.stock || {}, [dashboardData]);
  const topProducts = useMemo(() => dashboardData?.topProducts || [], [dashboardData]);
  const categories = useMemo(() => dashboardData?.categories || [], [dashboardData]);
  // const orderDistribution = useMemo(() => dashboardData?.orderDistribution || [], [dashboardData]);
  const recentOrders = useMemo(() => dashboardData?.recentOrders || [], [dashboardData]);
  const customerRegistrations = useMemo(() => dashboardData?.customerRegistrations || [], [dashboardData]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    return (sales.dailyRevenue || []).map((item) => ({
      date: new Date(item.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" }),
      revenue: item.revenue || 0,
    }));
  }, [sales.dailyRevenue]);

  const categoryRevenueData = useMemo(() => {
    return categories.slice(0, 6).map((cat) => ({
      name: cat.name,
      revenue: cat.revenue || 0,
      orders: cat.orders || 0,
    }));
  }, [categories]);

  // Compute category performance data based on selected metric
  const categoryPerformanceData = useMemo(() => {
    if (categories.length === 0) return { pieData: [], totalSelected: 0 };

    const totalSelected = categories.reduce((sum, c) => {
      const val = categoryMetric === 'revenue' ? (c.revenue || 0) : (c.orders || 0);
      return sum + val;
    }, 0);

    const pieData = categories.slice(0, 6).map((cat, idx) => {
      const rawValue = categoryMetric === 'revenue' ? (cat.revenue || 0) : (cat.orders || 0);
      const percentage = totalSelected > 0 ? ((rawValue / totalSelected) * 100).toFixed(1) : '0.0';
      const key = (cat.name || '').toLowerCase();
      const IconComp = CATEGORY_ICON_MAP[key] || Tag;
      return {
        name: cat.name,
        value: rawValue,
        percentage,
        icon: IconComp,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      };
    });

    return { pieData, totalSelected };
  }, [categories, categoryMetric]);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        className="gap-4"
        actions={
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="inline-flex w-full flex-wrap gap-2 sm:w-auto">
                <TabsTrigger value="overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <Activity className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="products">
                  <Package className="mr-2 h-4 w-4" />
                  Productos
                </TabsTrigger>
                <TabsTrigger value="customers">
                  <Users className="mr-2 h-4 w-4" />
                  Clientes
                </TabsTrigger>
                <TabsTrigger value="operations">
                  <Truck className="mr-2 h-4 w-4" />
                  Operaciones
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              appearance="outline"
              intent="primary"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              leadingIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {/* Error State */}
      {isError && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-error/30 bg-error/[0.06] p-6"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-error" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-error">Error de conexión</h3>
              <p className="mb-4 text-sm text-error/80">No se pudieron cargar algunos datos del panel de control.</p>
              <Button appearance="ghost" intent="error" size="sm" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        </Motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <AnimatePresence mode="wait">
            <Motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <OverviewKPIs />

              {/* Gráfico de Evolución de Ventas */}
              <SalesEvolutionChart periodo={30} />

              {/* Grid de 2 columnas: Top Productos y Estado de Órdenes */}
              <div className="grid gap-4 lg:grid-cols-2">
                <TopProductsList periodo={30} limit={5} />
                <OrderStatusDistribution />
              </div>

              {/* Charts Row 1 */}
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Ingresos diarios" subtitle="Últimos 30 días" loading={isLoading}>
                  <AreaChart
                    data={revenueChartData}
                    areas={[
                      {
                        dataKey: "revenue",
                        name: "Ingresos",
                        fillColor: "var(--color-primary1)",
                        strokeColor: "var(--color-primary1)",
                      },
                    ]}
                    xAxisKey="date"
                    height={240}
                    tooltipFormatter={(value) => formatCurrencyCLP(value)}
                    fillOpacity={0.2}
                  />
                </ChartCard>

                <ChartCard title="Ventas por categoría" subtitle="Distribución de pedidos" loading={isLoading}>
                  {categoryRevenueData.length > 0 ? (
                    <BarChart
                      data={categoryRevenueData}
                      bars={[{ dataKey: "orders", name: "Pedidos", useMultiColors: true }]}
                      xAxisKey="name"
                      height={240}
                      layout="vertical"
                      barSize={40}
                    />
                  ) : (
                    <div className="flex h-60 items-center justify-center">
                      <p className="text-sm text-(--text-muted)">No hay datos de categorías disponibles</p>
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* NEW: Charts Row 2 - Payment & Shipping Methods */}
              <div className="grid gap-4 lg:grid-cols-2">
                <PaymentMethodsChart periodo={30} />
                <ShippingMethodsChart periodo={30} />
              </div>
            </Motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnimatePresence mode="wait">
            <Motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Comparison Cards */}
              <div className="grid gap-4 lg:grid-cols-3">
                <ComparisonCard
                  title="Ingresos"
                  currentValue={metrics.monthlyRevenue || 0}
                  previousValue={metrics.previousMonthRevenue || 0}
                  formatter={formatCurrencyCLP}
                  color="var(--color-success)"
                  delay={0}
                />

                <ComparisonCard
                  title="Pedidos"
                  currentValue={sales.totalTransactions || 0}
                  previousValue={Math.floor((sales.totalTransactions || 0) * 0.85)}
                  color="var(--color-primary1)"
                  delay={0.1}
                />

                <ComparisonCard
                  title="Promedio por pedido"
                  currentValue={sales.averageOrderValue || 0}
                  previousValue={Math.floor((sales.averageOrderValue || 0) * 0.92)}
                  formatter={formatCurrencyCLP}
                  color="var(--color-secondary1)"
                  delay={0.2}
                />
              </div>

              {/* Conversion & Top Performance */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Conversión de usuarios" subtitle="Visitantes vs Compradores" loading={isLoading}>
                  <div className="space-y-6">
                    <div className="rounded-2xl bg-(--color-primary4)/10 p-4 text-center">
                      <p className="text-sm text-(--text-muted)">Tasa de Conversión</p>
                      <p className="mt-2 text-4xl font-bold text-(--color-success)">{conversion.overallRate || 0}%</p>
                    </div>
                    <BarChart
                      data={[
                        { name: "Visitantes", value: conversion.visitorCount || 0 },
                        { name: "Compradores", value: conversion.purchaserCount || 0 },
                      ]}
                      bars={[{ dataKey: "value", name: "Usuarios" }]}
                      xAxisKey="name"
                      height={220}
                      layout="horizontal"
                      colors={["var(--color-primary1)", "var(--color-success)"]}
                    />
                  </div>
                </ChartCard>

                <ChartCard title="Productos destacados" subtitle="Top performance" loading={isLoading}>
                  <div className="space-y-4">
                    {topProducts.slice(0, 2).map((product, index) => (
                      <Motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-2xl border border-(--color-border) bg-white p-4"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-(--text-strong)">{product.name}</h4>
                            <p className="mt-1 text-xs text-(--text-muted)">{product.sales} ventas</p>
                          </div>
                          {index === 0 ? (
                            <div className="rounded-full bg-(--color-success)/10 px-3 py-1">
                              <p className="text-xs font-semibold text-(--color-success)">Más vendido</p>
                            </div>
                          ) : (
                            <div className="rounded-full bg-(--color-primary1)/10 px-3 py-1">
                              <p className="text-xs font-semibold text-(--color-primary1)">{product.conversionRate}% conv.</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <SparklineChart
                            data={[...new Array(7)].map(() => Math.random() * 100 + 50)}
                            width={80}
                            height={40}
                            color="var(--color-primary1)"
                            fillColor="var(--color-primary1)"
                          />
                          <span className="text-xl font-bold text-(--color-primary1)">{formatCurrencyCLP(product.revenue)}</span>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </Motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <AnimatePresence mode="wait">
            <Motion.div
              key="products"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Product Metrics (sin stock bajo / sin stock, combinados más abajo) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <AnimatedKPICard
                  title="Productos totales"
                  value={metrics.totalProducts || 0}
                  icon={Package}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="Stock saludable"
                  value={stock.totalItems - stock.lowStockCount - stock.outOfStockCount || 0}
                  icon={Target}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.1}
                />
              </div>

              {/* Product Performance */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Top Productos por Ingresos" loading={isLoading}>
                  <BarChart
                    data={topProducts.slice(0, 8).map((p) => ({ name: p.name, value: p.revenue }))}
                    bars={[{ dataKey: "value", name: "Ingresos" }]}
                    xAxisKey="name"
                    height={350}
                    layout="horizontal"
                    tooltipFormatter={formatCurrencyCLP}
                    colors={["var(--color-primary1)", "var(--color-secondary1)", "var(--color-primary2)"]}
                  />
                </ChartCard>

                <ChartCard
                  title="Categorías Performance"
                  loading={isLoading}
                  action={(
                    <div className="inline-flex overflow-hidden rounded-md border border-(--color-border)">
                      <Button
                        appearance={categoryMetric === 'revenue' ? 'solid' : 'ghost'}
                        intent="primary"
                        size="xs"
                        className="rounded-none"
                        onClick={() => setCategoryMetric('revenue')}
                      >Ingresos</Button>
                      <Button
                        appearance={categoryMetric === 'orders' ? 'solid' : 'ghost'}
                        intent="primary"
                        size="xs"
                        className="-ml-px rounded-none border-l border-(--color-border)"
                        onClick={() => setCategoryMetric('orders')}
                      >Órdenes</Button>
                    </div>
                  )}
                >
                  {categoryPerformanceData.pieData.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <PieChart
                        data={categoryPerformanceData.pieData}
                        height={300}
                        innerRadius={40}
                        outerRadius={80}
                        showLegend={false}
                        showLabels={false}
                        tooltipFormatter={categoryMetric === 'revenue' ? formatCurrencyCLP : (v) => v?.toLocaleString('es-CL')}
                        legendRenderer={null}
                      />
                      {/* Leyenda debajo del gráfico */}
                      <div className="mt-4 w-full max-w-md space-y-3 px-2 sm:px-4">
                        {categoryPerformanceData.pieData.map((item) => {
                          const formattedValue = categoryMetric === 'revenue'
                            ? formatCurrencyCLP(item.value || 0)
                            : `${item.value.toLocaleString('es-CL')} ord.`;
                          return (
                            <div key={item.name} className="flex items-center justify-between text-base">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" style={{ color: item.color }} />
                                <span className="font-semibold" style={{ color: item.color }}>{item.name}</span>
                              </div>
                              <span className="text-(--text-muted)">{formattedValue} · {item.percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center">
                      <p className="text-sm text-(--text-muted)">No hay datos de categorías</p>
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* Inventario y alertas combinadas */}
              <ChartCard title="Estado de inventario" subtitle="Stock bajo y sin stock" loading={isLoading}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-2xl border border-warning/30 bg-warning/10 p-4"
                      onClick={() => window.location.href = `${ROUTES.admin.products}?low_stock=1`}
                    >
                      <AlertTriangle className="mb-2 h-6 w-6 text-warning" />
                      <p className="text-2xl font-bold text-warning">{stock.lowStockCount || 0}</p>
                      <p className="text-xs text-warning/70">Stock bajo</p>
                    </Motion.div>

                    <Motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl border border-error/30 bg-error/10 p-4 cursor-pointer"
                      onClick={() => window.location.href = `${ROUTES.admin.products}?low_stock=1`}
                    >
                      <AlertTriangle className="mb-2 h-6 w-6 text-error" />
                      <p className="text-2xl font-bold text-error">{stock.outOfStockCount || 0}</p>
                      <p className="text-xs text-error/70">Sin stock</p>
                    </Motion.div>
                  </div>

                  {(stock.lowStockProducts?.length > 0 || stock.outOfStockProducts?.length > 0) && (
                    <div className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4">
                      <h4 className="mb-3 text-sm font-semibold text-(--text-strong)">Productos críticos</h4>
                      <div className="space-y-2">
                        {[...(stock.outOfStockProducts || []).slice(0, 3), ...(stock.lowStockProducts || []).slice(0, 2)].map(
                          (product, index) => (
                            <Motion.div
                              key={product.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="flex items-center justify-between rounded-xl bg-white p-3 cursor-pointer"
                              onClick={() => window.location.href = `${ROUTES.admin.products}?low_stock=1`}
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-(--text-strong)">{product.name}</p>
                                <p className="text-xs text-(--text-muted)">{product.sku}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${product.currentStock === 0 ? "text-error" : "text-warning"}`}>
                                  {product.currentStock} unidades
                                </p>
                              </div>
                            </Motion.div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ChartCard>

              {/* Top Products with Sparklines */}
              <ChartCard title="Productos Destacados" loading={isLoading}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topProducts.slice(0, 6).map((product, index) => (
                    <Motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4 transition-all hover:shadow-(--shadow-md)"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-(--text-strong)">{product.name}</h4>
                          <p className="mt-1 text-xs text-(--text-muted)">{product.sales} ventas</p>
                        </div>
                        <SparklineChart
                          data={[...new Array(7)].map(() => Math.random() * 100 + 50)}
                          width={60}
                          height={30}
                          color="var(--color-primary1)"
                          fillColor="var(--color-primary1)"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-(--color-primary1)">{formatCurrencyCLP(product.revenue)}</span>
                        <span className="text-xs text-(--color-success)">{product.conversionRate}% conv.</span>
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </ChartCard>
            </Motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <AnimatePresence mode="wait">
            <Motion.div
              key="customers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Customer Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Total Clientes"
                  value={metrics.totalCustomers || 0}
                  icon={Users}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="Compradores activos"
                  value={conversion.purchaserCount || 0}
                  icon={ShoppingCart}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Tasa conversión"
                  value={conversion.overallRate || 0}
                  suffix="%"
                  icon={TrendingUp}
                  color="var(--color-secondary1)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Promedio por pedido"
                  value={sales.averageOrderValue || 0}
                  prefix="$"
                  icon={DollarSign}
                  color="var(--color-primary2)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* New Registrations Chart */}
              <ChartCard title="Nuevos registros" subtitle="Últimos 30 días" loading={isLoading}>
                <AreaChart
                  data={customerRegistrations.map(item => ({
                    name: new Date(item.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
                    registros: item.registrations,
                  }))}
                  areas={[{ 
                    dataKey: 'registros', 
                    name: 'Registros', 
                    strokeColor: 'var(--color-primary1)',
                    fillColor: 'var(--color-primary1)'
                  }]}
                  xAxisKey="name"
                  height={260}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  curve="monotone"
                />
              </ChartCard>

              {/* Customer Insights */}
              <div className="grid gap-6 lg:grid-cols-3">
                <ChartCard title="Segmentación de Clientes" loading={isLoading}>
                  <div className="flex flex-col items-center justify-center py-6">
                    <ProgressRing
                      progress={((conversion.purchaserCount || 0) / (metrics.totalCustomers || 1)) * 100}
                      size={180}
                      strokeWidth={14}
                      color="var(--color-primary1)"
                      label="Compradores"
                    />
                    <div className="mt-6 grid w-full grid-cols-2 gap-3">
                      <div className="rounded-xl bg-(--color-primary4)/20 p-3 text-center">
                        <p className="text-xs text-(--text-muted)">Activos</p>
                        <p className="mt-1 text-lg font-bold text-(--color-primary1)">{conversion.purchaserCount || 0}</p>
                      </div>
                      <div className="rounded-xl bg-(--color-neutral3) p-3 text-center">
                        <p className="text-xs text-(--text-muted)">Inactivos</p>
                        <p className="mt-1 text-lg font-bold text-(--text-secondary1)">
                          {(metrics.totalCustomers || 0) - (conversion.purchaserCount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </ChartCard>

                <ChartCard title="Preferencias de Categorías" loading={isLoading} className="lg:col-span-2">
                  <BarChart
                    data={categories.slice(0, 5).map((cat) => ({
                      name: cat.name,
                      ordenes: cat.orders,
                      ingresos: cat.revenue / 1000,
                    }))}
                    bars={[
                      { dataKey: "ordenes", name: "Órdenes", color: "var(--color-primary1)" },
                      { dataKey: "ingresos", name: "Ingresos (miles)", color: "var(--color-success)" },
                    ]}
                    xAxisKey="name"
                    height={300}
                    layout="horizontal"
                    showLegend
                  />
                </ChartCard>
              </div>
            </Motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <AnimatePresence mode="wait">
            <Motion.div
              key="operations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Operations Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AnimatedKPICard
                  title="Órdenes totales"
                  value={metrics.totalOrders || 0}
                  icon={Package}
                  color="var(--color-primary1)"
                  loading={isLoading}
                />

                <AnimatedKPICard
                  title="En proceso"
                  value={metrics.orderStatusCounts?.processing || 0}
                  icon={Clock}
                  color="var(--color-warning)"
                  loading={isLoading}
                  delay={0.1}
                />

                <AnimatedKPICard
                  title="Enviados"
                  value={metrics.orderStatusCounts?.shipped || 0}
                  icon={Truck}
                  color="var(--color-secondary1)"
                  loading={isLoading}
                  delay={0.2}
                />

                <AnimatedKPICard
                  title="Completados"
                  value={metrics.orderStatusCounts?.delivered || 0}
                  icon={Target}
                  color="var(--color-success)"
                  loading={isLoading}
                  delay={0.3}
                />
              </div>

              {/* Order Status Distribution */}
              <ChartCard title="Estado de pedidos" subtitle="Distribución por estado" loading={isLoading}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Pendientes */}
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-(--text-muted)">Pendientes</span>
                      <span className="text-xs text-(--text-muted)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.pending || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-(--text-strong)">{metrics.orderStatusCounts?.pending || 0}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.pending || 0) / metrics.totalOrders) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-(--color-warning)"
                      />
                    </div>
                  </Motion.div>

                  {/* En proceso */}
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-(--text-muted)">En proceso</span>
                      <span className="text-xs text-(--text-muted)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.processing || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-(--text-strong)">{metrics.orderStatusCounts?.processing || 0}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.processing || 0) / metrics.totalOrders) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full rounded-full bg-(--color-primary1)"
                      />
                    </div>
                  </Motion.div>

                  {/* Enviados */}
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-(--text-muted)">Enviados</span>
                      <span className="text-xs text-(--text-muted)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.shipped || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-(--text-strong)">{metrics.orderStatusCounts?.shipped || 0}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.shipped || 0) / metrics.totalOrders) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-(--color-secondary1)"
                      />
                    </div>
                  </Motion.div>

                  {/* Completados */}
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-(--text-muted)">Completados</span>
                      <span className="text-xs text-(--text-muted)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.delivered || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-(--text-strong)">{metrics.orderStatusCounts?.delivered || 0}</p>
                    <div className="h-2 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.delivered || 0) / metrics.totalOrders) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full rounded-full bg-(--color-success)"
                      />
                    </div>
                  </Motion.div>
                </div>
              </ChartCard>

              {/* Recent Orders */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Últimos pedidos" subtitle="Actividad reciente" loading={isLoading}>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order, index) => (
                        <Motion.div
                          key={order.id || order.orden_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary4">
                            <Truck className="h-5 w-5 text-primary1" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-(--text-strong)">
                              Pedido #{order.orderCode || order.order_code || order.number || order.id}
                            </p>
                            <p className="text-sm text-(--text-muted)">
                              {formatDate_ddMMyyyy(order.createdAt || order.creado_en, "—")} · {formatCurrencyCLP(order.total || 0)}
                            </p>
                          </div>
                          <StatusPill status={order.estado_pago || order.status || "pending"} domain="order" />
                        </Motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center">
                      <p className="text-(--text-muted)">No hay pedidos recientes</p>
                    </div>
                  )}
                </ChartCard>
              </div>

              {/* Operational Performance Metrics */}
              <ChartCard title="Rendimiento operacional" subtitle="Métricas clave de eficiencia" loading={isLoading}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Package className="h-5 w-5 text-(--color-primary1)" />
                      <span className="text-xs font-semibold text-(--color-success)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.delivered || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-(--text-strong)">
                      {metrics.orderStatusCounts?.delivered || 0}
                    </p>
                    <p className="mt-1 text-xs text-(--text-muted)">Entregas completadas</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <div 
                        className="h-full rounded-full bg-(--color-success)" 
                        style={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.delivered || 0) / metrics.totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </Motion.div>

                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Truck className="h-5 w-5 text-(--color-secondary1)" />
                      <span className="text-xs font-semibold text-(--color-secondary1)">
                        {metrics.totalOrders > 0 ? Math.round(((metrics.orderStatusCounts?.shipped || 0) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-(--text-strong)">
                      {metrics.orderStatusCounts?.shipped || 0}
                    </p>
                    <p className="mt-1 text-xs text-(--text-muted)">En tránsito</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <div 
                        className="h-full rounded-full bg-(--color-secondary1)" 
                        style={{ width: `${metrics.totalOrders > 0 ? ((metrics.orderStatusCounts?.shipped || 0) / metrics.totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </Motion.div>

                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Clock className="h-5 w-5 text-(--color-warning)" />
                      <span className="text-xs font-semibold text-(--color-warning)">
                        {metrics.totalOrders > 0 ? Math.round((((metrics.orderStatusCounts?.pending || 0) + (metrics.orderStatusCounts?.processing || 0)) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-(--text-strong)">
                      {(metrics.orderStatusCounts?.pending || 0) + (metrics.orderStatusCounts?.processing || 0)}
                    </p>
                    <p className="mt-1 text-xs text-(--text-muted)">Pendientes de procesar</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <div 
                        className="h-full rounded-full bg-(--color-warning)" 
                        style={{ width: `${metrics.totalOrders > 0 ? (((metrics.orderStatusCounts?.pending || 0) + (metrics.orderStatusCounts?.processing || 0)) / metrics.totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </Motion.div>

                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-(--color-border) bg-(--color-neutral2) p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <TrendingUp className="h-5 w-5 text-(--color-primary1)" />
                      <span className="text-xs font-semibold text-(--color-primary1)">
                        {metrics.totalOrders > 0 ? Math.round((((metrics.orderStatusCounts?.delivered || 0) + (metrics.orderStatusCounts?.shipped || 0)) / metrics.totalOrders) * 100) : 0}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-(--text-strong)">
                      {sales.averageOrderValue > 0 ? formatCurrencyCLP(sales.averageOrderValue) : "$0"}
                    </p>
                    <p className="mt-1 text-xs text-(--text-muted)">Valor promedio orden</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-(--color-neutral3)">
                      <div 
                        className="h-full rounded-full bg-(--color-primary1)" 
                        style={{ width: `${metrics.totalOrders > 0 ? (((metrics.orderStatusCounts?.delivered || 0) + (metrics.orderStatusCounts?.shipped || 0)) / metrics.totalOrders) * 100 : 0}%` }}
                      />
                    </div>
                  </Motion.div>
                </div>
              </ChartCard>
            </Motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </section>
  );
}
