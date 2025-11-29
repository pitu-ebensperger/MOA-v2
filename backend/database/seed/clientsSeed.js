import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { CLIENTS } from "./clientsData.js";

const DEFAULT_PASSWORD = process.env.CLIENTS_PASSWORD || "Cliente123!";

const normalizeClient = (client) => {
  const rol_code = client.rol_code || "CLIENT";
  const status = (client.status || "activo").toLowerCase();
  return {
    ...client,
    rol_code,
    status,
    password: client.password || DEFAULT_PASSWORD,
  };
};

async function seedClients() {
  try {
    for (const client of CLIENTS) {
      const normalized = normalizeClient(client);
      const passwordHash = bcrypt.hashSync(normalized.password, 10);
      const publicId = normalized.publicId || nanoid();

      const query = `
        INSERT INTO usuarios (
          public_id,
          nombre,
          email,
          telefono,
          password_hash,
          rol_code,
          status,
          creado_en
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          telefono = EXCLUDED.telefono,
          password_hash = EXCLUDED.password_hash,
          rol_code = EXCLUDED.rol_code,
          status = EXCLUDED.status,
          creado_en = EXCLUDED.creado_en
        RETURNING usuario_id;
      `;
      const values = [
        publicId,
        normalized.nombre,
        normalized.email,
        normalized.telefono,
        passwordHash,
        normalized.rol_code,
        normalized.status,
        normalized.creado_en || new Date(),
      ];

      const result = await pool.query(query, values);
      console.log(`Cliente: ${normalized.email} - ID ${result.rows[0].usuario_id} (${normalized.creado_en ? 'con fecha histórica' : 'fecha actual'})`);
    }
    console.log("\n Seed de clientes completado correctamente.");
  } catch (error) {
    console.error("Error al insertar clientes:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedClients();
