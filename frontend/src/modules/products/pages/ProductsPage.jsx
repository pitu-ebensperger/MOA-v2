import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs.jsx"
import { Pagination } from "@/components/ui/Pagination.jsx"
import { API_PATHS } from "@/config/api-paths.js"

import ProductGallery from "@/modules/products/components/ProductGallery.jsx"
import { ProductsFiltersPanel } from "@/modules/products/components/ProductsFiltersPanel.jsx"
import { Skeleton } from "@/components/ui/Skeleton.jsx"

import { useCategories } from "@/modules/products/hooks/useCategories.js"
import { useProducts } from "@/modules/products/hooks/useProducts.js"
import { useProductFilters } from "@/modules/products/hooks/useProductFilters.js"
import { useCatalogControls } from "@/modules/products/hooks/useCatalogControls.js"
import { useCartContext } from "@/context/cart-context.js"
import { useDebounce } from "@/hooks/useDebounce.js"

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = (searchParams.get("search") ?? searchParams.get("q") ?? "").trim();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const productQueryFilters = useMemo(
    () => (debouncedSearchQuery ? { q: debouncedSearchQuery } : undefined),
    [debouncedSearchQuery],
  );
  const handleClearSearch = () => {
    if (!searchQuery) return;
    navigate(API_PATHS.products.products, { replace: true });
  };

  const { products: fetchedProducts, isLoading, error } = useProducts(productQueryFilters);
  const { categories: fetchedCategories } = useCategories();

  const { addToCart } = useCartContext();

  const {
    sort,
    setSort,
    itemsPerPage,
    handleChangeItemsPerPage,
    pageSizeOptions,
  } = useCatalogControls();

  const {
    categories,
    filters,
    limits,
    appliedFilters,
    paginationInfo,
    paginatedProducts,
    setCurrentPage,
    onChangeCategory,
    onChangePrice,
    handleRemoveFilter,
    resetFilters,
  } = useProductFilters({
    products: fetchedProducts,
    categories: fetchedCategories,
    sort,
    itemsPerPage,
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, setCurrentPage]);

  return (
    <main className="page mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Inicio", href: "/" },
          { label: "Productos" },
        ]}
      />

      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-(--text-weak)">
              Mostrar{" "}
              <select
                value={itemsPerPage}
                onChange={(event) => handleChangeItemsPerPage(event.target.value)}
                className="w-fit rounded-full border border-transparent bg-transparent px-2 py-2 text-sm text-neutral-700 transition focus:border-(--color-primary1,#6B5444) focus:outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-(--text-weak)">
              Ordenar por{" "}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-fit rounded-full border border-transparent bg-transparent px-2 py-2 text-sm text-neutral-700 transition focus:border-(--color-primary1,#6B5444) focus:outline-none"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre A-Z</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-(--color-primary1,#6B5444) px-3 py-2 text-sm font-medium text-(--color-primary1,#6B5444) transition hover:bg-(--color-primary1,#6B5444) hover:text-white lg:hidden"
            >
              Filtros
            </button>
          </div>
        </div>
      </header>

      {searchQuery && (
        <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-neutral1)] px-5 py-4 text-sm text-[var(--color-secondary2)] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-neutral-700">
            Mostrando resultados para <strong className="text-(--color-primary1)">{searchQuery}</strong>.
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-sm font-semibold text-(--color-primary1) underline underline-offset-4"
          >
            Borrar búsqueda
          </button>
        </div>
      )}

      {appliedFilters.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-(--color-light-beige,#f6efe7) px-5 py-3 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Filtros activos
          </span>

          {appliedFilters.map((filter) => (
            <button
              key={filter.type}
              type="button"
              onClick={() => handleRemoveFilter(filter.type)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100"
            >
              {filter.label}
              <span aria-hidden className="text-neutral-400">×</span>
            </button>
          ))}
        </div>
      )}

      <ProductsFiltersPanel
        categories={categories}
        filters={filters}
        limits={limits}
        appliedFilters={appliedFilters}
        isMobileFiltersOpen={isMobileFiltersOpen}
        onCloseMobileFilters={() => setIsMobileFiltersOpen(false)}
        onChangeCategory={onChangeCategory}
        onChangePrice={onChangePrice}
        onRemoveFilter={handleRemoveFilter}
        onResetFilters={resetFilters}
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            No pudimos cargar los productos. Intenta nuevamente más tarde.
          </div>
        )}

        {isLoading && paginationInfo.totalItems === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`product-skeleton-${index}`}
                className="flex flex-col gap-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-neutral2)] p-4 shadow-[var(--shadow-sm)]"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-[1.25rem]" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-10 w-1/2 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGallery
            products={paginatedProducts}
            onAddToCart={addToCart}
          />
        )}
      </ProductsFiltersPanel>

      {paginationInfo.totalItems > 0 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            page={paginationInfo.page}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </main>
  );
}
