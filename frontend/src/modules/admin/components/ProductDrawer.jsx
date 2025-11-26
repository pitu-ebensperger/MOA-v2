import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/radix/Dialog.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Textarea } from "@/components/ui/Input.jsx";
import { Select } from "@/components/ui/Select.jsx";
import { ProductShape, CategoryShape } from "@/utils/propTypes.js";
import { Edit, Save, Trash2, X } from "lucide-react";

const STATUS_VALUES = ["activo", "sin_stock", "borrador"];

const STATUS_OPTIONS = STATUS_VALUES.map((value) => {
  if (value === "activo") return { value, label: "Activo" };
  if (value === "sin_stock") return { value, label: "Sin stock" };
  return { value, label: "Borrador" };
});

const DEFAULT_FORM_VALUES = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  status: "activo",
  fk_category_id: "",
  imgUrl: "",
  description: "",
  color: "",
  material: "",
  dimHeight: "",
  dimWidth: "",
  dimLength: "",
  dimUnit: "cm",
};

const productSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(2, "Nombre demasiado corto"),
  sku: z.string().min(2, "SKU requerido"),
  price: z.coerce.number().min(0, "Precio inválido"),
  stock: z.coerce.number().int().min(0, "Stock inválido"),
  status: z.enum(STATUS_VALUES),
  fk_category_id: z.union([z.string(), z.number()]).nullable().optional(),
  imgUrl: z.union([z.string().url(), z.literal("")]).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  dimHeight: z.string().optional(),
  dimWidth: z.string().optional(),
  dimLength: z.string().optional(),
  dimUnit: z.string().optional(),
});

const toNumOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const DIMENSION_UNIT_OPTIONS = [
  { value: "cm", label: "Centímetros (cm)" },
  { value: "mm", label: "Milímetros (mm)" },
  { value: "m", label: "Metros (m)" },
  { value: "in", label: "Pulgadas (in)" },
  { value: "ft", label: "Pies (ft)" },
];

const getDefaultValues = () => ({ ...DEFAULT_FORM_VALUES });

