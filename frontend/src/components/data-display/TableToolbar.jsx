import React from "react";
import { InputSm } from "@/components/ui/Input.jsx"
import { SelectSm, SelectGhost } from "@/components/ui/Select.jsx"
import { Button, IconButton } from "@/components/ui/Button.jsx"
import { cn } from "@/utils/cn.js";
import { Search, ListFilter, LayoutGrid, Rows, ChevronDown, Columns as ColumnsIcon, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/radix/DropdownMenu.jsx"

export function TableToolbar({ children, className }) {
  return (
    <div className={cn("flex w-full flex-wrap items-center gap-2 text-sm", className)}>
      {children}
    </div>
  );
}

export function TableSearch({ value, onChange, placeholder = "Buscar...", className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-8 w-full rounded-full border border-(--color-border) bg-white pl-9 pr-4 text-sm text-(--text-strong) placeholder:text-(--color-text-muted) focus:border-(--color-primary1) focus:outline-none focus:ring-2 focus:ring-(--color-primary1)/20"
        />
      </div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Todos",
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-xs text-(--color-secondary2)">{label}</span>}
      <SelectGhost size="sm" value={value} onChange={(e) => onChange?.(e.target.value)} options={options} placeholder={placeholder} />
    </div>
  );
}

export function FilterTags({ tags = [], onRemove, className }) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {tags.map((tag) => (
        <span key={`${tag.key}-${tag.value}`} className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-neutral1) px-2 py-0.5 text-xs">
          <span className="text-(--color-secondary2)">{tag.label ?? `${tag.key}: ${tag.value}`}</span>
          <button type="button" aria-label="Quitar filtro" className="rounded-full px-1 text-(--color-secondary2) hover:text-(--color-primary1)" onClick={() => onRemove?.(tag)}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

export function ToolbarSpacer() {
  return <div className="mx-1 h-6 w-px bg-(--color-border)" />;
}

export function QuickFilterPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
        active
          ? "border-(--color-primary1) bg-(--color-primary1)/10 text-(--color-primary1)"
          : "border-(--color-border) bg-white text-(--color-secondary2) hover:text-(--color-primary1)"
      )}
    >
      {children}
    </button>
  );
}

export function FilterTabs({ tabs = [], value, onChange, className }) {
  return (
    <div className={cn("flex items-center rounded-full border border-(--color-border) bg-white p-0.5", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange?.(tab.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              isActive ? "bg-(--color-primary1) text-white" : "text-(--color-secondary2) hover:text-(--color-primary1)"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterMenuButton({ onClick, label = "Filtros" }) {
  return (
    <Button appearance="ghost" iconLeft={<ListFilter size={16} />} onClick={onClick}>
      {label}
    </Button>
  );
}

export function LayoutToggleButton({ condensed, onToggle }) {
  return (
    <IconButton
      aria-label="Alternar densidad"
      intent="neutral"
      onClick={onToggle}
      icon={condensed ? <Rows size={16} /> : <LayoutGrid size={16} />}
    />
  );
}

export function ColumnsMenuButton({ table, label = "Columnas" }) {
  if (!table) return null;
  const columns = table.getAllLeafColumns?.() ?? [];
  const hideable = columns.filter((col) => col?.getCanHide?.());
  if (!hideable.length) return null;
  const resolveLabel = (col) => {
    const header = col.columnDef?.header;
    if (typeof header === "string" && header.trim()) return header.trim();
    const metaLabel = col.columnDef?.meta?.label;
    if (typeof metaLabel === "string" && metaLabel.trim()) return metaLabel.trim();
    if (typeof col.columnDef?.accessorKey === "string") return col.columnDef.accessorKey;
    return col.id ?? "col";
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          icon={<ColumnsIcon size={16} />}
          aria-label={label}
          title={label}
          appearance="ghost"
          intent="neutral"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hideable.map((col) => {
          const id = col.id;
          const visible = col.getIsVisible?.();
          const name = resolveLabel(col);
          return (
            <DropdownMenuItem
              key={id}
              onSelect={(e) => {
                e.preventDefault();
                col.toggleVisibility?.(!visible);
              }}
              className="justify-between"
            >
              <span className="truncate text-(--color-secondary2)">{name}</span>
              <input type="checkbox" aria-label={`Mostrar ${id}`} checked={!!visible} onChange={() => col.toggleVisibility?.(!visible)} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ClearFiltersButton({ onClear, label = "Limpiar" }) {
  return (
    <Button appearance="ghost" iconLeft={<X size={14} />} onClick={onClear}>
      {label}
    </Button>
  );
}
