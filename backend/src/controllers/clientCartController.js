import {
  getCartItems,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  updateCartItemQuantity,
} from "../models/cartModel.js";
import { ValidationError } from "../utils/error.utils.js";

const getRequestUserId = (req) => req.user?.usuario_id ?? req.user?.id;

export const getCart = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);

    const result = await getCartItems(userId);

    return res.json({
      cart_id: result.cart_id,
      items: result.items,
    });
  } catch (error) {
    console.error("Error en getCart:", error);
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    const { producto_id, cantidad = 1 } = req.body;

    if (!producto_id) {
      throw new ValidationError('producto_id es requerido', [
        { field: 'producto_id', message: 'Debe proporcionar el ID del producto' }
      ]);
    }

    const item = await addItemToCart(userId, producto_id, cantidad);

    return res.status(201).json({ item });
  } catch (error) {
    console.error("Error en addToCart:", error);
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    const { productId } = req.params;

    if (!productId) {
      throw new ValidationError('productId es requerido', [
        { field: 'productId', message: 'Debe proporcionar el ID del producto en la URL' }
      ]);
    }

    const removed = await removeItemFromCart(userId, productId);

    return res.json({
      message: "Producto eliminado",
      removed,
    });
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);
    const { producto_id, cantidad } = req.body;

    if (!producto_id) {
      throw new ValidationError('producto_id es requerido', [
        { field: 'producto_id', message: 'Debe proporcionar el ID del producto' }
      ]);
    }

    const parsedQuantity = Number(cantidad);
    if (Number.isNaN(parsedQuantity)) {
      throw new ValidationError('Cantidad inválida', [
        { field: 'cantidad', message: 'La cantidad debe ser un número válido' }
      ]);
    }

    if (parsedQuantity <= 0) {
      await removeItemFromCart(userId, producto_id);
      return res.json({ message: "Producto eliminado" });
    }

    const updated = await updateCartItemQuantity(
      userId,
      producto_id,
      parsedQuantity
    );

    return res.json({ item: updated });
  } catch (error) {
    console.error("Error en updateCartItem:", error);
    next(error);
  }
};

export const emptyCart = async (req, res, next) => {
  try {
    const userId = getRequestUserId(req);

    await clearCart(userId);

    return res.json({ message: "Carrito vaciado" });
  } catch (error) {
    console.error("Error en emptyCart:", error);
    next(error);
  }
};
