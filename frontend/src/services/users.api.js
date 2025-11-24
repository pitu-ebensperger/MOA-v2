import { apiClient } from './api-client.js';

export const usersApi = {
  // GET /usuario/:id - Obtener usuario por ID
  async getUserById(id) {
    if (!id) throw new Error('User ID is required');
    const data = await apiClient.private.get(`/usuario/${id}`);
    return data;
  },

  // PATCH /usuario/:id - Actualizar usuario
  async updateUser(id, updateData) {
    if (!id) throw new Error('User ID is required');
    const data = await apiClient.private.patch(`/usuario/${id}`, updateData);
    return data;
  },

  // GET /usuario - Obtener perfil del usuario autenticado (desde token)
  async getCurrentUser() {
    const data = await apiClient.private.get('/usuario');
    return data;
  }
};
