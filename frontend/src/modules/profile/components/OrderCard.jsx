import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatCurrencyCLP } from "@/utils/formatters/currency.js";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const orderCode = order.order_code ?? order.orderCode ?? 'N/A';
  const totalCents = order.total_cents ?? order.totalCents ?? 0;
  const itemsCount = order.total_items ?? order.items?.length ?? 0;
  const createdAt = order.creado_en ?? order.createdAt ?? new Date().toISOString();
  const orderId = order.orden_id ?? order.id;

  return (
    <button
      onClick={() => navigate(`/order-confirmation/${orderId}`)}
      className="group w-full rounded-2xl bg-white border border-(--border) p-5 text-left transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-(--color-primary1)">Orden #{orderCode}</p>
          <p className="text-xs text-(--text-secondary1)">
            {new Date(createdAt).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-xs text-(--text-muted)">
            {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-(--color-primary1)">
            {formatCurrencyCLP(totalCents / 100)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-1 text-xs text-(--color-primary1) font-medium group-hover:gap-2 transition-all">
        <span>Ver detalles</span>
        <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};

OrderCard.propTypes = {
  order: PropTypes.shape({
    orden_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    order_code: PropTypes.string,
    orderCode: PropTypes.string,
    total_cents: PropTypes.number,
    totalCents: PropTypes.number,
    total_items: PropTypes.number,
    items: PropTypes.array,
    creado_en: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
};

export default OrderCard;
