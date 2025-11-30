-- Migración: Agregar ON DELETE CASCADE a relaciones de usuario
-- Fecha: 2025-11-30
-- Propósito: Asegurar integridad referencial al eliminar usuarios sin órdenes

-- 1. Carritos: Agregar CASCADE
ALTER TABLE carritos 
DROP CONSTRAINT IF EXISTS carritos_usuario_id_fkey,
ADD CONSTRAINT carritos_usuario_id_fkey 
  FOREIGN KEY (usuario_id) 
  REFERENCES usuarios(usuario_id) 
  ON DELETE CASCADE;

-- 2. Wishlists: Agregar CASCADE
ALTER TABLE wishlists 
DROP CONSTRAINT IF EXISTS wishlists_usuario_id_fkey,
ADD CONSTRAINT wishlists_usuario_id_fkey 
  FOREIGN KEY (usuario_id) 
  REFERENCES usuarios(usuario_id) 
  ON DELETE CASCADE;

-- NOTA: ordenes NO tiene CASCADE intencionalmente
-- Las órdenes deben preservarse para historial y contabilidad
-- El controlador maneja la eliminación: desactiva usuarios con órdenes, elimina usuarios sin órdenes
