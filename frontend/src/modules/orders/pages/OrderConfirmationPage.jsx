import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Receipt, 
  MapPin, 
  Calendar,
  CreditCard,
  Download,
  Home,
  ShoppingBag,
  Mail,
  Phone
} from "lucide-react"

import { Button, Spinner, Badge } from "@/components/ui"
import { getOrderById } from "@/services/checkout.api.js"
import { API_PATHS } from "@/config/app.routes.js"
import { formatCurrencyCLP } from "@/utils/formatters/currency.js"
import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js"

// ⚠️ NOTA: Algunos valores legacy no coinciden con DDL actual
// DDL válido: 'preparacion' | 'enviado' | 'en_transito' | 'entregado' | 'cancelado'
const DELIVERY_STATUS_DAYS = {
  delivered: 0,
  entregado: 0,
  in_transit: 2,
  en_transito: 2,
  // 'processing' y 'empaquetado' NO existen en DDL
  processing: 3, // legacy - mapear a 'preparacion'
  preparing: 4,
  preparacion: 4,
  empaquetado: 4, // legacy - no existe en DDL
  shipped: 2,
  enviado: 2,
  cancelled: 0,
  cancelado: 0,
}

const DAY_MS = 24 * 60 * 60 * 1000
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null
  if (typeof value === "number" && Number.isFinite(value)) return value

  const src = typeof value === "string" ? value : String(value)
  let cleaned = ""
  for (const ch of src) {
    if (ch === "." || ch === "-" || (ch >= "0" && ch <= "9")) cleaned += ch
  }

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

const toClpValue = (value, { fromCents = false } = {}) => {
  const parsed = parseNumber(value)
  if (parsed === null) return null
  return fromCents ? parsed / 100 : parsed
}

const pickAmount = (...entries) => {
  for (const entry of entries) {
    if (!entry) continue
    const amount = toClpValue(entry.value, { fromCents: entry.fromCents })
    if (amount !== null) return amount
  }
  return 0
}

const formatLongDate = (value) => {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : LONG_DATE_FORMATTER.format(date)
}

const getTrackingNumber = (order) => {
  return order?.shipment?.trackingNumero ?? order?.shipment?.trackingNumber ?? order?.numero_seguimiento ?? null
}

const getTrackingUrl = (trackingNumber) => {
  if (!trackingNumber) return null
  return `https://tracking.moa.cl/${trackingNumber}`
}

const getEstimatedDelivery = (order) => {
  if (!order) return null
  if (order.shipment?.deliveredAt) {
    const delivered = new Date(order.shipment.deliveredAt)
    if (!Number.isNaN(delivered.getTime())) return delivered
  }

  const base = order.shipment?.shippedAt ?? order.createdAt
  const reference = base ? new Date(base) : new Date()
  if (Number.isNaN(reference.getTime())) return null

  const statusKey = String(order.shipment?.status ?? "").toLowerCase()
  const offsetDays = DELIVERY_STATUS_DAYS[statusKey] ?? 5
  return new Date(reference.getTime() + offsetDays * DAY_MS)
}

const resolveItemUnit = (item) => {
  if (!item) return { value: 0, quantity: 1 }
  const quantity = parseNumber(item.quantity ?? item.cantidad ?? item.qty) ?? 1
  if (item.unitPrice !== undefined) {
    return { value: toClpValue(item.unitPrice) ?? 0, quantity }
  }
  if (item.precio_unit !== undefined) {
    return { value: toClpValue(item.precio_unit, { fromCents: true }) ?? 0, quantity }
  }
  if (item.precio_unit_cents !== undefined) {
    return { value: toClpValue(item.precio_unit_cents, { fromCents: true }) ?? 0, quantity }
  }
  if (item.precio !== undefined) {
    return { value: toClpValue(item.precio) ?? 0, quantity }
  }
  return { value: 0, quantity }
}

const getItemsSubtotal = (items = []) => {
  return items.reduce((acc, item) => {
    const { value, quantity } = resolveItemUnit(item)
    return acc + value * quantity
  }, 0)
}

