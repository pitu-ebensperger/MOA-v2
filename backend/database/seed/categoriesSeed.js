import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { CATEGORIES } from "./categoriesData.js";

async function seedCategorias() {
  try {
    for (const cat of CATEGORIES) {
      await pool.query(
        `INSERT INTO categorias (nombre, slug, descripcion, cover_image)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (slug) DO NOTHING`,
        [cat.nombre, cat.slug, cat.descripcion, cat.cover_image]
      );
    }
    console.log("Categorías insertadas correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al insertar categorías:", error);
    process.exit(1);
  }
}

seedCategorias();
