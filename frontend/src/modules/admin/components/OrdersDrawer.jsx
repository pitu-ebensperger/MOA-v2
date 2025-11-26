import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent } from "@/components/ui/radix/Dialog.jsx";
import { Price } from "@/components/data-display/Price.jsx";
import { StatusPill } from "@/components/ui/StatusPill.jsx";
import { Pill } from "@/components/ui/Pill.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/ui/Input.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/shadcn/ui/select.jsx";
import { Accordion } from "@/components/ui/Accordion.jsx";
import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js";
import { CalendarDays, PackageCheck, Truck, ChevronRight, Edit, Save, X, AlertCircle } from "lucide-react";
import OrderStatusTimeline from "@/components/data-display/OrderStatusTimeline.jsx";
import { ordersAdminApi } from "@/services/ordersAdmin.api.js";
import { OrderShape } from "@/utils/propTypes.js";
import { SHIPPING_COMPANIES } from "@config/shipping-companies.js";
import { PAYMENT_STATUS_MAP, SHIPPING_STATUS_MAP } from '@/config/status-maps.js';

// Convertir maps a arrays de opciones para Select
const ESTADOS_PAGO_OPTIONS = Object.entries(PAYMENT_STATUS_MAP).map(([value, label]) => ({ value, label }));
const ESTADOS_ENVIO_OPTIONS = Object.entries(SHIPPING_STATUS_MAP).map(([value, label]) => ({ value, label }));

// Helpers pequeños para no ensuciar el JSX
const safeDate = (value) => (value ? formatDate_ddMMyyyy(value) : "–");
const safeText = (v) => (v == null || v === "" ? "–" : v);

