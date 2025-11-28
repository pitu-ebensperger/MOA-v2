import { useMemo } from "react";
import { useQueries } from "@config/react-query";
import { analyticsApi } from "@/services/analytics.api.js";
import { ordersApi } from "@/services/orders.api.js";

const DASHBOARD_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useAdminDashboard() {
  // Fetch multiple data sources in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: ["admin-dashboard-metrics"],
        queryFn: analyticsApi.getDashboardMetrics,
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-sales-analytics"],
        queryFn: () => analyticsApi.getSalesAnalytics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-conversion-metrics"],
        queryFn: () => analyticsApi.getConversionMetrics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-top-products"],
        queryFn: () => analyticsApi.getTopProducts({ limit: 5, period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-category-analytics"],
        queryFn: () => analyticsApi.getCategoryAnalytics({ period: "month" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-stock-analytics"],
        queryFn: analyticsApi.getStockAnalytics,
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-order-distribution"],
        queryFn: () => analyticsApi.getOrderDistribution({ period: "week" }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-customer-registrations"],
        queryFn: () => analyticsApi.getCustomerRegistrations({ days: 30 }),
        staleTime: DASHBOARD_STALE_TIME,
      },
      {
        queryKey: ["admin-recent-orders"],
        queryFn: () => ordersApi.list({ limit: 4, page: 1 }),
        staleTime: DASHBOARD_STALE_TIME * 0.5, // More frequent updates for recent orders
      },
    ],
  });

  const [
    dashboardMetricsQuery,
    salesAnalyticsQuery,
    conversionMetricsQuery,
    topProductsQuery,
    categoryAnalyticsQuery,
    stockAnalyticsQuery,
    orderDistributionQuery,
    customerRegistrationsQuery,
    recentOrdersQuery,
  ] = queries;

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.error);
  const errors = queries.map(query => query.error).filter(Boolean);

  // Process and normalize the data
  const dashboardData = useMemo(() => {
    if (isLoading) return null;

    const unwrap = (payload, fallback) => {
      if (!payload) return fallback;
      if (Array.isArray(payload)) return payload;
      if (typeof payload === "object" && payload !== null && Object.prototype.hasOwnProperty.call(payload, "data")) {
        return payload.data ?? fallback;
      }
      return payload;
    };

    const metrics = unwrap(dashboardMetricsQuery.data, {});
    const salesData = unwrap(salesAnalyticsQuery.data, {});
    const conversionData = unwrap(conversionMetricsQuery.data, {});
    const topProducts = unwrap(topProductsQuery.data, []);
    const categoryData = unwrap(categoryAnalyticsQuery.data, []);
    const stockData = unwrap(stockAnalyticsQuery.data, {});
    const orderDistribution = unwrap(orderDistributionQuery.data, []);
    const customerRegistrations = unwrap(customerRegistrationsQuery.data, []);
    const recentOrders = recentOrdersQuery.data?.items || [];

    const previousAverageOrderValue =
      (salesData.previousMonth?.orders || 0) > 0
        ? Math.round((salesData.previousMonth?.revenue || 0) / (salesData.previousMonth?.orders || 1))
        : 0;

    return {
      // Overview metrics
      metrics: {
        totalProducts: metrics.totalProducts || 0,
        totalOrders: metrics.totalOrders || 0,
        totalRevenue: metrics.totalRevenue || 0,
        totalCustomers: metrics.totalCustomers || 0,
        monthlyRevenue: salesData.currentMonth?.revenue || 0,
        previousMonthRevenue: salesData.previousMonth?.revenue || 0,
        previousMonthOrders: salesData.previousMonth?.orders || 0,
        previousMonthCustomers: salesData.previousMonth?.customers || 0,
        growthPercentage: salesData.growthPercentage || 0,
        // Added order status counts inside metrics for unified access in UI
        orderStatusCounts: metrics.orderStatusCounts || {},
      },

      // Stock analytics
      stock: {
        lowStockCount: stockData.lowStockCount || 0,
        outOfStockCount: stockData.outOfStockCount || 0,
        totalItems: stockData.totalItems || 0,
        lowStockProducts: stockData.lowStockProducts || [],
        outOfStockProducts: stockData.outOfStockProducts || [],
      },

      // Sales and conversion
      sales: {
        dailyRevenue: salesData.dailyRevenue || [],
        weeklyRevenue: salesData.weeklyRevenue || [],
        monthlyRevenue: salesData.monthlyRevenue || [],
        averageOrderValue: salesData.averageOrderValue || 0,
        previousAverageOrderValue,
        totalTransactions: salesData.totalTransactions || 0,
        currentMonth: salesData.currentMonth || {},
        previousMonth: salesData.previousMonth || {},
      },

      conversion: {
        overallRate: conversionData.overallRate || 0,
        categoryRates: conversionData.categoryRates || [],
        monthlyTrend: conversionData.monthlyTrend || [],
        visitorCount: conversionData.visitorCount || 0,
        purchaserCount: conversionData.purchaserCount || 0,
      },

      // Top performing products
      topProducts: topProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        sales: product.salesCount || 0,
        views: product.viewCount || 0,
        revenue: product.totalRevenue || 0,
        conversionRate: product.conversionRate || 0,
        image: product.images?.[0]?.url || product.imageUrl,
        price: product.price || 0,
      })),

      // Category performance
      categories: categoryData.map(category => ({
        id: category.id,
        name: category.name,
        sales: category.sales || 0,
        revenue: category.revenue || 0,
        orders: category.orders || 0,
        conversionRate: category.conversionRate || 0,
      })),

      // Order distribution
      orderDistribution: orderDistribution.map(item => ({
        period: item.period,
        orders: item.orderCount || 0,
        percentage: item.percentage || 0,
        revenue: item.revenue || 0,
      })),

      // Recent orders
      recentOrders: recentOrders.slice(0, 4),

      // Order status distribution
      orderStatusCounts: metrics.orderStatusCounts || {},

      // Customer registrations (last 30 days)
      customerRegistrations: customerRegistrations.map(item => ({
        date: item.date,
        registrations: item.registrations || 0,
      })),
    };
  }, [
    isLoading,
    dashboardMetricsQuery.data,
    salesAnalyticsQuery.data,
    conversionMetricsQuery.data,
    topProductsQuery.data,
    categoryAnalyticsQuery.data,
    stockAnalyticsQuery.data,
    orderDistributionQuery.data,
    recentOrdersQuery.data,
    customerRegistrationsQuery.data,
  ]);

  // Refetch all data
  const refetchAll = () => {
    for (const query of queries) {
      query.refetch();
    }
  };

  return {
    data: dashboardData,
    isLoading,
    isError,
    errors,
    refetch: refetchAll,
  };
}
