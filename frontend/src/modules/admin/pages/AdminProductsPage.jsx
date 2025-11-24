import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Package, X, AlertCircle, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import ProductDrawer from "@/modules/admin/components/ProductDrawer.jsx"
import ProductDetailDrawer from "@/modules/admin/components/ProductDetailDrawer.jsx"

import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable.jsx"
import { Button } from "@/components/ui/Button.jsx"
import { Badge } from "@/components/ui/Badge.jsx"
import { productsApi } from "@/services/products.api.js"
import { confirm } from "@/components/ui";

import { useAdminProducts, fetchAllAdminProducts } from "@/modules/admin/hooks/useAdminProducts.js"
import { useCategories } from "@/modules/products/hooks/useCategories.js"
import { buildProductColumns } from "@/modules/admin/utils/ProductsColumns.jsx"
import { DEFAULT_PAGE_SIZE } from "@/config/constants.js"
import { PRODUCT_STATUS_OPTIONS } from "@/config/status-options.js"
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";
import { useErrorHandler } from '@/hooks/useErrorHandler.js';

export default function AdminProductsPage() {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [search] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const condensed = false;
  const [selectedProductView, setSelectedProductView] = useState(null); // Modal vista detalle
  const [selectedProductEdit, setSelectedProductEdit] = useState(null); // holds product being edited
  const [creatingNewProduct, setCreatingNewProduct] = useState(false); // flag for create drawer
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const limit = DEFAULT_PAGE_SIZE;

  const { items, total, isLoading, error: productsError, refetch } = useAdminProducts({
    page,
    limit,
    search,
    status,
    categoryId,
    onlyLowStock,
  });
  const { handleError } = useErrorHandler({
    showAlert: false,
    defaultMessage: 'Ocurrió un problema al gestionar los productos',
  });
  const lastProductsErrorRef = useRef(null);

  // Inicializar filtro desde query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('low_stock') === '1') setOnlyLowStock(true);
  }, [location.search]);

  // Manejo de errores productos
  useEffect(() => {
    if (!productsError) return;
    const signature = `${productsError?.message ?? ''}|${productsError?.status ?? ''}`;
    if (lastProductsErrorRef.current === signature) return;
    lastProductsErrorRef.current = signature;
    handleError(productsError, 'No se pudieron cargar los productos');
  }, [productsError, handleError]);

  const { categories } = useCategories();
  const categoryMap = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.name])),
    [categories],
  );
  const statusFilterOptions = useMemo(
    () => PRODUCT_STATUS_OPTIONS.filter((option) => option.value),
    [],
  );
  const categoryOptions = useMemo(() => {
    const entries = (categories ?? [])
      .filter((category) => category?.id != null)
      .map((category) => ({
        value: String(category.id),
        label: category.name ?? "Sin categoría",
      }));
    return entries.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [categories]);

  const handleStatusFilterChange = useCallback((value) => {
    setStatus(value);
    setPage(1);
    if (value) {
      const label = PRODUCT_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
      setActiveTags((tags) => [
        { key: "status", value, label: `Estado: ${label}` },
        ...tags.filter((t) => t.key !== "status"),
      ]);
    } else {
      setActiveTags((tags) => tags.filter((t) => t.key !== "status"));
    }
  }, []);

  const handleCategoryFilterChange = useCallback((value) => {
    const normalizedValue = value ? String(value) : "";
    setCategoryId(normalizedValue);
    setPage(1);
    if (normalizedValue) {
      const label = categoryOptions.find((option) => option.value === normalizedValue)?.label ?? normalizedValue;
      setActiveTags((tags) => [
        { key: "category", value: normalizedValue, label: `Categoría: ${label}` },
        ...tags.filter((tag) => tag.key !== "category"),
      ]);
    } else {
      setActiveTags((tags) => tags.filter((tag) => tag.key !== "category"));
    }
  }, [categoryOptions]);

  const handleViewProduct = useCallback((product) => {
    setSelectedProductView(product);
  }, []);

  const handleDuplicateProduct = useCallback((product) => {
    // Crear copia sin ID para modal de creación
    const duplicated = {
      ...product,
      id: undefined,
      name: `${product.name} (copia)`,
      sku: `${product.sku}-copy`,
    };
    setSelectedProductEdit(duplicated);
  }, []);

  const handleDeleteProduct = useCallback(async (product) => {
    const confirmed = await confirm.delete(
      `¿Eliminar "${product.name}"?`,
      'Esta acción no se puede deshacer'
    );
    
    if (!confirmed) return;
    
    try {
      await productsApi.remove(product.id);
      refetch();
    } catch (error) {
      handleError(error, 'No se pudo eliminar el producto');
    }
  }, [refetch, handleError]);

  const columns = useMemo(() => buildProductColumns({
    categoryMap,
    onView: handleViewProduct,
    onEdit: setSelectedProductEdit,
    onDuplicate: handleDuplicateProduct,
    onDelete: handleDeleteProduct,
    statusFilterValue: status,
    statusFilterOptions,
    onStatusFilterChange: handleStatusFilterChange,
    categoryFilterValue: categoryId,
    categoryFilterOptions: categoryOptions,
    onCategoryFilterChange: handleCategoryFilterChange,
  }), [
    categoryMap,
    handleViewProduct,
    handleDuplicateProduct,
    handleDeleteProduct,
    status,
    statusFilterOptions,
    handleStatusFilterChange,
    categoryId,
    categoryOptions,
    handleCategoryFilterChange,
  ]);

  // Funciones de exportación (usa endpoint backend que respeta filtros)
  const exportToCSV = async () => {
    try {
      // Construir query params con filtros activos
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (categoryId) params.append('categoryId', categoryId);
      if (onlyLowStock) params.append('onlyLowStock', 'true');

      // Descargar CSV desde backend (fetch directo necesario para blob response)
      const token = localStorage.getItem('moa.accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin/productos/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al exportar productos');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `productos_moa_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error, 'Error al exportar CSV');
    } finally {
      setShowExportDropdown(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const { items: allItems } = await fetchAllAdminProducts({
        search,
        status,
        categoryId,
        onlyLowStock,
      });
      
      const headers = ["SKU", "Nombre", "Categoría", "Precio (CLP)", "Stock", "Estado"];
      const csvData = [
        headers.join("\t"),
        ...allItems.map(item => [
          item.sku || "",
          item.name || "",
          categoryMap[item.fk_category_id] || "",
          item.price || 0,
          item.stock || 0,
          item.status || ""
        ].join("\t"))
      ].join("\n");

      const blob = new Blob([csvData], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `productos_moa_${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error, 'Error al exportar Excel');
    } finally {
      setShowExportDropdown(false);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Tag removal logic extracted for lint (avoid deep nesting)
  const handleRemoveTag = useCallback((tag) => {
    if (tag.key === "status") {
      handleStatusFilterChange("");
      return;
    }
    if (tag.key === "category") {
      handleCategoryFilterChange("");
      return;
    }
    setActiveTags((tags) => tags.filter((t) => !(t.key === tag.key && t.value === tag.value)));
  }, [handleStatusFilterChange, handleCategoryFilterChange]);

  // Render toolbar inline
  const renderToolbar = useCallback(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        {onlyLowStock && (
          <Badge
            variant="warning"
            className="flex items-center gap-2"
          >
            <Package className="h-3 w-3" />
            Stock bajo
            <button
              onClick={() => {
                setOnlyLowStock(false);
                setPage(1);
              }}
              className="ml-1 hover:text-error"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {activeTags.map((tag) => (
          <Badge
            key={tag.key}
            variant="neutral"
            className="flex items-center gap-2"
          >
            {tag.label}
            <button
              onClick={() => handleRemoveTag(tag.key)}
              className="ml-1 hover:text-error"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    ),
    [onlyLowStock, activeTags, handleRemoveTag],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Productos"
        actions={<>
          {/* Dropdown de Exportar */}
          <div className="relative export-dropdown">
            <Button
              appearance="outline"
              intent="neutral"
              size="sm"
              leadingIcon={<Download className="h-4 w-4" />}
              trailingIcon={<ChevronDown className="h-4 w-4" />}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Exportar
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg z-50">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                  onClick={exportToCSV}
                >
                  <FileText className="h-4 w-4" />
                  Exportar como CSV
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                  onClick={exportToExcel}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar como Excel
                </button>
              </div>
            )}
          </div>
          
          <Button
            appearance="solid"
            intent="primary"
            size="sm"
            leadingIcon={<Plus className="h-4 w-4" />}
            style={{
              "--btn-gap": "0.35rem",
              "--btn-icon-gap-left": "0.35rem",
            }}
            onClick={() => {
              setCreatingNewProduct(true);
            }}
          >
            Nuevo producto
          </Button>
        </>}
      />

      {productsError && (
        <div className="flex items-start gap-3 rounded-xl border border-(--color-error) bg-(--color-error)/10 px-4 py-3 text-sm text-(--color-error)">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-2">
            <div>
              <p className="font-semibold">No pudimos cargar los productos</p>
              <p className="text-(--color-error)/80">
                {productsError.message || 'Intenta nuevamente en unos segundos.'}
              </p>
            </div>
            <div>
              <Button appearance="outline" intent="error" size="xs" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla con toolbar integrado */}
      <UnifiedDataTable
        columns={columns}
        data={items}
        loading={isLoading}
        page={page}
        pageSize={limit}
        total={total}
        onPageChange={setPage}
        toolbar={renderToolbar}
        maxHeight="calc(100vh - 260px)"
        condensed={condensed}
        variant="card"
      />

      {/* Drawers */}
      {/* Drawer: Crear nuevo producto */}
      <ProductDrawer
        open={creatingNewProduct}
        initial={null}
        categories={categories ?? []}
        onClose={() => setCreatingNewProduct(false)}
        onSubmit={async (payload) => {
          try {
            await productsApi.create(payload);
            setCreatingNewProduct(false);
            refetch();
          } catch (error) {
            handleError(error, 'No se pudo crear el producto');
          }
        }}
      />

      {/* Drawer: Editar producto existente */}
      <ProductDrawer
        open={!!selectedProductEdit}
        initial={selectedProductEdit}
        categories={categories ?? []}
        onClose={() => setSelectedProductEdit(null)}
        onSubmit={async (payload) => {
          try {
            await productsApi.update(payload.id, payload);
            setSelectedProductEdit(null);
            refetch();
          } catch (error) {
            handleError(error, 'No se pudo actualizar el producto');
          }
        }}
        onDelete={async (product) => {
          if (confirm(`¿Eliminar producto "${product.name}"?`)) {
            try {
              await productsApi.remove(product.id);
              setSelectedProductEdit(null);
              refetch();
            } catch (error) {
              handleError(error, 'No se pudo eliminar el producto');
            }
          }
        }}
      />

      {/* Drawer: Ver detalle producto (read-only) */}
      <ProductDetailDrawer
        open={!!selectedProductView}
        product={selectedProductView}
        onClose={() => setSelectedProductView(null)}
        onEdit={(product) => {
          setSelectedProductView(null);
          setSelectedProductEdit(product);
        }}
      />
    </div>
  );
}
