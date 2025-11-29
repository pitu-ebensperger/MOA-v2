import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";

const ADMIN_PROFILE = {
  publicId: nanoid(),
  nombre: "Administrador MOA",
  email: "admin@moa.cl",
  telefono: "+56900000000",
  password: process.env.ADMIN_PASSWORD,
  rol_code: "ADMIN",
};

async function cleanupNonAdminUsers() {
  const { rows: extraUsers } = await pool.query(
    "SELECT usuario_id FROM usuarios WHERE email <> $1",
    [ADMIN_PROFILE.email]
  );

  if (!extraUsers.length) {
    return;
  }

  const extraIds = extraUsers.map((row) => row.usuario_id);
  const cleanupQueries = [
    {
      text: "UPDATE configuracion_tienda SET actualizado_por = NULL WHERE actualizado_por = ANY($1)",
      values: [extraIds],
    },
    { text: "DELETE FROM ordenes WHERE usuario_id = ANY($1)", values: [extraIds] },
    { text: "DELETE FROM carritos WHERE usuario_id = ANY($1)", values: [extraIds] },
    { text: "DELETE FROM wishlists WHERE usuario_id = ANY($1)", values: [extraIds] },
    { text: "DELETE FROM direcciones WHERE usuario_id = ANY($1)", values: [extraIds] },
    { text: "DELETE FROM usuarios WHERE usuario_id = ANY($1)", values: [extraIds] },
  ];

  for (const query of cleanupQueries) {
    await pool.query(query.text, query.values);
  }

  console.log(
    `Eliminados ${extraIds.length} usuario(s) extra y sus referencias asociadas`
  );
}

async function seedAdminUser() {
  const passwordHash = bcrypt.hashSync(ADMIN_PROFILE.password, 10);
  const sql = `
    INSERT INTO usuarios (public_id, nombre, email, telefono, password_hash, rol_code)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      telefono = EXCLUDED.telefono,
      password_hash = EXCLUDED.password_hash,
      rol_code = EXCLUDED.rol_code
  `;
  const values = [
    ADMIN_PROFILE.publicId,
    ADMIN_PROFILE.nombre,
    ADMIN_PROFILE.email,
    ADMIN_PROFILE.telefono,
    passwordHash,
    ADMIN_PROFILE.rol_code,
  ];

  try {
    await pool.query(sql, values);
    await cleanupNonAdminUsers();
    console.log(`Usuario administrador '${ADMIN_PROFILE.email}' asegurado`);
    process.exit(0);
  } catch (error) {
    console.error("No se pudo insertar el usuario administrador", error);
    process.exit(1);
  }
}

seedAdminUser();
