-- MOA Database - Test Flows SQL
-- Description: Test de flujos críticos para validar integridad de BD
-- Version: 1.0.0
-- Date: November 22, 2025



-- (1) Verificar Estructura de Tablas ------------------------------------------------------------------------

\echo 'Estructura de Tablas'

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''


-- (2) Verificar Constraints de Órdenes ------------------------------------------------------------------------

\echo 'Constraints de Órdenes'

SELECT 
  conname AS constraint_name,
  CASE 
    WHEN conname LIKE '%metodo_pago%' THEN 'Payment Method'
    WHEN conname LIKE '%estado_orden%' THEN 'Order Status'
    WHEN conname LIKE '%metodo_despacho%' THEN 'Shipping Method'
    WHEN conname LIKE '%estado_pago%' THEN 'Payment Status'
    WHEN conname LIKE '%estado_envio%' THEN 'Shipping Status'
    ELSE 'Other'
  END AS constraint_type,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'ordenes'::regclass AND contype = 'c'
ORDER BY constraint_name;

\echo ''


-- (3) Verificar Índices Crítico ------------------------------------------------------------------------

\echo 'Índices Optimizados'

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('ordenes', 'productos', 'usuarios')
ORDER BY tablename, indexname;

\echo ''


-- (4) Validar Datos Seeded ------------------------------------------------------------------------

\echo 'Datos Iniciales (Seeds)'

SELECT 
  'Usuarios' as tabla, 
  COUNT(*) as registros,
  STRING_AGG(DISTINCT rol_code, ', ') as roles
FROM usuarios
UNION ALL
SELECT 
  'Categorías' as tabla, 
  COUNT(*) as registros,
  STRING_AGG(nombre, ', ' ORDER BY categoria_id LIMIT 3) as ejemplos
FROM categorias
UNION ALL
SELECT 
  'Productos' as tabla, 
  COUNT(*) as registros,
  CONCAT(COUNT(DISTINCT categoria_id), ' categorías') as info
FROM productos
UNION ALL
SELECT 
  'Órdenes' as tabla, 
  COUNT(*) as registros,
  STRING_AGG(DISTINCT estado_orden, ', ') as estados
FROM ordenes
UNION ALL
SELECT 
  'Direcciones' as tabla, 
  COUNT(*) as registros,
  STRING_AGG(DISTINCT comuna, ', ' ORDER BY comuna LIMIT 3) as comunas
FROM direcciones;

\echo ''


-- (5) Probar Constraint de Método de Pago INVÁLIDO ------------------------------------------------------------------------

\echo 'Constraint de Método de Pago'

BEGIN;

-- Intentar insertar orden con método de pago inválido (DEBE FALLAR)
\echo 'Intentando insertar orden con metodo_pago="bitcoin"...'
INSERT INTO ordenes (order_code, usuario_id, total_cents, metodo_pago)
SELECT 'TEST-INVALID-PAYMENT', usuario_id, 10000, 'bitcoin'
FROM usuarios LIMIT 1;

ROLLBACK;

\echo 'Si no viste ERROR arriba, el constraint NO está funcionando ❌'
\echo ''


-- (6) Probar Constraint de Estado Orden INVÁLIDO ------------------------------------------------------------------------

\echo 'Constraint de Estado Orden'

BEGIN;

-- Intentar insertar orden con estado inválido
-- ESTO DEBE FALLAR
\echo 'Intentando insertar orden con estado_orden="processing"...'
INSERT INTO ordenes (order_code, usuario_id, total_cents, estado_orden)
SELECT 'TEST-INVALID-STATUS', usuario_id, 10000, 'processing'
FROM usuarios LIMIT 1;

ROLLBACK;

\echo 'Si no viste ERROR arriba, el constraint NO está funcionando ❌'
\echo ''



-- (7) Simular Creación de Orden (CON stock decrement) ------------------------------------------------------------------------

\echo 'Flujo Completo de Orden'

BEGIN;

-- 1. Seleccionar producto con stock
SELECT producto_id, nombre, stock
FROM productos
WHERE stock > 10
ORDER BY producto_id
LIMIT 1;

-- 2. Guardar valores en variables temporales (simular con CTE)
WITH producto_seleccionado AS (
  SELECT producto_id, nombre, stock, precio_cents
  FROM productos
  WHERE stock > 10
  ORDER BY producto_id
  LIMIT 1
),
orden_nueva AS (
  INSERT INTO ordenes (
    order_code, 
    usuario_id, 
    total_cents, 
    metodo_pago, 
    metodo_despacho,
    estado_orden,
    estado_pago
  )
  SELECT 
    'TEST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-9999',
    usuario_id,
    (SELECT precio_cents * 2 FROM producto_seleccionado),
    'webpay',
    'standard',
    'confirmed',
    'pendiente'
  FROM usuarios
  WHERE rol_code = 'ADMIN'
  LIMIT 1
  RETURNING orden_id, order_code, total_cents
),
orden_item_nuevo AS (
  INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unit)
  SELECT 
    o.orden_id,
    p.producto_id,
    2, -- cantidad
    p.precio_cents
  FROM orden_nueva o, producto_seleccionado p
  RETURNING *
),
stock_actualizado AS (
  UPDATE productos
  SET stock = stock - 2
  WHERE producto_id = (SELECT producto_id FROM producto_seleccionado)
  RETURNING producto_id, nombre, stock
)
SELECT 
  'Orden creada: ' || order_code as resultado,
  'Total: $' || (total_cents / 100) as precio
FROM orden_nueva
UNION ALL
SELECT 
  'Stock DESPUÉS de orden: ' || nombre,
  'Stock: ' || stock
FROM stock_actualizado;

ROLLBACK;

\echo 'Test completado (ROLLBACK aplicado, no se guardaron cambios)'


-- (8) Verificar Foreign Keys ------------------------------------------------------------------------

\echo 'Foreign Keys'

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''


-- (9) Verificar Triggers ------------------------------------------------------------------------

\echo ' Triggers'

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''



-- (10) Verificar Extensiones ------------------------------------------------------------------------

\echo 'Extensiones de PostgreSQL'

SELECT 
  extname AS extension_name,
  extversion AS version,
  CASE 
    WHEN extname = 'pg_trgm' THEN 'Para búsquedas por similitud'
    ELSE ''
  END AS purpose
FROM pg_extension
WHERE extname NOT IN ('plpgsql')
ORDER BY extname;

\echo ''


----------------------------------------------------------------------------------------------------------------------------------------------

\echo ''
\echo '2 errores en (5) y (6) > los constraints funcionan ok'
\echo '(7) con decremento > flujo de órdenes funciona'
\echo ''
\echo 'Ejecutar de nuevo con:'
\echo '  psql -U postgres -d moa -f backend/scripts/test-database.sql'
\echo ''
