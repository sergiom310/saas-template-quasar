import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const usePagosStore = defineStore('pagos', {
  state: () => ({
    pagos: [],
    pagosPorCliente: [],
  }),

  getters: {
    getPagos: (state) => state.pagos,
    getPagosPorCliente: (state) => state.pagosPorCliente,
  },

  actions: {
    async loadPagos() {
      try {
        const response = await api.get('/api/pagos')
        this.pagos = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async loadPagosPorCliente(codCli) {
      try {
        const response = await api.get(`/api/pagos-cliente/${codCli}`)
        this.pagosPorCliente = response.data
        this.pagos = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addPago(payload) {
      Loading.show()
      try {
        const response = await api.post('/api/pagos', payload)
        Notify.create('Pago registrado!')
        await this.loadPagos()
        return response
      } catch (error) {
        let msg =
          error?.response?.data?.errors ||
          error?.response?.data?.error ||
          error?.message ||
          JSON.stringify(error) ||
          'Error desconocido'
        showErrorMessage(msg)
        throw error
      } finally {
        Loading.hide()
      }
    },

    async updatePago(payload) {
      Loading.show()
      try {
        const response = await api.put(`/api/pagos/${payload.id_pago}`, payload)
        Notify.create('Pago modificado!')
        await this.loadPagos()
        return response
      } catch (error) {
        let msg =
          error?.response?.data?.errors ||
          error?.response?.data?.error ||
          error?.message ||
          JSON.stringify(error) ||
          'Error desconocido'
        showErrorMessage(msg)
        throw error
      } finally {
        Loading.hide()
      }
    },

    async deletePago(id) {
      Loading.show()
      try {
        const response = await api.delete(`/api/pagos/${id}`)
        await this.loadPagos()
        Notify.create('Pago eliminado!')
        return response
      } catch (error) {
        let msg =
          error?.response?.data?.errors ||
          error?.response?.data?.error ||
          error?.message ||
          JSON.stringify(error) ||
          'Error desconocido'
        showErrorMessage(msg)
        throw error
      } finally {
        Loading.hide()
      }
    }
  },
})
