import React, { useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn.js";
import { Search, LayoutGrid, Rows3, Download, RefreshCw, Plus, Columns3, X, SlidersHorizontal, ChevronDown, FileDown, FileJson } from "lucide-react";
import { Button, IconButton, SelectGhost } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/primitives";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/primitives";

export function UnifiedTableToolbar({
  table,

  // Search
  search = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",

  // Column Visibility
  columnVisibility = false,
  columnVisibilityLabel = "Columnas",

  // Sort By
  sortBy = false,
  sortByOptions = [],
  sortByValue,
  onSortByChange,
  sortByLabel = "Ordenar por",

  // Export
  exportMenu = false,
  onExport,
  exportFormats = ["csv", "json"],
  exportLabel = "Exportar",

  // Density
  density = false,
  densityValue = "normal",
  onDensityChange,
  densityLabel = "Densidad",

  // Layout Toggle
  layoutToggle = false,
  layoutValue = "table",
  onLayoutChange,
  layoutOptions = ["table", "grid", "list"],

  // Refresh
  refresh = false,
  onRefresh,
  refreshLabel = "Refrescar",
  refreshing = false,

  // Quick Filters (pill buttons)
  quickFilters = false,
  quickFilterOptions = [],
  activeQuickFilters = [],
  onQuickFilterChange,

  // Advanced Filters (popover)
  advancedFilters = false,
  advancedFiltersContent,
  advancedFiltersLabel = "Filtros avanzados",

  // Add New
  addNew = false,
  onAddNew,
  addNewLabel = "Agregar",
  addNewIcon = <Plus size={16} />,

  // Clear Filters
  clearFilters = false,
  onClearFilters,
  clearFiltersLabel = "Limpiar filtros",

  // Active Filters (badges)
  activeFilters = [],
  onRemoveFilter,

  // Custom actions (extra buttons/content)
  customActions,

  // Styling
  className = "",
  variant = "default", // default | compact
}) {
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Get hideable columns from table instance
  const hideableColumns = table?.getAllLeafColumns?.().filter((col) => col.getCanHide()) || [];

  // Resolve column label
  const resolveColumnLabel = (col) => {
    const header = col.columnDef?.header;
    if (typeof header === "string" && header.trim()) return header.trim();
    const metaLabel = col.columnDef?.meta?.label;
    if (typeof metaLabel === "string" && metaLabel.trim()) return metaLabel.trim();
    if (typeof col.columnDef?.accessorKey === "string") return col.columnDef.accessorKey;
    return col.id ?? "col";
  };

  // Export format icons
  const exportIcons = {
    csv: <FileDown size={14} />,
    json: <FileJson size={14} />,
  };

  // Density icons
  const densityIcons = {
    compact: <Rows3 size={16} />,
    normal: <LayoutGrid size={16} />,
    comfortable: <Rows3 size={16} />,
  };

  // Layout icons
  const layoutIcons = {
    table: <Rows3 size={16} />,
    grid: <LayoutGrid size={16} />,
    list: <Rows3 size={16} />,
  };

  const isCompact = variant === "compact";

  return (
    <div className={cn("flex w-full flex-wrap items-center gap-2", className)}>
      {/* LEFT SECTION: Search + Quick Filters */}
      <div className="flex flex-1 items-center gap-2">
        {/* Search Bar */}
        {search && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={cn(
                "rounded-full border border-(--color-border) bg-white pl-9 pr-4 text-sm text-(--text-strong) placeholder:text-(--color-text-muted) focus:border-(--color-primary1) focus:outline-none focus:ring-2 focus:ring-(--color-primary1)/20 transition",
                isCompact ? "h-8 w-48" : "h-9 w-64"
              )}
            />
          </div>
        )}

        {/* Quick Filter Pills */}
        {quickFilters && quickFilterOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            {quickFilterOptions.map((filter) => {
              const isActive = activeQuickFilters?.includes(filter.value);
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onQuickFilterChange?.(filter.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition",
                    isActive
                      ? "border-(--color-primary1) bg-(--color-primary1)/10 text-(--color-primary1)"
                      : "border-(--color-border) bg-white text-(--color-secondary2) hover:border-(--color-primary1)/50 hover:text-(--color-primary1)"
                  )}
                >
                  {filter.icon && <span className="text-current">{filter.icon}</span>}
                  {filter.label}
                  {filter.count !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        isActive ? "bg-(--color-primary1) text-white" : "bg-(--color-neutral3) text-(--color-secondary2)"
                      )}
                    >
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Active Filter Badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilters.map((filter, idx) => (
              <span
                key={`${filter.key}-${filter.value}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-neutral1) px-2 py-0.5 text-xs"
              >
                <span className="text-(--color-secondary2)">
                  {filter.label ?? `${filter.key}: ${filter.value}`}
                </span>
                <button
                  type="button"
                  aria-label="Quitar filtro"
                  className="rounded-full text-(--color-secondary2) hover:text-(--color-primary1) transition"
                  onClick={() => onRemoveFilter?.(filter)}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Controls */}
      <div className="flex items-center gap-1.5">
        {/* Clear Filters */}
        {clearFilters && (activeFilters.length > 0 || activeQuickFilters?.length > 0) && (
          <Button
            appearance="ghost"
            size={isCompact ? "xs" : "sm"}
            iconLeft={<X size={14} />}
            onClick={onClearFilters}
            className="text-(--color-secondary2) hover:text-(--color-error)"
          >
            {clearFiltersLabel}
          </Button>
        )}

        {/* Separator */}
        {(clearFilters || quickFilters) && (
          <div className="mx-1 h-6 w-px bg-(--color-border)" />
        )}

        {/* Advanced Filters */}
        {advancedFilters && (
          <Popover open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                appearance="outline"
                size={isCompact ? "xs" : "sm"}
                iconLeft={<SlidersHorizontal size={14} />}
                iconRight={<ChevronDown size={14} />}
              >
                {advancedFiltersLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4">
              {advancedFiltersContent || (
                <div className="text-sm text-(--color-text-muted)">
                  Configura filtros avanzados aquí
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* Sort By */}
        {sortBy && sortByOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-(--color-secondary2) whitespace-nowrap">
              {sortByLabel}:
            </span>
            <SelectGhost
              size={isCompact ? "xs" : "sm"}
              value={sortByValue}
              onChange={(e) => onSortByChange?.(e.target.value)}
              options={sortByOptions}
            />
          </div>
        )}

        {/* Column Visibility */}
        {columnVisibility && hideableColumns.length > 0 && (
          <DropdownMenu open={columnMenuOpen} onOpenChange={setColumnMenuOpen}>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={<Columns3 size={16} />}
                aria-label={columnVisibilityLabel}
                title={columnVisibilityLabel}
                appearance="ghost"
                intent="neutral"
                size={isCompact ? "xs" : "sm"}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs font-semibold text-(--color-secondary2)">
                {columnVisibilityLabel}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map((col) => {
                const id = col.id;
                const visible = col.getIsVisible?.();
                const name = resolveColumnLabel(col);
                return (
                  <DropdownMenuItem
                    key={id}
                    onSelect={(e) => {
                      e.preventDefault();
                      col.toggleVisibility?.(!visible);
                    }}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate text-sm text-(--color-secondary2)">{name}</span>
                    <input
                      type="checkbox"
                      aria-label={`Mostrar ${id}`}
                      checked={!!visible}
                      onChange={() => col.toggleVisibility?.(!visible)}
                      className="cursor-pointer"
                    />
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Density Toggle */}
        {density && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                icon={densityIcons[densityValue] || <LayoutGrid size={16} />}
                aria-label={densityLabel}
                title={densityLabel}
                appearance="ghost"
                intent="neutral"
                size={isCompact ? "xs" : "sm"}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs font-semibold text-(--color-secondary2)">
                {densityLabel}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDensityChange?.("compact")}
                className={cn(densityValue === "compact" && "bg-(--color-neutral2)")}
              >
                <Rows3 size={14} className="mr-2" />
                Compacta
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDensityChange?.("normal")}
                className={cn(densityValue === "normal" && "bg-(--color-neutral2)")}
              >
                <LayoutGrid size={14} className="mr-2" />
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDensityChange?.("comfortable")}
                className={cn(densityValue === "comfortable" && "bg-(--color-neutral2)")}
              >
                <Rows3 size={14} className="mr-2" />
                Cómoda
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Layout Toggle */}
        {layoutToggle && layoutOptions.length > 1 && (
          <div className="flex items-center gap-0.5 rounded-full border border-(--color-border) bg-white p-0.5">
            {layoutOptions.map((layout) => {
              const isActive = layoutValue === layout;
              const icon = layoutIcons[layout] || <LayoutGrid size={16} />;
              return (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onLayoutChange?.(layout)}
                  className={cn(
                    "rounded-full p-1.5 transition",
                    isActive
                      ? "bg-(--color-primary1) text-white"
                      : "text-(--color-secondary2) hover:text-(--color-primary1)"
                  )}
                  aria-label={`Vista ${layout}`}
                  title={`Vista ${layout}`}
                >
                  {icon}
                </button>
              );
            })}
          </div>
        )}

        {/* Export Menu */}
        {exportMenu && (
          <DropdownMenu open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                appearance="outline"
                size={isCompact ? "xs" : "sm"}
                iconLeft={<Download size={14} />}
                iconRight={<ChevronDown size={14} />}
              >
                {exportLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs font-semibold text-(--color-secondary2)">
                Formato de exportación
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {exportFormats.includes("csv") && (
                <DropdownMenuItem onSelect={() => onExport?.("csv")}>
                  {exportIcons.csv}
                  <span className="ml-2">CSV</span>
                </DropdownMenuItem>
              )}
              {exportFormats.includes("json") && (
                <DropdownMenuItem onSelect={() => onExport?.("json")}>
                  {exportIcons.json}
                  <span className="ml-2">JSON</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Refresh */}
        {refresh && (
          <IconButton
            icon={<RefreshCw size={16} className={cn(refreshing && "animate-spin")} />}
            aria-label={refreshLabel}
            title={refreshLabel}
            appearance="ghost"
            intent="neutral"
            size={isCompact ? "xs" : "sm"}
            onClick={onRefresh}
            disabled={refreshing}
          />
        )}

        {/* Add New */}
        {addNew && (
          <>
            <div className="mx-1 h-6 w-px bg-(--color-border)" />
            <Button
              appearance="solid"
              intent="primary"
              size={isCompact ? "xs" : "sm"}
              iconLeft={addNewIcon}
              onClick={onAddNew}
            >
              {addNewLabel}
            </Button>
          </>
        )}

        {/* Custom Actions */}
        {customActions && <div className="flex items-center gap-1.5">{customActions}</div>}
      </div>
    </div>
  );
}

UnifiedTableToolbar.propTypes = {
  // Table instance
  table: PropTypes.object,

  // Search
  search: PropTypes.bool,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,

  // Column Visibility
  columnVisibility: PropTypes.bool,
  columnVisibilityLabel: PropTypes.string,

  // Sort By
  sortBy: PropTypes.bool,
  sortByOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  sortByValue: PropTypes.string,
  onSortByChange: PropTypes.func,
  sortByLabel: PropTypes.string,

  // Export
  exportMenu: PropTypes.bool,
  onExport: PropTypes.func,
  exportFormats: PropTypes.arrayOf(PropTypes.oneOf(["csv", "json"])),
  exportLabel: PropTypes.string,

  // Density
  density: PropTypes.bool,
  densityValue: PropTypes.oneOf(["compact", "normal", "comfortable"]),
  onDensityChange: PropTypes.func,
  densityLabel: PropTypes.string,

  // Layout Toggle
  layoutToggle: PropTypes.bool,
  layoutValue: PropTypes.oneOf(["table", "grid", "list"]),
  onLayoutChange: PropTypes.func,
  layoutOptions: PropTypes.arrayOf(PropTypes.oneOf(["table", "grid", "list"])),

  // Refresh
  refresh: PropTypes.bool,
  onRefresh: PropTypes.func,
  refreshLabel: PropTypes.string,
  refreshing: PropTypes.bool,

  // Quick Filters
  quickFilters: PropTypes.bool,
  quickFilterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      count: PropTypes.number,
    })
  ),
  activeQuickFilters: PropTypes.arrayOf(PropTypes.string),
  onQuickFilterChange: PropTypes.func,

  // Advanced Filters
  advancedFilters: PropTypes.bool,
  advancedFiltersContent: PropTypes.node,
  advancedFiltersLabel: PropTypes.string,

  // Add New
  addNew: PropTypes.bool,
  onAddNew: PropTypes.func,
  addNewLabel: PropTypes.string,
  addNewIcon: PropTypes.node,

  // Clear Filters
  clearFilters: PropTypes.bool,
  onClearFilters: PropTypes.func,
  clearFiltersLabel: PropTypes.string,

  // Active Filters
  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.any,
      label: PropTypes.string,
    })
  ),
  onRemoveFilter: PropTypes.func,

  // Custom
  customActions: PropTypes.node,

  // Styling
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "compact"]),
};

export default UnifiedTableToolbar;
