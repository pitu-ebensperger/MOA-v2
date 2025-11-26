# Anexo: Errores comunes, decisiones y cómo se resolvieron

Este anexo documenta problemas reales encontrados (y otros muy comunes) y las decisiones que tomamos, con el "por qué" detrás.

## 1) Importar código compartido en Vite dev (403/FS allow)
- Síntoma: importar desde `../shared` (fuera de `frontend`) en dev daba 403.
- Causa: Vite dev server restringe lectura fuera del proyecto.
- Decisión: permitir explícitamente en `frontend/vite.config.js`:
  - `server.fs.allow: [path.resolve(__dirname, '.'), path.resolve(__dirname, '../shared')]`.
- Por qué: habilita imports de `@shared/*` en desarrollo sin debilitar seguridad del dev server.

## 2) Dividir `react-query-lite` (core vs React wrappers)
- Síntoma: necesitábamos reusar el "motor" (QueryClient) en shared, pero los hooks y Provider son específicos de React.
- Decisión: mantener `QueryClient` y utils en `shared/lib/react-query-lite/`; mover `QueryClientProvider`, `useQuery*` a `frontend/src/lib/react-query-lite/`.
- Por qué: separa responsabilidades, evita que el backend toque código de React y permite compartir el núcleo.

## 3) Eliminar barrel `@/components/shadcn/ui/index`
- Síntoma: importaciones a `@/components/shadcn/ui/index.js` pero no existía el barrel; generaba errores de módulo.
- Decisión: importar directo: `card.jsx`, `label.jsx`, `button-classes.js`.
- Por qué: menos acoplamiento y más claro; evitamos barrel roto.

## 4) Config de React Query (stale/retry) en el lugar correcto
- Síntoma: config vivía en shared; sólo el frontend la usa.
- Decisión: mover a `frontend/src/config/react-query.config.js` y usar en hooks.
- Por qué: single-responsibility y claridad de fronteras.

## 5) Falta `handleAuthError`
- Síntoma: `main.jsx` importaba `handleAuthError` inexistente.
- Decisión: crear `frontend/src/utils/handleAuthError.js` que maneja 401/403 (limpiar storage + redirect).
- Por qué: manejo coherente de sesión caída y evita reintentos inútiles.

## 6) Aliases y optimizaciones de Vite
- Acción: `@` → `./src`, `@shared` → `../shared` en `vite.config.js`.
- Extra: `optimizeDeps` puede incluir `@shared/lib/react-query-lite` si hace falta prebundle.
- Por qué: imports cortos/claros y builds más estables.

## 7) Paginación: cliente vs servidor
- Decisión: público (productos) en cliente; admin (usuarios/órdenes) en servidor.
- Por qué: datasets pequeños vs grandes; performance y precisión de conteos.

## 8) Export CSV (blob)
- Síntoma: descarga de binarios mal manejada.
- Decisión: `responseType: 'blob'` y `URL.createObjectURL` + `<a download>`.
- Por qué: manejo correcto de archivos y UX consistente.

## 9) Optimistic updates y rollback (wishlist)
- Riesgo: estado cacheado inconsistente si la mutación falla.
- Decisión: snapshot `previous` en `onMutate`, `onError` hace rollback, `onSettled` invalida.
- Por qué: UI rápida sin sacrificar consistencia eventual.

## 10) Offline/Online listeners
- Acción: listeners en `main.jsx` para `online/offline`, refetch al volver.
- Por qué: resiliencia y buena UX ante redes inestables.

## 11) Consola en producción y observabilidad
- Decisión: suavizar `console.error` en prod y enviar errores a `observability`.
- Por qué: reducir ruido al usuario y centralizar logs de errores reales.

## 12) Constantes compartidas
- Decisión: unificar en `shared/constants/` con nombres consistentes y remover duplicados.
- Por qué: single source of truth y menos drift entre frontend/backend.

---

### Checklist de riesgos evitados
- [x] Barrel roto eliminado.
- [x] FS allow para `../shared` configurado.
- [x] Core compartido vs React wrappers separado.
- [x] Configs frontend-only dentro de `frontend/src/config`.
- [x] Manejo de 401/403 consistente.
- [x] Paginación correcta según caso.
- [x] Export blob tratado como archivo.
- [x] Optimistic update con rollback.
- [x] Listeners de red + refetch.
- [x] Observabilidad activa en prod.
