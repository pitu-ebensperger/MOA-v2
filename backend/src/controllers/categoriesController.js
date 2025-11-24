import { pool } from "../../database/config.js";
import { categoriesModel } from "../models/categoriesModel.js";

/* GET /categorias */
export async function getCategories(req, res, next) {
  try {
    const categories = await categoriesModel.getAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

/*GET /categorias/:id*/
export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    const category = await categoriesModel.getById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
}

/*POST /admin/categorias*/
export async function createCategory(req, res, next) {
  try {
    const { nombre, slug, descripcion, cover_image } = req.body;

    // Validaciones
    if (!nombre || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y slug son obligatorios'
      });
    }

    // Validar que el slug no exista
    const slugExists = await categoriesModel.slugExists(slug);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

    // Validar formato de slug (solo letras, números y guiones)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        success: false,
        message: 'El slug solo puede contener letras minúsculas, números y guiones'
      });
    }

    const newCategory = await categoriesModel.create({
      nombre,
      slug,
      descripcion,
      cover_image
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: newCategory
    });
  } catch (error) {
    next(error);
  }
}

/*PUT /admin/categorias/:id */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion, cover_image } = req.body;

    // Verificar que la categoría existe
    const existingCategory = await categoriesModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si se está actualizando el slug, validar que no exista (excepto el actual)
    if (slug && slug !== existingCategory.slug) {
      // Validar formato de slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          success: false,
          message: 'El slug solo puede contener letras minúsculas, números y guiones'
        });
      }

      const slugExists = await categoriesModel.slugExists(slug, id);
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'El slug ya existe'
        });
      }
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (slug !== undefined) updateData.slug = slug;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const updatedCategory = await categoriesModel.update(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
}

/*DELETE /admin/categorias/:id */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const existingCategory = await categoriesModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Intentar eliminar (el modelo verificará si tiene productos)
    await categoriesModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    // Capturar error específico de productos asociados
    if (error.message.includes('producto(s) asociado(s)')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

/*GET /admin/categorias/:id/productos/count */
export async function getCategoryProductCount(req, res, next) {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    const existingCategory = await categoriesModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const count = await categoriesModel.countProducts(id);

    res.status(200).json({
      success: true,
      data: {
        categoria_id: id,
        producto_count: count
      }
    });
  } catch (error) {
    next(error);
  }
}
