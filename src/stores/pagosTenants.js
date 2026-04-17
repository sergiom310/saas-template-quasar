import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const usePagosTenantsStore = defineStore('pagosTenants', {
  state: () => ({
    pagos: [],
    tenantsFiltro: [], // Lista de tenants para el filtro
  }),

  getters: {
    pagosCount: (state) => state.pagos.length,
    
    // Obtener pagos por tenant_id
    pagosByTenant: (state) => (tenantId) => {
      return state.pagos.filter(p => p.tenant_id === tenantId)
    },
    
    // Calcular total de pagos
    totalPagos: (state) => {
      return state.pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0)
    },
  },

  actions: {
    /**
     * Obtener todos los pagos (opcionalmente filtrados por tenant_id)
     */
    async fetchPagos(tenantId = null) {
      try {
        const params = {}
        if (tenantId) {
          params.tenant_id = tenantId
        }
        
        const response = await api.get('/api/tenants-pagos', { params })
        this.pagos = response.data
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al cargar pagos'
        throw new Error(errorMsg)
      }
    },

    /**
     * Obtener lista de tenants para el filtro
     */
    async fetchTenantsFiltro() {
      try {
        const response = await api.get('/api/tenants')
        this.tenantsFiltro = response.data
        return response.data
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al cargar tenants'
        throw new Error(errorMsg)
      }
    },

    /**
     * Limpiar filtros y recargar todos los pagos
     */
    async resetFiltros() {
      return await this.fetchPagos()
    },
  },
})
