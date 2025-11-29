import PropTypes from "prop-types";
import { 
  ESTADOS_ORDEN, 
  METODOS_DESPACHO,
  calcularEstadoActual,
  calcularFechaEstimada,
  obtenerEstadosPorMetodo,
  obtenerIndiceEstado,
  esEstadoPasado,
  formatearFecha,
  mensajeTiempoEntrega
} from "@/utils/orderTracking.js";
import { Mail, Phone, Store } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig.js";

const estadoOrdenKeys = Object.keys(ESTADOS_ORDEN);
const metodoDespachoKeys = Object.keys(METODOS_DESPACHO);

const timelineEntryShape = PropTypes.shape({
  estado: PropTypes.string.isRequired,
  fecha: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  comentario: PropTypes.string,
});

const orderShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  order_code: PropTypes.string,
  estado_envio: PropTypes.oneOf(estadoOrdenKeys),
  estado: PropTypes.oneOf(estadoOrdenKeys),
  estado_pago: PropTypes.string,
  metodo_despacho: PropTypes.oneOf(metodoDespachoKeys),
  fecha_entrega_estimada: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  fecha_entrega_real: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  creado_en: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  timeline: PropTypes.arrayOf(timelineEntryShape),
});

export default function OrderStatusTimeline({ order }) {
  const { config } = useStoreConfig();
  // Si no hay orden, no mostrar nada
  if (!order) return null;

  // Calcular estado actual y fecha estimada
  const estadoActual = calcularEstadoActual(order);
  const fechaEstimada = order.fecha_entrega_estimada 
    ? new Date(order.fecha_entrega_estimada)
    : calcularFechaEstimada(order.creado_en || order.createdAt, order.metodo_despacho || 'standard');
  
  const metodoDespacho = METODOS_DESPACHO[order.metodo_despacho || 'standard'];
  
  // Determinar qué estados mostrar según el método
  const estadosMostrar = obtenerEstadosPorMetodo(order.metodo_despacho || 'standard');
  const indiceActual = obtenerIndiceEstado(estadoActual, estadosMostrar);

  return (
    <div className="space-y-6">
      {/* Encabezado con fecha estimada y progreso */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-(--text-weak)">
              {order.metodo_despacho === 'retiro' ? 'Disponible para retiro' : 'Entrega estimada'}
            </p>
            <p className="mt-1 text-2xl font-bold text-(--color-primary1)">
              {fechaEstimada ? formatearFecha(fechaEstimada) : 'Calculando...'}
            </p>
            <p className="mt-1 text-sm text-(--text-weak)">
              {metodoDespacho?.label} • {mensajeTiempoEntrega(fechaEstimada)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-4xl font-bold text-(--color-primary1)">
              {ESTADOS_ORDEN[estadoActual]?.progreso || 0}%
            </div>
            <p className="text-xs text-(--text-weak)">Completado</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700 ease-out"
            style={{ width: `${ESTADOS_ORDEN[estadoActual]?.progreso || 0}%` }}
          />
        </div>
      </div>

      {/* Timeline de estados */}
      <div className="relative space-y-6">
        {estadosMostrar.map((key, index) => {
          const estado = ESTADOS_ORDEN[key];
          const isActive = key === estadoActual;
          const isPast = esEstadoPasado(index, indiceActual);
          const IconComponent = estado.icon;
          
          return (
            <div key={key} className="relative flex gap-4">
              {/* Línea conectora vertical */}
              {index < estadosMostrar.length - 1 && (
                <div className="absolute left-5 top-10 h-[calc(100%+1.5rem)] w-0.5">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isPast ? 'bg-green-500' : 
                      isActive ? 'bg-gradient-to-b from-blue-500 to-gray-200' : 
                      'bg-gray-200'
                    }`}
                  />
                </div>
              )}
              
              {/* Ícono del estado */}
              <div 
                className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'scale-110 bg-blue-500 text-white shadow-lg ring-4 ring-blue-100' :
                  isPast 
                    ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-400'
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              
              {/* Contenido del estado */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold transition-colors ${
                    isActive ? 'text-blue-600' : 
                    isPast ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    {estado.label}
                  </p>
                  {isActive && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                      Ahora
                    </span>
                  )}
                  {isPast && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
                <p className={`mt-1 text-sm transition-colors ${
                  isActive ? 'text-(--text-strong)' : 'text-(--text-weak)'
                }`}>
                  {estado.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card especial para retiro en showroom */}
      {order.metodo_despacho === 'retiro' && estadoActual === 'listo_retiro' && (
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Store className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900">
                ¡Tu pedido está listo para retirar!
              </h3>
              <div className="mt-3 space-y-2 text-sm text-purple-800">
                <div>
                  <span className="font-medium">Dirección:</span>
                  <p>{metodoDespacho.direccion}</p>
                </div>
                <div>
                  <span className="font-medium">Horario:</span>
                  <p>{metodoDespacho.horario}</p>
                </div>
                <div className="mt-3 rounded-lg bg-purple-100 p-3">
                  <p className="text-xs font-medium text-purple-900">
                    💡 Recuerda traer tu número de orden:
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-purple-900">
                    #{order.order_code || order.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card especial para orden entregada */}
      {estadoActual === 'entregado' && (
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-xl font-semibold text-green-900">
              ¡Pedido entregado!
            </h3>
            <p className="mt-2 text-sm text-green-700">
              Esperamos que disfrutes tus nuevas piezas MOA
            </p>
          </div>
        </div>
      )}
      
      {/* Información de contacto */}
  <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 font-semibold text-blue-900">
          ¿Dudas sobre tu pedido?
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <a 
            href={`https://wa.me/${config.telefono?.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-blue-600 hover:underline"
          >
            <Phone className="h-4 w-4" />
            WhatsApp: {config.telefono}
          </a>
          <a 
            href={`mailto:${config.email}`}
            className="flex items-center gap-2 transition-colors hover:text-blue-600 hover:underline"
          >
            <Mail className="h-4 w-4" />
            Email: {config.email}
          </a>
        </div>
      </div>
    </div>
  );
}

OrderStatusTimeline.propTypes = {
  order: orderShape,
};

OrderStatusTimeline.defaultProps = {
  order: null,
};
