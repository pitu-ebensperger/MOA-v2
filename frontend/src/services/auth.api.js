import { apiClient } from '@/services/api-client.js'
import { API_PATHS } from '@/config/api-paths.js'

const buildProfilePath = (userId) =>
  userId
    ? API_PATHS.profile.root(userId)
    : API_PATHS.auth.profile ?? '/auth/perfil'

// Auth API agrupada
export const authApi = {
  async login(payload = {}) {
    const res = await apiClient.post(API_PATHS.auth.login, payload)
    return res
  },

  async register(payload = {}) {
    const res = await apiClient.post(API_PATHS.auth.register, payload)
    return res
  },

  // GET /auth/profile o /usuario (requiere token)
  profile: async (userId) => {
    // Si no se especifica userId, usa endpoint /usuario que obtiene por token
    const endpoint = userId 
      ? buildProfilePath(userId)
      : '/usuario';
    const res = await apiClient.private.get(endpoint)
    return res?.data ?? res
  },

  async requestPasswordReset(payload = {}) {
    const body =
      typeof payload === 'string'
        ? { email: payload }
        : payload ?? {};

    const res = await apiClient.post(
      API_PATHS.auth.requestPasswordReset,
      body
    )
    return res
  },

  async resetPassword(payload = {}) {
    const body =
      payload && typeof payload === 'object'
        ? payload
        : { token: payload?.token, password: payload?.password };

    const res = await apiClient.post(
      API_PATHS.auth.resetPassword,
      body
    )
    return res
  },

  // Renovar token JWT (extender sesión)
  async refreshToken() {
    const res = await apiClient.private.post('/auth/refresh-token')
    return res
  },
}

// (Opcional) Exponer funciones con nombre si te gusta ese estilo:
export const requestPasswordReset = authApi.requestPasswordReset
export const resetPassword = authApi.resetPassword