export default function OrdersDrawer({ open, order, onClose, breadcrumb = null, onOrderUpdate }) {
  // Estado para edición de orden
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    estado_pago: '',
    estado_envio: '',
    numero_seguimiento: '',
    empresa_envio: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Inicializar form cuando cambia la orden
  React.useEffect(() => {
    if (order) {
      setEditForm({
        estado_pago: order.estado_pago || '',
        estado_envio: order.estado_envio || '',
        numero_seguimiento: order.shipment?.trackingNumber || order.shipment?.trackingNumero || '',
        empresa_envio: order.shipment?.carrier || '',
      });
    }
  }, [order]);

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Manejar actualización de estado
  const handleStatusUpdate = async () => {
    if (!order?.id) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await ordersAdminApi.updateOrderStatus(order.id, editForm);
      
      // Llamar callback para actualizar la orden en el componente padre
      if (onOrderUpdate) {
        onOrderUpdate(order.id);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      setUpdateError(error.message || 'Error al actualizar el estado de la orden');
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditForm({
      estado_pago: order.estado_pago || '',
      estado_envio: order.estado_envio || '',
      numero_seguimiento: order.shipment?.trackingNumber || order.shipment?.trackingNumero || '',
      empresa_envio: order.shipment?.carrier || '',
    });
    setIsEditing(false);
    setUpdateError(null);
  };

  // Si no hay orden seleccionada, no mostramos nada
  if (!open || !order) return null;

  const {
    number,
    status,
    createdAt,
    items = [],
    payment,
    shipment,
    address,
    userName,
    userEmail,
    userPhone,
    shipping,
    total,
  } = order;

  // Fallbacks simples para evitar undefined
  const paymentMethod = payment?.provider ?? payment?.method ?? "—";
  const deliveryService = shipment?.carrier ?? "—";
  const shippingStatus = shipment?.status ?? "—";
  const deliveredAt = shipment?.deliveredAt ?? null;
  const shippedAt = shipment?.shippedAt ?? null;
  const tracking = shipment?.trackingNumero ?? shipment?.trackingNumber ?? null;
  // Link de tracking se removió por solicitud; mantenemos sólo el número.
  const fullAddress = address
    ? [
        address.street,
        [address.commune, address.city].filter(Boolean).join(", "),
        [address.region, address.country].filter(Boolean).join(", "),
        address.postalCode,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  // Stepper helpers -----------------------------------------------------------------------------------------------
  const shippingCurrentStep = (() => {
    if (shipment?.status === "cancelled" || status === "cancelled") return 0;
    if (deliveredAt) return 2;
    if (shippedAt || shipment?.status === "in_transit" || shipment?.status === "processing" || shipment?.status === "preparing") return 1;
    return 0; // creada
  })();

  const steps = [
    { key: "created", label: "Creada", date: createdAt, icon: CalendarDays },
    { key: "shipped", label: "Enviada", date: shippedAt, icon: Truck },
    { key: "delivered", label: "Entregada", date: deliveredAt, icon: PackageCheck },
  ];

  // Micro description list rows (menos cajas, mejor legibilidad)
  const Dl = ({ children, className = "" }) => (
    <dl className={`divide-(--color-border) ${className}`}>{children}</dl>
  );
  const DlRow = ({ label, children }) => (
    <div className="grid grid-cols-3 gap-3 py-2">
      <dt className="col-span-1 text-[11px] uppercase tracking-wide text-(--color-text-muted)">{label}</dt>
      <dd className="col-span-2 text-sm leading-6">{children}</dd>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        variant="drawer"
        placement="right"
        className="w-full max-w-[720px]"
        showClose={true}
      >
        <div className="flex h-full flex-col bg-(--color-neutral2) text-(--color-text)">
          {/* Header (sticky) */}
          <header className="sticky top-0 z-10 border-b border-(--color-border) bg-white/90 px-7 py-5 backdrop-blur">
            {/* Breadcrumb si viene de cliente */}
            {breadcrumb && (
              <div className="mb-3 flex items-center gap-1 text-xs text-(--color-text-muted)">
                <span>{breadcrumb}</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-(--color-primary1)">Orden {number}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-(--color-text-muted)">
              Orden
            </p>
            <h2 className="mt-0.5 truncate font-mono text-lg font-semibold tracking-tight text-primary">
              {number ?? "Orden"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Delivery date quick glance */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-(--color-border) bg-(--surface-subtle) px-3 py-1.5 text-sm text-(--color-text)">
              <CalendarDays className="h-4 w-4 text-(--color-text-muted)" />
              <span className="whitespace-nowrap">
                {deliveredAt ? `Entrega: ${safeDate(deliveredAt)}` : shippedAt ? `Envío: ${safeDate(shippedAt)}` : "Sin fecha"}
              </span>
            </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-xs text-(--color-text-muted)">Estado</span>
              <StatusPill status={status} />
            </div>
          </div>
        </header>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Secciones en acordeón */}
          <Accordion
            className="divide-y divide-(--color-border) rounded-2xl border border-(--color-border) bg-white shadow-sm"
            sections={[
              {
                key: "status-management",
                title: "Gestión de estados",
                defaultOpen: true,
                render: () => (
                  <div className="space-y-4">
                    {/* Encabezado con botón editar */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-(--color-text)">Estados de la orden</h4>
                      <div className="flex gap-2">
                        {!isEditing ? (
                          <Button
                            appearance="outline"
                            intent="primary"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Editar estados
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              appearance="outline"
                              intent="neutral"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancelar
                            </Button>
                            <Button
                              appearance="outline"
                              intent="success"
                              size="sm"
                              onClick={handleStatusUpdate}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5"
                            >
                              <Save className="h-3.5 w-3.5" />
                              {isUpdating ? 'Guardando...' : 'Guardar'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error de actualización */}
                    {updateError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {updateError}
                      </div>
                    )}

                    {/* Formulario de estados */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Estado de pago */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
                          Estado de pago
                        </label>
                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            <Pill variant={order.estado_pago === 'pagado' ? 'success' : order.estado_pago === 'fallido' ? 'error' : 'info'}>
                              {order.estado_pago || '–'}
                            </Pill>
                          </div>
                        ) : (
                          <Select value={editForm.estado_pago} onValueChange={(value) => handleFormChange('estado_pago', value)}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {ESTADOS_PAGO_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Estado de envío */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
                          Estado de envío
                        </label>
                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            <Pill variant={order.estado_envio === 'entregado' ? 'success' : order.estado_envio === 'devuelto' ? 'error' : 'info'}>
                              {order.estado_envio || '–'}
                            </Pill>
                          </div>
                        ) : (
                          <Select value={editForm.estado_envio} onValueChange={(value) => handleFormChange('estado_envio', value)}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {ESTADOS_ENVIO_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Número de seguimiento */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
                          Número de seguimiento
                        </label>
                        {!isEditing ? (
                          <p className="text-sm font-mono text-(--color-text)">
                            {order.shipment?.trackingNumber || order.shipment?.trackingNumero || '–'}
                          </p>
                        ) : (
                          <Input
                            value={editForm.numero_seguimiento}
                            onChange={(e) => handleFormChange('numero_seguimiento', e.target.value)}
                            placeholder="Ej: CHXP123456789"
                            className="font-mono text-sm"
                          />
                        )}
                      </div>

                      {/* Empresa de courier */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
                          Empresa de courier
                        </label>
                        {!isEditing ? (
                          <p className="text-sm text-(--color-text)">
                            {order.shipment?.carrier || '–'}
                          </p>
                        ) : (
                          <Select value={editForm.empresa_envio} onValueChange={(value) => handleFormChange('empresa_envio', value)}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Seleccionar courier" />
                            </SelectTrigger>
                            <SelectContent>
                              {SHIPPING_COMPANIES.map((company) => (
                                <SelectItem key={company.id} value={company.label}>
                                  {company.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                  </div>
                ),
              },
              {
                key: "tracking",
                title: "Seguimiento del pedido",
                defaultOpen: true,
                render: () => (
                  <div className="px-2 py-3">
                    <OrderStatusTimeline 
                      order={{
                        id: order.id,
                        order_code: order.number,
                        metodo_despacho: order.shipment?.carrier === 'Retiro en tienda' ? 'retiro' : 
                                        order.shipment?.carrier === 'Express' ? 'express' : 'standard',
                        creado_en: order.createdAt,
                        fecha_entrega_estimada: order.shipment?.deliveredAt || 
                                               new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                      }} 
                    />
                  </div>
                ),
              },
              {
                key: "summary",
                title: "Resumen de la orden",
                defaultOpen: false,
                render: () => (
                  <div className="space-y-3">
                    <div className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
                      {items.length === 0 && (
                        <div className="px-4 py-3 text-sm text-(--color-text-muted)">Esta orden no tiene ítems.</div>
                      )}
                      {items.map((item, idx) => {
                        return (
                          <div key={idx} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-(--color-neutral3) text-xs text-(--color-text-muted)">
                              {item.name?.[0] ?? "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{safeText(item.name)}</p>
                              <p className="text-xs text-(--color-text-muted)">{item.quantity ?? 1} uds</p>
                            </div>
                            <div className="text-right text-sm font-medium tabular-nums">
                              <Price value={item.unitPrice ?? 0} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between">
                        <span className="text-(--color-text-muted)">Envío</span>
                        <span className="tabular-nums"><Price value={shipping ?? 0} /></span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-(--color-border) pt-2 font-medium">
                        <span>Total</span>
                        <span className="tabular-nums"><Price value={total ?? payment?.amount ?? 0} /></span>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "customer",
                title: "Cliente",
                render: () => (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Nombre</p>
                      <p className="mt-0.5 text-sm">{safeText(userName)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Email</p>
                      <p className="mt-0.5 break-all text-sm text-(--color-primary1)">{safeText(userEmail)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Teléfono</p>
                      <p className="mt-0.5 text-sm">{safeText(userPhone)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Método de pago</p>
                      <p className="mt-0.5 text-sm">{safeText(paymentMethod)}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "delivery",
                title: "Envío y entrega",
                render: () => (
                  <div className="space-y-4 text-sm">
                    {/* Stepper */}
                    <div className="relative">
                      <ol className="flex items-center justify-between gap-2">
                        {steps.map((s, idx) => {
                          const active = idx <= shippingCurrentStep;
                          const Icon = s.icon;
                          return (
                            <li key={s.key} className="flex min-w-0 flex-1 flex-col items-center">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium ${active ? "bg-(--color-primary1) text-white border-(--color-primary1)" : "bg-white text-(--color-text-muted) border-(--color-border)"}`}>
                                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-(--color-text-muted)"}`} />
                              </div>
                              <span className={`mt-1 text-[12px] ${active ? "text-(--color-primary1)" : "text-(--color-text-muted)"}`}>{s.label}</span>
                              <span className="mt-0.5 text-[10px] text-(--color-text-muted)">{safeDate(s.date)}</span>
                            </li>
                          );
                        })}
                      </ol>
                      {/* progress line */}
                      <div className="pointer-events-none absolute left-[calc(2rem-2px)] right-[calc(2rem-2px)] top-4 h-0.5 bg-(--color-border)">
                        <div
                          className="h-full bg-(--color-primary1) transition-all"
                          style={{ width: `${(shippingCurrentStep / (steps.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Panel resumen de envío */}
                    <div className="rounded-lg border border-(--color-border) bg-white/70 p-3">
                      <div className="flex items-start gap-3">
                        <Truck className="mt-0.5 h-4 w-4 text-(--color-text-muted)" />
                        <div className="min-w-0">
                          <p className="font-medium">{safeText(deliveryService)}</p>
                          <div className="mt-0.5">
                            <Pill variant={deliveredAt ? "success" : shippingStatus === "cancelled" ? "error" : "info"}>
                              {safeText(shippingStatus)}
                            </Pill>
                          </div>
                          {tracking && (
                            <p className="mt-1 text-xs text-(--color-text-muted)">Tracking: <span className="font-mono">{tracking}</span></p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-md border border-(--color-border) bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Fecha de envío</p>
                        <p className="mt-0.5">{safeDate(shippedAt)}</p>
                      </div>
                      <div className="rounded-md border border-(--color-border) bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Fecha de entrega</p>
                        <p className="mt-0.5">{safeDate(deliveredAt)}</p>
                      </div>
                      <div className="rounded-md border border-(--color-border) bg-white px-3 py-2 sm:col-span-2">
                        <p className="text-[11px] uppercase tracking-wide text-(--color-text-muted)">Dirección de envío {address?.label ? `(${address.label})` : ""}</p>
                        <p className="mt-0.5 wrap-break-word">{fullAddress ?? "–"}</p>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />

            {/* Col derecha: Meta (envío / cliente / pago) */}
            <aside className="md:col-span-4">
              {/* Envío y entrega */}
              <section className="mb-8">
                <h3 className="mb-3 text-sm font-semibold">Envío y entrega</h3>
                {/* Stepper */}
                <div className="relative">
                  <ol className="flex items-center justify-between gap-2">
                    {steps.map((s, idx) => {
                      const active = idx <= shippingCurrentStep;
                      const Icon = s.icon;
                      return (
                        <li key={s.key} className="flex min-w-0 flex-1 flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${active ? "bg-(--color-primary1) text-white border-(--color-primary1)" : "bg-white text-(--color-text-muted) border-(--color-border)"}`}>
                            <Icon className={`h-4 w-4 ${active ? "text-white" : "text-(--color-text-muted)"}`} />
                          </div>
                          <span className={`mt-1 text-[11px] ${active ? "text-(--color-primary1)" : "text-(--color-text-muted)"}`}>{s.label}</span>
                          <span className="mt-0.5 text-[10px] text-(--color-text-muted)">{safeDate(s.date)}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="pointer-events-none absolute left-[calc(1.75rem)] right-[calc(1.75rem)] top-3 h-px bg-(--color-border)">
                    <div className="h-full bg-(--color-primary1) transition-all" style={{ width: `${(shippingCurrentStep / (steps.length - 1)) * 100}%` }} />
                  </div>
                </div>

                {/* Datos de envío (lista simple) */}
                <Dl className="mt-4">
                  <DlRow label="Carrier">
                    <span className="font-medium">{safeText(deliveryService)}</span>
                    <span className="ml-2 align-middle"><Pill variant={deliveredAt ? "success" : shippingStatus === "cancelled" ? "error" : "info"}>{safeText(shippingStatus)}</Pill></span>
                  </DlRow>
                  {tracking && (
                    <DlRow label="Tracking"><span className="font-mono text-[13px] text-(--color-text-muted)">{tracking}</span></DlRow>
                  )}
                  <DlRow label="Fecha de envío">{safeDate(shippedAt)}</DlRow>
                  <DlRow label="Fecha de entrega">{safeDate(deliveredAt)}</DlRow>
                  <DlRow label={`Dirección${address?.label ? ` (${address.label})` : ""}`}>
                    <span className="wrap-break-word">{fullAddress ?? "–"}</span>
                  </DlRow>
                </Dl>
              </section>

              {/* Cliente */}
              <section className="mb-8">
                <h3 className="mb-3 text-sm font-semibold">Cliente</h3>
                <Dl>
                  <DlRow label="Nombre">{safeText(userName)}</DlRow>
                  <DlRow label="Email"><span className="text-(--color-primary1)">{safeText(userEmail)}</span></DlRow>
                  <DlRow label="Teléfono">{safeText(userPhone)}</DlRow>
                </Dl>
              </section>

              {/* Pago */}
              <section>
                <h3 className="mb-3 text-sm font-semibold">Pago</h3>
                <Dl>
                  <DlRow label="Método">{safeText(paymentMethod)}</DlRow>
                  {payment?.status && (
                    <DlRow label="Estado">
                      <Pill variant={payment.status === "captured" ? "success" : payment.status === "failed" ? "error" : "info"}>{payment.status}</Pill>
                    </DlRow>
                  )}
                </Dl>
              </section>
            </aside>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

OrdersDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  order: OrderShape,
  onClose: PropTypes.func.isRequired,
  breadcrumb: PropTypes.node,
  onOrderUpdate: PropTypes.func,
};
