import { categoriesModel } from "../models/categoriesModel.js";

export async function createCategory(req, res, next) {
  try {
    const { nombre, slug, descripcion, cover_image } = req.body;

    if (!nombre || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y slug son obligatorios'
      });
    }

    const slugExists = await categoriesModel.slugExists(slug);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'El slug ya existe'
      });
    }

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

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, slug, descripcion, cover_image } = req.body;

    const existingCategory = await categoriesModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    if (slug && slug !== existingCategory.slug) {
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

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const existingCategory = await categoriesModel.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    await categoriesModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    if (error.message.includes('producto(s) asociado(s)')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

export async function getProductCount(req, res, next) {
  try {
    const { id } = req.params;

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

export default {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductCount: getProductCount
};
