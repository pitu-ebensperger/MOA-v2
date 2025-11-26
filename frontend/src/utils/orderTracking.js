import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Store,
  PartyPopper,
  Rocket,
} from "lucide-react";

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_LOCALE = "es-CL";
const DEFAULT_FORMAT_OPTIONS = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const METODOS_DESPACHO = {
  standard: {
    value: "standard",
    label: "Despacho estándar",
    descripcion: "Entrega en 3-5 días hábiles",
    precio: 0,
    dias_min: 3,
    dias_max: 5,
    icono: Truck,
  },
  express: {
    value: "express",
    label: "Despacho express",
    descripcion: "Entrega en 1-2 días hábiles",
    precio: 6900,
    dias_min: 1,
    dias_max: 2,
    icono: Rocket,
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
    icono: Store,
  },
};

export const ESTADOS_ORDEN = {
  confirmada: {
    label: "Orden confirmada",
    description: "Hemos recibido tu pedido",
    icon: CheckCircle2,
    color: "green",
    progreso: 25,
  },
  preparacion: {
    label: "En preparación",
    description: "Estamos seleccionando y empaquetando tus piezas",
    icon: PackageCheck,
    color: "blue",
    progreso: 50,
  },
  en_transito: {
    label: "En camino",
    description: "Tu pedido está en camino",
    icon: Truck,
    color: "orange",
    progreso: 75,
  },
  listo_retiro: {
    label: "Listo para retiro",
    description: "Tu pedido está disponible en nuestro showroom",
    icon: Store,
    color: "purple",
    progreso: 75,
  },
  entregado: {
    label: "Entregado",
    description: "Tu pedido fue entregado exitosamente",
    icon: PartyPopper,
    color: "green",
    progreso: 100,
  },
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(parsed?.getTime()) ? null : parsed;
};

export function calcularFechaEstimada(baseDate, metodo = "standard") {
  const shippingMethod = METODOS_DESPACHO[metodo] ?? METODOS_DESPACHO.standard;
  const reference = parseDate(baseDate) ?? new Date();
  const estimated = new Date(reference);

  let daysAdded = 0;
  while (daysAdded < shippingMethod.dias_max) {
    estimated.setDate(estimated.getDate() + 1);
    if (!isWeekend(estimated)) {
      daysAdded += 1;
    }
  }

  return estimated;
}

export function calcularEstadoActual(order = {}) {
  if (!order) return "confirmada";

  if (order.estado_envio === "entregado" || order.fecha_entrega_real) {
    return "entregado";
  }

  const now = new Date();
  const createdAt = parseDate(order.creado_en ?? order.createdAt) ?? now;
  const estimated = order.fecha_entrega_estimada
    ? parseDate(order.fecha_entrega_estimada)
    : calcularFechaEstimada(createdAt, order.metodo_despacho || "standard");

  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation < 24) return "confirmada";
  if (hoursSinceCreation < 48) return "preparacion";

  if ((order.metodo_despacho || "standard") === "retiro") {
    if (estimated && now > estimated) return "entregado";
    return "listo_retiro";
  }

  if (estimated && now > estimated) {
    return "entregado";
  }

  if (estimated) {
    const remainingDays = Math.ceil((estimated - now) / MS_IN_DAY);
    if (remainingDays <= 1) {
      return "en_transito";
    }
  }

  return "preparacion";
}

export function obtenerEstadosPorMetodo(metodo = "standard") {
  return metodo === "retiro"
    ? ["confirmada", "preparacion", "listo_retiro", "entregado"]
    : ["confirmada", "preparacion", "en_transito", "entregado"];
}

export function obtenerIndiceEstado(estado, estados = []) {
  const index = estados.indexOf(estado);
  return index === -1 ? 0 : index;
}

export function esEstadoPasado(index, indiceActual) {
  if (indiceActual < 0) return false;
  return index < indiceActual;
}

export function formatearFecha(date, options = {}) {
  const parsed = parseDate(date);
  if (!parsed) return "";
  return parsed.toLocaleDateString(DEFAULT_LOCALE, {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  });
}

const diasRestantes = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return null;
  return Math.ceil((parsed - new Date()) / MS_IN_DAY);
};

export function mensajeTiempoEntrega(date) {
  const daysLeft = diasRestantes(date);
  if (daysLeft === null) return "";

  if (daysLeft < 0) return "Debería haber sido entregado";
  if (daysLeft === 0) return "Entrega hoy";
  if (daysLeft === 1) return "Entrega mañana";
  if (daysLeft <= 3) return `Entrega en ${daysLeft} días`;

  return formatearFecha(date, { weekday: "long", month: "long", day: "numeric" });
}
