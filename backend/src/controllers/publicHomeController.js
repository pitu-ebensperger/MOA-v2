import { pool } from "../../database/config.js";

export async function getHome(req, res) {
  try {
    const { rows: rowsCategories } = await pool.query(`
        SELECT categoria_id AS id, nombre AS name, slug, descripcion AS description, cover_image AS "coverImage"
        FROM categorias
        ORDER BY categoria_id
        LIMIT 4
      `);

    const { rows: rowsProducts } = await pool.query(`
      SELECT
        producto_id AS id,
        public_id AS "publicId",
        nombre AS name,
        slug,
        sku,
        precio_cents AS price,
        stock,
        status,
        descripcion AS description,
        img_url AS "imgUrl",
        gallery,
        badge,
        tags,
        color,
        material,
        dimensions,
        weight,
        categoria_id AS "fk_category_id",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM productos
      ORDER BY producto_id;
    `);

    const { rows: storeConfig } = await pool.query(`
      SELECT 
        nombre_tienda AS "nombreTienda",
        descripcion,
        direccion,
        telefono,
        email,
        instagram_url AS "instagramUrl",
        facebook_url AS "facebookUrl",
        twitter_url AS "twitterUrl"
      FROM configuracion_tienda
      LIMIT 1
    `);

    return res.json({
      categories: rowsCategories,
      featuredProducts: rowsProducts,
      storeConfig: storeConfig[0] || null,

      editorialSections: [
        {
          id: "atelier-story",
          title: "Atelier en calma",
          description:
            "Geometrías curvas, tapices de lino y maderas certificadas que celebran lo artesanal con una mirada contemporánea.",
          image:
            "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop",
          cta: {
            label: "Ver piezas destacadas",
            href: `/productos`,
          },
        },
        {
          id: "bruma-living",
          title: "Living en capas suaves",
          description:
            "Sofás modulares con fundas lavables, mesas en fresno y lámparas en lino que aportan calidez inmediata.",
          image:
            "https://images.unsplash.com/photo-1616628182504-d51a0ff4e39f?q=80&w=1600&auto=format&fit=crop",
          cta: { label: "Inspiración living", href: "/lookbook/living" },
        },
      ],
    });
  } catch (error) {
    console.error("Error al obtener el home:", error);
    res.status(500).json({
      error: "Error al obtener el home",
    });
  }
}
