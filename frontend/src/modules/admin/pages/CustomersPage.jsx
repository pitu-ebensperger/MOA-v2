import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@config/react-query";
import { Mail, Phone, Calendar, RefreshCw, UserPlus, MoreHorizontal, Eye, Edit3, ShoppingBag, LayoutGrid, Rows } from "lucide-react";
import { toast } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce.js';
import CustomerDrawer from "@/modules/admin/components/CustomerDrawer.jsx"
import OrdersDrawer from "@/modules/admin/components/OrdersDrawer.jsx"
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable.jsx";
import { TableToolbar, TableSearch } from "@/components/data-display/TableToolbar.jsx";
import { Button, IconButton } from "@/components/ui/Button.jsx"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/primitives";
import { USER_STATUS_MAP } from "@/config/status-maps.js";
import { ordersAdminApi } from "@/services/ordersAdmin.api.js"
import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { TooltipNeutral } from "@/components/ui/Tooltip.jsx";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/primitives";
import { Input } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select.jsx";
import { customersAdminApi } from "@/services/customersAdmin.api.js";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import { ResponsiveRowActions } from "@/components/ui/ResponsiveRowActions.jsx";

const USER_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  ...Object.entries(USER_STATUS_MAP).map(([value, { label }]) => ({
    value,
    label,
  })),
];

const STATUS_FILTER_OPTIONS = USER_STATUS_OPTIONS.filter((option) => option.value);
const NEW_CUSTOMER_INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: STATUS_FILTER_OPTIONS[0]?.value ?? "activo",
};

