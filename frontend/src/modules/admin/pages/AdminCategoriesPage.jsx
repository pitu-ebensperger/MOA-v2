import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@/config/query.client.config.js";
import { Plus, Edit3, Trash2, Check, X } from "lucide-react";

import { categoriesApi } from "@/services/categories.api.js";
import { confirm, Button, Input, Textarea } from '@/components/ui';
import { validateRequired, validateSlug } from '@/utils/validation';
import { useToast } from '@/hooks/useToast.js';
import { UnifiedDataTable } from "@/components/data-display/UnifiedDataTable.jsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/primitives";
import { buildCategoryColumns } from "@/modules/admin/utils/categoriesColumns.jsx";
import { useAdminCategories, ADMIN_CATEGORIES_QUERY_KEY } from "@/modules/admin/hooks/useAdminCategories.js";
import { DEFAULT_PAGE_SIZE } from "@/config/app.constants.js";
import AdminPageHeader from "@/modules/admin/components/AdminPageHeader.jsx";

const sanitizeSlug = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/(^-+)|(-+$)/g, "");

const initialFormState = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
};

const resolveErrorMessage = (error) =>
  error?.data?.message ?? error?.message ?? "Ocurrió un error inesperado";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { categories, isLoading, error } = useAdminCategories();
  const { success, error: showError } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [formValues, setFormValues] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(activeCategory);

  const columns = useMemo(() => buildCategoryColumns(), []);
  const categoriesPageSize = DEFAULT_PAGE_SIZE;
  const categoriesList = useMemo(() => categories ?? [], [categories]);
  const totalCategories = categoriesList.length;
  const maxPage = Math.max(1, Math.ceil(totalCategories / categoriesPageSize));
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, maxPage]);

  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * categoriesPageSize;
    return categoriesList.slice(start, start + categoriesPageSize);
  }, [categoriesList, page, categoriesPageSize]);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setActiveCategory(null);
    setFormValues(initialFormState);
    setFormError("");
    setFieldErrors({});
  }, []);

  const openCreateDrawer = useCallback(() => {
    handleCloseDrawer();
    setIsDrawerOpen(true);
  }, [handleCloseDrawer]);

  const openEditDrawer = useCallback(
    (category) => {
      setActiveCategory(category);
      setFormValues({
        name: category.name ?? "",
        slug: category.slug ?? "",
        description: category.description ?? "",
        coverImage: category.coverImage ?? "",
      });
      setFieldErrors({});
      setFormError("");
      setIsDrawerOpen(true);
    },
    [],
  );

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleSlugInput = useCallback(
    (event) => {
      const sanitized = sanitizeSlug(event.target.value);
      setFormValues((prev) => ({ ...prev, slug: sanitized }));
      setFieldErrors((prev) => ({ ...prev, slug: "" }));
    },
    [],
  );

  const invalidateCategories = useCallback(() => {
    queryClient.invalidateQueries(ADMIN_CATEGORIES_QUERY_KEY);
  }, [queryClient]);

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => categoriesApi.create(payload),
    onSuccess: () => {
      invalidateCategories();
      success("Categoría creada exitosamente");
      handleCloseDrawer();
    },
    onError: (mutationError) => {
      setFormError(resolveErrorMessage(mutationError));
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => categoriesApi.update(id, payload),
    onSuccess: () => {
      invalidateCategories();
      success("Categoría actualizada exitosamente");
      handleCloseDrawer();
    },
    onError: (mutationError) => {
      setFormError(resolveErrorMessage(mutationError));
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      invalidateCategories();
      success("Categoría eliminada exitosamente");
    },
    onError: (mutationError) => {
      showError(resolveErrorMessage(mutationError));
    },
  });

  const isSaving = createCategoryMutation.isLoading || updateCategoryMutation.isLoading;
  const submitButtonLabel = isSaving
    ? "Guardando..."
    : isEditing
      ? "Guardar cambios"
      : "Guardar categoría";

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setFormError("");

    const payload = {
      nombre: formValues.name.trim(),
      slug: formValues.slug.trim(),
      descripcion: formValues.description.trim(),
      cover_image: formValues.coverImage.trim() || null,
    };

    const validationErrors = {};
    
    // Validar nombre
    const nameValidation = validateRequired(payload.nombre, 'El nombre');
    if (!nameValidation.valid) {
      validationErrors.name = nameValidation.error;
    }
    
    // Validar slug
    const slugValidation = validateSlug(payload.slug);
    if (!slugValidation.valid) {
      validationErrors.slug = slugValidation.error;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (activeCategory) {
      updateCategoryMutation.mutate({ id: activeCategory.id, payload });
    } else {
      createCategoryMutation.mutate(payload);
    }
  };

  const handleDelete = useCallback(
    async (category) => {
      const confirmed = await confirm.delete(
        `¿Eliminar "${category.name}"?`,
        'Esta acción no se puede deshacer'
      );
      
      if (!confirmed) return;
      
      deleteCategoryMutation.mutate(category.id);
    },
    [deleteCategoryMutation],
  );

  const rowActions = useMemo(
    () => [
      {
        key: "edit",
        label: "Editar",
        icon: Edit3,
        onAction: openEditDrawer,
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: Trash2,
        onAction: handleDelete,
      },
    ],
    [handleDelete, openEditDrawer],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Categorías"
        actions={
          <Button
            size="sm"
            appearance="solid"
            intent="primary"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={openCreateDrawer}
          >
            Crear Categoría
          </Button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-(--color-error) bg-(--color-error)/10 px-4 py-3 text-sm text-(--color-error)">
          No pudimos cargar las categorías. {resolveErrorMessage(error)}
        </div>
      )}

      <UnifiedDataTable
        columns={columns}
        data={paginatedCategories}
        loading={isLoading}
        emptyMessage="No hay categorías registradas"
        rowActions={rowActions}
        variant="card"
        maxHeight="calc(100vh - 260px)"
        page={page}
        pageSize={categoriesPageSize}
        total={totalCategories}
        onPageChange={setPage}
      />

      <Dialog open={isDrawerOpen} onOpenChange={(open) => !open && handleCloseDrawer()}>
        <DialogContent variant="drawer" placement="right" className="max-w-lg rounded-tl-3xl rounded-bl-3xl">
          <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col gap-5 overflow-hidden p-8">
            <DialogHeader>
              <h2 className="text-lg font-semibold text-(--text-strong)">
                {isEditing ? "Editar categoría" : "Nueva categoría"}
              </h2>
            </DialogHeader>

            <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 hide-scrollbar">
              {formError && (
                <div className="rounded-2xl border border-(--color-error) bg-(--color-error)/10 px-4 py-2 text-xs font-medium text-(--color-error)">
                  {formError}
                </div>
              )}

              <Input
                label="Nombre"
                value={formValues.name}
                onChange={handleInputChange("name")}
                placeholder="Ej. Decoración"
                error={fieldErrors.name}
                required
              />

              <Input
                label="Slug"
                value={formValues.slug}
                onChange={handleSlugInput}
                placeholder="decoracion"
                helperText="Solo letras minúsculas, números y guiones."
                error={fieldErrors.slug}
                required
              />

              <Textarea
                label="Descripción"
                value={formValues.description}
                onChange={handleInputChange("description")}
                placeholder="Escribe un texto breve que resuma la categoría"
              />

              <Input
                label="URL de imagen de portada"
                value={formValues.coverImage}
                onChange={handleInputChange("coverImage")}
                placeholder="https://..."
                type="url"
              />

              {formValues.coverImage && (
                <div className="rounded-2xl border border-neutral-200 bg-(--color-neutral1) px-3 py-2">
                  <p className="text-xs font-semibold text-(--text-muted)">Previsualización</p>
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-2xl bg-(--surface-subtle)">
                    <img
                      src={formValues.coverImage}
                      alt="Previsualización de portada"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-0 shrink-0 border-(--color-border) pt-4">
              <div className="flex w-full justify-end gap-3">
                <Button
                  type="button"
                  appearance="ghost"
                  intent="neutral"
                  onClick={handleCloseDrawer}
                  className="text-(--text-strong)"
                  leadingIcon={<X className="h-4 w-4" />}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  appearance="solid"
                  intent="primary"
                  disabled={isSaving}
                  leadingIcon={<Check className="h-4 w-4" />}
                >
                  {submitButtonLabel}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
