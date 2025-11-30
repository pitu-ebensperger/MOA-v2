import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import { Breadcrumbs } from "@/components/layout/Breadcrumbs.jsx"
import { Accordion } from "@/components/ui"
import { Price } from "@/components/data-display/Price.jsx"

import { productsApi } from "@/services/products.api.js"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/app.constants.js"
import { useCategories } from "@/modules/products/hooks/useCategories.js"
import { API_PATHS } from "@/config/app.routes.js"
import { Minus, Plus, Recycle, ShieldCheck, Truck } from "lucide-react";
import { useCartContext } from "@/context/CartContext.jsx"
import { useAuth } from "@/context/AuthContext.jsx"

const initialState = {
  product: null,
  isLoading: true,
  error: null,
};

const formatDimensions = (dimensions) => {
  if (!dimensions) return null;
  const { width, length, height, unit = "cm" } = dimensions;
  const measures = [width, length, height].filter((value) => value !== undefined && value !== null);
  if (!measures.length) return null;
  if (measures.length === 3) {
    return `${width} × ${length} × ${height} ${unit}`;
  }
  return `${measures.join(" × ")} ${unit}`;
};

const formatWeight = (weight) => {
  if (!weight) return null;
  if (weight.value === undefined || weight.value === null) return null;
  return `${weight.value} ${weight.unit ?? "kg"}`;
};


