import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Edit,
  Save,
  X,
} from "lucide-react";

import { ordersAdminApi } from '@/services/ordersAdmin.api.js';
import { Button } from '@/components/ui/Button.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { StatusPill } from '@/components/ui/StatusPill.jsx';
import { formatCurrencyCLP } from '@/utils/currency.js';
import { formatDateTime } from '@/utils/date.js';
import AdminPageHeader from '@/modules/admin/components/AdminPageHeader.jsx';
import { PAYMENT_STATUS_MAP, SHIPPING_STATUS_MAP } from '@/config/status-maps.js';

// Convertir maps a arrays de opciones para el Select
const ESTADOS_PAGO_OPTIONS = Object.entries(PAYMENT_STATUS_MAP).map(([value, label]) => ({ value, label }));
const ESTADOS_ENVIO_OPTIONS = Object.entries(SHIPPING_STATUS_MAP).map(([value, label]) => ({ value, label }));

// Estados de pago y envío (importados desde constantes compartidas)
const ESTADOS_PAGO = ESTADOS_PAGO_OPTIONS;
const ESTADOS_ENVIO = ESTADOS_ENVIO_OPTIONS;

// Mapeo de colores para estados
const getStatusColor = (estado, tipo) => {
  if (tipo === 'pago') {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'procesando': return 'info';
      case 'pagado': return 'success';
      case 'fallido': return 'error';
      case 'reembolsado': return 'neutral';
      case 'cancelado': return 'error';
      default: return 'neutral';
    }
  } else if (tipo === 'envio') {
    switch (estado) {
      case 'preparacion': return 'warning';
      case 'empaquetado': return 'info';
      case 'enviado': return 'info';
      case 'en_transito': return 'primary';
      case 'entregado': return 'success';
      case 'devuelto': return 'error';
      default: return 'neutral';
    }
  }
  return 'neutral';
};

const formatEstado = (estado) => {
  if (!estado) return 'N/A';
  return estado
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w|(?:\s)\w/g, (char) => char.toUpperCase());
};