export function ProductDrawer({
  open,
  onClose,
  onSubmit,
  onDelete,
  initial,
  categories = [],
  mode,
  onEditRequest,
  title,
}) {
  const resolvedMode = mode ?? (initial ? "edit" : "create");
  const isViewMode = resolvedMode === "view";
  const headerTitle =
    title ??
    (isViewMode
      ? "Detalle del producto"
      : initial
        ? "Editar producto"
        : "Nuevo producto");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (!open) return;

    if (initial) {
      const dim = initial.dimensions || {};
      reset({
        ...initial,
        fk_category_id: initial.fk_category_id ?? "",
        dimHeight: dim.height ?? "",
        dimWidth: dim.width ?? "",
        dimLength: dim.length ?? "",
        dimUnit: dim.unit ?? "cm",
      });
    } else {
      reset(getDefaultValues());
    }
  }, [open, initial, reset]);

  const imgUrl = watch("imgUrl");

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Sin categoría" },
      ...(categories ?? []).map((category) => ({
        value: String(category.id ?? ""),
        label: category.name ?? "Sin categoría",
      })),
    ],
    [categories],
  );

  const handleFormSubmit = async (data) => {
    if (isViewMode || !onSubmit) return;

    const {
      dimHeight,
      dimWidth,
      dimLength,
      dimUnit,
      fk_category_id,
      ...rest
    } = data;

    const height = toNumOrNull(dimHeight);
    const width = toNumOrNull(dimWidth);
    const length = toNumOrNull(dimLength);
    const unit = dimUnit || null;

    const dimensions =
      height !== null || width !== null || length !== null || unit
        ? { height, width, length, unit }
        : null;

    const payload = {
      ...rest,
      fk_category_id: fk_category_id || null,
      dimensions,
    };

    await onSubmit(payload);
  };

  const previewImage = imgUrl?.trim();

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent variant="drawer" placement="right" className="max-w-2xl rounded-tl-3xl rounded-bl-3xl">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col gap-5 p-6">
          <DialogHeader>
            <h2 className="text-lg font-semibold text-(--text-strong)">{headerTitle}</h2>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1 hide-scrollbar">
            {/* Información básica */}
            <div className="space-y-3">
              <Input
                label="Nombre"
                {...register("name")}
                error={errors.name?.message}
                placeholder="Ej. Mesa Escandinava"
                fullWidth
                disabled={isViewMode}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="SKU"
                  {...register("sku")}
                  error={errors.sku?.message}
                  placeholder="MOA-001"
                  fullWidth
                  disabled={isViewMode}
                />
                <Select
                  label="Estado"
                  {...register("status")}
                  options={STATUS_OPTIONS}
                  fullWidth
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Inventario y precio */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Precio"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("price")}
                  error={errors.price?.message}
                  placeholder="150000"
                  disabled={isViewMode}
                />
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  step="1"
                  {...register("stock")}
                  error={errors.stock?.message}
                  placeholder="10"
                  disabled={isViewMode}
                />
              </div>
            </div>

            {/* Clasificación */}
            <div className="space-y-3">
              <Select
                label="Categoría"
                {...register("fk_category_id")}
                options={categoryOptions}
                fullWidth
                disabled={isViewMode}
              />
            </div>

            {/* Imagen */}
            <div className="space-y-3">
              <Input
                label="URL de imagen"
                {...register("imgUrl")}
                placeholder="https://..."
                fullWidth
                disabled={isViewMode}
              />
              {previewImage && (
                <div className="rounded-2xl border border-neutral-200 bg-(--color-neutral1) px-3 py-2">
                  <p className="text-xs font-semibold text-(--text-muted)">Previsualización</p>
                  <div className="mt-2 h-32 w-full overflow-hidden rounded-2xl bg-(--surface-subtle)">
                    <img
                      src={previewImage}
                      alt="Previsualización del producto"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Descripción y características */}
            <div className="space-y-3">
              <Textarea
                label="Descripción"
                rows={4}
                {...register("description")}
                placeholder="Describe brevemente este producto"
                fullWidth
                disabled={isViewMode}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Color" {...register("color")} placeholder="Beige" disabled={isViewMode} />
                <Input label="Material" {...register("material")} placeholder="Madera de roble" disabled={isViewMode} />
              </div>
            </div>

            {/* Dimensiones */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <Input
                  label="Alto"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="75"
                  {...register("dimHeight")}
                  disabled={isViewMode}
                />
                <Input
                  label="Ancho"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="120"
                  {...register("dimWidth")}
                  disabled={isViewMode}
                />
                <Input
                  label="Largo"
                  size="sm"
                  type="number"
                  min="0"
                  placeholder="80"
                  {...register("dimLength")}
                  disabled={isViewMode}
                />
                <Select
                  label="Unidad"
                  size="sm"
                  {...register("dimUnit")}
                  options={DIMENSION_UNIT_OPTIONS}
                  placeholder="cm"
                  fullWidth
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <div className="flex w-full justify-end gap-2">
              {initial && onDelete && !isViewMode && (
                <Button
                  type="button"
                  appearance="ghost"
                  intent="error"
                  size="xs"
                  leadingIcon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => onDelete?.(initial)}
                  className="mr-auto rounded-full"
                >
                  Eliminar
                </Button>
              )}
              <Button
                type="button"
                appearance="ghost"
                intent="neutral"
                size="xs"
                leadingIcon={<X className="h-3.5 w-3.5" />}
                onClick={onClose}
                className="text-(--text-strong) rounded-full"
              >
                {isViewMode ? "Cerrar" : "Cancelar"}
              </Button>
              {!isViewMode ? (
                <Button
                  type="submit"
                  appearance="solid"
                  intent="primary"
                  size="xs"
                  leadingIcon={<Save className="h-3.5 w-3.5" />}
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  {isSubmitting ? "Guardando..." : initial ? "Actualizar producto" : "Guardar producto"}
                </Button>
              ) : (
                onEditRequest && initial && (
                  <Button
                    type="button"
                    appearance="solid"
                    intent="primary"
                    size="xs"
                    leadingIcon={<Edit className="h-3.5 w-3.5" />}
                    onClick={() => onEditRequest?.(initial)}
                    className="rounded-full"
                  >
                    Editar
                  </Button>
                )
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ProductDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  initial: ProductShape,
  categories: PropTypes.arrayOf(CategoryShape),
  mode: PropTypes.oneOf(["create", "edit", "view"]),
  onEditRequest: PropTypes.func,
  title: PropTypes.string,
};

export default ProductDrawer;
