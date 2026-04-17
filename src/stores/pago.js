import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'

const showErrorMessage = (errors) => {
  if (!errors) return

  if (typeof errors === 'string') {
    Notify.create({
      type: 'negative',
      message: errors
    })
    return
  }

  if (typeof errors === 'object') {
    Object.keys(errors).forEach((key) => {
      const messages = errors[key]
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          Notify.create({
            type: 'negative',
            message: msg
          })
        })
      }
    })
  }
}

export const usePagoStore = defineStore('pago', {
  state: () => ({
    metodosPago: [],
    pagos: []
  }),

  getters: {
    getMetodosPagoActivos: (state) => {
      return state.metodosPago.filter(metodo => metodo.activo)
    }
  },

  actions: {
    async loadMetodosPago() {
      Loading.show({ message: 'Cargando métodos de pago...' })
      try {
        const { data } = await api.get('/api/metodos-pago')
        this.metodosPago = data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async createPago(payload) {
      Loading.show({ message: 'Registrando pago...' })
      try {
        const { data } = await api.post('/api/pago-agenda', payload)
        Notify.create({
          type: 'positive',
          message: 'Pago registrado exitosamente. La cita ha sido marcada como atendida.',
          icon: 'check_circle'
        })
        return data
      } catch (error) {
        if (error.response?.status === 422) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error || 'Error al registrar el pago'
          })
        } else {
          showErrorMessage(error.response?.data?.errors)
        }
        throw error
      } finally {
        Loading.hide()
      }
    },

    async loadPagos(filters = {}) {
      Loading.show({ message: 'Cargando pagos...' })
      try {
        const params = {}
        if (filters.id_cliente) params.id_cliente = filters.id_cliente
        if (filters.id_profesional) params.id_profesional = filters.id_profesional
        if (filters.fecha) params.fecha = filters.fecha
        if (filters.metodo_pago) params.metodo_pago = filters.metodo_pago

        const { data } = await api.get('/api/pagos', { params })
        this.pagos = data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updatePago(id, payload) {
      Loading.show({ message: 'Actualizando pago...' })
      try {
        const { data } = await api.put(`/api/pagos/${id}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Pago actualizado exitosamente',
          icon: 'check_circle'
        })
        await this.loadPagos()
        return data
      } catch (error) {
        if (error.response?.status === 422) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error || 'Error al actualizar el pago'
          })
        } else {
          showErrorMessage(error.response?.data?.errors)
        }
        throw error
      } finally {
        Loading.hide()
      }
    },

    async deletePago(id) {
      Loading.show({ message: 'Eliminando pago...' })
      try {
        const { data } = await api.delete(`/api/pagos/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Pago eliminado exitosamente. La cita ha sido actualizada a reservado.',
          icon: 'check_circle'
        })
        await this.loadPagos()
        return data
      } catch (error) {
        if (error.response?.status === 422) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error || 'Error al eliminar el pago'
          })
        } else {
          showErrorMessage(error.response?.data?.errors)
        }
        throw error
      } finally {
        Loading.hide()
      }
    }
  }
})
