import { pool } from "../../database/config.js";
import { getLastNDaysWindow } from "../utils/referenceDate.js";

const parseDays = (value, fallback = 30) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Obtiene estadísticas generales del dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);

    const statsQuery = `
      SELECT 
        -- Totales generales
        COUNT(*)::INT as total_ordenes,
        COUNT(*) FILTER (WHERE estado_pago = 'pagado')::INT as ordenes_pagadas,
        
        -- Ingresos
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(SUM(total_cents) FILTER (WHERE estado_pago = 'pagado'), 0)::BIGINT as ingresos_confirmados,
        
        -- Promedios
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        COALESCE(ROUND(AVG(total_cents) FILTER (WHERE estado_pago = 'pagado')), 0)::INT as ticket_promedio_pagado
        
      FROM ordenes
      WHERE creado_en >= $1
        AND creado_en < $2
        AND estado_orden = 'confirmado'
    `;

    const { rows } = await pool.query(statsQuery, [startDate.toISOString(), endDate.toISOString()]);

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene estadísticas por método de pago
 */
export const getPaymentMethodStats = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);

    const query = `
      SELECT 
        metodo_pago,
        COUNT(*)::INT as cantidad_ordenes,
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje_uso
      FROM ordenes 
      WHERE estado_orden = 'confirmado'
        AND creado_en >= $1
        AND creado_en < $2
      GROUP BY metodo_pago
      ORDER BY ingresos_totales DESC
    `;

    const { rows } = await pool.query(query, [startDate.toISOString(), endDate.toISOString()]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats de pago:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de métodos de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene estadísticas por método de envío
 */
export const getShippingMethodStats = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);

    const query = `
      SELECT 
        metodo_despacho,
        COUNT(*)::INT as cantidad_ordenes,
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
        COALESCE(SUM(envio_cents), 0)::BIGINT as ingresos_envio,
        COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje_uso
      FROM ordenes 
      WHERE estado_orden = 'confirmado'
        AND creado_en >= $1
        AND creado_en < $2
      GROUP BY metodo_despacho
      ORDER BY cantidad_ordenes DESC
    `;

    const { rows } = await pool.query(query, [startDate.toISOString(), endDate.toISOString()]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo stats de envío:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas de métodos de envío',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene KPIs principales del dashboard
 */
export const getDashboardKPIs = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);
    const previousEnd = new Date(startDate);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - periodDays);

    // KPIs del período actual
    const currentQuery = `
      WITH current_period AS (
        SELECT 
          COUNT(DISTINCT orden_id)::INT as total_ordenes,
          COUNT(DISTINCT usuario_id)::INT as total_clientes,
          COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales,
          COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio
        FROM ordenes
        WHERE estado_orden = 'confirmado'
          AND creado_en >= $1
          AND creado_en < $2
      ),
      previous_period AS (
        SELECT 
          COUNT(DISTINCT orden_id)::INT as total_ordenes_prev,
          COUNT(DISTINCT usuario_id)::INT as total_clientes_prev,
          COALESCE(SUM(total_cents), 0)::BIGINT as ingresos_totales_prev,
          COALESCE(ROUND(AVG(total_cents)), 0)::INT as ticket_promedio_prev
        FROM ordenes
        WHERE estado_orden = 'confirmado'
          AND creado_en >= $3
          AND creado_en < $4
      )
      SELECT 
        cp.*,
        pp.total_ordenes_prev,
        pp.total_clientes_prev,
        pp.ingresos_totales_prev,
        pp.ticket_promedio_prev
      FROM current_period cp, previous_period pp
    `;

    const values = [
      startDate.toISOString(),
      endDate.toISOString(),
      previousStart.toISOString(),
      previousEnd.toISOString(),
    ];

    const { rows } = await pool.query(currentQuery, values);
    const kpis = rows[0] ?? {
      ingresos_totales: 0,
      ingresos_totales_prev: 0,
      total_ordenes: 0,
      total_ordenes_prev: 0,
      total_clientes: 0,
      total_clientes_prev: 0,
      ticket_promedio: 0,
      ticket_promedio_prev: 0,
    };

    res.json({
      success: true,
      data: {
        ingresos: {
          value: kpis.ingresos_totales,
          previousValue: kpis.ingresos_totales_prev
        },
        ordenes: {
          value: kpis.total_ordenes,
          previousValue: kpis.total_ordenes_prev
        },
        clientes: {
          value: kpis.total_clientes,
          previousValue: kpis.total_clientes_prev
        },
        aov: {
          value: kpis.ticket_promedio,
          previousValue: kpis.ticket_promedio_prev
        }
      }
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo KPIs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener KPIs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene top productos más vendidos
 */
export const getTopProducts = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const limitValue = parseInt(req.query.limit ?? '5', 10);
    const limitSanitized = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 5;
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);

    const query = `
      SELECT 
        p.producto_id,
        p.nombre,
        p.img_url,
        p.precio_cents,
        c.nombre as categoria,
        SUM(oi.cantidad)::INT as unidades_vendidas,
        COALESCE(SUM(oi.cantidad * oi.precio_unit), 0)::BIGINT as ingresos_totales,
        COALESCE(ROUND(AVG(oi.precio_unit)), 0)::INT as precio_promedio
      FROM orden_items oi
      JOIN productos p ON oi.producto_id = p.producto_id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      JOIN ordenes o ON oi.orden_id = o.orden_id
      WHERE o.estado_orden = 'confirmado'
        AND o.creado_en >= $1
        AND o.creado_en < $2
      GROUP BY p.producto_id, p.nombre, p.img_url, p.precio_cents, c.nombre
      ORDER BY unidades_vendidas DESC
      LIMIT $3
    `;

    const params = [startDate.toISOString(), endDate.toISOString(), limitSanitized];
    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo top productos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos más vendidos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene evolución de ventas (diaria, semanal, mensual)
 */
export const getSalesEvolution = async (req, res) => {
  try {
    const periodDays = parseDays(req.query.periodo, 30);
    const { startDate, endDate } = await getLastNDaysWindow(periodDays);

    const query = `
      SELECT 
        DATE(creado_en) as fecha,
        COUNT(*)::INT as num_ordenes,
        COALESCE(SUM(total_cents), 0)::BIGINT as ingresos
      FROM ordenes
      WHERE estado_orden = 'confirmado'
        AND creado_en >= $1
        AND creado_en < $2
      GROUP BY DATE(creado_en)
      ORDER BY fecha ASC
    `;

    const { rows } = await pool.query(query, [startDate.toISOString(), endDate.toISOString()]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo evolución de ventas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener evolución de ventas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtiene distribución de órdenes por estado
 */
export const getOrdersByStatus = async (req, res) => {
  try {
    const { startDate, endDate } = await getLastNDaysWindow(30);

    const query = `
      SELECT 
        estado_envio,
        COUNT(*)::INT as cantidad,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje
      FROM ordenes
      WHERE estado_orden = 'confirmado'
        AND creado_en >= $1
        AND creado_en < $2
      GROUP BY estado_envio
      ORDER BY cantidad DESC
    `;

    const { rows } = await pool.query(query, [startDate.toISOString(), endDate.toISOString()]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('[DashboardController] Error obteniendo órdenes por estado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener distribución de órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getDashboardStats,
  getPaymentMethodStats,
  getShippingMethodStats,
  getDashboardKPIs,
  getTopProducts,
  getSalesEvolution,
  getOrdersByStatus
};
