-- DDL ADMIN
-- extensiones, funciones/triggers, tablas admin + indices 

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Función para actualizar automáticamente la columna actualizado_en
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT now(),
    expira_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON password_reset_tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expira_en);

-- Configuración de la tienda
CREATE TABLE IF NOT EXISTS configuracion_tienda (
    id SERIAL PRIMARY KEY,
    nombre_tienda TEXT NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_por BIGINT REFERENCES usuarios(usuario_id)
);

-- Crear trigger de actualizado_en para direcciones (se asume que tabla direcciones ya existe en DDL_base)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_direcciones_updated_at'
  ) THEN
    CREATE TRIGGER trigger_direcciones_updated_at
    BEFORE UPDATE ON direcciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END$$;

-- Índices avanzados
CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin(nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_search ON productos USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));
