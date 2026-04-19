import { defineStore } from 'pinia'
import { api } from 'boot/api'

export const usePedidosStore = defineStore('pedidos', {
  state: () => ({
    pedidos: [],
    misPedidos: [],
    estadisticas: null,
  }),

  actions: {
    async loadPedidos(filters = {}) {
      const params = new URLSearchParams(filters).toString()
      const url = params ? `/api/pedidos?${params}` : '/api/pedidos'
      const res = await api.get(url)
      this.pedidos = res.data
    },

    async loadMisPedidos() {
      const res = await api.get('/api/pedidos/mis-pedidos')
      this.misPedidos = res.data
    },

    async loadEstadisticas() {
      const res = await api.get('/api/pedidos/estadisticas')
      this.estadisticas = res.data
    },

    async crearPedido(payload) {
      const res = await api.post('/api/pedidos', payload)
      return res.data
    },

    async updateStatus(id, payload) {
      const res = await api.put(`/api/pedidos/${id}/status`, payload)
      const idx = this.pedidos.findIndex((p) => p.id === id)
      if (idx !== -1) {
        this.pedidos[idx] = res.data
      }
      return res.data
    },
  },
})
