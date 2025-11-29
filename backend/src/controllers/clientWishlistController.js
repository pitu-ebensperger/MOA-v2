import {
  getWishlistModel,
  addWishlistItemModel,
  deleteWishlistItemModel,
} from "../models/wishlistModel.js";
import { ValidationError } from "../utils/error.utils.js";

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await getWishlistModel(userId);
    return res.json({ items });
  } catch (error) {
    console.error("Error en getWishlist:", error);
    next(error);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { producto_id, productId } = req.body;
    const realId = producto_id ?? productId;

    if (!realId) {
      throw new ValidationError('producto_id es requerido', [
        { field: 'producto_id', message: 'Debe proporcionar el ID del producto' }
      ]);
    }

    const item = await addWishlistItemModel(userId, realId);

    return res.status(201).json({ item });
  } catch (error) {
    console.error("Error en addWishlistItem:", error);
    next(error);
  }
};

export const deleteWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      throw new ValidationError('productId es requerido', [
        { field: 'productId', message: 'Debe proporcionar el ID del producto en la URL' }
      ]);
    }

    await deleteWishlistItemModel(userId, productId);

    return res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error en deleteWishlistItem:", error);
    next(error);
  }
};
