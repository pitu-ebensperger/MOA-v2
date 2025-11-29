import { apiClient } from '@/services/api-client.js'

export const cartApi = {
  /*GET /cart*/
  get: async () => {
    try {
      const response = await apiClient.private.get('/cart')
      return response?.data || response
    } catch (error) {
      // Si es 401, el usuario no está autenticado - retornar carrito vacío
      if (error?.status === 401) {
        if (import.meta.env.DEV) console.warn('[cartApi.get] Usuario no autenticado, retornando carrito vacío');
        return { items: [], total: 0 };
      }
      console.error('[cartApi.get] Error obteniendo carrito:', error);
      throw error
    }
  },

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
