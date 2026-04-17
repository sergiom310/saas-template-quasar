import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useTarifaReglaStore = defineStore('tarifaRegla', {
  state: () => ({
    tarifaReglas: [],
  }),

  getters: {
    getTarifaReglas: (state) => state.tarifaReglas,
  },

  actions: {
    async loadTarifaReglas() {
      try {
        const response = await api.get('/api/tarifa-reglas')
        this.tarifaReglas = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addTarifaRegla(payload) {
      Loading.show()
      try {
        await api.post('/api/tarifa-reglas/', payload)

        Notify.create('Registro creado!')
        await this.loadTarifaReglas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateTarifaRegla(payload) {
      Loading.show()
      try {
        await api.put(`/api/tarifa-reglas/${payload.id}`, payload)

        Notify.create('Registro modificado!')
        await this.loadTarifaReglas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteTarifaRegla(id) {
      Loading.show()
      try {
        await api.delete(`/api/tarifa-reglas/${id}`)
        await this.loadTarifaReglas()
        Notify.create('Registro eliminado!')
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },
  },
})
