import { defineStore } from 'pinia'
import { api } from 'boot/api'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useVentasStore = defineStore('ventas', {
  state: () => ({
    ventas: [],
    ventaActual: null,
    metodosPago: [],
    estadisticas: null,
  }),

  getters: {
    getVentas: (state) => state.ventas,
    getVentaActual: (state) => state.ventaActual,
    getMetodosPago: (state) => state.metodosPago,
    getEstadisticas: (state) => state.estadisticas,
  },

  actions: {
    /**
     * Cargar lista de ventas con filtros opcionales
     */
    async loadVentas(filters = {}) {
      Loading.show({ message: 'Cargando ventas...' })
      try {
        const params = new URLSearchParams()
        if (filters.estado) params.append('estado', filters.estado)
        if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde)
        if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta)
        if (filters.user_id) params.append('user_id', filters.user_id)
        if (filters.per_page) params.append('per_page', filters.per_page)

        const queryString = params.toString()
        const url = queryString ? `/api/ventas?${queryString}` : '/api/ventas'
        
        const response = await api.get(url)
        this.ventas = response.data.data || response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    /**
     * Obtener detalle de una venta específica
     */
    async loadVentaDetalle(id) {
      Loading.show({ message: 'Cargando detalle de venta...' })
      try {
        const response = await api.get(`/api/ventas/${id}`)
        this.ventaActual = response.data
        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        return null
      } finally {
        Loading.hide()
      }
    },

    /**
     * Crear una nueva venta
     */
    async crearVenta(payload) {
      Loading.show({ message: 'Procesando venta...' })
      try {
        const response = await api.post('/api/ventas', payload)
        
        Notify.create({
          type: 'positive',
          message: 'Venta registrada exitosamente',
          position: 'top',
          timeout: 2000
        })

        this.ventaActual = response.data.venta
        return response.data.venta
      } catch (error) {
        showErrorMessage(error.response?.data?.errors || error.response?.data?.message)
        throw error
      } finally {
        Loading.hide()
      }
    },

    /**
     * Actualizar estado de una venta
     */
    async actualizarEstado(id, estado) {
      Loading.show({ message: 'Actualizando estado...' })
      try {
        const response = await api.put(`/api/ventas/${id}/estado`, { estado })
        
        Notify.create({
          type: 'positive',
          message: 'Estado actualizado exitosamente'
        })

        await this.loadVentas()
        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        throw error
      } finally {
        Loading.hide()
      }
    },

    /**
     * Agregar un pago a una venta existente
     */
    async agregarPago(ventaId, pago) {
      Loading.show({ message: 'Registrando pago...' })
      try {
        const response = await api.post(`/api/ventas/${ventaId}/pagos`, pago)
        
        Notify.create({
          type: 'positive',
          message: 'Pago registrado exitosamente'
        })

        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        throw error
      } finally {
        Loading.hide()
      }
    },

    /**
     * Cancelar una venta
     */
    async cancelarVenta(id) {
      Loading.show({ message: 'Cancelando venta...' })
      try {
        await api.delete(`/api/ventas/${id}`)
        
        Notify.create({
          type: 'positive',
          message: 'Venta cancelada exitosamente'
        })

        await this.loadVentas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        throw error
      } finally {
        Loading.hide()
      }
    },

    /**
     * Obtener estadísticas de ventas
     */
    async loadEstadisticas(filters = {}) {
      Loading.show({ message: 'Cargando estadísticas...' })
      try {
        const params = new URLSearchParams()
        if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde)
        if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta)

        const queryString = params.toString()
        const url = queryString ? `/api/ventas/estadisticas?${queryString}` : '/api/ventas/estadisticas'
        
        const response = await api.get(url)
        this.estadisticas = response.data
        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        return null
      } finally {
        Loading.hide()
      }
    },

    /**
     * Cargar métodos de pago disponibles (lista estática)
     */
    async loadMetodosPago() {
      try {
        const response = await api.get('/api/metodos-pago/activos')
        this.metodosPago = response.data
        return response.data
      } catch (error) {
        showErrorMessage(error)
        return []
      }
    },

    /**
     * Limpiar venta actual
     */
    clearVentaActual() {
      this.ventaActual = null
    }
  }
})
