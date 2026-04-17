import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useGastosStore = defineStore('gastos', {
  state: () => ({
    gastos: []
  }),

  actions: {
    async loadGastos() {
      Loading.show({ message: 'Cargando gastos...' })
      try {
        const response = await api.get('/api/gastos')
        this.gastos = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async addGasto(payload) {
      Loading.show({ message: 'Guardando gasto...' })
      try {
        await api.post('/api/gastos', payload)
        Notify.create({
          type: 'positive',
          message: 'Gasto creado exitosamente'
        })
        await this.loadGastos()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateGasto(payload) {
      Loading.show({ message: 'Actualizando gasto...' })
      try {
        await api.put(`/api/gastos/${payload.id}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Gasto actualizado exitosamente'
        })
        await this.loadGastos()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteGasto(id) {
      Loading.show({ message: 'Eliminando gasto...' })
      try {
        await api.delete(`/api/gastos/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Gasto eliminado exitosamente'
        })
        await this.loadGastos()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    }
  }
})
