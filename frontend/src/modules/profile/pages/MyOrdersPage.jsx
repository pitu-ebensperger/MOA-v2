import { useOrders } from '@/modules/orders/hooks/useOrders.js';
import OrderCard from '../components/OrderCard.jsx';
import { Skeleton } from "@/components/ui";

export const MyOrdersPage = () => {
  const { orders = [], isLoading, error } = useOrders();

  return (
    <div className="page container-px mx-auto max-w-4xl py-12">
      <header className="mb-8">
        <h1 className="title-serif text-4xl text-(--color-primary1)">Mis Pedidos</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Revisa el estado de tus pedidos y su historial
        </p>
      </header>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al cargar tus pedidos. Intenta nuevamente.
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-(--border) bg-(--color-lightest) p-8 text-center">
          <p className="text-(--color-text-muted)">Aún no tienes pedidos</p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.orden_id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;