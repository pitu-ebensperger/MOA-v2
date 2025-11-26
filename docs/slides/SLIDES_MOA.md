# MOA – Visión y Pasos Clave

Apertura

- Backend (Express + PostgreSQL)
- Frontend (React + Vite)
- Shared (utilidades comunes)
- Objetivo: ver cómo fluye la info y cómo se implementan filtros, layouts y UX prácticas.

---

## Mapa de flujo Admin

![Flujo Admin](../diagrams/admin-data-flow.svg)

Notas:
- Componentes piden datos vía servicios (`analyticsApi`, `ordersAdminApi`).
- Rutas `/admin/*` protegidas por `verifyAdmin`.
- Controladores devuelven datos listos para mostrar.

---

## Filtros en cliente (Products)

![Filtros cliente](../diagrams/client-filter-flow.svg)

Puntos claves:
- Búsqueda con debounce.
- `useProductFilters` aplica filtros, ordena y pagina en memoria.
- `Pagination` usa `paginationInfo`.

---

## Layout + Grid responsivo

![Layout grid](../diagrams/layout-grid.svg)

Tips:
- Sidebar fijo en `lg`.
- Grid 1→2→3 columnas con breakpoints Tailwind.

---

## Ciclo de query (react-query-lite)

![Query lifecycle](../diagrams/query-lifecycle.svg)

Claves:
- `staleTime` y `cacheTime`.
- `retry` evita 4xx y 401/403.
- `onError` → observabilidad.

---

## Optimistic update (Wishlist)

![Optimistic update](../diagrams/optimistic-update.svg)

Flujo:
- `onMutate` actualiza cache al vuelo.
- `onSettled` invalida para sincronizar.
- `onError` hace rollback.

---

## Extra: Export CSV de órdenes

Pasos rápidos:
1. Endpoint: `GET /admin/pedidos/export?format=csv`.
2. Service: `ordersAdminApi.exportOrders(params, 'csv')` con `responseType:'blob'`.
3. UI: crear URL del blob y descargar.

---

## Referencias

- Guía completa: `docs/GUIA_SIMPLE_MOA.md`
- Anexo (errores/decisiones): `docs/ANEXO_ERRORES_DECISIONES.md`

---

## ¿Prof evaluando?

- Prepárate para explicar cliente vs servidor en filtros.
- Cuenta por qué se partió `react-query-lite` entre core compartido y wrappers React.
- Explica `server.fs.allow` para importar desde `../shared` en Vite dev.

---

## Auth/Login y rutas protegidas

![Auth flow](../diagrams/auth-login-flow.svg)

Claves:
- Token en storage y `AuthContext` con `isAuthenticated`.
- `verifyAdmin` protege `/admin/*` en backend.
- `handleAuthError` limpia y redirige en 401/403.

---

## Carrito end-to-end

![Cart E2E](../diagrams/cart-end-to-end.svg)

Notas:
- `ensureAuthenticated` antes de mutar.
- `useCartQuery` + refetch/invalidate sincronizan el badge.

---

## Búsqueda Products: URL y estado

![Products search](../diagrams/products-search-url-state.svg)

Puntos:
- `URLSearchParams` + debounce.
- Cambiar `itemsPerPage` resetea página.

---

## Admin: actualizar estado orden

![Order status](../diagrams/admin-order-status-update.svg)

Pasos:
- PUT `/api/admin/orders/:id/status`.
- Refetch + toast; validaciones previas.

---

## Export CSV UX

![CSV export](../diagrams/csv-export-ux.svg)

Checklist:
- `responseType:'blob'`.
- `URL.createObjectURL` → download → `revokeObjectURL`.

---

## Errores y observabilidad

![Errors/obs](../diagrams/error-handling-observability.svg)

Resumen:
- `onError` y `retry` responsables.
- `console.error` filtrado en prod + captura a observabilidad.