export const ProductDetailPage = () => {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [state, setState] = useState(initialState);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, updateQuantity } = useCartContext() ?? {};
  const { isAuthenticated } = useAuth();
  const productsBasePath = API_PATHS.products.products;

  const baseBreadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: productsBasePath },
  ];

  useEffect(() => {
    if (!slugOrId) {
      setState({ product: null, isLoading: false, error: new Error("Producto no encontrado") });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // First fetch by slug to get the product with its ID
    productsApi
      .getBySlug(slugOrId)
      .then((product) => {
        if (cancelled) return;
        // Now we have the product with its numeric ID for any future operations
        setState({ product, isLoading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ product: null, isLoading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [slugOrId]);

  const product = state.product;
  const toPrimitive = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v;
    // If it's an object, try common id/slug fields
    if (typeof v === 'object') {
      if (v.id !== undefined && v.id !== null) return v.id;
      if (v.slug) return v.slug;
      if (v.toString && typeof v.toString === 'function') {
        try {
          const s = v.toString();
          if (typeof s === 'string') return s;
        } catch {
          // ignore
        }
      }
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };
  const categoryBreadcrumb = useMemo(() => {
    if (!product) return null;
    // Robust extracción y comparación de IDs evitando coerción de objetos complejos
    const toComparable = (val) => {
      try {
        if (val == null) return null;
        if (typeof val === 'string' || typeof val === 'number') return String(val);
        if (typeof val === 'bigint') return val.toString();
        if (typeof val.toString === 'function') {
          const str = val.toString();
          return typeof str === 'string' ? str : null;
        }
        return null;
      } catch {
        return null;
      }
    };

    const candidateId = product.fk_category_id ?? product.categoryId ?? product.category?.id ?? null;
    const candidateComparable = toComparable(candidateId);
    const match = candidateComparable
      ? categories.find((category) => {
          const catComparable = toComparable(category.id);
          return catComparable !== null && catComparable === candidateComparable;
        })
      : null;
    if (match) {
      const param = toPrimitive(match.slug ?? match.id ?? candidateId);
      const href = param ? `${productsBasePath}?category=${encodeURIComponent(String(param))}` : productsBasePath;
      return {
        label: match.name ?? "Categoría",
        href,
      };
    }
    return null;
  }, [product, categories, productsBasePath]);

  const materialList = useMemo(() => {
    if (!product) return [];
    const materials = Array.isArray(product.materials) ? product.materials : [];
    if (materials.length) return materials.filter(Boolean);
    if (product.material) return [product.material];
    return [];
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const rawGallery = Array.isArray(product.gallery) ? product.gallery : [];
    const filtered = rawGallery.filter(Boolean);
    if (filtered.length) return filtered;
    if (product.imgUrl) return [product.imgUrl];
    if (product.imageUrl) return [product.imageUrl];
    return [];
  }, [product]);

  const mainImage = galleryImages[0] ?? DEFAULT_PLACEHOLDER_IMAGE;
  const thumbnailImages = galleryImages.slice(1, 4);
  const hasDimensions = Boolean(product?.dimensions);
  const hasWeight = Boolean(product?.weight);
  const hasMeasurementDetails = hasDimensions || hasWeight;

  const highlights = [
    {
      icon: <Truck className="size-4" aria-hidden />,
      label: "Despacho rápido",
      description: "48-72 h dentro de la RM. Regiones vía transporte asociado.",
    },
    {
      icon: <ShieldCheck className="size-4" aria-hidden />,
      label: "Garantía MOA",
      description: "18 meses contra defectos de fabricación.",
    },
    {
      icon: <Recycle className="size-4" aria-hidden />,
      label: "Materiales responsables",
      description: materialList.length ? materialList.join(" · ") : "Selección sustentable certificada.",
    },
  ];

  const sections = [
    {
      title: "Descripción",
      content: product?.description ?? "Producto MOA diseñado para acompañar tus espacios.",
      defaultOpen: true,
    },
    {
      title: "Materiales y cuidado",
      content:
        materialList.length > 0
          ? `Fabricado en ${materialList.join(
              ", ",
            )}. Limpiar con paño seco y evitar exposición directa y prolongada al sol o humedad.`
          : "Recomendamos limpieza suave con paño seco y proteger de la luz solar directa.",
    },
    {
      title: "Medidas y especificaciones",
      content: (
        <ul className="space-y-2">
          {hasDimensions && (
            <li>
              <span className="font-medium text-neutral-800">Dimensiones:&nbsp;</span>
              <span>{formatDimensions(product.dimensions)}</span>
            </li>
          )}
          {hasWeight && (
            <li>
              <span className="font-medium text-neutral-800">Peso:&nbsp;</span>
              <span>{formatWeight(product.weight)}</span>
            </li>
          )}
          {!hasMeasurementDetails && (
            <li>Consultar ficha técnica para más detalles.</li>
          )}
        </ul>
      ),
    },
    {
      title: "Despachos y devoluciones",
      content:
        "Despachamos a todo Chile a través de partners logísticos. Puedes solicitar devolución dentro de los 10 días siguientes a la entrega si el producto no fue usado y mantiene su empaque original.",
    },
  ];

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(99, prev + 1));
  };

  if (state.isLoading) {
    return (
      <main className="page container-px mx-auto max-w-6xl py-12">
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
        <div className="h-120 animate-pulse rounded-4xl bg-neutral-100" />
      </main>
    );
  }

  if (state.error || !product) {
    return (
      <main className="page container-px mx-auto max-w-6xl py-12">
        <Breadcrumbs items={baseBreadcrumbItems} className="mb-6" />
        
        <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          No encontramos el producto que estás buscando.
        </div>
      </main>
    );
  }

  const breadcrumbItems = categoryBreadcrumb
    ? [...baseBreadcrumbItems, categoryBreadcrumb]
    : baseBreadcrumbItems;

  return (
    <>
      <main className="page container-px mx-auto max-w-6xl py-10 lg:py-14">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <article className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="space-y-4 h-full">
            <div className="relative flex h-full flex-col overflow-hidden rounded-4xl bg-neutral-100 shadow-sm max-h-[580px]">
              <img
                src={mainImage}
                alt={product.name ?? "Imagen del producto"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = DEFAULT_PLACEHOLDER_IMAGE;
                  e.target.onerror = null; // Prevenir loop infinito
                }}
              />
            </div>
            {thumbnailImages.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {thumbnailImages.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className="overflow-hidden rounded-3xl border border-neutral-200 bg-white"
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name ?? "Producto"} - vista ${index + 2}`}
                      className="h-24 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none'; // Ocultar si falla
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="title-sans text-xl leading-tight text-(--color-secondary12) sm:text-2xl sm:leading-tight">{product.name}</h1>
              <div className="mt-0 flex items-baseline gap-3">
                <Price value={product.price} className="text-3xl font-semibold text-(--color-secondary1)" />
                {product.compareAtPrice && (
                  <Price value={product.compareAtPrice} className="text-base text-neutral-400 line-through" />
                )}
              </div>
              <div className="mt-2 inline-flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      ✓ En stock
                    </span>
                    <span className="text-xs text-neutral-500">({product.stock} disponibles)</span>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                    ✕ Sin stock
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className={`flex items-center justify-between rounded-full px-4 py-2 text-lg font-medium text-neutral-900 sm:w-40 border border-(--border-subtle) ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={product.stock <= 0}
                  className="text-(--color-secondary1) transition hover:text-(--color-primary1) disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={product.stock <= 0}
                  className="text-(--color-secondary1) transition hover:text-(--color-primary1) disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { authRequired: true } });
                    return;
                  }
                  if (!addToCart) return;
                  
                  // Agregar producto al carrito con la cantidad correcta
                  addToCart(product);
                  if (quantity > 1 && updateQuantity) {
                    // La cantidad inicial es 1, así que actualizamos al total deseado
                    updateQuantity(product.id, quantity);
                  }
                  
                  // Resetear cantidad después de agregar
                  setQuantity(1);
                }}
                className="w-full rounded-full border border-(--color-primary1) px-6 py-2 text-base font-medium text-(--color-primary1) transition hover:bg-(--color-primary1) hover:text-(--color-light) disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                Agregar al carrito
              </button>
            </div>

            <section className="space-y-2 border-t border-(--color-secondary2) pt-4">
              <p className="text-xs uppercase tracking-[0.25em] text-(--color-secondary1)">SKU {product.sku}</p>
              <Accordion sections={sections} />
            </section>
          </div>
        </article>
      </main>

      <section className="w-full py-6 bg-(--color-secondary1)">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-(--color-secondary2) text-sm text-(--color-light) sm:grid-cols-2 lg:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-(--color-secondary2)">
          {highlights.map((highlight) => (
            <div
              key={highlight.label}
              className="flex flex-col gap-2 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{highlight.icon}</span>
                <p className="font-semibold">{highlight.label}</p>
              </div>
              <p>{highlight.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;
