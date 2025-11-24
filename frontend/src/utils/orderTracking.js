/**
 * Utilidades para tracking y cálculo de estados de órdenes
 */

import { Truck, Package, CheckCircle, Store, CheckCircle2, Zap } from "@icons/lucide";

// ============================================================================
// CONFIGURACIÓN DE MÉTODOS DE DESPACHO
// ============================================================================

export const METODOS_DESPACHO = {
  standard: {
    value: "standard",
    label: "Despacho estándar",
    descripcion: "Entrega en 3-5 días hábiles",
    precio: 0, // Gratis
    dias_min: 3,
    dias_max: 5,
    icono: Truck
  },
  express: {
    value: "express",
    label: "Despacho express",
    descripcion: "Entrega en 1-2 días hábiles",
    precio: 6900,
    dias_min: 1,
    dias_max: 2,
    icono: Zap
  },
  retiro: {
    value: "retiro",
    label: "Retiro en showroom",
    descripcion: "Disponible al día siguiente",
    precio: 0,
    dias_min: 1,
    dias_max: 1,
    direccion: "Av. Nueva Providencia 1881, Providencia",
    horario: "Lunes a viernes 10:00 - 18:00, Sábados 10:00 - 14:00",
    icono: Store
  }
};

// ============================================================================
// ESTADOS DE ORDEN
// ============================================================================

export const ESTADOS_ORDEN = {
  confirmada: {
    label: "Orden confirmada",
    description: "Hemos recibido tu pedido",
    icon: CheckCircle,
    color: "green",
    progreso: 25
  },
  preparacion: {
    label: "En preparación",
    description: "Estamos seleccionando y empaquetando tus piezas",
    icon: Package,
    color: "blue",
    progreso: 50
  },
  en_transito: {
    label: "En camino",
    description: "Tu pedido está en camino",
    icon: Truck,
    color: "orange",
    progreso: 75
  },
  listo_retiro: {
    label: "Listo para retiro",
    description: "Tu pedido está disponible en nuestro showroom",
    icon: Store,
    color: "purple",
    progreso: 75
  },
  entregado: {
    label: "Entregado",
    description: "Tu pedido fue entregado exitosamente",
    icon: CheckCircle2,
    color: "green",
    progreso: 100
  }
};

// ============================================================================
// FUNCIONES DE CÁLCULO
// ============================================================================

/**
 * Calcula la fecha estimada de entrega basada en el método de despacho
 * @param {Date|string} fechaOrden - Fecha de creación de la orden
 * @param {string} metodoDespacho - 'standard' | 'express' | 'retiro'
 * @returns {Date} Fecha estimada de entrega
 */
export function calcularFechaEstimada(fechaOrden, metodoDespacho) {
  const metodo = METODOS_DESPACHO[metodoDespacho];
  if (!metodo) return null;

  const fecha = new Date(fechaOrden);
  
  // Agregar días hábiles (excluyendo fines de semana)
  let diasAgregados = 0;
  while (diasAgregados < metodo.dias_max) {
    fecha.setDate(fecha.getDate() + 1);
    
    // Si no es fin de semana, contar como día hábil
    const diaSemana = fecha.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasAgregados++;
    }
  }
  
  return fecha;
}

/**
 * Calcula el estado actual de una orden basado en fechas y tiempo transcurrido
 * @param {Object} orden - Objeto de orden con propiedades necesarias
 * @returns {string} Estado actual de la orden
 */
