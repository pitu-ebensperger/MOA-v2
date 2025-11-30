import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";

import { useAdminOrders } from '@/modules/admin/hooks/useAdminOrders.js';
import { ordersAdminApi } from '@/services/ordersAdmin.api.js';
import { useDebounce } from '@/hooks/useDebounce.js';

import { Button, IconButton, Input, Select, StatusPill, TooltipNeutral } from "@/components/ui";
import { UnifiedDataTable } from '@/components/data-display/UnifiedDataTable.jsx';
import { TableToolbar, TableSearch } from '@/components/data-display/TableToolbar.jsx';
import { buildOrderColumns } from '@/modules/admin/utils/ordersColumns.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/primitives';

import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import { useErrorHandler, useFormErrorHandler } from '@/hooks/useErrorHandler.js';
import { confirm } from '@/components/ui';
import { PAYMENT_STATUS_MAP, SHIPPING_STATUS_MAP } from '@/config/estados.js';
import { useToast } from '@/hooks/useToast.js';

// Convertir maps a arrays de opciones
const ESTADOS_PAGO_OPTIONS = Object.entries(PAYMENT_STATUS_MAP).map(([value, { label }]) => ({ value, label }));
const ESTADOS_ENVIO_OPTIONS = Object.entries(SHIPPING_STATUS_MAP).map(([value, { label }]) => ({ value, label }));

// Estados y opciones (agregar opción "Todos" a las constantes compartidas)
const ESTADOS_PAGO = [
  { value: '', label: 'Todos los pagos' },
  ...ESTADOS_PAGO_OPTIONS
];

const ESTADOS_ENVIO = [
  { value: '', label: 'Todos los envíos' },
  ...ESTADOS_ENVIO_OPTIONS
];

const METODOS_DESPACHO = [
  { value: '', label: 'Todos los métodos' },
  { value: 'standard', label: 'Standard (3-5 días)' },
  { value: 'express', label: 'Express (1-2 días)' },
  { value: 'retiro', label: 'Retiro en Tienda' },
];

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  search: '',
  estado_pago: '',
  estado_envio: '',
  metodo_despacho: '',
  fecha_desde: '',
  fecha_hasta: '',
};

const EXPORT_FORMATS = [
  { label: 'CSV', value: 'csv', extension: 'csv' },
  { label: 'JSON', value: 'json', extension: 'json' },
];

const EXPORT_CHUNK_SIZE = 200;

const EXPORT_COLUMNS = [
  { key: 'orden_id', label: 'ID orden' },
  { key: 'codigo', label: 'Código' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'estado_pago', label: 'Estado pago' },
  { key: 'estado_envio', label: 'Estado envío' },
  { key: 'metodo_pago', label: 'Método de pago' },
  { key: 'metodo_despacho', label: 'Método de despacho' },
  { key: 'total_items', label: 'Ítems' },
  { key: 'subtotal', label: 'Subtotal (CLP)' },
  { key: 'envio', label: 'Envío (CLP)' },
  { key: 'total', label: 'Total (CLP)' },
  { key: 'fecha_creacion', label: 'Creado en' },
  { key: 'fecha_actualizacion', label: 'Actualizado en' },
];

const compactFilters = (params = {}) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === '' || value === null || value === undefined) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
};

const buildExportFileName = (extension) => {
  return `pedidos-moa-${new Date().toISOString().split('T')[0]}.${extension}`;
};

const toPesos = (value, fallback) => {
  if (value !== null && value !== undefined) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  if (fallback !== null && fallback !== undefined) {
    const parsed = Number(fallback);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }
  return 0;
};


const formatEstado = (estado) => {
  if (!estado) return 'N/A';
  return estado
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w|(?:\s)\w/g, (char) => char.toUpperCase());
};

const mapOrderToExportRow = (order = {}) => {
  const totalItems =
    order.totalItems ??
    order.total_items ??
    (Array.isArray(order.items) ? order.items.length : 0);

  return {
    orden_id: order.orden_id ?? order.id ?? '',
    codigo: order.orderCode ?? order.number ?? '',
    cliente: order.userName ?? 'Sin nombre',
    email: order.userEmail ?? '',
    telefono: order.userPhone ?? '',
    estado_pago: order.estado_pago ? formatEstado(order.estado_pago) : 'N/A',
    estado_envio: order.estado_envio ? formatEstado(order.estado_envio) : 'N/A',
    metodo_pago: order.metodo_pago ? formatEstado(order.metodo_pago) : 'N/A',
    metodo_despacho: order.metodo_despacho
      ? formatEstado(order.metodo_despacho)
      : 'N/A',
    total_items: totalItems,
    subtotal: toPesos(
      order.subtotal,
      order.subtotal_cents ? order.subtotal_cents / 100 : undefined,
    ),
    envio: toPesos(
      order.shipping,
      order.envio_cents ? order.envio_cents / 100 : undefined,
    ),
    total: toPesos(
      order.total,
      order.total_cents ? order.total_cents / 100 : undefined,
    ),
    fecha_creacion: order.createdAt ?? order.creado_en ?? '',
    fecha_actualizacion: order.updatedAt ?? order.actualizado_en ?? '',
  };
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/\r?\n/g, ' ').trim();
  if (stringValue === '') return '';
  if (/[",;]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const buildCsvFromRows = (rows = []) => {
  const headers = EXPORT_COLUMNS.map((column) => column.label);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      EXPORT_COLUMNS.map((column) => escapeCsvValue(row[column.key])).join(','),
    ),
  ];
  return csvLines.join('\n');
};

