import PropTypes from "prop-types";
import { formatCurrencyCLP } from "@/utils/currency.js";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const normalizeOrder = (order, index) => {
  if (!order || typeof order !== "object") {
    return {
      id: `order-${index}`,
      orderCode: `N/A`,
      totalCents: 0,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return {
    id: order.orden_id ?? order.id ?? `order-${index}`,
    orderCode: order.order_code ?? order.orderCode ?? `N/A`,
    totalCents: order.total_cents ?? order.totalCents ?? 0,
    itemsCount: order.total_items ?? order.items?.length ?? 0,
    createdAt: order.creado_en ?? order.createdAt ?? new Date().toISOString(),
  };
};

const orderPropShape = PropTypes.shape({
  orden_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  order_code: PropTypes.string,
  orderCode: PropTypes.string,
  total_cents: PropTypes.number,
  totalCents: PropTypes.number,
  total_items: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.object),
  creado_en: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  estado_envio: PropTypes.string,
  estado_pago: PropTypes.string,
});

const MyOrdersSection = ({ orders = [], isLoading = false, error = null }) => {
  const navigate = useNavigate();
  const recentOrders = (Array.isArray(orders) ? orders : [])
    .slice(0, 6)
    .map(normalizeOrder);
  const hasOrders = recentOrders.length > 0;

  return (
    <section className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-(--text-strong)">Mis Compras</h2>
          <p className="text-sm text-(--text-secondary1) mt-1">Historial de pedidos recientes</p>
        </div>
        <Link
          to="/myorders"
          className="px-3 py-1 rounded-full bg-(--color-primary4) text-(--color-primary1) text-sm font-medium transition-all hover:bg-(--color-primary1) hover:text-white"
        >
          Ver más
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-3xl bg-(--color-light)">
        {isLoading && (
          <p className="text-center text-sm text-(--text-secondary1) py-8">Cargando tus órdenes...</p>
        )}
        {!isLoading && error && (
          <div className="text-center py-8">
            <p role="alert" className="text-sm text-(--color-error)">
              {error}
            </p>
          </div>
        )}
        {!isLoading && !error && hasOrders ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                className="group w-full rounded-2xl bg-white/75 p-5 text-left transition-all hover:bg-white hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-(--color-primary1)">Orden #{order.orderCode}</p>
                    <p className="text-xs text-(--text-secondary1)">
                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-(--text-muted)">
                      {order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-(--color-primary1)">
                      {formatCurrencyCLP(order.totalCents / 100)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-1 text-xs text-(--color-primary1) font-medium group-hover:gap-2 transition-all">
                  <span>Ver detalles</span>
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        ) : null}
        {!isLoading && !error && !hasOrders && (
          <div className="rounded-2xl border border-dashed border-(--color-primary1)/30 bg-(--color-primary4)/30 p-12 text-center">
            <p className="text-sm text-(--text-secondary1)">Aún no tienes órdenes registradas.</p>
            <Link to="/productos" className="inline-block mt-4 text-sm text-(--color-primary1) font-medium hover:underline">
              Comenzar a comprar
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

MyOrdersSection.propTypes = {
  orders: PropTypes.arrayOf(orderPropShape),
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.instanceOf(Error)]),
};

MyOrdersSection.defaultProps = {
  orders: [],
  isLoading: false,
  error: null,
};

export default MyOrdersSection;
