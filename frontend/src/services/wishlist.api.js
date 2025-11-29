import { apiClient } from '@/services/api-client.js'

export const wishlistApi = {
  get: async () => {
    try {
      const response = await apiClient.private.get('/wishlist')
      return response?.data || response
    } catch (error) {
      console.error('[wishlistApi.get] Error obteniendo wishlist:', error);
      throw error
    }
  },

  add: async (productId) => {
    try {
      const response = await apiClient.private.post('/wishlist/add', {
        producto_id: productId
      })
      return response?.data || response
    } catch (error) {
      console.error('Error agregando a wishlist:', error)
      throw error
    }
  },

  remove: async (productId) => {
    try {
      const response = await apiClient.private.delete(`/wishlist/remove/${productId}`)
      return response?.data || response
    } catch (error) {
      console.error('Error eliminando de wishlist:', error)
      throw error
    }
  },

  contains: async (productId) => {
    try {
      const data = await wishlistApi.get()
      const items = data?.items || []
      return items.some(item => 
        item.producto_id === productId || item.id === productId
      )
    } catch (error) {
      console.error('Error verificando wishlist:', error)
      return false
    }
  },

  toggle: async (productId) => {
    try {
      const isInWishlist = await wishlistApi.contains(productId)
      
      if (isInWishlist) {
        return await wishlistApi.remove(productId)
      } else {
        return await wishlistApi.add(productId)
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      throw error
    }
  }
}
