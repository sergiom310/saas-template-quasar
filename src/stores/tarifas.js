import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useTarifasStore = defineStore('tarifas', {
  state: () => ({
    tarifas: [],
  }),

  getters: {
    getTarifas: (state) => state.tarifas,
  },

  actions: {
    async fetchTarifasActivos() {
      try {
        const response = await api.get('/api/tarifas-activos')
        this.tarifas = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async loadTarifas() {
      try {
        const response = await api.get('/api/tarifas')
        this.tarifas = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addTarifa(payload) {
      Loading.show()
      try {
        await api.post('/api/tarifas/', {
          nombre: payload.nombre,
          status: 'Activo'
        })

        Notify.create('Registro creado!')
        await this.loadTarifas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateTarifa(payload) {
      Loading.show()
      try {
        await api.put(`/api/tarifas/${payload.id}`, {
          nombre: payload.nombre,
          status: payload.status ?? 'Activo'
        })

        Notify.create('Registro modificado!')
        await this.loadTarifas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteTarifa(id) {
      Loading.show()
      try {
        await api.delete(`/api/tarifas/${id}`)
        await this.loadTarifas()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      Loading.show()
      try {
        await api.put(`/api/tarifas/tarifastatus/${payload.id}`, { status: payload.status })
        Notify.create('Registro actualizado!')
        await this.loadTarifas()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    }
  },
})
