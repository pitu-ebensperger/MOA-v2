import { formatDate_ddMMyyyy } from "@/utils/formatters/date.js"
import { formatCurrencyCLP } from "@/utils/formatters/currency.js"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/radix/DropdownMenu.jsx"
import { Eye, XCircle } from "lucide-react";
import { ResponsiveRowActions } from "@/components/ui/ResponsiveRowActions.jsx";

export const buildOrderColumns = ({ onOpen, onUpdateStatus, onCancel }) => [
  {
    accessorKey: "number",
    header: "Orden",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.number || "-"}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.createdAt
          ? formatDate_ddMMyyyy(row.original.createdAt)
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    enableSorting: true,
    meta: { align: "right" },
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.original.total !== null && row.original.total !== undefined)
          ? formatCurrencyCLP(row.original.total)
          : "-"}
      </span>
    ),
  },
  {
    accessorKey: "items",
    header: "Ítems",
    enableSorting: false,
    meta: { align: "center" },
    cell: ({ row }) => {
      const count = Array.isArray(row.original.items)
        ? row.original.items.length
        : 0;
      return <span className="tabular-nums font-semibold">{count}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    enableSorting: true,
    cell: ({ row }) => {
      const order = row.original;
      const canUpdateStatus = order.status !== "cancelled" && order.status !== "fulfilled";

      if (!canUpdateStatus) {
        return <StatusPill status={order.status} />;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="cursor-pointer transition-opacity hover:opacity-80"
              aria-label="Cambiar estado de orden"
            >
              <StatusPill status={order.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "pending")}>
              Pendiente
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "processing")}>
              Procesando
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "shipped")}>
              Enviada
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdateStatus?.(order, "fulfilled")}>
              Completada
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onUpdateStatus?.(order, "cancelled")}
              className="text-red-600 focus:text-red-600"
            >
              Cancelada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    enableSorting: false,
    meta: { align: "right" },
    cell: ({ row }) => {
      const order = row.original;
      const canCancel = order.status !== "cancelled" && order.status !== "fulfilled";

      const actions = [
        {
          key: "view",
          label: "Ver detalle",
          icon: Eye,
          onAction: () => onOpen?.(order),
        },
      ];

      if (canCancel) {
        actions.push({
          key: "cancel",
          label: "Cancelar orden",
          icon: XCircle,
          onAction: () => onCancel?.(order),
          danger: true,
          separatorBefore: true,
        });
      }

      return (
        <div className="px-1 py-2 flex justify-end">
          <ResponsiveRowActions
            actions={actions}
            menuLabel="Acciones de orden"
          />
        </div>
      );
    },
  },
];
