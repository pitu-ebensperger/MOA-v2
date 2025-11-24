import pg from 'pg'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const isTestEnv = process.env.NODE_ENV === 'test'
// Valores pensados para desarrollo; sobreescríbelos con DB_POOL_* en producción
const DEFAULT_POOL_MAX = 20
const DEFAULT_IDLE_TIMEOUT = 30000
const DEFAULT_CONNECTION_TIMEOUT = 2000

const toNumber = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}
let pool

if (isTestEnv) {
  const { newDb, DataType } = await import('pg-mem')

  const db = newDb({
    autoCreateForeignKeyIndices: true
  })

  // Cargar esquema base
  const schemaDir = join(__dirname, 'schema')
  const baseSchemaRaw = readFileSync(join(schemaDir, 'DDL_base.sql'), 'utf-8')
  // Ajustes para compatibilidad con pg-mem
  let baseSchema = baseSchemaRaw.replace(/SMALLSERIAL/gi, 'SERIAL')
  baseSchema = baseSchema.replace(
    "    metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'webpay', 'tarjeta_credito', 'tarjeta_debito', 'paypal', 'efectivo')),\n",
    "    metodo_pago TEXT DEFAULT 'transferencia' CHECK (metodo_pago IS NULL OR metodo_pago IN ('transferencia', 'webpay', 'tarjeta_credito', 'tarjeta_debito', 'paypal', 'efectivo')),\n"
  )
  db.public.none(baseSchema)

  // Crear tablas adicionales necesarias para los tests (subset compatible de DDL_admin)
  db.public.none(`
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

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_id BIGSERIAL PRIMARY KEY,
      usuario_id BIGINT NOT NULL REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      creado_en TIMESTAMPTZ DEFAULT now(),
      expira_en TIMESTAMPTZ NOT NULL,
      usado_en TIMESTAMPTZ
    );

    INSERT INTO configuracion_tienda (id, nombre_tienda, descripcion)
    VALUES (1, 'MOA Test Store', 'Seed configuracion for tests')
    ON CONFLICT (id) DO NOTHING;
  `)

  const registerAdvisoryLock = (argTypes) => {
    db.public.registerFunction({
      name: 'pg_advisory_xact_lock',
      args: argTypes,
      returns: DataType.integer,
      implementation: () => 0
    })
  }

  [
    [DataType.integer, DataType.integer],
    [DataType.bigint, DataType.bigint],
    [DataType.text, DataType.text]
  ].forEach(registerAdvisoryLock)

  const pgMem = db.adapters.createPg()
  pool = new pgMem.Pool()
} else {
  const {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    DB_POOL_MAX,
    DB_POOL_IDLE_TIMEOUT_MS,
    DB_POOL_CONNECTION_TIMEOUT_MS,
    DB_SSL,
    DB_SSL_REJECT_UNAUTHORIZED,
  } = process.env

  const poolConfig = {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: toNumber(DB_PORT, 5432),
    max: toNumber(DB_POOL_MAX, DEFAULT_POOL_MAX),
    idleTimeoutMillis: toNumber(DB_POOL_IDLE_TIMEOUT_MS, DEFAULT_IDLE_TIMEOUT),
    connectionTimeoutMillis: toNumber(DB_POOL_CONNECTION_TIMEOUT_MS, DEFAULT_CONNECTION_TIMEOUT),
  }

  // Producción suele necesitar SSL; mantener opcional para entornos locales
  if (typeof DB_SSL === 'string' && DB_SSL.toLowerCase() === 'true') {
    const rejectUnauthorized = DB_SSL_REJECT_UNAUTHORIZED?.toLowerCase() !== 'false'
    poolConfig.ssl = { rejectUnauthorized }
  }

  pool = new pg.Pool(poolConfig)

  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('Error al conectar la base de datos', err)
    }
  })
}

export default pool
export { pool }
