import React from "react";
import { X, Edit, Package, Tag, DollarSign, Calendar, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { formatCurrencyCLP } from "@/utils/formatters/currency.js";

/**
 * ProductDetailDrawer - Vista de solo lectura para detalles de un producto
 * @param {Object} props
 * @param {boolean} props.open - Estado de apertura del drawer
 * @param {Object} props.product - Producto a mostrar
 * @param {Function} props.onClose - Callback al cerrar
 * @param {Function} props.onEdit - Callback para editar producto
 */
export default function ProductDetailDrawer({ open, product, onClose, onEdit }) {
  if (!open || !product) return null;

  const statusColors = {
    active: "success",
    inactive: "neutral",
    discontinued: "error",
  };

  const stockStatus = product.stock <= 0 
    ? { label: "Sin stock", color: "error" }
    : product.stock <= 10
    ? { label: "Stock bajo", color: "warning" }
    : { label: "Stock disponible", color: "success" };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Detalle del Producto</h2>
            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku || "N/A"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              appearance="outline"
              intent="primary"
              size="sm"
              leadingIcon={<Edit className="h-4 w-4" />}
              onClick={() => onEdit(product)}
            >
              Editar
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Imagen del producto */}
          {product.image_url ? (
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder-product.png";
                }}
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre del Producto</label>
              <p className="mt-1 text-base text-gray-900">{product.name}</p>
            </div>

            {product.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <p className="mt-1 text-base text-gray-600 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Grid de información */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {/* Precio */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Precio</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrencyCLP(product.price)}
                  </p>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  stockStatus.color === "error" ? "bg-red-100" :
                  stockStatus.color === "warning" ? "bg-yellow-100" :
                  "bg-green-100"
                }`}>
                  <Package className={`h-5 w-5 ${
                    stockStatus.color === "error" ? "text-red-600" :
                    stockStatus.color === "warning" ? "text-yellow-600" :
                    "text-green-600"
                  }`} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <p className="text-lg font-semibold text-gray-900">{product.stock}</p>
                  <Badge variant={stockStatus.color} size="sm" className="mt-1">
                    {stockStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Categoría */}
              {product.category_name && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Categoría</label>
                    <p className="text-base text-gray-900">{product.category_name}</p>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <div className="mt-1">
                    <Badge variant={statusColors[product.status] || "neutral"}>
                      {product.status === "active" ? "Activo" :
                       product.status === "inactive" ? "Inactivo" :
                       product.status === "discontinued" ? "Descontinuado" :
                       product.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Especificaciones técnicas */}
            {product.specifications && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-700">Especificaciones</label>
                <p className="mt-1 text-base text-gray-600 whitespace-pre-wrap">
                  {product.specifications}
                </p>
              </div>
            )}

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              {product.created_at && (
                <div>
                  <label className="font-medium text-gray-700">Fecha de creación</label>
                  <p className="text-gray-600">
                    {new Date(product.created_at).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {product.updated_at && (
                <div>
                  <label className="font-medium text-gray-700">Última actualización</label>
                  <p className="text-gray-600">
                    {new Date(product.updated_at).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
          <Button
            appearance="outline"
            intent="neutral"
            size="xs"
            onClick={onClose}
            className="rounded-full"
          >
            Cerrar
          </Button>
          <Button
            appearance="solid"
            intent="primary"
            size="xs"
            leadingIcon={<Edit className="h-3.5 w-3.5" />}
            onClick={() => onEdit(product)}
            className="rounded-full"
          >
            Editar Producto
          </Button>
        </div>
      </div>
    </>
  );
}
