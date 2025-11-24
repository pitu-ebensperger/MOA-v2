import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import pool from "../config.js";
import { ADDRESSES } from "./addressesData.js";

async function seedAddresses() {
  try {
    const emails = [...new Set(ADDRESSES.map((address) => address.email))];
    if (!emails.length) {
      console.log("No hay direcciones definidas para insertar.");
      return;
    }

    const { rows: users } = await pool.query(
      `SELECT usuario_id, email FROM usuarios WHERE email = ANY($1)`,
      [emails],
    );

    const userMap = new Map(users.map((user) => [user.email, user.usuario_id]));

    for (const address of ADDRESSES) {
      const userId = userMap.get(address.email);
      if (!userId) continue;

      const checkQuery = `
        SELECT direccion_id FROM direcciones
        WHERE usuario_id = $1 AND calle = $2 AND numero = $3 AND comuna = $4
        LIMIT 1
      `;
      const existing = await pool.query(checkQuery, [
        userId,
        address.street,
        address.number,
        address.commune,
      ]);

      if (existing.rows.length > 0) {
        const updateQuery = `
          UPDATE direcciones SET
            label = $1,
            nombre_contacto = $2,
            telefono_contacto = $3,
            departamento = $4,
            ciudad = $5,
            region = $6,
            codigo_postal = $7,
            referencia = $8,
            es_predeterminada = $9,
            actualizado_en = NOW()
          WHERE direccion_id = $10
        `;
        await pool.query(updateQuery, [
          address.label || 'casa',
          address.contactName,
          address.contactPhone,
          address.apartment,
          address.city,
          address.region,
          address.postalCode,
          address.reference,
          address.isDefault ?? false,
          existing.rows[0].direccion_id,
        ]);
        console.log(`✓ Dirección actualizada para ${address.email} (${address.label})`);
      } else {
        await pool.query(
          `
            INSERT INTO direcciones (
              usuario_id,
              label,
              nombre_contacto,
              telefono_contacto,
              calle,
              numero,
              departamento,
              comuna,
              ciudad,
              region,
              codigo_postal,
              referencia,
              es_predeterminada
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
          `,
          [
            userId,
            address.label || 'casa',
            address.contactName,
            address.contactPhone,
            address.street,
            address.number,
            address.apartment,
            address.commune,
            address.city,
            address.region,
            address.postalCode,
            address.reference,
            address.isDefault ?? false,
          ],
        );
        console.log(`✓ Dirección insertada para ${address.email} (${address.label})`);
      }
    }

    console.log("Seed de direcciones completado.");
  } catch (error) {
    console.error("Error al insertar direcciones:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAddresses();