export const OrderConfirmationPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    setError("")

    getOrderById(orderId)
      .then((payload) => setOrder(payload?.data ?? payload))
      .catch((err) => setError(err?.message ?? "No fue posible recuperar la orden"))
      .finally(() => setLoading(false))
  }, [orderId])

  const summary = useMemo(() => {
    if (!order) return null
    const itemsSubtotal = getItemsSubtotal(order.items)

    const subtotal = pickAmount(
      { value: order.subtotal },
      { value: order.subtotal_cents, fromCents: true },
      { value: itemsSubtotal }
    )

    const shipping = pickAmount(
      { value: order.shipping },
      { value: order.envio_cents, fromCents: true },
      { value: order.shipping_cost },
      { value: order.envio },
      { value: order.shippingFee }
    )

    const tax = pickAmount(
      { value: order.tax },
      { value: order.impuestos_cents, fromCents: true },
      { value: order.tax_cents, fromCents: true }
    )

    const total = pickAmount(
      { value: order.total },
      { value: order.total_cents, fromCents: true },
      { value: subtotal + shipping + tax }
    )

    return { subtotal, shipping, tax, total }
  }, [order])

  const items = order?.items ?? []
  const estimatedDelivery = useMemo(() => getEstimatedDelivery(order), [order])
  const formattedEstimatedDelivery = formatLongDate(estimatedDelivery)
  const trackingNumber = getTrackingNumber(order)
  const trackingUrl = getTrackingUrl(trackingNumber)

  const paymentLabel =
    order?.payment?.provider ?? order?.metodo_pago ?? "Pago por confirmar con nuestro equipo"

  const shippingMethod = order?.shipment?.carrier ?? order?.metodo_despacho ?? "Despacho estándar"
  
  const orderCode = order?.order_code ?? order?.number ?? order?.id ?? "-"
  const orderStatus = order?.estado_pago ?? order?.status ?? "pending"
  
  const getStatusBadge = (status) => {
    // ⚠️ Estados válidos DDL: 'pendiente' | 'pagado' | 'rechazado' | 'reembolsado'
    const statusConfig = {
      completado: { label: 'Pagado', variant: 'success' },
      pagado: { label: 'Pagado', variant: 'success' },
      pending: { label: 'Pendiente', variant: 'warning' },
      pendiente: { label: 'Pendiente', variant: 'warning' },
      processing: { label: 'Pendiente', variant: 'info' }, // legacy - mapear a pendiente
      cancelled: { label: 'Rechazado', variant: 'danger' },
      rechazado: { label: 'Rechazado', variant: 'danger' },
      approved: { label: 'Pagado', variant: 'success' },
      reembolsado: { label: 'Reembolsado', variant: 'default' }
    }
    return statusConfig[status?.toLowerCase()] ?? { label: status, variant: 'default' }
  }

  return (
    <main className="page min-h-screen bg-(--color-light) py-12">
      <div className="mx-auto w-full max-w-5xl px-4">
        {/* Success Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-success)/10">
            <CheckCircle className="h-8 w-8 text-(--color-success)" strokeWidth={2} />
          </div>
          <h1 className="font-serif text-3xl text-(--text-strong)">
            ¡Compra confirmada!
          </h1>
          <p className="text-base text-(--text-secondary1)">
            Tu pedido <span className="font-semibold text-(--color-primary1)">#{orderCode}</span> ha sido recibido exitosamente
          </p>
          {order && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Badge variant={getStatusBadge(orderStatus).variant} className="text-sm">
                {getStatusBadge(orderStatus).label}
              </Badge>
              {trackingNumber && (
                <Badge variant="outline" className="text-sm">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  {trackingNumber}
                </Badge>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-(--color-error) bg-(--color-error)/5 p-6 text-center">
            <p className="text-(--color-error) font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !order && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Spinner size="lg" />
            <p className="text-(--text-secondary1)">Cargando detalles de tu pedido...</p>
          </div>
        )}

        {/* Order Details */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Quick Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/75 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-(--text-secondary1)">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">Fecha de pedido</p>
                </div>
                <p className="text-lg font-semibold text-(--text-strong)">{formatDate_ddMMyyyy(order?.createdAt ?? order?.created_at) || "-"}</p>
              </div>
              <div className="bg-white/75 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-(--text-secondary1)">
                  <Truck className="h-4 w-4" />
                  <p className="text-sm">Entrega estimada</p>
                </div>
                <p className="text-lg font-semibold text-(--text-strong)">{formattedEstimatedDelivery || "Próximamente"}</p>
              </div>
              <div className="bg-white/75 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-(--text-secondary1)">
                  <CreditCard className="h-4 w-4" />
                  <p className="text-sm">Total pagado</p>
                </div>
                <p className="text-xl font-bold text-(--color-primary1)">{summary ? formatCurrencyCLP(summary.total) : '$0'}</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Shipping & Payment */}
              <div className="lg:col-span-1 space-y-4">
                {/* Shipping Address */}
                <div className="bg-white/75 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-(--color-primary1)" />
                    <h2 className="font-semibold text-(--text-strong)">Dirección de envío</h2>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-(--text-strong)">{order?.userName ?? order?.usuario_nombre ?? "Cliente"}</p>
                    <div className="space-y-1 text-(--text-secondary1)">
                      {order?.address?.street && <p>{order.address.street}</p>}
                      {(order?.address?.commune || order?.address?.city) && <p>{[order.address.commune, order.address.city].filter(Boolean).join(", ")}</p>}
                      {order?.address?.region && <p>{order.address.region}</p>}
                    </div>
                    {order?.userEmail && (
                      <div className="pt-3 border-t border-(--border) flex items-center gap-2 text-(--text-secondary1)">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{order.userEmail}</span>
                      </div>
                    )}
                    {order?.address?.telefono_contacto && (
                      <div className="flex items-center gap-2 text-(--text-secondary1)">
                        <Phone className="h-4 w-4" />
                        <span>{order.address.telefono_contacto}</span>
                      </div>
                    )}
                    {(order?.notas_cliente || order?.notes) && (
                      <div className="pt-3 border-t border-(--border)">
                        <p className="text-xs font-semibold text-(--text-secondary1) mb-1">Notas:</p>
                        <p className="text-sm italic text-(--text-secondary1)">"{order.notas_cliente ?? order.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white/75 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-(--color-primary1)" />
                    <h3 className="font-semibold text-(--text-strong)">Método de pago</h3>
                  </div>
                  <p className="text-sm text-(--text-secondary1)">{paymentLabel}</p>
                  {order?.payment?.status && <Badge variant="outline" className="mt-2">{order.payment.status}</Badge>}
                </div>

                {/* Shipping Method */}
                <div className="bg-white/75 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-5 w-5 text-(--color-primary1)" />
                    <h3 className="font-semibold text-(--text-strong)">Método de envío</h3>
                  </div>
                  <p className="text-sm text-(--text-secondary1)">{shippingMethod}</p>
                </div>

                {/* Tracking Info */}
                {trackingNumber && (
                  <div className="bg-(--color-primary1) rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="h-5 w-5" />
                      <h3 className="font-semibold">Seguimiento</h3>
                    </div>
                    <p className="text-sm font-mono break-all mb-2">{trackingNumber}</p>
                    {order?.shipment?.carrier && <p className="text-xs text-white/80 mb-3">Courier: {order.shipment.carrier}</p>}
                    {trackingUrl && (
                      <Button as="a" href={trackingUrl} target="_blank" rel="noreferrer" size="sm" className="w-full bg-white text-(--color-primary1) hover:bg-white/90">
                        Ver tracking
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Products & Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Products List */}
                <div className="bg-white/75 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ShoppingBag className="h-5 w-5 text-(--color-primary1)" />
                    <h2 className="font-serif text-xl text-(--text-strong)">Productos ({items.length})</h2>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const { value, quantity } = resolveItemUnit(item);
                      const name = item.producto_nombre ?? item.nombre ?? item.name ?? "Producto";
                      const imageUrl = item.imagen_url ?? item.image ?? null;
                      return (
                        <div key={`${name}-${index}`} className="flex items-start gap-4 pb-3 border-b border-(--border) last:border-0 last:pb-0">
                          {imageUrl && (
                            <div className="w-16 h-16 rounded-lg bg-(--color-light) flex items-center justify-center overflow-hidden shrink-0">
                              <img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={(e) => {e.target.style.display = 'none'}} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-(--text-strong) text-sm">{name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-(--text-secondary1)">
                              <span>Cantidad: {quantity}</span>
                              <span>•</span>
                              <span>{formatCurrencyCLP(value)} c/u</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-(--color-primary1)">{formatCurrencyCLP(value * quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/75 rounded-2xl p-6">
                  <h3 className="font-serif text-lg text-(--text-strong) mb-4">Resumen del pedido</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-(--text-secondary1)">Subtotal</span>
                      <span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary?.subtotal ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-(--text-secondary1)">Envío</span>
                      <span className="font-semibold text-(--text-strong)">{summary?.shipping > 0 ? formatCurrencyCLP(summary.shipping) : <span className="text-(--color-success)">Gratis</span>}</span>
                    </div>
                    {summary?.tax > 0 && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-(--text-secondary1)">Impuestos</span>
                        <span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary.tax)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-(--border) pt-4 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-(--text-strong)">Total</span>
                        <span className="text-2xl font-bold text-(--color-primary1)">{formatCurrencyCLP(summary?.total ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button appearance="solid" intent="primary" className="w-full" onClick={() => globalThis.print()}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button appearance="outline" intent="primary" className="w-full" onClick={() => navigate(API_PATHS.auth.profile)}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Mis pedidos
              </Button>
              <Button appearance="outline" intent="neutral" className="w-full" onClick={() => navigate("/", { replace: true })}>
                <Home className="h-4 w-4 mr-2" />
                Volver a inicio
              </Button>
            </div>

            {/* Email Notification Notice */}
            <div className="bg-(--color-primary4)/50 rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-(--color-primary1)" />
                <h3 className="font-semibold text-(--text-strong)">Confirmación enviada</h3>
              </div>
              <p className="text-sm text-(--text-secondary1)">
                Hemos enviado un correo de confirmación a <span className="font-semibold">{order?.userEmail ?? 'tu email'}</span> con todos los detalles de tu pedido.
              </p>
              <p className="text-xs text-(--text-secondary1) mt-2">Si no lo encuentras, revisa tu carpeta de spam.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default OrderConfirmationPage
