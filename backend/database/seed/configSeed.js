import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";

const CONFIG_DATA = {
  id: 1,
  nombre_tienda: "MOA",
  descripcion:
    "Muebles y decoración de diseño contemporáneo para crear espacios únicos. Calidad, estilo y funcionalidad en cada pieza.",
  direccion: "Providencia 1234, Santiago, Chile",
  telefono: "+56 2 2345 6789",
  email: "contacto@moa.cl",
  instagram_url: "https://instagram.com/moa",
  facebook_url: "",
  twitter_url: "",
};

async function seedConfig() {
  try {
    const query = `
      INSERT INTO configuracion_tienda (
        id, nombre_tienda, descripcion, direccion, telefono,
        email, instagram_url, facebook_url, twitter_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        nombre_tienda = EXCLUDED.nombre_tienda,
        descripcion = EXCLUDED.descripcion,
        direccion = EXCLUDED.direccion,
        telefono = EXCLUDED.telefono,
        email = EXCLUDED.email,
        instagram_url = EXCLUDED.instagram_url,
        facebook_url = EXCLUDED.facebook_url,
        twitter_url = EXCLUDED.twitter_url,
        actualizado_en = NOW()
    `;

    const values = [
      CONFIG_DATA.id,
      CONFIG_DATA.nombre_tienda,
      CONFIG_DATA.descripcion,
      CONFIG_DATA.direccion,
      CONFIG_DATA.telefono,
      CONFIG_DATA.email,
      CONFIG_DATA.instagram_url,
      CONFIG_DATA.facebook_url,
      CONFIG_DATA.twitter_url,
    ];

    await pool.query(query, values);
    console.log("✅ Configuración de tienda insertada/actualizada correctamente.");
  } catch (error) {
    console.error("❌ Error al insertar configuración de tienda:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedConfig();
