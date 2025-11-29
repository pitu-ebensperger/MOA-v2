import { categoriesModel } from "../models/categoriesModel.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await categoriesModel.getAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

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

export default {
  getCategories,
  getCategoryById
};
