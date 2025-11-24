-- DDL base: tablas esenciales y relaciones (sin comentarios)

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol_code TEXT DEFAULT 'CLIENT' CHECK (rol_code IN ('CLIENT', 'ADMIN')),
    status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'bloqueado')),
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol_code ON usuarios(rol_code);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

-- Categorias
CREATE TABLE IF NOT EXISTS categorias (
    categoria_id SMALLSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    cover_image TEXT
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
    producto_id BIGSERIAL PRIMARY KEY,
    public_id TEXT UNIQUE NOT NULL,
    categoria_id SMALLINT REFERENCES categorias (categoria_id),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    precio_cents INT NOT NULL,
    stock INT DEFAULT 0,
    status TEXT DEFAULT 'activo',
    descripcion TEXT,
    img_url TEXT,
    gallery TEXT[],
    badge TEXT[],
    tags TEXT[],
    color TEXT,
    material TEXT,
    dimensions JSONB,
    weight JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_status ON productos(status);
CREATE INDEX IF NOT EXISTS idx_productos_slug ON productos(slug);
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);

-- Direcciones
CREATE TABLE IF NOT EXISTS direcciones (
    direccion_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
    label TEXT,
    nombre_contacto TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    calle TEXT NOT NULL,
    numero TEXT NOT NULL,
    departamento TEXT,
    comuna TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    region TEXT NOT NULL,
    codigo_postal TEXT,
    referencia TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direcciones_usuario ON direcciones (usuario_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada ON direcciones (usuario_id, es_predeterminada);

-- Carritos y items
CREATE TABLE IF NOT EXISTS carritos (
    carrito_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id) UNIQUE,
    status TEXT NOT NULL DEFAULT 'ABIERTO',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carrito_items (
    carrito_item_id BIGSERIAL PRIMARY KEY,
    carrito_id BIGINT REFERENCES carritos (carrito_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL,
    UNIQUE (carrito_id, producto_id)
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios (usuario_id)
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    wishlist_item_id BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL REFERENCES wishlists (wishlist_id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos (producto_id) ON DELETE CASCADE,
    UNIQUE (wishlist_id, producto_id)
);

-- Ordenes y orden_items
CREATE TABLE IF NOT EXISTS ordenes (
    orden_id BIGSERIAL PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL,
    usuario_id BIGINT REFERENCES usuarios (usuario_id),
    direccion_id BIGINT REFERENCES direcciones (direccion_id),
    subtotal_cents INT DEFAULT 0,
    envio_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'webpay', 'tarjeta_credito', 'tarjeta_debito', 'paypal', 'efectivo')),
    metodo_despacho TEXT DEFAULT 'standard' CHECK (metodo_despacho IN ('standard', 'express', 'retiro')),
    estado_orden TEXT DEFAULT 'confirmado' CHECK (estado_orden IN ('borrador', 'confirmado', 'cancelado')),
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'rechazado', 'reembolsado')),
    estado_envio TEXT DEFAULT 'preparacion' CHECK (estado_envio IN ('preparacion', 'enviado', 'en_transito', 'entregado', 'cancelado')),
    notas_cliente TEXT,
    fecha_pago TIMESTAMPTZ,
    fecha_envio TIMESTAMPTZ,
    fecha_entrega_real TIMESTAMPTZ,
    numero_seguimiento TEXT DEFAULT 'PENDIENTE_ASIGNAR',
    empresa_envio TEXT DEFAULT 'por_asignar' CHECK (empresa_envio IN ('chilexpress', 'blue_express', 'starken', 'correos_chile', 'por_asignar')),
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_pago ON ordenes(estado_pago);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_envio ON ordenes(estado_envio);
CREATE INDEX IF NOT EXISTS idx_ordenes_creado_en ON ordenes(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_creado ON ordenes(estado_orden, creado_en);

CREATE TABLE IF NOT EXISTS orden_items (
    orden_item_id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes (orden_id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos (producto_id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unit INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orden_items_orden ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto ON orden_items(producto_id);
