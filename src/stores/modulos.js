import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useModulosStore = defineStore('modulos', {
  state: () => ({
    modulos: [],
  }),

  getters: {
    activeModulos: (state) => state.modulos.filter(m => m.is_active),
    modulosCount: (state) => state.modulos.length,
  },

  actions: {
    /**
     * Obtener todos los módulos
     */
    async fetchModulos() {
      try {
        const response = await api.get('/api/modulos-admin')
        this.modulos = response.data
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al cargar módulos'
        throw new Error(errorMsg)
      }
    },

    /**
     * Crear un nuevo módulo
     */
    async createModulo(payload) {
      try {
        const response = await api.post('/api/modulos-admin', payload)
        await this.fetchModulos() // Recargar la lista
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al crear módulo'
        throw new Error(errorMsg)
      }
    },

    /**
     * Actualizar un módulo existente
     */
    async updateModulo(id, payload) {
      try {
        const response = await api.put(`/api/modulos-admin/${id}`, payload)
        await this.fetchModulos() // Recargar la lista
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al actualizar módulo'
        throw new Error(errorMsg)
      }
    },

    /**
     * Eliminar un módulo
     */
    async deleteModulo(id) {
      try {
        const response = await api.delete(`/api/modulos-admin/${id}`)
        await this.fetchModulos() // Recargar la lista
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al eliminar módulo'
        throw new Error(errorMsg)
      }
    },

    /**
     * Cambiar el estado activo/inactivo de un módulo
     */
    async toggleStatus(id) {
      try {
        const response = await api.put(`/api/modulos-admin/${id}/toggle-status`)
        
        // Actualizar el módulo en el estado local
        const index = this.modulos.findIndex(m => m.id === id)
        if (index !== -1) {
          this.modulos[index] = response.data.modulo
        }
        
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar el estado'
        throw new Error(errorMsg)
      }
    },

    /**
     * Obtener un módulo por ID
     */
    async getModuloById(id) {
      try {
        const response = await api.get(`/api/modulos-admin/${id}`)
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al obtener módulo'
        throw new Error(errorMsg)
      }
    },
  },
})