const downloadBlobFile = (content, type, extension) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildExportFileName(extension);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Sin componente OrderFilters - se usa TableToolbar inline

// Componente principal
export default function OrdersAdminPage() {
  const navigate = useNavigate();
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para exportación y alertas
  const [isExporting, setIsExporting] = useState(false);
  const { success, error: showErrorToast, warning } = useToast();
  
  // Estados para edición inline
  const { handleError } = useErrorHandler({
    showAlert: false,
    defaultMessage: 'Ocurrió un problema al gestionar los pedidos',
  });
  const {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFormErrorHandler();
  const lastOrdersErrorRef = useRef(null);

  // Aplicar debounce al campo search
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedFilters = useMemo(() => {
    return { ...filters, search: debouncedSearch };
  }, [filters, debouncedSearch]);

  // Hooks para datos con filtros debounced
  const {
    orders,
    total,
    page,
    pageSize,
    isLoading,
    error,
    refetch
  } = useAdminOrders(debouncedFilters);
  useEffect(() => {
    if (!error) return;
    const signature = `${error?.message ?? ''}|${error?.status ?? ''}`;
    if (lastOrdersErrorRef.current === signature) return;
    lastOrdersErrorRef.current = signature;
    handleError(error, 'No se pudieron cargar las órdenes');
  }, [error, handleError]);

  const ordersData = orders ?? [];

  const hasActiveFilters = useMemo(() => {
    const { page: _PAGE, limit: _LIMIT, ...rest } = filters;
    return Object.values(rest).some((value) => value);
  }, [filters]);

  // Handlers
  const validateDateRange = useCallback((nextFilters) => {
    const { fecha_desde, fecha_hasta } = nextFilters;
    if (fecha_desde && fecha_hasta && fecha_desde > fecha_hasta) {
      setFieldError('fecha_rango', 'La fecha hasta debe ser igual o posterior a la fecha desde');
      return false;
    }
    clearFieldError('fecha_rango');
    return true;
  }, [setFieldError, clearFieldError]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value, page: key === 'page' ? value : 1 };
      if (key === 'fecha_desde' || key === 'fecha_hasta') {
        validateDateRange(next);
      }
      return next;
    });
  }, [validateDateRange]);

  const handlePageChange = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const resetFilters = useCallback(() => {
    clearAllErrors();
    setFilters({ ...DEFAULT_FILTERS });
  }, [clearAllErrors]);

  const fetchOrdersForExport = useCallback(async () => {
    // Re-fetch all rows (not just current page) so los archivos incluyen filtros activos.
    const filtersWithoutPagination = { ...filters };
    delete filtersWithoutPagination.page;
    delete filtersWithoutPagination.limit;

    const baseParams = {
      ...compactFilters(filtersWithoutPagination),
      order_by: 'creado_en',
      order_dir: 'DESC',
    };

    const collected = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await ordersAdminApi.getAll({
        ...baseParams,
        limit: EXPORT_CHUNK_SIZE,
        offset,
      });

      const chunk = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      if (chunk.length) {
        collected.push(...chunk);
      }

      const pagination = response?.pagination;
      const limitUsed = pagination?.limit ?? EXPORT_CHUNK_SIZE;
      const totalAvailable = pagination?.total ?? collected.length;

      offset += limitUsed;

      if (chunk.length === 0) {
        hasMore = false;
      } else if (pagination) {
        hasMore = offset < totalAvailable;
      } else {
        hasMore = chunk.length === limitUsed;
      }
    }

    return collected;
  }, [filters]);

  const handleViewDetails = useCallback((order) => {
    navigate(`/admin/orders/${order.orden_id}`);
  }, [navigate]);

  const handleCancelOrder = useCallback(async (order) => {
    const orderId = order?.orden_id ?? order?.id;
    if (!orderId) return;

    const label = order?.order_code ?? order?.number ?? orderId;
    const confirmed = await confirm.delete(
      label ? `¿Cancelar la orden ${label}?` : "¿Cancelar esta orden?",
      "Esta acción no se puede deshacer"
    );

    if (!confirmed) {
      return;
    }

    try {
      await ordersAdminApi.updateStatus(orderId, {
        estado_pago: 'cancelado',
        motivo_cambio: 'Cancelado por administrador',
      });
      success('Orden cancelada correctamente');
      refetch();
    } catch (error) {
      showErrorToast(error?.message || 'No se pudo cancelar la orden');
    }
  }, [handleError, refetch, success, showErrorToast]);

  const handleExport = useCallback(async (format) => {
    if (ordersData.length === 0) {
      warning('No hay órdenes para exportar');
      return;
    }

    try {
      setIsExporting(true);
      const exportOrders = await fetchOrdersForExport();

      if (!exportOrders.length) {
        warning('No hay datos para exportar con los filtros actuales');
        return;
      }

      const formattedRows = exportOrders.map(mapOrderToExportRow);
      const targetFormat = format ?? 'csv';

      if (targetFormat === 'json') {
        downloadBlobFile(
          JSON.stringify(formattedRows, null, 2),
          'application/json',
          'json',
        );
      } else {
        const csvContent = buildCsvFromRows(formattedRows);
        downloadBlobFile(csvContent, 'text/csv;charset=utf-8;', 'csv');
      }

      const formatConfig = EXPORT_FORMATS.find((item) => item.value === targetFormat);
      success(`${formatConfig?.label ?? targetFormat.toUpperCase()} listo para descargar`);
    } catch (error) {
      showErrorToast(error?.message || 'Error al exportar pedidos');
    } finally {
      setIsExporting(false);
    }
  }, [fetchOrdersForExport, ordersData.length, warning, success, showErrorToast]);

  const toolbar = useMemo(
    () => () => (
      <TableToolbar>
        <TableSearch
          value={filters.search || ''}
          onChange={(v) => handleFilterChange('search', v)}
          placeholder="Buscar por código, cliente, email…"
          className="flex-1 max-w-2xl"
        />
        <div className="ml-auto flex items-center gap-2">
          <TooltipNeutral label="Filtros avanzados" position="bottom">
            <IconButton
              appearance="ghost"
              intent={showAdvancedFilters ? "primary" : "neutral"}
              size="sm"
              icon={<Filter className="h-4 w-4" />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-label="Filtros avanzados"
              className={showAdvancedFilters ? "bg-(--color-primary1)/10" : ""}
            />
          </TooltipNeutral>
          <TooltipNeutral label="Refrescar pedidos" position="bottom">
            <IconButton
              appearance="ghost"
              intent="neutral"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={refetch}
              aria-label="Refrescar pedidos"
            />
          </TooltipNeutral>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                appearance="solid"
                intent="primary"
                size="sm"
                leadingIcon={<Download className="h-4 w-4" />}
                loading={isExporting}
                disabled={ordersData.length === 0 || isExporting}
                aria-label="Exportar pedidos"
              >
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {EXPORT_FORMATS.map((format) => (
                <DropdownMenuItem
                  key={format.value}
                  onSelect={() => handleExport(format.value)}
                >
                  {format.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableToolbar>
    ),
    [filters.search, showAdvancedFilters, isExporting, ordersData.length, handleFilterChange, refetch, handleExport]
  );
  const tableColumns = useMemo(
    () =>
      buildOrderColumns({
        onOpen: handleViewDetails,
        onCancel: handleCancelOrder,
      }),
    [handleViewDetails, handleCancelOrder],
  );

  const emptyStateMessage = hasActiveFilters ? (
    <div className="flex flex-col items-center gap-3 text-(--text-secondary1)">
      <p>No se encontraron órdenes con los filtros aplicados.</p>
      <Button
        appearance="outline"
        intent="primary"
        size="sm"
        onClick={resetFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  ) : (
    <div className="text-(--text-secondary1)">Aún no se han registrado órdenes en el sistema.</div>
  );

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar órdenes
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error.message || 'Ha ocurrido un error inesperado'}
              </div>
              <div className="mt-3">
                <Button
                  appearance="outline"
                  intent="error"
                  size="sm"
                  onClick={refetch}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Pedidos" />

      {/* Filtros Avanzados */}
      {showAdvancedFilters && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Estado de Pago
              </label>
              <Select
                value={filters.estado_pago || ''}
                onChange={(e) => handleFilterChange('estado_pago', e.target.value)}
                options={ESTADOS_PAGO}
                fullWidth
                placeholder="Selecciona una opción"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Estado de Envío
              </label>
              <Select
                value={filters.estado_envio || ''}
                onChange={(e) => handleFilterChange('estado_envio', e.target.value)}
                options={ESTADOS_ENVIO}
                fullWidth
                placeholder="Selecciona una opción"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Método de Despacho
              </label>
              <Select
                value={filters.metodo_despacho || ''}
                onChange={(e) => handleFilterChange('metodo_despacho', e.target.value)}
                options={METODOS_DESPACHO}
                fullWidth
                placeholder="Selecciona una opción"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Fecha desde
              </label>
              <Input
                type="date"
                value={filters.fecha_desde || ''}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Fecha hasta
              </label>
              <Input
                type="date"
                value={filters.fecha_hasta || ''}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                className="w-full"
              />
              {fieldErrors.fecha_rango && (
                <p className="text-sm text-[#cc5f49] mt-1">{fieldErrors.fecha_rango}</p>
              )}
            </div>

            <div className="flex items-end">
              <Button
                appearance="outline"
                intent="neutral"
                size="sm"
                onClick={resetFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      <UnifiedDataTable
        data={ordersData}
        columns={tableColumns}
        loading={isLoading}
        emptyMessage={emptyStateMessage}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        toolbar={toolbar}
        variant="card"
        maxHeight="calc(100vh - 280px)"
      />

    </div>
  );
}
