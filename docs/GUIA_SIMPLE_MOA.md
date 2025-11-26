Guía simple de MOA: cómo funciona todo (explicado con ejemplos cotidianos)

Objetivo: Explicar, en lenguaje simple, cómo está conectado el backend con el panel admin y el frontend, cómo funcionan filtros/búsqueda/paginación, los layouts/grids, y pequeños detalles como el badge del carrito o el bloqueo de botones si no hay login. Incluye preguntas típicas que podrían hacerte.

1) Visión general (mapa mental)
- Backend (la cocina): Express + PostgreSQL. Recibe pedidos (requests), prepara datos (SQL), y devuelve platos listos (JSON). Rutas: /admin/... para cosas de administración.
- Frontend (el salón): React + Vite. Los meseros (hooks/api services) piden datos a la cocina y los sirven como tablas, tarjetas, y gráficos.
- Shared (la receta común): Código reutilizable (por ejemplo QueryClient core) accesible por ambos.
- Conector principal: "apiClient" hace las llamadas HTTP; en admin usamos services como analyticsApi u ordersAdminApi.

2) Cómo se conecta el backend a Admin (tablas, gráficos, textos)
Piensa: El dashboard es una serie de tarjetas/gráficos que piden datos a endpoints /admin/analytics/*.
- Rutas backend clave: backend/routes/adminRoutes.js
  - Métricas generales: GET /admin/analytics/dashboard → AdminController.getDashboardMetrics
  - Ventas (series por día/semana/mes): GET /admin/analytics/sales → AdminController.getSalesAnalytics
  - Conversión: GET /admin/analytics/conversion → AdminController.getConversionMetrics
  - Top productos: GET /admin/analytics/products/top → AdminController.getTopProducts
  - Categorías: GET /admin/analytics/categories → AdminController.getCategoryAnalytics
  - Stock: GET /admin/analytics/stock → AdminController.getStockAnalytics
  - Distribución de órdenes: GET /admin/analytics/orders/distribution → AdminController.getOrderDistribution
  - Nuevos clientes: GET /admin/analytics/customers/registrations → AdminController.getCustomerRegistrations
  - Pedidos admin (tabla/acciones): /admin/pedidos, /admin/pedidos/:id, export, updateStatus… via orderAdminController
  - Usuarios admin (tabla): GET /admin/usuarios (con page, limit, search)
- Controladores backend: backend/src/controllers/adminController.js (arma las consultas SQL y formatea resultados). Ej: buildDailyRevenueSeries arma un arreglo [{ date, revenue }] que el frontend puede graficar directo.
- Frontend llama a estos endpoints con servicios:
  - frontend/src/services/analytics.api.js → getDashboardMetrics(), getSalesAnalytics(), etc.
  - frontend/src/services/ordersAdmin.api.js → getAll(), getById(), updateStatus(), exportOrders()
  - frontend/src/services/customersAdmin.api.js → list({ page, limit, search })
- Flujo práctico (analogía):
  1) Un componente Admin pide "Ventas del mes" a analyticsApi.getSalesAnalytics().
  2) El backend consulta la DB, resume y devuelve números/series listos para usar.
  3) El componente muestra tarjetas (totales), gráficos (series) y texto (resumen). Sin transformar mucho en el frontend.

2.1) Paso a paso detallado: crear y consumir un endpoint de Admin
- ¿Qué queremos?: una tabla de usuarios con paginación y búsqueda.
- Backend (pasos):
  1) Ruta: en `backend/routes/adminRoutes.js` define `router.get('/admin/usuarios', verifyAdmin, asyncHandler(AdminController.getUsers))`.
  2) Seguridad: `verifyAdmin` comprueba token y rol ADMIN.
  3) Controlador: en `backend/src/controllers/adminController.js`, método `getUsers`:
     - Lee `page`, `limit`, `search` de `req.query`.
     - Arma `WHERE` con `ILIKE` si hay `search`.
     - Calcula `offset = (page-1)*limit`.
     - Ejecuta la query con `LIMIT` y `OFFSET`.
     - Obtiene `total` con `COUNT(*)` para calcular `totalPages`.
     - Devuelve `{ items, total, page, pageSize, totalPages }`.
- Frontend (pasos):
  1) Service: en `frontend/src/services/customersAdmin.api.js` crea `list({ page, limit, search })` que arma la query-string y llama al endpoint.
  2) Hook (opcional): un `useQuery` que use `customersAdminApi.list` y cachee por clave `['admin','users', page, limit, search]`.
  3) Componente: usa estados controlados `page`, `search`, `limit`, muestra la tabla y un componente `Pagination` (con `onPageChange`).
  4) UX: la barra de búsqueda actualiza `search` y reinicia `page=1`.

Visualizador (diagrama sencillo)

  [Componente Admin]
    │ (list)
    ▼
  customersAdminApi.list({ page, limit, search })  ← useQuery cachea por clave
    │
    ▼
  GET /admin/usuarios?page=1&limit=20&search=ana  ← verifyAdmin
    │
    ▼
  AdminController.getUsers → SQL con WHERE/LIMIT/OFFSET + COUNT
    │
    ▼
  { items, total, page, pageSize, totalPages }  → render tabla + paginación

3) Filtros, barras de búsqueda y paginación
Hay dos estilos: del lado del cliente (sin pedir de nuevo al backend) y del lado del servidor (con query params).
- Del lado del cliente (ej: listado de productos público):
  - Página: frontend/src/modules/products/pages/ProductsPage.jsx
  - Hooks: useProducts(), useProductFilters(), useCatalogControls().
  - Búsqueda: lee ?search= de la URL, la "debouncea" (espera 500ms) y filtra resultados en memoria.
  - Paginación: useProductFilters hace el corte por página (itemsPerPage) y maneja setCurrentPage.
  - Orden: setSort cambia el orden en memoria.

3.1) Paso a paso detallado: filtros cliente (Products)
- Inicialización: `useProducts()` trae los productos; `useCategories()` trae categorías.
- Controles: `useCatalogControls()` maneja `sort` y `itemsPerPage`.
- Filtros: `useProductFilters({ products, categories, sort, itemsPerPage })` devuelve:
  - `appliedFilters` (ej. categoría/precio), `paginatedProducts`, `paginationInfo`, y handlers (`onChangeCategory`, `onChangePrice`, `setCurrentPage`).
- Búsqueda:
  - Lee `search` desde URL (`useSearchParams`).
  - Aplica `useDebounce(search, 500)` para evitar filtrar en cada tecla.
  - Si hay búsqueda, pasa `{ q }` a `useProducts` o filtra localmente (según implementación).
- Paginación:
  - `itemsPerPage` controla tamaño de página.
  - Al cambiar `itemsPerPage`, se hace `setCurrentPage(1)`.
- Render:
  - `ProductGallery` recibe `paginatedProducts`.
  - `Pagination` muestra `page`, `totalPages`, `onPageChange`.

Visualizador (flujo cliente)

  Productos (memoria) → aplicar filtros (categoría/precio/búsqueda) → ordenar → cortar por página
      │
      ├─ `appliedFilters` (chips/labels visibles)
      └─ `paginationInfo` (page/totalPages/totalItems)
- Del lado del servidor (ej: usuarios admin):
  - Backend: GET /admin/usuarios recibe page, limit, search y hace LIMIT/OFFSET en SQL.
  - Frontend: customersAdminApi.list({ page, limit, search }) arma la query string y el backend devuelve items + total + page + pageSize.
  - Útil cuando hay muchos datos.
- Barras de búsqueda: simplemente controlan un estado (o URLSearchParams) y disparan un refetch o un filtrado local según el caso.

3.2) Paso a paso detallado: filtros servidor (Admin Users)
- Componente controla `page`, `limit`, `search`.
- Llama `customersAdminApi.list({ page, limit, search })`.
- Al escribir en la barra de búsqueda:
  - Aplica debounce (~300–500ms).
  - Reinicia `page=1`.
  - Hace refetch.
- Renderiza tabla y `Pagination` con `totalPages` que viene del backend.

4) Layouts y grid (cómo se ordena todo visualmente)
- Se usa Tailwind (clases utilitarias) para construir grids y diseños responsivos.
- Ejemplo claro: en ProductsPage.jsx hay una grilla de tarjetas con "grid gap-6 sm:grid-cols-2 lg:grid-cols-3". Traducción:
  - En pantallas pequeñas: 1 columna.
  - En sm (tablets): 2 columnas.
  - En lg (desktop): 3 columnas.
- Sidebar + contenido: se compone con flex y anchos fijos (lg:w-64 para el sidebar) y flex-1 para el contenido.
- Componentes de UI (shadcn adaptados): card.jsx, label.jsx, etc., que son divs/labels con clases ya estilosas.

4.1) Paso a paso detallado: layout con sidebar
- Contenedor: `<div className="flex flex-col gap-8 lg:flex-row lg:gap-12">`
- Sidebar: `<aside className="hidden lg:block lg:w-64 lg:shrink-0">` (aparece sólo en desktop)
- Contenido: `<div className="flex-1 min-w-0">` (toma el resto del espacio)
- Grid de tarjetas: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
- Reglas: piensa en cajitas que se acomodan; a medida que la pantalla crece, agregas más columnas.

Visualizador (layout)

  [Header/Breadcrumbs]
  ┌──────────────Página───────────────┐
  │ [Sidebar (lg)] │   [Contenido]    │
  │                │  Grid 1→2→3 cols │
  └────────────────┴──────────────────┘

5) Estado global y data fetching (muy corto)
- En main.jsx se crea un QueryClient (nuestro react-query-lite) y se provee con <QueryClientProvider>.
- Todos los hooks de datos (useQuery/useMutation) viven debajo de ese Provider y cachean/reenfocan/rehacen fetch.
- Config global: tiempos de stale/cache, reintentos, y manejo de errores global (handleAuthError, observability).

5.1) Paso a paso detallado: cómo se maneja el fetch/errores
- En `frontend/src/app/main.jsx`:
  - Crea `queryClient = new QueryClient({ defaultOptions: { queries: { retry, staleTime, ... }, mutations: { retry:false, onError } } })`.
  - `onError` captura y reporta errores.
  - `retry` evita reintentos en 4xx y si `handleAuthError(error)` detecta 401/403.
- Listeners de red:
  - `online`: log y `queryClient.refetchQueries()`.
  - `offline`: log/observabilidad.
- Dev helpers: expone `window.__MOA_QUERY_DUMP()` para ver el cache.

Visualizador (ciclo de query)

  Componente → useQuery({ queryKey, queryFn }) → cache
     │                    │
     │ onError/retry      └→ llamada HTTP (apiClient)
     └→ reintentos condicionales y políticas de stale/cache

6) Cosas prácticas visibles (carrito, wishlist, bloqueo por auth)
- Badge del carrito (puntito):
  - En Navbar.jsx, si hay items (cartItems.length > 0), se dibuja un circulito en la esquina del ícono.
  - Source of truth: CartContext (useCartContext) que expone cartItems y acciones.
- Bloquear carrito si no estás logeado:
  - En Navbar: si no hay sesión, el ícono te lleva a login con ?authRequired=true.
  - En el hook useCart (modules/cart/hooks/useCart.js): antes de mutar, ensureAuthenticated() redirige a login si no hay token.
- Wishlist si no hay sesión:
  - useAddToWishlistMutation: si no estás autenticado, muestra toast "Debes iniciar sesión" y lanza error para no continuar.
  - useToggleWishlist decide agregar/quitar y usa invalidate para refrescar estado luego.

6.1) Paso a paso detallado: carrito y wishlist
- Carrito:
  1) Fuente: `useCartQuery()` carga items del servidor.
  2) Acciones: `useAddToCart`, `useRemoveFromCart`, `useUpdateCartQuantity`, `useClearCart`.
  3) Guardado por auth: `ensureAuthenticated()` (en `useCart`) redirige a login si no hay token.
  4) Badge: en `Navbar.jsx`, si `cartItems.length > 0`, se muestra el puntito.
- Wishlist:
  1) Hook `useWishlistQuery` trae items; `enabled` depende de sesión.
  2) `useAddToWishlistMutation` usa optimistic update: agrega temporalmente; si falla, `onError` hace rollback.
  3) `useRemoveFromWishlistMutation` quita temporalmente; si falla, rollback.
  4) `useToggleWishlist` decide qué mutación usar.

Visualizador (optimistic update)

  Click "Favorito" → onMutate: actualiza cache al vuelo
      │
      ├─ éxito → invalidate para sincronizar
      └─ error → rollback al estado previo

7) Paso a paso: cómo harías X
- "Quiero una tabla admin con paginación y búsqueda":
  1) Backend: crea endpoint GET /admin/cosas con page, limit, search; hace SQL con LIMIT/OFFSET y COUNT total.
  2) Frontend: crea service cosasAdminApi.list({ page, limit, search }).
  3) Componente: controla estados page, search; pasa al service; muestra items y un componente Pagination.
  4) UX: la barra de búsqueda actualiza search y reinicia page=1.
- "Quiero un gráfico con ventas semanales":
  1) Backend: en el controller, agrega query que GROUP BY week y devuelva [{ week, revenue }].
  2) Ruta: GET /admin/analytics/sales?period=week.
  3) Frontend: analyticsApi.getSalesAnalytics({ period: 'week' }); pasa esos datos a tu componente de gráfico.
- "Quiero un layout con sidebar":
  1) Estructura: <div className="flex"> <aside className="w-64 hidden lg:block"/> <main className="flex-1"/> </div>
  2) Grids: añade sm:grid-cols-2, lg:grid-cols-3 según necesites.

7.1) Paso a paso detallado extra: export CSV de órdenes
- Objetivo: descargar un archivo .csv con filtros.
- Backend: `GET /admin/pedidos/export` (ya existe) acepta `format=csv` y filtros.
- Frontend: `ordersAdmin.api.js` → `exportOrders(params, 'csv')` que hace `responseType: 'blob'`.
- Componente: al hacer click, llama al service, crea un `URL.createObjectURL(blob)` y dispara `a.download`.
- UX: muestra loader mientras exporta y un toast al terminar.

8) Dónde ver el código exacto
- Rutas Admin: backend/routes/adminRoutes.js
- Lógica Admin: backend/src/controllers/adminController.js (y orderAdminController.js para pedidos)
- Servicios frontend Admin: frontend/src/services/analytics.api.js, ordersAdmin.api.js, customersAdmin.api.js
- Productos (filtros/paginación cliente): frontend/src/modules/products/pages/ProductsPage.jsx y hooks relacionados
- Navbar y badge carrito: frontend/src/components/layout/Navbar.jsx
- Carrito (auth/acciones): frontend/src/modules/cart/hooks/useCart.js y CartContext.jsx
- Wishlist (auth/acciones): frontend/src/modules/profile/hooks/useWishlistQuery.js
- React Query setup: frontend/src/app/main.jsx

9) Preguntas de profe (fáciles, medias, difíciles y capciosas)
- Fáciles:
  - ¿Cómo cambia el número de columnas del grid según la pantalla? (sm: 2, lg: 3… clases de Tailwind)
  - ¿Qué hace el Provider de QueryClient? (Habilita cache/fetch global)
  - ¿Cómo se muestra el "puntito" del carrito? (Si cartItems.length > 0)
- Medias:
  - Diferencia entre paginación en cliente vs servidor y cuándo elegir cada una.
  - ¿Cómo invalidas el cache después de una mutación? (queryClient.invalidateQueries)
  - ¿Cómo asegura el backend que sólo admin lleguen a /admin/*? (middleware verifyAdmin + token)
- Difíciles:
  - Explica cómo se construyen las series de tiempo (día/semana/mes) en el controller y por qué eso simplifica el frontend.
  - ¿Qué políticas de reintento y staleTime/config global usa react-query y por qué?
  - ¿Cómo manejarías millones de filas? (paginación en servidor, índices, filtros en SQL, streaming/export por lote)
- Capciosas:
  - Si falla una mutación de wishlist, ¿qué pasa con el optimistic update? (rollback en onError)
  - Si el usuario pierde internet, ¿qué hace la app? (listeners online/offline + refetch al volver)
  - ¿Se puede importar código fuera del frontend con Vite dev? (sí, pero hay que permitir ../shared en server.fs.allow)

Visualizadores extra (atajos mentales)
- "Cocina" (backend) → menú del día (JSON con KPIs y series). El salón sólo sirve.
- Filtros cliente: colador en la mesa. Filtros servidor: pides a cocina que ya te traiga la porción correcta.
- Optimistic update: le dices al cliente "tu mesa está lista" y acomodas; si no, te disculpas y vuelves atrás.
- Layout grid: mesas por filas; en móvil 1, en tablet 2, en desktop 3.

10) Preguntas para evaluar tu nivel (así ajusto la profundidad)
- Backend:
  - ¿Te sientes cómodo explicando una consulta SQL con GROUP BY y agregados?
  - ¿Puedes describir cómo funciona verifyAdmin y el flujo de auth?
- Frontend datos:
  - ¿Has usado antes React Query o conceptos de cache/invalidación?
  - ¿Prefieres filtrar/paginar en cliente o servidor? ¿Por qué?
- UI/UX:
  - ¿Qué entiendes por responsive en Tailwind (sm/md/lg) y cómo aplicarías una grilla distinta en móvil?
  - ¿Cuándo usarías un Drawer vs un Sidebar fijo?
- Flujo de negocio:
  - Si quisieras agregar un filtro nuevo en el admin de pedidos, ¿qué tocarías en backend y frontend?

11) Mini checklist de verificación rápida
- ¿Admin responde con datos ya listos para mostrar? Sí, controllers formatean series/kpis.
- ¿Productos públicos filtran/paginan en cliente? Sí, con hooks locales.
- ¿Usuarios admin paginan en servidor? Sí, page/limit/search.
- ¿Auth bloquea acciones de carrito/wishlist si no hay login? Sí, redirige o muestra toast.
- ¿Layouts responden a breakpoints? Sí, clases Tailwind sm:/lg:.

Fin. Si quieres, puedo agregar capturas/pantallazos o diagramas simples para cada flujo.

Anexos y material visual
- Diagramas (SVG): `docs/diagrams/` — admin-data-flow, client-filter-flow, layout-grid, query-lifecycle, optimistic-update.
- Slides (Reveal Markdown): `docs/slides/SLIDES_MOA.md`.
- Anexo de errores/decisiones: `docs/ANEXO_ERRORES_DECISIONES.md`.
