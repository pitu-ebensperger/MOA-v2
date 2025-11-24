import React, { useState, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ChevronUp, ChevronDown, ListFilter, Pencil, Check, X } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination.jsx";
import { IconButton } from "@/components/ui/Button.jsx";
import { InputSm } from "@/components/ui/Input.jsx";
import { ResponsiveRowActions } from "@/components/ui/ResponsiveRowActions.jsx";

/**
 * UnifiedDataTable - Componente de tabla unificado para MOA
 * 
 * Combina las mejores características de DataTableV2, TanstackDataTable y VirtualizedTable:
 * - TanStack Table v8 como base
 * - Virtualización OPCIONAL para grandes datasets (+100 rows)
 * - Diseño consistente con estética MOA
 * - Todas las features: sorting, filtering, pagination, selection, inline editing, actions
 * - Toolbar integrado opcional
 * - Soporte para paginación manual (backend) o automática (client-side)
 * - Densidad ajustable (compact, normal, comfortable)
 * 
 * @example
 * // Tabla básica con paginación
 * <UnifiedDataTable
 *   columns={columns}
 *   data={data}
 *   loading={loading}
 * />
 * 
 * @example
 * // Tabla virtualizada para grandes datasets
 * <UnifiedDataTable
 *   columns={columns}
 *   data={largeData}
 *   virtualized
 *   estimatedRowHeight={60}
 * />
 * 
 * @example
 * // Tabla con todas las features
 * <UnifiedDataTable
 *   columns={columns}
 *   data={data}
 *   selectable
 *   editable
 *   rowActions={actions}
 *   toolbar={<UnifiedTableToolbar />}
 *   onPageChange={handlePageChange}
 *   page={page}
 *   pageSize={pageSize}
 *   total={total}
 * />
 */