// Stepper de progreso
const OrderProgressStepper = ({ estadoEnvio, estadoPago }) => {
  const steps = [
    {
      id: 'preparacion',
      label: 'En Preparación',
      icon: Clock,
      description: 'Orden recibida',
    },
    {
      id: 'empaquetado',
      label: 'Empaquetado',
      icon: Package,
      description: 'Empaquetando productos',
    },
    {
      id: 'enviado',
      label: 'Enviado',
      icon: Truck,
      description: 'En camino',
    },
    {
      id: 'entregado',
      label: 'Entregado',
      icon: CheckCircle2,
      description: 'Orden completada',
    },
  ];

  const getCurrentStepIndex = () => {
    const stepMap = {
      'preparacion': 0,
      'empaquetado': 1,
      'enviado': 2,
      'en_transito': 2,
      'entregado': 3,
      'devuelto': -1,
    };
    return stepMap[estadoEnvio] ?? 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isDevuelto = estadoEnvio === 'devuelto';
  const isPagoCancelado = estadoPago === 'cancelado' || estadoPago === 'fallido';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h3 className="mb-6 text-lg font-semibold text-(--text-strong)">
        Progreso del Pedido
      </h3>
      
      {(isDevuelto || isPagoCancelado) && (
        <div className="mb-4 rounded-xl border border-(--color-error) bg-(--color-error)/10 px-4 py-3 text-sm text-(--color-error)">
          {isDevuelto && 'Esta orden ha sido devuelta.'}
          {isPagoCancelado && 'El pago de esta orden ha sido cancelado o falló.'}
        </div>
      )}

      <div className="relative">
        {/* Línea de progreso */}
        <div className="absolute left-6 top-0 h-full w-0.5 bg-neutral-200" />
        <div 
          className="absolute left-6 top-0 w-0.5 bg-(--color-primary1) transition-all duration-500"
          style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Pasos */}
        <div className="relative space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div
                  className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'border-(--color-primary1) bg-(--color-primary1) text-white'
                      : 'border-neutral-300 bg-white text-neutral-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 pt-2">
                  <h4
                    className={`text-sm font-semibold ${
                      isCompleted ? 'text-(--text-strong)' : 'text-(--text-muted)'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p
                    className={`text-xs ${
                      isCurrent ? 'text-(--color-primary1)' : 'text-(--text-secondary1)'
                    }`}
                  >
                    {isCurrent ? 'En proceso' : step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    estado_pago: '',
    estado_envio: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ordersAdminApi.getById(orderId);
        setOrder(data);
        setEditValues({
          estado_pago: data.estado_pago,
          estado_envio: data.estado_envio,
        });
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Error al cargar la orden');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValues({
      estado_pago: order.estado_pago,
      estado_envio: order.estado_envio,
    });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await ordersAdminApi.updateOrderStatus(orderId, editValues);
      setOrder(prev => ({ ...prev, ...editValues }));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el estado');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="text-sm text-(--text-muted)">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Detalle de Orden"
          actions={
            <Button
              appearance="ghost"
              intent="neutral"
              size="sm"
              leadingIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/admin/orders')}
            >
              Volver
            </Button>
          }
        />
        <div className="rounded-xl border border-(--color-error) bg-(--color-error)/10 p-6 text-center">
          <p className="text-(--color-error)">
            {error || 'No se pudo cargar la orden'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Orden ${order.order_code}`}
        actions={
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Button
                  appearance="ghost"
                  intent="neutral"
                  size="sm"
                  leadingIcon={<X className="h-4 w-4" />}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  appearance="solid"
                  intent="primary"
                  size="sm"
                  leadingIcon={<Save className="h-4 w-4" />}
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  appearance="outline"
                  intent="primary"
                  size="sm"
                  leadingIcon={<Edit className="h-4 w-4" />}
                  onClick={handleStartEdit}
                >
                  Editar Estado
                </Button>
                <Button
                  appearance="ghost"
                  intent="neutral"
                  size="sm"
                  leadingIcon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() => navigate('/admin/orders')}
                >
                  Volver
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text-strong)">
              <User className="h-5 w-5" />
              Información del Cliente
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-(--text-muted)" />
                <div>
                  <p className="text-sm font-medium text-(--text-strong)">
                    {order.usuario_nombre || 'N/A'}
                  </p>
                  <p className="text-xs text-(--text-secondary1)">Nombre completo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-(--text-muted)" />
                <div>
                  <p className="text-sm font-medium text-(--text-strong)">
                    {order.usuario_email || 'N/A'}
                  </p>
                  <p className="text-xs text-(--text-secondary1)">Correo electrónico</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-(--text-muted)" />
                <div>
                  <p className="text-sm font-medium text-(--text-strong)">
                    {order.usuario_telefono || 'N/A'}
                  </p>
                  <p className="text-xs text-(--text-secondary1)">Teléfono</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la orden */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text-strong)">
              <FileText className="h-5 w-5" />
              Detalles de la Orden
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-(--text-secondary1)">Código de orden</p>
                  <p className="font-mono text-sm font-semibold text-(--text-strong)">
                    {order.order_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-secondary1)">Fecha de creación</p>
                  <p className="text-sm font-medium text-(--text-strong)">
                    {formatDateTime(order.creado_en)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-secondary1)">Total</p>
                  <p className="text-lg font-bold text-(--color-primary1)">
                    {formatCurrencyCLP(order.total_cents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-secondary1)">Items</p>
                  <p className="text-sm font-medium text-(--text-strong)">
                    {order.total_items ?? 0} {order.total_items === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs text-(--text-secondary1)">Estado de Pago</p>
                    {isEditing ? (
                      <Select
                        value={editValues.estado_pago}
                        onChange={(e) =>
                          setEditValues(prev => ({ ...prev, estado_pago: e.target.value }))
                        }
                        className="w-full"
                      >
                        {ESTADOS_PAGO.map(estado => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <StatusPill
                        status={order.estado_pago}
                        intent={getStatusColor(order.estado_pago, 'pago')}
                        size="md"
                      >
                        {formatEstado(order.estado_pago)}
                      </StatusPill>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-(--text-secondary1)">Estado de Envío</p>
                    {isEditing ? (
                      <Select
                        value={editValues.estado_envio}
                        onChange={(e) =>
                          setEditValues(prev => ({ ...prev, estado_envio: e.target.value }))
                        }
                        className="w-full"
                      >
                        {ESTADOS_ENVIO.map(estado => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <StatusPill
                        status={order.estado_envio}
                        intent={getStatusColor(order.estado_envio, 'envio')}
                        size="md"
                      >
                        {formatEstado(order.estado_envio)}
                      </StatusPill>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          {(order.comuna || order.ciudad || order.region) && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text-strong)">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-(--text-strong)">
                  {order.calle || 'Sin calle especificada'}
                </p>
                <p className="text-sm text-(--text-secondary1)">
                  {order.comuna}
                  {order.ciudad && `, ${order.ciudad}`}
                  {order.region && `, ${order.region}`}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
                  <Truck className="h-4 w-4 text-(--text-muted)" />
                  <span className="text-xs text-(--text-secondary1)">
                    Método: {formatEstado(order.metodo_despacho) || 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notas del cliente */}
          {order.notas_cliente && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-(--text-strong)">
                <FileText className="h-5 w-5" />
                Notas del Cliente
              </h3>
              <p className="text-sm text-(--text-secondary1)">{order.notas_cliente}</p>
            </div>
          )}
        </div>

        {/* Columna lateral - Stepper */}
        <div>
          <OrderProgressStepper
            estadoEnvio={isEditing ? editValues.estado_envio : order.estado_envio}
            estadoPago={isEditing ? editValues.estado_pago : order.estado_pago}
          />
        </div>
      </div>
    </div>
  );
}
