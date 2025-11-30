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
    console.log(`Usuario administrador '${ADMIN_PROFILE.email}' asegurado (otros usuarios preservados)`);
  } catch (error) {
    console.error("No se pudo insertar el usuario administrador", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAdminUser();
