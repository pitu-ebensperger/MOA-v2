//path/frontend/src/modules/admin/utils/productsColumns.jsx
import { AlertTriangle, Eye, Edit3, Copy, Trash2, Filter, Check } from "lucide-react";
import { formatCurrencyCLP } from "@/utils/formatters/currency.js"
import { StatusPill } from "@/components/ui/StatusPill.jsx"
import { LOW_STOCK_THRESHOLD } from "@/config/constants.js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/radix/DropdownMenu.jsx";
import { ResponsiveRowActions } from "@/components/ui/ResponsiveRowActions.jsx"



export function buildProductColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  categoryMap,
  statusFilterValue,
  statusFilterOptions = [],
  onStatusFilterChange,
  categoryFilterValue,
  categoryFilterOptions = [],
  onCategoryFilterChange,
}) {
  const ColumnFilterHeader = ({ title, value, onChange, options = [] }) => {
    const hasFilter = typeof onChange === "function" && options.length > 0;
    const normalizedValue = value ? String(value) : "";

    if (!hasFilter) {
      return <span>{title}</span>;
    }

    return (
      <div className="flex items-center gap-1.5">
        <span>{title}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Filtrar ${title.toLowerCase()}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              className={`rounded-full border border-transparent p-1 transition ${normalizedValue ? "bg-(--color-primary4)/40 text-(--color-primary1)" : "text-(--color-secondary2) hover:text-(--color-primary1)"}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onSelect={() => onChange("")}
              className="justify-between text-(--color-secondary2)"
            >
              <span>Todos</span>
              {!normalizedValue && <Check className="h-4 w-4 text-(--color-primary1)" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {options.map((option) => {
              const optionValue = option.value ?? "";
              const optionLabel = option.label ?? optionValue;
              const isActive = normalizedValue && String(optionValue) === normalizedValue;
              return (
                <DropdownMenuItem
                  key={`${optionValue}-${optionLabel}`}
                  onSelect={() => onChange(optionValue)}
                  className="justify-between text-(--color-secondary2)"
                >
                  <span>{optionLabel}</span>
                  {isActive && <Check className="h-4 w-4 text-(--color-primary1)" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return [
    {
      accessorKey: "name",
      header: "Producto",
      size: 320,
      minSize: 240,
      cell: ({ row }) => {
        const product = row.original;
        const thumbnail = product.imgUrl ?? product.gallery?.[0] ?? null;
        const fallbackInitial = product.name?.[0]?.toUpperCase() ?? "M";
        return (
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-(--surface-subtle)">
              {thumbnail ? (
                <img src={thumbnail} alt={product.name ?? "Producto"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-(--text-muted)">
                  {fallbackInitial}
                </div>
              )}
            </div>
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-(--text-strong)">
                {product.name}
              </span>
              <span className="text-[11px] tracking-[0.15em] text-(--text-muted)">
                {product.sku}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: () => (
        <ColumnFilterHeader
          title="Categoría"
          value={categoryFilterValue}
          options={categoryFilterOptions}
          onChange={onCategoryFilterChange}
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const label =
          (categoryMap && categoryMap[product.fk_category_id]) || "General";
        return (
          <span className="px-1 py-2 text-sm text-(--text-weak)">{label}</span>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original;
        const isLowStock =
          typeof product.stock === "number" &&
          product.stock <= LOW_STOCK_THRESHOLD;

        return (
          <div
            className={`flex items-center gap-1 px-1 py-2 text-sm font-semibold ${
              isLowStock ? "text-(--color-error)" : "text-(--text-strong)"
            }`}
          >
            {product.stock ?? "—"}
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-(--color-error)" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <ColumnFilterHeader
          title="Estado"
          value={statusFilterValue}
          options={statusFilterOptions}
          onChange={onStatusFilterChange}
        />
      ),
      cell: ({ row }) => {
        const product = row.original;
        const status = (product.status ?? "activo").toLowerCase();
        return (
          <div className="px-1 py-2">
            <StatusPill status={status} domain="product" />
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ getValue }) => {
        const price = getValue();
        return (
          <span className="px-1 py-2 text-sm text-(--text-strong)">
            {formatCurrencyCLP(price)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      meta: { align: "right" },
      cell: ({ row }) => {
        const product = row.original;

        return (
          <div className="px-1 py-2 flex justify-end">
            <ResponsiveRowActions
              actions={(() => {
                const actions = [];
                if (onView) {
                  actions.push({
                    key: "view",
                    label: "Ver detalle",
                    icon: Eye,
                    onAction: () => onView(product),
                  });
                }
                if (onEdit) {
                  actions.push({
                    key: "edit",
                    label: "Editar producto",
                    icon: Edit3,
                    onAction: () => onEdit(product),
                  });
                }
                if (onDuplicate) {
                  actions.push({
                    key: "duplicate",
                    label: "Duplicar",
                    icon: Copy,
                    onAction: () => onDuplicate(product),
                  });
                }
                if (onDelete) {
                  actions.push({
                    key: "delete",
                    label: "Eliminar",
                    icon: Trash2,
                    onAction: () => onDelete(product),
                    danger: true,
                    separatorBefore: true,
                  });
                }
                return actions;
              })()}
              menuLabel={`Acciones para ${product.name}`}
            />
          </div>
        );
      },
    },
  ];
}
