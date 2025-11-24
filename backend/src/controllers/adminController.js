import pool from "../../database/config.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/error.utils.js";
import { createAdminCustomerModel, updateAdminCustomerModel } from "../models/usersModel.js";
import configModel from "../models/configModel.js";

const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const toClp = (value) => Math.round(safeNumber(value) / 100);

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const ORDER_STATUS_KEYS = [
  "pendiente",
  "confirmado",
  "procesando",
  "enviado",
  "entregado",
  "cancelado",
];

const determineOrderStatus = (estadoPago, estadoEnvio) => {
  const payment = String(estadoPago || "").toLowerCase();
  const shipping = String(estadoEnvio || "").toLowerCase();

  if (payment === "cancelado" || shipping === "cancelado") return "cancelado";
  if (shipping === "entregado") return "entregado";
  if (shipping === "enviado") return "enviado";
  if (payment === "pendiente") return "pendiente";
  if (payment === "pagado") {
    if (shipping === "" || shipping === "preparacion") {
      return "confirmado";
    }
    return "enviado";
  }
  if (shipping === "preparacion" || payment === "procesando") {
    return "procesando";
  }
  return "procesando";
};

const buildStatusCounts = (rows) => {
  const counts = ORDER_STATUS_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

  rows.forEach((row) => {
    const key = determineOrderStatus(row.estado_pago, row.estado_envio);
    counts[key] += safeNumber(row.count);
  });

  return counts;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CL", { month: "short" });

const formatMonthLabel = (value) => {
  if (!value) return "";
  const label = MONTH_FORMATTER.format(new Date(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getWeekNumber = (value) => {
  const date = new Date(value);
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNr);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
};

const getWeekStart = (value) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildDailyRevenueSeries = (rows, startDate, endDate) => {
  const map = new Map();
  rows.forEach((row) => {
    const dateKey = new Date(row.period).toISOString().split("T")[0];
    map.set(dateKey, toClp(row.revenue));
  });

  const series = [];
  const cursor = new Date(startDate);
  while (cursor < endDate) {
    const key = cursor.toISOString().split("T")[0];
    series.push({
      date: key,
      revenue: map.get(key) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
};

const buildWeeklyRevenueSeries = (rows, weeksToShow = 4) => {
  const map = new Map();
  rows.forEach((row) => {
    const start = getWeekStart(row.period);
    map.set(start.toISOString(), toClp(row.revenue));
  });

  const reference = getWeekStart(new Date());
  const series = [];
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const date = new Date(reference);
    date.setDate(reference.getDate() - i * 7);
    const key = date.toISOString();
    series.push({
      week: `W${getWeekNumber(date)}`,
      revenue: map.get(key) ?? 0,
    });
  }
  return series;
};

const buildMonthlyRevenueSeries = (rows, monthsToShow = 6) => {
  const map = new Map();
  rows.forEach((row) => {
    const date = new Date(row.period);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    map.set(key, toClp(row.revenue));
  });

  const reference = new Date();
  reference.setDate(1);
  reference.setHours(0, 0, 0, 0);

  const series = [];
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    series.push({
      month: formatMonthLabel(date),
      revenue: map.get(key) ?? 0,
    });
  }
  return series;
};

const buildMonthlyTrend = (rows, visitorCount, monthsToShow = 3) => {
  if (!rows.length) return [];
  const sliceStart = Math.max(0, rows.length - monthsToShow);
  return rows.slice(sliceStart).map((row) => {
    const buyers = safeNumber(row.unique_buyers);
    const rate = visitorCount ? (buyers / visitorCount) * 100 : 0;
    return {
      month: formatMonthLabel(row.period),
      rate: Number(rate.toFixed(1)),
    };
  });
};

const buildOrderDistribution = (rows) => {
  const map = new Map();
  let total = 0;
  rows.forEach((row) => {
    const dow = Number(row.dow);
    const count = Number(row.order_count);
    total += count;
    map.set(dow, {
      orderCount: count,
      revenue: toClp(row.revenue),
    });
  });

  return DAY_NAMES.map((label, index) => {
    const data = map.get(index) ?? { orderCount: 0, revenue: 0 };
    const percentage = total ? (data.orderCount / total) * 100 : 0;
    return {
      period: label,
      orderCount: data.orderCount,
      revenue: data.revenue,
      percentage: Number(percentage.toFixed(1)),
    };
  });
};


export class AdminController {
  static async getDashboardMetrics(req, res, next) {
    try {
      const [
        productsResult,
        ordersResult,
        revenueResult,
        customersResult,
        statusResult,
      ] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS total_products FROM productos WHERE status = 'activo'"),
        pool.query("SELECT COUNT(*)::int AS total_orders FROM ordenes"),
        pool.query("SELECT COALESCE(SUM(total_cents), 0)::bigint AS total_revenue FROM ordenes"),
        pool.query("SELECT COUNT(*)::int AS total_customers FROM usuarios WHERE rol_code != 'ADMIN'"),
        pool.query("SELECT estado_pago, estado_envio, COUNT(*)::int AS count FROM ordenes GROUP BY estado_pago, estado_envio"),
      ]);

      const metrics = {
        totalProducts: productsResult.rows[0]?.total_products ?? 0,
        totalOrders: ordersResult.rows[0]?.total_orders ?? 0,
        totalRevenue: toClp(revenueResult.rows[0]?.total_revenue ?? 0),
        totalCustomers: customersResult.rows[0]?.total_customers ?? 0,
        orderStatusCounts: buildStatusCounts(statusResult.rows),
      };

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesAnalytics(req, res, next) {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const weekWindowStart = new Date(now);
      weekWindowStart.setDate(now.getDate() - 28);
      weekWindowStart.setHours(0, 0, 0, 0);
      const monthlyWindowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const statsQuery = `
        SELECT
          COUNT(*)::int AS orders,
          COUNT(DISTINCT usuario_id)::int AS customers,
          COALESCE(SUM(total_cents), 0)::bigint AS revenue
        FROM ordenes
        WHERE creado_en >= $1 AND creado_en < $2
      `;

      const [
        currentStats,
        previousStats,
        dailyRows,
        weeklyRows,
        monthlyRows,
      ] = await Promise.all([
        pool.query(statsQuery, [currentMonthStart.toISOString(), nextMonthStart.toISOString()]),
        pool.query(statsQuery, [previousMonthStart.toISOString(), currentMonthStart.toISOString()]),
        pool.query(
          `
            SELECT DATE_TRUNC('day', creado_en) AS period,
                   COALESCE(SUM(total_cents), 0)::bigint AS revenue
            FROM ordenes
            WHERE creado_en >= $1 AND creado_en < $2
            GROUP BY 1
            ORDER BY 1 ASC
          `,
          [currentMonthStart.toISOString(), nextMonthStart.toISOString()]
        ),
        pool.query(
          `
            SELECT DATE_TRUNC('week', creado_en) AS period,
                   COALESCE(SUM(total_cents), 0)::bigint AS revenue
            FROM ordenes
            WHERE creado_en >= $1
            GROUP BY 1
            ORDER BY 1 ASC
          `,
          [weekWindowStart.toISOString()]
        ),
        pool.query(
          `
            SELECT DATE_TRUNC('month', creado_en) AS period,
                   COALESCE(SUM(total_cents), 0)::bigint AS revenue
            FROM ordenes
            WHERE creado_en >= $1
            GROUP BY 1
            ORDER BY 1 ASC
          `,
          [monthlyWindowStart.toISOString()]
        ),
      ]);

      const current = currentStats.rows[0] ?? { orders: 0, customers: 0, revenue: 0 };
      const previous = previousStats.rows[0] ?? { orders: 0, customers: 0, revenue: 0 };
      const currentRevenueClp = toClp(current.revenue);
      const previousRevenueClp = toClp(previous.revenue);
      const growthPercentage = previousRevenueClp
        ? Number((((currentRevenueClp - previousRevenueClp) / previousRevenueClp) * 100).toFixed(1))
        : 0;

      const dailyRevenue = buildDailyRevenueSeries(dailyRows.rows, currentMonthStart, nextMonthStart);
      const weeklyRevenue = buildWeeklyRevenueSeries(weeklyRows.rows, 4);
      const monthlyRevenue = buildMonthlyRevenueSeries(monthlyRows.rows, 6);

      const salesData = {
        currentMonth: {
          revenue: currentRevenueClp,
          orders: current.orders,
          customers: current.customers,
        },
        previousMonth: {
          revenue: previousRevenueClp,
          orders: previous.orders,
          customers: previous.customers,
        },
        growthPercentage,
        averageOrderValue:
          current.orders > 0 ? Math.round(currentRevenueClp / current.orders) : 0,
        totalTransactions: current.orders,
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
      };

      res.json({
        success: true,
        data: salesData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConversionMetrics(req, res, next) {
    try {
      const now = new Date();
      const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [
        visitorResult,
        purchaserResult,
        ordersResult,
        categoriesResult,
        trendResult,
      ] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS visitor_count FROM usuarios WHERE rol_code != 'ADMIN'"),
        pool.query("SELECT COUNT(DISTINCT usuario_id)::int AS purchaser_count FROM ordenes"),
        pool.query("SELECT COUNT(*)::int AS total_orders FROM ordenes"),
        pool.query(
          `
            SELECT
              c.categoria_id AS id,
              c.nombre AS name,
              COUNT(DISTINCT o.orden_id)::int AS orders,
              COALESCE(SUM(oi.cantidad), 0)::int AS sales,
              COALESCE(SUM(oi.cantidad * oi.precio_unit), 0)::bigint AS revenue
            FROM orden_items oi
            JOIN ordenes o ON oi.orden_id = o.orden_id
            JOIN productos p ON oi.producto_id = p.producto_id
            LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
            WHERE p.status = 'activo' AND c.categoria_id IS NOT NULL
            GROUP BY c.categoria_id, c.nombre
            ORDER BY revenue DESC
            LIMIT 5
          `
        ),
        pool.query(
          `
            SELECT
              DATE_TRUNC('month', creado_en) AS period,
              COUNT(DISTINCT usuario_id)::int AS unique_buyers
            FROM ordenes
            WHERE creado_en >= $1
            GROUP BY 1
            ORDER BY 1 ASC
          `,
          [trendStart.toISOString()]
        ),
      ]);

      const visitorCount = visitorResult.rows[0]?.visitor_count ?? 0;
      const purchaserCount = purchaserResult.rows[0]?.purchaser_count ?? 0;
      const totalOrders = ordersResult.rows[0]?.total_orders ?? 0;

      const categoryRates = categoriesResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sales: Number(row.sales),
        revenue: toClp(row.revenue),
        orders: Number(row.orders),
        conversionRate: totalOrders
          ? Number(((row.orders / totalOrders) * 100).toFixed(1))
          : 0,
      }));

      const conversionData = {
        overallRate: visitorCount
          ? Number(((purchaserCount / visitorCount) * 100).toFixed(1))
          : 0,
        visitorCount,
        purchaserCount,
        categoryRates,
        monthlyTrend: buildMonthlyTrend(trendResult.rows, visitorCount, 3),
      };

      res.json({
        success: true,
        data: conversionData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTopProducts(req, res, next) {
    try {
      const limitValue = parsePositiveInt(req.query.limit ?? 10, 10);

      const result = await pool.query(
        `
          SELECT
            p.producto_id AS id,
            p.nombre AS name,
            p.sku,
            p.img_url AS image_url,
            p.precio_cents AS price_cents,
            COALESCE(SUM(oi.cantidad), 0)::int AS sales_count,
            COALESCE(SUM(oi.cantidad * oi.precio_unit), 0)::bigint AS revenue
          FROM orden_items oi
          JOIN productos p ON oi.producto_id = p.producto_id
          JOIN ordenes o ON oi.orden_id = o.orden_id
          WHERE p.status = 'activo'
          GROUP BY p.producto_id, p.nombre, p.sku, p.img_url, p.precio_cents
          ORDER BY revenue DESC
          LIMIT $1
        `,
        [limitValue]
      );

      const topProducts = result.rows.map((row) => {
        const salesCount = Number(row.sales_count);
        const viewCount = Math.max(100, salesCount * 25);
        const conversionRate = viewCount
          ? Number(((salesCount / viewCount) * 100).toFixed(1))
          : 0;

        return {
          id: row.id,
          name: row.name,
          sku: row.sku,
          salesCount,
          viewCount,
          totalRevenue: toClp(row.revenue),
          conversionRate,
          price: Math.round((Number(row.price_cents) || 0) / 100),
          imageUrl: row.image_url,
          images: row.image_url ? [{ url: row.image_url }] : [],
        };
      });

      res.json({
        success: true,
        data: topProducts,
      });
    } catch (error) {
      next(error);
    }
  }


  static async getCategoryAnalytics(req, res, next) {
    try {
      const limitValue = parsePositiveInt(req.query.limit ?? 6, 6);

      const [ordersResult, categoriesResult] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS total_orders FROM ordenes"),
        pool.query(
          `
            SELECT
              c.categoria_id AS id,
              c.nombre AS name,
              COUNT(DISTINCT o.orden_id)::int AS orders,
              COALESCE(SUM(oi.cantidad), 0)::int AS sales,
              COALESCE(SUM(oi.cantidad * oi.precio_unit), 0)::bigint AS revenue
            FROM orden_items oi
            JOIN ordenes o ON oi.orden_id = o.orden_id
            JOIN productos p ON oi.producto_id = p.producto_id
            JOIN categorias c ON p.categoria_id = c.categoria_id
            WHERE p.status = 'activo'
            GROUP BY c.categoria_id, c.nombre
            ORDER BY revenue DESC
            LIMIT $1
          `,
          [limitValue]
        ),
      ]);

      const totalOrders = ordersResult.rows[0]?.total_orders ?? 0;

      const categoryData = categoriesResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        sales: Number(row.sales),
        revenue: toClp(row.revenue),
        orders: Number(row.orders),
        conversionRate: totalOrders
          ? Number(((row.orders / totalOrders) * 100).toFixed(1))
          : 0,
      }));

      res.json({
        success: true,
        data: categoryData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStockAnalytics(req, res, next) {
    try {
      const threshold = parsePositiveInt(req.query.threshold ?? 5, 5);
      const limitValue = parsePositiveInt(req.query.limit ?? 5, 5);

      const [countsResult, lowStockResult, outOfStockResult] = await Promise.all([
        pool.query(
          `
            SELECT
              COUNT(*) FILTER (WHERE stock <= $1 AND status = 'activo')::int AS low_stock_count,
              COUNT(*) FILTER (WHERE stock = 0 AND status = 'activo')::int AS out_of_stock_count,
              COUNT(*) FILTER (WHERE status = 'activo')::int AS total_items
            FROM productos
          `,
          [threshold]
        ),
        pool.query(
          `
            SELECT 
              p.producto_id AS id,
              p.nombre,
              p.sku,
              p.stock,
              stats.last_sale
            FROM productos p
            LEFT JOIN (
              SELECT oi.producto_id, MAX(o.creado_en) AS last_sale
              FROM orden_items oi
              JOIN ordenes o ON oi.orden_id = o.orden_id
              GROUP BY oi.producto_id
            ) stats ON stats.producto_id = p.producto_id
            WHERE p.status = 'activo' AND p.stock <= $1
            ORDER BY p.stock ASC, p.nombre ASC
            LIMIT $2
          `,
          [threshold, limitValue]
        ),
        pool.query(
          `
            SELECT 
              p.producto_id AS id,
              p.nombre,
              p.sku,
              p.stock,
              stats.last_sale
            FROM productos p
            LEFT JOIN (
              SELECT oi.producto_id, MAX(o.creado_en) AS last_sale
              FROM orden_items oi
              JOIN ordenes o ON oi.orden_id = o.orden_id
              GROUP BY oi.producto_id
            ) stats ON stats.producto_id = p.producto_id
            WHERE p.status = 'activo' AND p.stock = 0
            ORDER BY p.nombre ASC
            LIMIT $1
          `,
          [limitValue]
        ),
      ]);

      const counts = countsResult.rows[0] ?? {
        low_stock_count: 0,
        out_of_stock_count: 0,
        total_items: 0,
      };

      const formatProduct = (row, statusLabel) => ({
        id: row.id,
        name: row.nombre,
        sku: row.sku,
        currentStock: Number(row.stock),
        minStock: threshold,
        status: statusLabel,
        lastSaleDate: row.last_sale ? new Date(row.last_sale).toISOString() : null,
      });

      const stockData = {
        lowStockCount: Number(counts.low_stock_count ?? 0),
        outOfStockCount: Number(counts.out_of_stock_count ?? 0),
        totalItems: Number(counts.total_items ?? 0),
        lowStockProducts: lowStockResult.rows.map((row) => formatProduct(row, "low_stock")),
        outOfStockProducts: outOfStockResult.rows.map((row) => formatProduct(row, "out_of_stock")),
      };

      res.json({
        success: true,
        data: stockData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDistribution(req, res, next) {
    try {
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - 6);
      windowStart.setHours(0, 0, 0, 0);

      const { rows } = await pool.query(
        `
          SELECT
            EXTRACT(DOW FROM creado_en)::int AS dow,
            COUNT(*)::int AS order_count,
            COALESCE(SUM(total_cents), 0)::bigint AS revenue
          FROM ordenes
          WHERE creado_en >= $1
          GROUP BY dow
        `,
        [windowStart.toISOString()]
      );

      const distributionData = buildOrderDistribution(rows);

      res.json({
        success: true,
        data: distributionData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerRegistrations(req, res, next) {
    try {
      const days = 30;
      const endDate = new Date();
      endDate.setHours(0, 0, 0, 0);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - (days - 1));

      const { rows } = await pool.query(
        `
          SELECT DATE_TRUNC('day', creado_en) AS period, COUNT(*)::int AS registrations
          FROM usuarios
          WHERE rol_code != 'ADMIN' AND creado_en >= $1
          GROUP BY 1
          ORDER BY 1 ASC
        `,
        [startDate.toISOString()]
      );

      // Build complete daily series including missing days
      const map = new Map();
      rows.forEach(r => {
        const key = new Date(r.period).toISOString().split('T')[0];
        map.set(key, r.registrations);
      });

      const series = [];
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const key = cursor.toISOString().split('T')[0];
        series.push({ date: key, registrations: map.get(key) || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }

      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const { page = "1", limit = "20", search = "" } = req.query;
      const parsedPage = Number.parseInt(page, 10);
      const parsedLimit = Number.parseInt(limit, 10);
      const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const pageSize = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
      const offset = (pageNumber - 1) * pageSize;

      const whereClauses = ["rol_code != 'ADMIN'"];
      const whereValues = [];

      if (search) {
        whereValues.push(`%${search}%`);
        const searchIndex = whereValues.length;
        whereClauses.push(
          `(nombre ILIKE $${searchIndex} OR email ILIKE $${searchIndex})`,
        );
      }

      const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
      const queryValues = [...whereValues];
      const limitPlaceholder = queryValues.length + 1;
      const offsetPlaceholder = queryValues.length + 2;

      const query = `
        SELECT 
          usuario_id AS id,
          public_id AS "publicId",
          nombre,
          email,
          telefono,
          status,
          rol_code AS "rolCode",
          creado_en AS "createdAt",
          (
            SELECT COUNT(*)::int
            FROM ordenes o
            WHERE o.usuario_id = usuarios.usuario_id
          ) AS "orderCount"
        FROM usuarios
        ${whereClause}
        ORDER BY creado_en DESC
        LIMIT $${limitPlaceholder}
        OFFSET $${offsetPlaceholder}
      `;

      queryValues.push(pageSize, offset);
      const result = await pool.query(query, queryValues);

      const countValues = [...whereValues];
      const countQuery = `SELECT COUNT(*) FROM usuarios ${whereClause}`;
      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        data: {
          items: result.rows,
          total,
          page: pageNumber,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req, res, next) {
    try {
      const { nombre, email, telefono, rol_code, password, status } = req.body;

      if (!nombre || !email) {
        return res.status(400).json({
          success: false,
          message: "Nombre y correo son obligatorios",
        });
      }

      const newCustomer = await createAdminCustomerModel({
        nombre,
        email,
        telefono,
        password,
        rol_code: rol_code || "CLIENT",
        status: status || "activo",
      });

      res.status(201).json({
        success: true,
        message: "Cliente creado correctamente",
        data: newCustomer,
      });
    } catch (error) {
      console.error("Error creando cliente admin:", error);
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "El correo ya está registrado",
        });
      }
      next(error);
    }
  }

  static async updateCustomer(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, email, telefono, status, rol_code } = req.body;

      if (!nombre && !email && !telefono && !status && !rol_code) {
        return res.status(400).json({
          success: false,
          message: "Debes proporcionar al menos un campo para actualizar",
        });
      }

      const updates = {
        ...(nombre !== undefined ? { nombre } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(telefono !== undefined ? { telefono } : {}),
      };

      if (status !== undefined) {
        updates.status = status;
      }

      if (rol_code) {
        updates.rol_code = rol_code;
      }

      const updatedCustomer = await updateAdminCustomerModel({
        id,
        ...updates,
      });

      if (!updatedCustomer) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Cliente actualizado",
        data: updatedCustomer,
      });
    } catch (error) {
      console.error("Error actualizando cliente admin:", error);
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { rolCode } = req.body;

      if (!rolCode) {
        throw new ValidationError('Código de rol es requerido');
      }

      const userCheck = await pool.query(
        'SELECT usuario_id FROM usuarios WHERE usuario_id = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        throw new NotFoundError('Usuario');
      }

      if (parseInt(id) === req.user.id && rolCode.toUpperCase() !== 'ADMIN') {
        throw new ForbiddenError('No puedes remover tus propios privilegios de administrador');
      }

      const updateResult = await pool.query(
        `UPDATE usuarios 
         SET rol_code = $1 
         WHERE usuario_id = $2 
         RETURNING usuario_id AS id, nombre, email, rol_code AS "rolCode"`,
        [rolCode, id]
      );

      res.json({
        success: true,
        message: 'Rol actualizado correctamente',
        data: updateResult.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStoreConfig(req, res, next) {
    try {
      const config = await configModel.getConfig();

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Error obteniendo configuración tienda:", error);
      next(error);
    }
  }

  static async updateStoreConfig(req, res, next) {
    try {
      const config = req.body ?? {};

      if (!Object.keys(config).length) {
        throw new ValidationError("Debe proporcionar al menos un campo para actualizar");
      }

      if (config.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(config.email)) {
          throw new ValidationError("Formato de email inválido");
        }
      }

      const socialFields = ["instagram_url", "facebook_url", "twitter_url"];
      for (const field of socialFields) {
        if (!config[field]) continue;
        try {
          new URL(config[field]);
        } catch {
          throw new ValidationError(`URL inválida en el campo ${field}`);
        }
      }

      const userId =
        req.user?.id_usuario ?? req.user?.usuario_id ?? req.user?.id;

      if (!userId) {
        throw new ForbiddenError("No se pudo determinar el usuario autenticado");
      }

      const updatedConfig = await configModel.updateConfig(config, userId);

      res.json({
        success: true,
        message: "Configuración actualizada correctamente",
        data: updatedConfig,
      });
    } catch (error) {
      console.error("Error actualizando configuración tienda:", error);
      next(error);
    }
  }
}
