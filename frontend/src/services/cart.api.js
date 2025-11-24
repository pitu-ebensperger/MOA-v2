import { apiClient } from '@/services/api-client.js'

// Nota: Se migró de métodos getCart/addToCart/etc. a get/add/remove/updateQuantity/clear.
// Para mantener compatibilidad con código legacy (evitar TypeError en builds antiguos)
// se añaden alias luego de definir el objeto principal.
export const cartApi = {
  /*GET /cart*/
  get: async () => {
    try {
      const response = await apiClient.private.get('/cart')
      return response?.data || response
    } catch (error) {
      console.error('[cartApi.get] Error obteniendo carrito:', error);
      throw error
    }
  },

  /**POST /cart/add
   * @param {number} productId - ID del producto
   * @param {number} quantity - Cantidad (default: 1)
   */
  add: async (productId, quantity = 1) => {
    try {
      const response = await apiClient.private.post('/cart/add', {
        producto_id: productId,
        cantidad: quantity
      })
      return response?.data || response
    } catch (error) {
      console.error('[cartApi.add] Error agregando al carrito:', error);
      console.debug('[cartApi.add] error.response:', error.response);
      throw error
    }
  },

  /** DELETE /cart/remove/:productId
   * @param {number} productId - ID del producto a eliminar
   */
  remove: async (productId) => {
    try {
      const response = await apiClient.private.delete(`/cart/remove/${productId}`)
      return response?.data || response
    } catch (error) {
      console.error('[cartApi.remove] Error eliminando del carrito:', error);
      throw error
    }
  },

  /*DELETE /cart/clear */
  clear: async () => {
    try {
      const response = await apiClient.private.delete('/cart/clear')
      return response?.data || response
    } catch (error) {
      console.error('[cartApi.clear] Error vaciando carrito:', error);
      throw error
    }
  },

  /**
   * Actualizar cantidad de un item (implementado via remove + add)
   * @param {number} productId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   */
  updateQuantity: async (productId, newQuantity) => {
    try {
      // Primero eliminar el item
      await cartApi.remove(productId)
      // Luego agregarlo con la nueva cantidad
      if (newQuantity > 0) {
        return await cartApi.add(productId, newQuantity)
      }
      return { success: true, message: 'Item eliminado' }
    } catch (error) {
      console.error('[cartApi.update] Error actualizando cantidad:', error);
      throw error
    }
  }
}

// Compatibilidad retroactiva (para código que aún llama cartApi.getCart / addToCart / etc.)
// Evita TypeError: cartApi.getCart is not a function
cartApi.getCart = cartApi.get
cartApi.addToCart = cartApi.add
cartApi.removeFromCart = cartApi.remove
cartApi.clearCart = cartApi.clear
cartApi.updateCartItemQuantity = cartApi.updateQuantity

// Exports individuales (manteniendo ambos nombres)
export const getCart = cartApi.get
export const addToCart = cartApi.add
export const removeFromCart = cartApi.remove
export const clearCart = cartApi.clear
export const updateCartItemQuantity = cartApi.updateQuantity
