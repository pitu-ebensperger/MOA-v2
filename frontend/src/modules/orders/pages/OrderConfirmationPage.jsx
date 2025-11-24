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

import { Button } from "@/components/ui/Button.jsx"
import { Spinner } from "@/components/ui/Spinner.jsx"
import { Badge } from "@/components/ui/Badge.jsx"
import { getOrderById } from "@/services/checkout.api.js"
import { API_PATHS } from "@/config/api-paths.js"
import { formatCurrencyCLP } from "@/utils/currency.js"
import { formatDate_ddMMyyyy } from "@/utils/date.js"

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
    <main className="page min-h-screen bg-neutral-50 py-8 md:py-16">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-6 md:p-10 space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-(--color-success) to-green-600 shadow-lg shadow-green-500/50">
            <CheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-(--color-primary1)">
              ¡Compra confirmada!
            </h1>
            <p className="text-base md:text-lg text-(--color-text-secondary) max-w-2xl mx-auto">
              Tu pedido <span className="font-semibold text-(--color-primary1)">#{orderCode}</span> ha sido recibido exitosamente
            </p>
          </div>
          {order && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Badge variant={getStatusBadge(orderStatus).variant} className="text-sm px-4 py-1.5">
                {getStatusBadge(orderStatus).label}
              </Badge>
              {trackingNumber && (
                <Badge variant="outline" className="text-sm px-4 py-1.5">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  Tracking: {trackingNumber.slice(0, 12)}...
                </Badge>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !order && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
            <Spinner size="lg" />
            <p className="text-(--color-text-secondary)">Cargando detalles de tu pedido...</p>
          </div>
        )}

        {/* Order Details */}
        {!loading && order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Quick Info Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 flex items-center gap-4 bg-neutral-50 rounded-xl p-4">
                <Calendar className="h-6 w-6 text-(--color-primary1)" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Fecha de pedido</p>
                  <p className="text-lg font-bold text-(--color-primary1)">{formatDate_ddMMyyyy(order?.createdAt ?? order?.created_at) || "-"}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-4 bg-green-50 rounded-xl p-4">
                <Truck className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Entrega estimada</p>
                  <p className="text-lg font-bold text-green-600">{formattedEstimatedDelivery || "Próximamente"}</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-4 bg-linear-to-br from-(--color-primary1) to-(--color-primary2) rounded-xl p-4">
                <CreditCard className="h-6 w-6 text-white" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80 mb-1">Total pagado</p>
                  <p className="text-2xl font-bold text-white">{summary ? formatCurrencyCLP(summary.total) : '$0'}</p>
                </div>
              </div>
            </div>

            {/* Main Content - Single Column */}
            <div className="space-y-8">
              {/* Shipping & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-(--color-primary1)/10">
                      <MapPin className="h-5 w-5 text-(--color-primary1)" />
                    </div>
                    <h2 className="text-lg font-bold text-(--color-primary1)">Dirección de envío</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-(--text-strong)">{order?.userName ?? order?.usuario_nombre ?? "Cliente"}</p>
                      <div className="mt-2 space-y-1 text-sm text-neutral-700">
                        {order?.address?.street && (<p className="flex items-start gap-2"><span className="text-neutral-400 mt-0.5">•</span>{order.address.street}</p>)}
                        {(order?.address?.commune || order?.address?.city) && (<p className="flex items-start gap-2"><span className="text-neutral-400 mt-0.5">•</span>{[order.address.commune, order.address.city].filter(Boolean).join(", ")}</p>)}
                        {order?.address?.region && (<p className="flex items-start gap-2"><span className="text-neutral-400 mt-0.5">•</span>{order.address.region}</p>)}
                      </div>
                    </div>
                    {order?.userEmail && (<div className="pt-3 border-t border-neutral-200"><div className="flex items-center gap-2 text-sm text-neutral-600"><Mail className="h-4 w-4" /><span className="truncate">{order.userEmail}</span></div></div>)}
                    {order?.address?.telefono_contacto && (<div className="flex items-center gap-2 text-sm text-neutral-600"><Phone className="h-4 w-4" /><span>{order.address.telefono_contacto}</span></div>)}
                    {(order?.notas_cliente || order?.notes) && (<div className="pt-3 border-t border-neutral-200"><p className="text-xs font-semibold text-neutral-500 mb-1">Notas:</p><p className="text-sm italic text-neutral-600">"{order.notas_cliente ?? order.notes}"</p></div>)}
                  </div>
                </div>
                {/* Payment & Shipping Method */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-blue-100"><CreditCard className="h-5 w-5 text-blue-600" /></div><h3 className="text-sm font-semibold text-neutral-700">Método de pago</h3></div>
                      <p className="text-base font-medium text-(--text-strong) ml-11">{paymentLabel}</p>
                      {order?.payment?.status && (<Badge variant="outline" className="ml-11 mt-2">{order.payment.status}</Badge>)}
                    </div>
                    <div className="border-t border-neutral-200 pt-4"><div className="flex items-center gap-3 mb-3"><div className="p-2 rounded-lg bg-green-100"><Truck className="h-5 w-5 text-green-600" /></div><h3 className="text-sm font-semibold text-neutral-700">Método de envío</h3></div><p className="text-base font-medium text-(--text-strong) ml-11">{shippingMethod}</p></div>
                  </div>
                  {/* Tracking Info */}
                  {trackingNumber && (<div className="bg-linear-to-br from-(--color-primary2) to-(--color-primary1) rounded-xl p-4 text-white mt-6"><div className="flex items-center gap-3 mb-3"><Package className="h-5 w-5" /><h3 className="text-sm font-semibold">Número de seguimiento</h3></div><p className="text-lg font-mono font-bold break-all">{trackingNumber}</p>{order?.shipment?.carrier && (<p className="text-sm text-white/80 mt-2">Courier: {order.shipment.carrier}</p>)}{trackingUrl && (<Button as="a" href={trackingUrl} target="_blank" rel="noreferrer" appearance="solid" intent="neutral" className="w-full mt-4 bg-white text-(--color-primary1) hover:bg-neutral-100">Ver tracking en tiempo real</Button>)}</div>)}
                </div>
              </div>
              {/* Products & Summary */}
              <div className="space-y-8">
                {/* Products List */}
                <div>
                  <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-lg bg-(--color-primary1)/10"><ShoppingBag className="h-5 w-5 text-(--color-primary1)" /></div><h2 className="text-xl font-bold text-(--color-primary1)">Productos ({items.length})</h2></div>
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const { value, quantity } = resolveItemUnit(item);
                      const name = item.producto_nombre ?? item.nombre ?? item.name ?? "Producto";
                      const imageUrl = item.imagen_url ?? item.image ?? null;
                      return (
                        <article key={`${name}-${index}`} className="flex items-start gap-4 rounded-xl border border-neutral-200 p-4 hover:border-(--color-primary1) hover:shadow-md transition-all duration-200">
                          {imageUrl && (
                            <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                              <img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={(e) => {e.target.style.display = 'none'}} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-(--text-strong) truncate">{name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-neutral-500">Cantidad: <span className="font-semibold text-neutral-700">{quantity}</span></span>
                              <span className="text-xs text-neutral-400">•</span>
                              <span className="text-xs text-neutral-500">{formatCurrencyCLP(value)} c/u</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-(--color-primary1)">{formatCurrencyCLP(value * quantity)}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-bold text-(--color-primary1) mb-4">Resumen del pedido</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2"><span className="flex items-center gap-2 text-sm text-neutral-600"><Package className="h-4 w-4" />Subtotal</span><span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary?.subtotal ?? 0)}</span></div>
                    <div className="flex items-center justify-between py-2"><span className="flex items-center gap-2 text-sm text-neutral-600"><Truck className="h-4 w-4" />Envío</span><span className="font-semibold text-(--text-strong)">{summary?.shipping > 0 ? formatCurrencyCLP(summary.shipping) : (<span className="text-green-600">Gratis</span>)}</span></div>
                    {summary?.tax > 0 && (<div className="flex items-center justify-between py-2"><span className="flex items-center gap-2 text-sm text-neutral-600"><Receipt className="h-4 w-4" />Impuestos</span><span className="font-semibold text-(--text-strong)">{formatCurrencyCLP(summary.tax)}</span></div>)}
                    <div className="border-t-2 border-neutral-200 pt-4 mt-2"><div className="flex items-center justify-between"><span className="text-lg font-bold text-(--color-primary1)">Total</span><span className="text-2xl font-bold text-(--color-primary1)">{formatCurrencyCLP(summary?.total ?? 0)}</span></div></div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <Button appearance="solid" intent="primary" className="w-full" onClick={() => globalThis.print()}><Download className="h-4 w-4 mr-2" />Descargar comprobante</Button>
                  <Button appearance="outline" intent="primary" className="w-full" onClick={() => navigate(API_PATHS.auth.profile)}><ShoppingBag className="h-4 w-4 mr-2" />Ver mis pedidos</Button>
                  <Button appearance="outline" intent="neutral" className="w-full sm:col-span-2" onClick={() => navigate("/", { replace: true })}><Home className="h-4 w-4 mr-2" />Volver a inicio</Button>
                </div>
              </div>
            </div>
            {/* Email Notification Notice */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2"><Mail className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-semibold text-blue-900">Confirmación enviada</h3></div>
              <p className="text-sm text-blue-700">Hemos enviado un correo de confirmación a <span className="font-semibold">{order?.userEmail ?? 'tu email'}</span> con todos los detalles de tu pedido.</p>
              <p className="text-xs text-blue-600 mt-2">Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  )
}

export default OrderConfirmationPage