export function UnifiedDataTable({
  // Data & Columns
  columns,
  data,
  loading = false,
  emptyMessage = "Sin resultados",

  // Pagination (manual or auto)
  page,
  pageSize,
  total,
  onPageChange,
  enablePagination = true,

  // Sorting
  onSortChange,

  // Filtering
  enableFiltering = false,
  globalFilter,
  onGlobalFilterChange,

  // Row Selection
  selectable = false,
  onSelectionChange,
  rowSelection: controlledRowSelection,

  // Inline Editing
  editable = false,
  onCommitEdit,

  // Row Actions
  rowActions = [],

  // Virtualization
  virtualized = false,
  estimatedRowHeight = 60,
  overscan = 5,

  // Styling
  variant = "card", // card | plain
  density = "normal", // compact | normal | comfortable
  maxHeight,
  className = "",
  condensed, // deprecated: use density instead

  // Toolbar
  toolbar,

  // Advanced
  meta,
  enableColumnVisibility = true,
  onRowClick,
}) {
  // Internal state
  const [sorting, setSorting] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [internalRowSelection, setInternalRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const tableContainerRef = useRef(null);

  // Determine if pagination is manual (controlled by parent)
  const manualPaginationEnabled = onPageChange && Number.isFinite(page) && Number.isFinite(pageSize);
  
  const paginationState = manualPaginationEnabled
    ? { pageIndex: Math.max(0, page - 1), pageSize }
    : undefined;

  // Build table state
  const tableState = {
    sorting,
    columnVisibility,
    ...(manualPaginationEnabled && { pagination: paginationState }),
    ...(enableFiltering && { globalFilter }),
    rowSelection: controlledRowSelection ?? internalRowSelection,
  };

  // Augment columns with selection and actions
  const augmentedColumns = useMemo(() => {
    const cols = [...columns];

    // Add selection column
    if (selectable) {
      cols.unshift({
        id: "_select",
        size: 44,
        enableHiding: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Seleccionar todos"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={(e) => table.toggleAllRowsSelected(e.target.checked)}
            className="cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Seleccionar fila"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            className="cursor-pointer"
          />
        ),
        meta: { align: "center" },
      });
    }

    // Add actions column
    if (rowActions && (Array.isArray(rowActions) ? rowActions.length > 0 : true)) {
      cols.push({
        id: "_actions",
        size: 80,
        enableHiding: false,
        header: () => <span className="sr-only">Acciones</span>,
        meta: { align: "right" },
        cell: ({ row }) => {
          const actions = typeof rowActions === "function" ? rowActions(row.original) : rowActions;

          if (!actions || actions.length === 0) return null;

          const preparedActions = actions.map((action, idx) => ({
            ...action,
            key: action.key ?? `row-action-${idx}`,
            onAction: () => action.onAction?.(row.original),
          }));

          return (
            <ResponsiveRowActions
              actions={preparedActions}
              menuLabel="Acciones del registro"
              menuContentClassName="w-44"
            />
          );
        },
      });
    }

    return cols;
  }, [columns, selectable, rowActions]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns: augmentedColumns,
    state: tableState,

    // Sorting
    onSortingChange: (updater) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const [first] = next ?? [];
        if (onSortChange && first?.id) {
          onSortChange(first.id, first.desc ? "desc" : "asc");
        }
        return next;
      });
    },

    // Filtering
    ...(enableFiltering && {
      onGlobalFilterChange,
      globalFilterFn: "includesString",
    }),

    // Pagination
    manualPagination: manualPaginationEnabled,
    getPaginationRowModel: manualPaginationEnabled || !enablePagination ? undefined : getPaginationRowModel(),

    // Row Selection
    enableRowSelection: selectable,
    onRowSelectionChange: (updater) => {
      const setter = controlledRowSelection !== undefined ? onSelectionChange : setInternalRowSelection;
      
      setter?.((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        
        if (onSelectionChange && controlledRowSelection === undefined) {
          const selected = Object.keys(next)
            .filter((key) => next[key])
            .map((key) => {
              const r = table.getRowModel().rowsById[key];
              return r?.original;
            })
            .filter(Boolean);
          onSelectionChange(selected);
        }
        
        return next;
      });
    },

    // Column Visibility
    enableColumnVisibility,
    onColumnVisibilityChange: setColumnVisibility,

    // Core models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),

    // Meta
    meta: {
      ...meta,
      isRowEditing: (rowId) => !!editingRows[rowId],
    },
  });

  // Get rows
  const { rows } = table.getRowModel();

  // Virtualizer setup (only if virtualized=true)
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan,
    enabled: virtualized,
  });

  const virtualRows = virtualized ? rowVirtualizer.getVirtualItems() : null;
  const totalSize = virtualized ? rowVirtualizer.getTotalSize() : 0;

  // Pagination calculations
  const totalPages =
    manualPaginationEnabled && Number.isFinite(total) && Number.isFinite(pageSize) && pageSize > 0
      ? Math.max(1, Math.ceil(total / pageSize))
      : undefined;

  const showPagination = enablePagination && !virtualized && manualPaginationEnabled && Number.isFinite(totalPages);

  // Determine row height based on density
  const densityClass = condensed
    ? "h-10"
    : density === "compact"
    ? "h-10"
    : density === "comfortable"
    ? "h-16"
    : "h-14";

  const paddingYClass =
    density === "compact" ? "py-1.5" : density === "comfortable" ? "py-3.5" : "py-2.5";

  // Container styles
  const containerClasses =
    variant === "card"
      ? "rounded-3xl border border-(--color-border) bg-white/95 shadow-sm"
      : "border border-(--color-border) rounded-xl overflow-hidden";

  const tableScrollStyle = maxHeight
    ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }
    : virtualized
    ? { height: "600px" }
    : undefined;

  // Toolbar render
  const toolbarContent = typeof toolbar === "function" ? toolbar(table) : toolbar;

  // Render helpers
  const renderHeaderCell = (header) => {
    const metaAlign = header.column.columnDef.meta?.align;
    const align =
      metaAlign === "right" ? "text-right" : metaAlign === "center" ? "text-center" : "text-left";
    const canSort = header.column.getCanSort();
    const sorted = header.column.getIsSorted();
    const headerMeta = header.column.columnDef.meta?.header || {};
    const filterActive = header.column.getIsFiltered?.() ?? false;
    const filterIconClass = `text-(--color-secondary1) transition ${
      filterActive ? "opacity-100" : "opacity-40"
    }`;

    return (
      <th
        key={header.id}
        colSpan={header.colSpan}
        style={{ width: header.getSize() }}
        className={`px-3 py-2 font-semibold ${align}`}
      >
        {header.isPlaceholder ? null : (
          <div
            role={canSort ? "button" : undefined}
            tabIndex={canSort ? 0 : undefined}
            onKeyDown={
              canSort
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      header.column.toggleSorting();
                    }
                  }
                : undefined
            }
            className={`inline-flex items-center gap-1 ${
              canSort ? "cursor-pointer select-none hover:text-(--color-primary1)" : ""
            }`}
            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {canSort &&
              (sorted === "asc" ? (
                headerMeta.sortIcons?.asc ?? <ChevronUp size={18} className="opacity-70" />
              ) : sorted === "desc" ? (
                headerMeta.sortIcons?.desc ?? <ChevronDown size={18} className="opacity-70" />
              ) : (
                headerMeta.sortIcons?.unsorted ?? <ArrowUpDown size={18} className="opacity-40" />
              ))}
            {header.column.columnDef.meta?.filterable && (
              <IconButton
                aria-label="Filtrar"
                size="xs"
                intent="neutral"
                appearance="ghost"
                className="ml-1"
                icon={<ListFilter size={14} className={filterIconClass} />}
                onClick={(e) => {
                  e.stopPropagation();
                  header.column.columnDef.meta.onFilterClick?.(header.getContext());
                }}
              />
            )}
          </div>
        )}
      </th>
    );
  };

  const renderCell = (cell, row) => {
    const meta = cell.column.columnDef.meta || {};
    const metaAlign = meta.align;
    const align =
      metaAlign === "right" ? "text-right" : metaAlign === "center" ? "text-center" : "text-left";
    const isEditing = editable && editingRows[row.id] && meta.editable;
    const isActionsCell = cell.column.id === "_actions";

    return (
      <td key={cell.id} className={`px-3 ${paddingYClass} ${isActionsCell ? "" : align}`}>
        {isActionsCell ? (
          <div className="flex justify-end">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-1">
            <InputSm
              value={editingRows[row.id][cell.column.id] ?? cell.getValue() ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setEditingRows((prev) => ({
                  ...prev,
                  [row.id]: { ...prev[row.id], [cell.column.id]: value },
                }));
              }}
            />
            <IconButton
              aria-label="Guardar"
              intent="primary"
              size="xs"
              icon={<Check size={14} />}
              onClick={() => {
                const changes = editingRows[row.id] ?? {};
                if (onCommitEdit && Object.keys(changes).length) {
                  onCommitEdit(row.original, changes);
                }
                setEditingRows((prev) => {
                  const next = { ...prev };
                  delete next[row.id];
                  return next;
                });
              }}
            />
            <IconButton
              aria-label="Cancelar"
              intent="neutral"
              size="xs"
              icon={<X size={14} />}
              onClick={() => {
                setEditingRows((prev) => {
                  const next = { ...prev };
                  delete next[row.id];
                  return next;
                });
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
            {editable && meta.editable && (
              <IconButton
                aria-label="Editar"
                size="xs"
                intent="neutral"
                appearance="ghost"
                icon={<Pencil size={14} />}
                onClick={() => {
                  setEditingRows((prev) => ({
                    ...prev,
                    [row.id]: prev[row.id] || {},
                  }));
                }}
              />
            )}
          </div>
        )}
      </td>
    );
  };

  const renderRow = (row, style = {}) => {
    return (
      <tr
        key={row.id}
        style={style}
        className={`border-t border-(--color-border) ${densityClass} hover:bg-(--color-neutral2)/50 transition ${
          onRowClick ? "cursor-pointer" : ""
        }`}
        onClick={() => onRowClick?.(row.original)}
      >
        {row.getVisibleCells().map((cell) => renderCell(cell, row))}
      </tr>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Toolbar */}
      {toolbarContent && <div className="mb-3">{toolbarContent}</div>}

      {/* Table Container */}
      <div className={containerClasses}>
        <div
          ref={tableContainerRef}
          className={`overflow-x-auto ${virtualized || maxHeight ? "overflow-y-auto" : ""}`}
          style={tableScrollStyle}
        >
          <table className="min-w-full text-sm">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-white text-(--color-secondary2)">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>{hg.headers.map(renderHeaderCell)}</tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              {/* Loading State */}
              {loading && (
                <tr>
                  <td colSpan={table.getHeaderGroups()[0]?.headers.length || 1} className="px-3 py-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 w-1/3 rounded bg-(--color-neutral3)" />
                      <div className="h-3 w-2/3 rounded bg-(--color-neutral3)" />
                      <div className="h-3 w-1/2 rounded bg-(--color-neutral3)" />
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty State */}
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={table.getHeaderGroups()[0]?.headers.length || 1}
                    className="px-3 py-8 text-center text-(--color-text-muted)"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {/* Virtualized Rows */}
              {!loading && virtualized && virtualRows && (
                <>
                  {virtualRows.length > 0 && (
                    <tr>
                      <td colSpan={table.getHeaderGroups()[0]?.headers.length || 1} style={{ height: virtualRows[0]?.start || 0 }} />
                    </tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return renderRow(row, {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    });
                  })}
                  {virtualRows.length > 0 && (
                    <tr>
                      <td
                        colSpan={table.getHeaderGroups()[0]?.headers.length || 1}
                        style={{
                          height: Math.max(0, totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)),
                        }}
                      />
                    </tr>
                  )}
                </>
              )}

              {/* Normal Rows */}
              {!loading && !virtualized && rows.map((row) => renderRow(row))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="mt-3 px-4 pb-3">
            <Pagination page={page} totalItems={total} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    </div>
  );
}

UnifiedDataTable.propTypes = {
  // Data
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,

  // Pagination
  page: PropTypes.number,
  pageSize: PropTypes.number,
  total: PropTypes.number,
  onPageChange: PropTypes.func,
  enablePagination: PropTypes.bool,

  // Sorting
  onSortChange: PropTypes.func,

  // Filtering
  enableFiltering: PropTypes.bool,
  globalFilter: PropTypes.string,
  onGlobalFilterChange: PropTypes.func,

  // Selection
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  rowSelection: PropTypes.object,

  // Editing
  editable: PropTypes.bool,
  onCommitEdit: PropTypes.func,

  // Actions
  rowActions: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),

  // Virtualization
  virtualized: PropTypes.bool,
  estimatedRowHeight: PropTypes.number,
  overscan: PropTypes.number,

  // Styling
  variant: PropTypes.oneOf(["card", "plain"]),
  density: PropTypes.oneOf(["compact", "normal", "comfortable"]),
  condensed: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,

  // Toolbar
  toolbar: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

  // Advanced
  meta: PropTypes.object,
  enableColumnVisibility: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default UnifiedDataTable;