const normalizeCustomerRecord = (customer = {}) => {
  const nameParts = String(customer.nombre ?? "").split(" ").filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  return {
    ...customer,
    status: customer.status ?? "activo",
    firstName,
    lastName,
    phone: customer.telefono ?? customer.phone ?? "",
  };
};

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" o "grid"
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const [onOrderUpdateCallback, setOnOrderUpdateCallback] = useState(null);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState(NEW_CUSTOMER_INITIAL);
  const [isCreatingSubmitting, setIsCreatingSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", email: "", telefono: "", status: "activo" });
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  const limit = 10; // Reducir a 10 para mejor visualización

  const {
    data: customersResponse,
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["admin-customers", page, limit, debouncedSearch],
    queryFn: () => customersAdminApi.list({ page, limit, search }),
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

  const customersData = customersResponse?.data ?? null;
  const customersList = useMemo(() => customersData?.items ?? [], [customersData?.items]);
  const totalCustomers = customersData?.total ?? customersList.length;
  const pageSize = customersData?.pageSize ?? limit;
  const pageCount = Math.max(1, Math.ceil(totalCustomers / pageSize));

  // Cargar orden completa desde backend cuando se solicita
  const loadFullOrder = async (order) => {
    try {
      const data = await ordersAdminApi.getById(order.id);
      return {
        ...data,
        userName: data.userName || data.nombre_cliente || data.cliente_nombre || "—",
        userEmail: data.userEmail || data.email_cliente || data.cliente_email || "—",
        userPhone: data.userPhone || data.telefono_cliente || data.cliente_telefono || "—",
      };
    } catch (err) {
      console.error("Error cargando orden", err);
      return { ...order };
    }
  };

  const resetNewCustomerForm = useCallback(() => {
    setNewCustomerForm(NEW_CUSTOMER_INITIAL);
  }, []);

  const handleCancelNewCustomer = useCallback(() => {
    resetNewCustomerForm();
    setIsCreatingCustomer(false);
  }, [resetNewCustomerForm]);

  const handleCreateCustomer = useCallback(
    async (event) => {
      event.preventDefault();
      setIsCreatingSubmitting(true);
      try {
        const payload = {
          nombre:
            `${newCustomerForm.firstName.trim()} ${newCustomerForm.lastName.trim()}`.trim() ||
            newCustomerForm.firstName.trim(),
          email: newCustomerForm.email.trim(),
          telefono: newCustomerForm.phone.trim(),
          status: newCustomerForm.status || "activo",
          rol_code: "CLIENT",
        };
        const response = await customersAdminApi.create(payload);
        const createdCustomer = response?.data?.data ?? response?.data ?? response;
        setSelectedCustomer(normalizeCustomerRecord(createdCustomer));
        refetchCustomers();
        setIsCreatingCustomer(false);
        resetNewCustomerForm();
        setPage(1);
      } catch (error) {
        console.error("Error creando cliente:", error);
        toast.error(error?.message ?? "No se pudo crear el cliente");
      } finally {
        setIsCreatingSubmitting(false);
      }
    },
    [newCustomerForm, resetNewCustomerForm, refetchCustomers, setPage, setSelectedCustomer],
  );

  const handleNewCustomerChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setNewCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchCustomers();
  }, [refetchCustomers]);

  const handleViewOrder = async (order, onOrderUpdateCb) => {
    const customer = selectedCustomer;
    setBreadcrumb(customer ? customer.nombre : null);
    const fullOrder = await loadFullOrder(order);
    setSelectedOrder(fullOrder);
    setOnOrderUpdateCallback(() => onOrderUpdateCb);
  };

  const handleCloseOrder = () => {
    setSelectedOrder(null);
    setBreadcrumb(null);
    setOnOrderUpdateCallback(null);
  };

  const enhancedCustomers = useMemo(
    () => customersList.map(normalizeCustomerRecord),
    [customersList],
  );

  const filteredCustomers = useMemo(() => {
    if (!statusFilter) return enhancedCustomers;
    return enhancedCustomers.filter((customer) => customer.status === statusFilter);
  }, [enhancedCustomers, statusFilter]);

  const handleStatusChange = useCallback(
    async (customerId, newStatus) => {
      try {
        await customersAdminApi.update(customerId, { status: newStatus });
        refetchCustomers();
        toast.success('Estado actualizado correctamente');
      } catch (error) {
        console.error("Error cambiando estado de cliente:", error);
        toast.error(error?.message ?? "No se pudo actualizar el estado del cliente");
      }
    },
    [refetchCustomers],
  );

  const customerColumns = useMemo(() => [
    {
      accessorKey: "nombre",
      header: "Nombre",
      size: 220,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-neutral-900 truncate" title={customer.nombre}>
              {customer.nombre || "—"}
            </span>
            {customer.phone && (
              <span className="text-xs text-neutral-500 truncate">{customer.phone}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Correo",
      size: 260,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-0">
          <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
          <span className="text-xs text-neutral-600 truncate" title={row.original.email}>
            {row.original.email || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "orderCount",
      header: "Pedidos",
      size: 110,
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = Number.isFinite(row.original.orderCount)
          ? row.original.orderCount
          : Number(row.original.orderCount ?? 0) || 0;
        return (
          <div className="flex items-center justify-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" />
            <span className="font-semibold tabular-nums">{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      size: 160,
      meta: { align: "center" },
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="cursor-pointer transition-opacity hover:opacity-80"
                aria-label="Cambiar estado"
              >
                <StatusPill status={customer.status} domain="user" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {USER_STATUS_OPTIONS.filter((opt) => opt.value).map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => handleStatusChange(customer.id, option.value)}
                  className="flex items-center justify-between gap-2"
                >
                  <StatusPill status={option.value} domain="user" />
                  {customer.status === option.value && (
                    <span className="text-(--color-primary1)">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registro",
      size: 170,
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-neutral-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate_ddMMyyyy(row.original.createdAt)}</span>
        </div>
      ),
    },
  ], [handleStatusChange]);

  const handleOpenEditDialog = useCallback((customer) => {
    setEditingCustomer(customer);
    setEditForm({
      nombre: customer?.nombre ?? "",
      email: customer?.email ?? "",
      telefono: customer?.telefono ?? "",
      status: customer?.status ?? "activo",
    });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditingCustomer(null);
    setEditForm({ nombre: "", email: "", telefono: "", status: "activo" });
  }, []);

  const handleEditFormChange = useCallback((field) => (event) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  }, []);

  const handleUpdateCustomer = useCallback(
    async (event) => {
      event.preventDefault();
      if (!editingCustomer) return;
      setIsEditingSubmitting(true);
      try {
        const payload = {
          nombre: editForm.nombre.trim(),
          email: editForm.email.trim(),
          telefono: editForm.telefono.trim(),
          status: editForm.status,
        };
        const response = await customersAdminApi.update(editingCustomer.id, payload);
        const updated = response?.data?.data ?? response?.data ?? response;
        setSelectedCustomer(normalizeCustomerRecord(updated));
        refetchCustomers();
        handleCloseEditDialog();
        toast.success('Cliente actualizado correctamente');
      } catch (error) {
        console.error("Error editando cliente:", error);
        toast.error(error?.message ?? "No se pudo actualizar el cliente");
      } finally {
        setIsEditingSubmitting(false);
      }
    },
    [editingCustomer, editForm, refetchCustomers, handleCloseEditDialog, setSelectedCustomer],
  );

  const toolbar = useMemo(
    () => () => (
      <TableToolbar>
        <TableSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          } }
          placeholder="Buscar por nombre, email…"
          className="flex-1 max-w-2xl" />
        <div className="w-48">
          <Select
            label="Estado"
            size="sm"
            variant="ghost"
            placeholder=""
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            options={USER_STATUS_OPTIONS}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-md border border-(--color-border) p-0.5">
            <TooltipNeutral label="List" position="bottom">
              <IconButton
                appearance="ghost"
                intent={viewMode === "list" ? "primary" : "neutral"}
                size="sm"
                icon={<Rows className="h-4 w-4" />}
                onClick={() => setViewMode("list")}
                aria-label="Vista lista"
                className={viewMode === "list" ? "bg-(--color-primary1)/10" : ""}
              />
            </TooltipNeutral>
            <TooltipNeutral label="Grid" position="bottom">
              <IconButton
                appearance="ghost"
                intent={viewMode === "grid" ? "primary" : "neutral"}
                size="sm"
                icon={<LayoutGrid className="h-4 w-4" />}
                onClick={() => setViewMode("grid")}
                aria-label="Vista grid"
                className={viewMode === "grid" ? "bg-(--color-primary1)/10" : ""}
              />
            </TooltipNeutral>
          </div>
          <TooltipNeutral label="Refrescar clientes" position="bottom">
            <IconButton
              appearance="ghost"
              intent="neutral"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRefresh}
              aria-label="Refrescar clientes"
            />
          </TooltipNeutral>
          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            leadingIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsCreatingCustomer(true)}
          >
            Nuevo cliente
          </Button>
        </div>
      </TableToolbar>
    ),
    [search, statusFilter, viewMode, handleRefresh, handleStatusFilter]
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Clientes"
      />

      {/* Tabla con toolbar integrado */}
      {viewMode === "list" ? (
        <div>
          {/* Toolbar */}
          {toolbar(null)}
          
          <UnifiedDataTable
            data={filteredCustomers}
            columns={customerColumns}
            loading={isLoadingCustomers}
            emptyMessage="No se encontraron clientes"
            className="mt-4"
          />
          
          {/* Paginación */}
          {totalCustomers > pageSize && !isLoadingCustomers && filteredCustomers.length > 0 && (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600">
                  Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCustomers)} de {totalCustomers} clientes
                </p>
                <div className="flex gap-2">
                  <Button
                    appearance="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    appearance="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => setPage(page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Toolbar */}
          {toolbar(null)}
          
          {/* Grid View */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCustomers.map((customer) => {
              const orderCount =
                Number.isFinite(customer.orderCount)
                  ? customer.orderCount
                  : Number(customer.orderCount ?? customer.orders?.length ?? 0) || 0;
              return (
                <div
                  key={customer.id}
                  className="rounded-lg border border-(--color-border) bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-(--text-strong)">
                        {customer.nombre}
                      </h3>
                      <p className="mt-0.5 text-xs text-(--text-muted)">{customer.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 hover:bg-(--surface-subtle)">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedCustomer(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenEditDialog(customer)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-3 space-y-2 text-sm">
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-(--text-weak)">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-(--text-weak)">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{orderCount} pedidos</span>
                    </div>
                    <div className="flex items-center gap-2 text-(--text-weak)">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate_ddMMyyyy(customer.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-(--color-border)">
                    <StatusPill status={customer.status} />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination for grid */}
          {totalCustomers > pageSize && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  appearance="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-(--text-weak)">
                  Página {page} de {pageCount}
                </span>
                <Button
                  appearance="ghost"
                  size="sm"
                  disabled={page >= pageCount}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawers */}
      <CustomerDrawer
        open={!!selectedCustomer && !selectedOrder}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onViewOrder={handleViewOrder}
      />

      <OrdersDrawer
        open={!!selectedOrder}
        order={selectedOrder}
        onClose={handleCloseOrder}
        breadcrumb={breadcrumb}
        onOrderUpdate={onOrderUpdateCallback}
      />

      <Dialog
        open={isCreatingCustomer}
        onOpenChange={(open) => {
          if (!open) handleCancelNewCustomer();
        }}
      >
        <DialogContent className="space-y-4 max-w-lg">
          <DialogTitle>Nuevo cliente</DialogTitle>
          <p className="text-sm text-(--color-text-muted)">
            Registra manualmente a un cliente y prepara el payload para conectar con el backend cuando esté disponible.
          </p>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={newCustomerForm.firstName}
                onChange={handleNewCustomerChange("firstName")}
                required
              />
              <Input
                label="Apellido"
                value={newCustomerForm.lastName}
                onChange={handleNewCustomerChange("lastName")}
                required
              />
            </div>
            <Input
              label="Correo"
              type="email"
              value={newCustomerForm.email}
              onChange={handleNewCustomerChange("email")}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              value={newCustomerForm.phone}
              onChange={handleNewCustomerChange("phone")}
            />
            <div className="space-y-1">
              <label htmlFor="new-customer-status" className="text-xs font-semibold text-(--color-text-muted)">Estado</label>
              <select
                id="new-customer-status"
                value={newCustomerForm.status}
                onChange={handleNewCustomerChange("status")}
                className="w-full rounded-lg border border-(--color-border) bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-(--color-primary1) focus:bg-white"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="px-0">
              <Button appearance="ghost" intent="neutral" onClick={handleCancelNewCustomer} type="button">
                Cancelar
              </Button>
              <Button
                appearance="solid"
                intent="primary"
                type="submit"
                disabled={isCreatingSubmitting}
              >
                {isCreatingSubmitting ? "Creando..." : "Crear cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(editingCustomer)}
        onOpenChange={(open) => {
          if (!open) handleCloseEditDialog();
        }}
      >
        <DialogContent className="space-y-4 max-w-lg">
          <DialogTitle>Editar cliente</DialogTitle>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={editForm.nombre}
                onChange={handleEditFormChange("nombre")}
                required
              />
              <Input
                label="Correo"
                type="email"
                value={editForm.email}
                onChange={handleEditFormChange("email")}
                required
              />
            </div>
            <Input
              label="Teléfono"
              type="tel"
              value={editForm.telefono}
              onChange={handleEditFormChange("telefono")}
            />
            <div className="space-y-1">
              <label htmlFor="edit-customer-status" className="text-xs font-semibold text-(--color-text-muted)">Estado</label>
              <select
                id="edit-customer-status"
                value={editForm.status}
                onChange={handleEditFormChange("status")}
                className="w-full rounded-lg border border-(--color-border) bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-(--color-primary1) focus:bg-white"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter className="px-0">
              <Button appearance="ghost" intent="neutral" onClick={handleCloseEditDialog} type="button">
                Cancelar
              </Button>
              <Button
                appearance="solid"
                intent="primary"
                type="submit"
                disabled={isEditingSubmitting}
              >
                {isEditingSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
