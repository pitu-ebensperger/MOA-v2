import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent } from "@/components/ui/radix/Dialog.jsx"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { Price } from "@/components/data-display/Price.jsx"
import { Mail, Phone, Calendar, MapPin, ShoppingBag, Package } from "lucide-react";
import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js"
import { ordersAdminApi } from "@/services/ordersAdmin.api.js"
import { UserShape } from "@/utils/propTypes.js";

const safeText = (v) => (v == null || v === "" ? "–" : v);
const safeDate = (value) => (value ? formatDate_ddMMyyyy(value) : "–");

/**
 * Componente Accordion simple para organizar secciones
 */
function Accordion({ sections, className = "" }) {
  const [openKeys, setOpenKeys] = React.useState(() => {
    return sections.filter((s) => s.defaultOpen).map((s) => s.key);
  });

  const toggle = (key) => {
    setOpenKeys((keys) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]));
  };

  return (
    <div className={className}>
      {sections.map((section) => {
        const isOpen = openKeys.includes(section.key);
        return (
          <div key={section.key} className="border-b border-(--color-border) last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(section.key)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-(--text-strong) transition-colors hover:bg-(--color-neutral3)"
            >
              {section.title}
              <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {isOpen && <div className="px-5 py-4">{section.render()}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function CustomerDrawer({ open, customer, onClose, onViewOrder }) {
  const id = customer?.id;
  const firstName = customer?.firstName ?? "";
  const lastName = customer?.lastName ?? "";
  const email = customer?.email ?? "";
  const phone = customer?.phone ?? "";
  const createdAt = customer?.createdAt ?? null;
  const fullName = (firstName + " " + lastName).trim() || "Cliente";

  // Cargar órdenes del cliente con filtro backend
  const [customerOrders, setCustomerOrders] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    async function fetchOrders() {
      if (!id) {
        setCustomerOrders([]);
        return;
      }
      try {
        const data = await ordersAdminApi.getAll({ usuario_id: id, limit: 100 });
        const rawItems = data?.items || data?.data?.items || [];
        rawItems.sort((a, b) => new Date(b.createdAt || b.creado_en || 0) - new Date(a.createdAt || a.creado_en || 0));
        if (active) setCustomerOrders(rawItems);
      } catch (err) {
        console.error("Error cargando órdenes del cliente", err);
        if (active) setCustomerOrders([]);
      }
    }
    fetchOrders();
    return () => { active = false; };
  }, [id]);

  // Exponer refetch para que OrdersDrawer lo llame tras actualizar
  const handleOrderUpdated = React.useCallback(() => {
    if (!id) return;
    ordersAdminApi.getAll({ usuario_id: id, limit: 100 })
      .then(data => {
        const rawItems = data?.items || data?.data?.items || [];
        rawItems.sort((a, b) => new Date(b.createdAt || b.creado_en || 0) - new Date(a.createdAt || a.creado_en || 0));
        setCustomerOrders(rawItems);
      })
      .catch(err => console.error("Error refrescando órdenes", err));
  }, [id]);

  const totalSpent = useMemo(() => {
    if (!id) return 0;
    return customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  }, [id, customerOrders]);

  const completedOrders = useMemo(() => {
    if (!id) return 0;
    return customerOrders.filter((order) => order.status === "fulfilled").length;
  }, [id, customerOrders]);

  const customerAddresses = useMemo(() => {
    // Derivar direcciones únicas desde las órdenes cargadas
    const list = [];
    const seen = new Set();
    for (const o of customerOrders) {
      const addr = o.address || o.direccion || null;
      if (addr && addr.id && !seen.has(addr.id)) {
        seen.add(addr.id);
        list.push(addr);
      }
    }
    return list;
  }, [customerOrders]);

  // Early return AFTER hooks (evita warning de hooks condicionales)
  if (!open || !customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        variant="drawer"
        placement="right"
        className="w-full max-w-[720px]"
        showClose={true}
      >
        <div className="flex h-full flex-col bg-(--color-neutral2) text-(--color-text)">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-(--color-border) bg-white/90 px-7 py-5 backdrop-blur">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-text-muted)">
                Cliente
              </p>
              <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-primary">
                {fullName}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-(--color-text-muted)">Total gastado</p>
                <p className="text-lg font-semibold text-(--color-primary1)">
                  <Price value={totalSpent} />
                </p>
              </div>
            </div>
          </header>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Stats rápidas */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-(--color-border) bg-white px-4 py-3 text-center">
                <div className="text-2xl font-bold text-(--color-primary1)">{customerOrders.length}</div>
                <div className="text-xs text-(--color-text-muted)">Órdenes totales</div>
              </div>
              <div className="rounded-lg border border-(--color-border) bg-white px-4 py-3 text-center">
                <div className="text-2xl font-bold text-(--color-success)">{completedOrders}</div>
                <div className="text-xs text-(--color-text-muted)">Completadas</div>
              </div>
              <div className="rounded-lg border border-(--color-border) bg-white px-4 py-3 text-center">
                <div className="text-2xl font-bold text-(--color-text)">
                  <Price value={totalSpent} showCurrency={false} />
                </div>
                <div className="text-xs text-(--color-text-muted)">Total gastado</div>
              </div>
            </div>

            {/* Secciones en acordeón */}
            <Accordion
              className="divide-y divide-(--color-border) rounded-2xl border border-(--color-border) bg-white shadow-sm"
              sections={[
                {
                  key: "profile",
                  title: "Información del perfil",
                  defaultOpen: true,
                  render: () => (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-1 h-4 w-4 text-(--color-text-muted)" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Email</p>
                          <p className="mt-0.5 break-all text-sm text-(--color-primary1)">{safeText(email)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="mt-1 h-4 w-4 text-(--color-text-muted)" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Teléfono</p>
                          <p className="mt-0.5 text-sm">{safeText(phone)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-1 h-4 w-4 text-(--color-text-muted)" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">
                            Fecha de registro
                          </p>
                          <p className="mt-0.5 text-sm">{safeDate(createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "orders",
                  title: `Historial de compras (${customerOrders.length})`,
                  defaultOpen: true,
                  render: () => (
                    <div className="space-y-2">
                      {customerOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <ShoppingBag className="mb-2 h-10 w-10 text-(--color-text-muted)" />
                          <p className="text-sm text-(--color-text-muted)">Este cliente no ha realizado compras aún.</p>
                        </div>
                      )}
                      {customerOrders.map((order) => {
                        const itemsCount = Array.isArray(order.items) ? order.items.length : (order.items_count || order.total_items || 0);
                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => onViewOrder?.(order, handleOrderUpdated)}
                            className="group w-full rounded-lg border border-(--color-border) bg-white p-3 text-left transition-all hover:border-(--color-primary1) hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-(--color-primary1) bg-opacity-10">
                                  <Package className="h-5 w-5 text-(--color-primary1)" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-mono text-sm font-medium text-(--text-strong) group-hover:text-(--color-primary1)">
                                    {order.number}
                                  </p>
                                  <p className="text-xs text-(--color-text-muted)">
                                    {safeDate(order.createdAt)} · {itemsCount} {itemsCount === 1 ? "item" : "items"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <StatusPill status={order.status} />
                                <p className="text-sm font-semibold tabular-nums text-(--text-strong)">
                                  <Price value={order.total} />
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ),
                },
                {
                  key: "addresses",
                  title: "Direcciones",
                  render: () => (
                    <div className="space-y-3">
                      {customerAddresses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <MapPin className="mb-2 h-8 w-8 text-(--color-text-muted)" />
                          <p className="text-sm text-(--color-text-muted)">Sin direcciones registradas</p>
                        </div>
                      )}
                      {customerAddresses.map((address) => {
                        const fullAddress = [
                          address.street,
                          [address.commune, address.city].filter(Boolean).join(", "),
                          [address.region, address.country].filter(Boolean).join(", "),
                          address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(" · ");

                        return (
                          <div
                            key={address.id}
                            className="rounded-lg border border-(--color-border) bg-white/70 p-3"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 text-(--color-text-muted)" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{address.label || "Sin etiqueta"}</p>
                                  {address.isDefault && (
                                    <span className="rounded-full bg-(--color-primary1) bg-opacity-10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--color-primary1)">
                                      Predeterminada
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 wrap-break-word text-xs text-(--color-text-muted)">{fullAddress}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

CustomerDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  customer: UserShape,
  onClose: PropTypes.func.isRequired,
};
