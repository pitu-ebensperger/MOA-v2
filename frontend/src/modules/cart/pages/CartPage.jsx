import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useCartContext } from "@/context/CartContext.jsx"
import { Price } from "@/components/data-display/Price.jsx"
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/config/constants.js"
import { resolveProductPrice } from "@/modules/products/utils/products.js"
import { API_PATHS } from "@/config/api-paths.js"
import {
  buttonClasses,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "../../../components/shadcn/ui/index.js";
// Despacho y dirección ahora gestionados sólo en Checkout
import { QuantityControl } from '@/components/cart/QuantityControl.jsx'

const buildItemImage = (item) =>
  item?.imgUrl ?? item?.image ?? item?.gallery?.[0] ?? DEFAULT_PLACEHOLDER_IMAGE;

const getItemKey = (item, index) =>
  item?.id ?? item?.slug ?? item?.name ?? `cart-item-${index}`;

// Se removieron opciones de despacho del carrito; se calculan en Checkout

export const CartPage = () => {
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } = useCartContext();
  // Sin selección de despacho en carrito

  const hasItems = cartItems.length > 0;
  const totalUnits = useMemo(() => (
    cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0)
  ), [cartItems]);

  const grandTotal = total; // Total sin envío; envío se agrega en Checkout

  // Quantity handled directly via QuantityControl

  return (
    <main className="page container-px mx-auto max-w-6xl py-12">
      <header className="mb-10 space-y-3">
        <h1 className="title-serif text-4xl text-(--color-primary1)">
          {hasItems ? "Carro de compra" : "Tu carrito aún no tiene tesoros"}
        </h1>
        {/* Métricas removidas según solicitud: tipos, unidades y total inline */}
      </header>

      {hasItems ? (
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-(--border)">
                      {cartItems.map((item, index) => {
                        const itemPrice = resolveProductPrice(item) ?? 0;
                        const quantity = Number(item.quantity) || 1;
                        const itemTotal = itemPrice * quantity;

                        return (
                          <div
                            key={getItemKey(item, index)}
                            className="flex flex-col gap-4 px-4 py-5 first:pt-5 last:pb-5 sm:grid sm:grid-cols-[minmax(0,1fr)_92px_160px] sm:items-center sm:gap-6"
                          >
                            {/* Col 1: Imagen + info */}
                            <div className="flex items-center gap-4">
                              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#44311417]">
                                <img
                                  src={buildItemImage(item)}
                                  alt={item.name ?? "Producto"}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex flex-col justify-center min-w-0">
                                <p className="font-display text-lg leading-snug text-(--color-primary2) truncate">{item.name}</p>
                                <p className="text-xs uppercase text-(--color-text-muted) leading-tight">
                                  SKU {item.sku ?? "—"}
                                </p>
                                <div className="mt-1 text-xs flex items-center gap-1 text-(--color-text-muted)">
                                  <span className="uppercase">Precio unidad:</span>
                                  <Price value={itemPrice} className="font-semibold text-(--color-primary2)" />
                                </div>
                              </div>
                            </div>

                            {/* Col 2: Controles */}
                            <div className="flex items-center justify-center gap-1 w-[92px]">
                              <QuantityControl
                                value={quantity}
                                onChange={(next) => updateQuantity(item.id, next)}
                                min={1}
                              />
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className={buttonClasses({
                                  variant: "ghost",
                                  size: "icon",
                                  className: "h-8 w-8 text-(--color-text-muted) hover:text-(--color-primary1)",
                                })}
                                aria-label={`Eliminar ${item.name}`}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Col 3: Subtotal */}
                            <div className="flex items-center justify-end w-40">
                              <Price value={itemTotal} className="text-lg  text-(--color-primary1)" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-row items-center justify-between gap-4 px-4">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-semibold text-(--color-text-muted) transition hover:text-(--color-primary1) rounded-full border border-(--border) px-4 py-2 bg-white/40 backdrop-blur-sm hover:border-(--color-primary1)"
                    >
                      Vaciar carrito
                    </button>
                    <div className="flex items-center gap-3 text-xs text-(--color-text-muted)">
                      <span className="uppercase tracking-tight">Total carro</span>
                      <Price value={total} className="text-lg font-medium text-(--color-secondary)" />
                    </div>
                  </CardFooter>
                </Card>
                {/* Sección de despacho eliminada del carrito */}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <Card className="bg-(--color-lightest) ring-1 ring-(--border)/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-(--color-primary2)">Resumen de compra</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-xs uppercase text-(--color-text-muted)">
                      <span>{cartItems.length} tipo{cartItems.length === 1 ? '' : 's'}</span>
                      <span>{totalUnits} unidad{totalUnits === 1 ? '' : 'es'}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-(--color-text-muted)">
                        <span className="tracking-tight">Subtotal productos</span>
                        <Price value={total} className="text-sm" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-(--color-text-muted)">Total (sin envío)</span>
                        <Price value={grandTotal} className="text-xl font-bold text-(--color-primary1) tracking-tight" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <Link
                      to="/checkout"
                      className={buttonClasses({
                        variant: "primary",
                        size: "md",
                        className: "w-full justify-center gap-2 text-white",
                      })}
                    >
                        Continuar al checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={API_PATHS.products.products}
                      className={buttonClasses({
                        variant: "outline",
                        size: "md",
                        className: "w-full justify-center",
                      })}
                    >
                      Seguir explorando
                    </Link>
                  </CardFooter>
                </Card>
              </aside>
        </div>
      ) : (
        <Card className="flex flex-col items-center gap-6 border-dashed py-16 text-center">
          <div className="rounded-full bg-(--color-primary4)/70 p-6 text-(--color-primary1)">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-(--color-primary2)">Tu carrito está vacío</h2>
            <p className="text-sm text-(--color-text-secondary) max-w-md">
              Explora el catálogo MOA, guarda tus favoritos y podrás retomar el checkout cuando quieras.
            </p>
          </div>
          <Link
            to={API_PATHS.products.products}
            className={buttonClasses({
              variant: "ghost",
              size: "md",
              className: "text-(--color-primary1)",
            })}
          >
            Comenzar a explorar
          </Link>
        </Card>
      )}
    </main>
  );
};
