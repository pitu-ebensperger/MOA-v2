import {
  getWishlistModel,
  addWishlistItemModel,
  deleteWishlistItemModel,
} from "../models/wishlistModel.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await getWishlistModel(userId);
    return res.json({ items });
  } catch (error) {
    console.error("Error en getWishlist:", error);
    return res.status(500).json({ error: "Error al obtener wishlist" });
  }
};

export const addWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const { producto_id, productId } = req.body;
    const realId = producto_id ?? productId;

    if (!realId) {
      return res.status(400).json({
        error: "Debes enviar producto_id o productId en el body",
      });
    }

    const item = await addWishlistItemModel(userId, realId);

    return res.status(201).json({ item });
  } catch (error) {
    console.error("Error en addWishlistItem:", error);
    return res.status(500).json({ error: "Error al agregar item" });
  }
};

export const deleteWishlistItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: "Debes enviar productId en la URL",
      });
    }

    await deleteWishlistItemModel(userId, productId);

    return res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error en deleteWishlistItem:", error);
    return res.status(500).json({ error: "Error al eliminar" });
  }
};
