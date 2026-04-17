import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useTipoVehiculosStore = defineStore('tipoVehiculos', {
  state: () => ({
    tipoVehiculos: [],
  }),

  getters: {
    getTipoVehiculos: (state) => state.tipoVehiculos,
  },

  actions: {
    async fetchTipoVehiculosActivos() {
      try {
        const response = await api.get('/api/tipo-vehiculos-activos')
        this.tipoVehiculos = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async loadTipoVehiculos() {
      try {
        const response = await api.get('/api/tipo-vehiculos')
        this.tipoVehiculos = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addTipoVehiculo(payload) {
      Loading.show()
      try {
        const data = {
          nombre: payload.nombre,
          imagen: payload.imagen || null,
          etiqueta_detalle: payload.etiqueta_detalle || null
        }
        await api.post('/api/tipo-vehiculos/', data)

        Notify.create('Registro creado!')
        await this.loadTipoVehiculos()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateTipoVehiculo(payload) {
      Loading.show()
      try {
        const data = {
          nombre: payload.nombre,
          imagen: payload.imagen || null,
          etiqueta_detalle: payload.etiqueta_detalle || null
        }
        await api.put(`/api/tipo-vehiculos/${payload.id}`, data)

        Notify.create('Registro modificado!')
        await this.loadTipoVehiculos()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteTipoVehiculo(id) {
      Loading.show()
      try {
        await api.delete(`/api/tipo-vehiculos/${id}`)
        await this.loadTipoVehiculos()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      Loading.show()
      try {
        await api.put(`/api/tipo-vehiculos/tipovehiculostatus/${payload.id}`, { status: payload.status })
        Notify.create('Registro actualizado!')
        await this.loadTipoVehiculos()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    }
  },
})
