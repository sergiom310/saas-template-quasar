import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useProfesionalesStore = defineStore('profesionales', {
  state: () => ({
    profesionales: [],
    especialidades: []
  }),

  actions: {
    async loadProfesionales() {
      Loading.show({ message: 'Cargando profesionales...' })
      try {
        const response = await api.get('/api/profesionales')
        this.profesionales = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async loadEspecialidades() {
      try {
        const response = await api.get('/api/especialidades')
        this.especialidades = response.data.filter(e => e.activo == 1)
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addProfesional(payload) {
      Loading.show({ message: 'Guardando profesional...' })
      try {
        await api.post('/api/profesionales', payload)
        Notify.create({
          type: 'positive',
          message: 'Profesional creado exitosamente'
        })
        await this.loadProfesionales()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateProfesional(payload) {
      Loading.show({ message: 'Actualizando profesional...' })
      try {
        await api.put(`/api/profesionales/${payload.id_profesional}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Profesional actualizado exitosamente'
        })
        await this.loadProfesionales()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteProfesional(id) {
      Loading.show({ message: 'Eliminando profesional...' })
      try {
        await api.delete(`/api/profesionales/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Profesional eliminado exitosamente'
        })
        await this.loadProfesionales()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    }
  }
})