export function calcularEstadoActual(orden) {
  // Si está marcado manualmente como entregado
  if (orden.estado_envio === 'entregado' || orden.fecha_entrega_real) {
    return 'entregado';
  }

  const ahora = new Date();
  const fechaOrden = new Date(orden.creado_en || orden.createdAt);
  
  // Usar fecha estimada del backend o calcularla
  const fechaEstimada = orden.fecha_entrega_estimada 
    ? new Date(orden.fecha_entrega_estimada)
    : calcularFechaEstimada(fechaOrden, orden.metodo_despacho || 'standard');
  
  // Si está en proceso de confirmación (primeras 24h)
  const horasDesdeOrden = (ahora - fechaOrden) / (1000 * 60 * 60);
  if (horasDesdeOrden < 24) {
    return 'confirmada';
  }
  
  // Si está entre 24h y 48h -> en preparación
  if (horasDesdeOrden < 48) {
    return 'preparacion';
  }
  
  // Si es retiro en showroom y ya pasaron 48h
  if (orden.metodo_despacho === 'retiro') {
    return 'listo_retiro';
  }
  
  // Si ya pasó el tiempo estimado pero no está marcado como entregado
  if (ahora > fechaEstimada) {
    return 'entregado'; // Asumir entregado si pasó la fecha
  }
  
  // Si está dentro del rango de entrega
  const diasRestantes = Math.ceil((fechaEstimada - ahora) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 1) {
    return orden.metodo_despacho === 'retiro' ? 'listo_retiro' : 'en_transito';
  }
  
  return 'preparacion';
}

/**
 * Obtiene los estados a mostrar según el método de despacho
 * @param {string} metodoDespacho - 'standard' | 'express' | 'retiro'
 * @returns {Array<string>} Lista de estados a mostrar
 */
export function obtenerEstadosPorMetodo(metodoDespacho) {
  if (metodoDespacho === 'retiro') {
    return ['confirmada', 'preparacion', 'listo_retiro', 'entregado'];
  }
  return ['confirmada', 'preparacion', 'en_transito', 'entregado'];
}

/**
 * Calcula el índice del estado actual en la lista de estados
 * @param {string} estadoActual - Estado actual de la orden
 * @param {Array<string>} estadosMostrar - Lista de estados a mostrar
 * @returns {number} Índice del estado actual
 */
export function obtenerIndiceEstado(estadoActual, estadosMostrar) {
  return estadosMostrar.indexOf(estadoActual);
}

/**
 * Determina si un estado ya fue completado
 * @param {number} indiceEstado - Índice del estado a verificar
 * @param {number} indiceActual - Índice del estado actual
 * @returns {boolean} True si el estado ya pasó
 */
export function esEstadoPasado(indiceEstado, indiceActual) {
  return indiceEstado < indiceActual;
}

/**
 * Formatea una fecha a formato legible en español chileno
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export function formatearFecha(date, options = {}) {
  const defaultOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Date(date).toLocaleDateString('es-CL', formatOptions);
}

/**
 * Formatea una fecha a formato corto (dd/mm/yyyy)
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export function formatearFechaCorta(date) {
  return new Date(date).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Calcula días restantes hasta la entrega
 * @param {Date|string} fechaEstimada - Fecha estimada de entrega
 * @returns {number} Días restantes (puede ser negativo si ya pasó)
 */
export function diasRestantesEntrega(fechaEstimada) {
  const ahora = new Date();
  const fecha = new Date(fechaEstimada);
  const diferencia = fecha - ahora;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Genera mensaje descriptivo del tiempo de entrega
 * @param {Date|string} fechaEstimada - Fecha estimada de entrega
 * @returns {string} Mensaje descriptivo
 */
export function mensajeTiempoEntrega(fechaEstimada) {
  const dias = diasRestantesEntrega(fechaEstimada);
  
  if (dias < 0) {
    return 'Debería haber sido entregado';
  } else if (dias === 0) {
    return 'Entrega hoy';
  } else if (dias === 1) {
    return 'Entrega mañana';
  } else if (dias <= 3) {
    return `Entrega en ${dias} días`;
  } else {
    return formatearFecha(fechaEstimada, { weekday: 'long', month: 'long', day: 'numeric' });
  }
}

/**
 * Obtiene el color del estado según su tipo
 * @param {string} estado - Estado de la orden
 * @returns {string} Clase de color de Tailwind
 */
export function obtenerColorEstado(estado) {
  const colores = {
    confirmada: 'text-green-600 bg-green-50',
    preparacion: 'text-blue-600 bg-blue-50',
    en_transito: 'text-orange-600 bg-orange-50',
    listo_retiro: 'text-purple-600 bg-purple-50',
    entregado: 'text-green-600 bg-green-50'
  };
  
  return colores[estado] || 'text-gray-600 bg-gray-50';
}
