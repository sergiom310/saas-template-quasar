import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useFranjasHorariasStore = defineStore('franjasHorarias', {
  state: () => ({
    franjas: []
  }),

  actions: {
    async loadFranjas() {
      Loading.show({ message: 'Cargando franjas horarias...' })
      try {
        const response = await api.get('/api/franjas-horarias')
        this.franjas = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async addFranja(payload) {
      Loading.show({ message: 'Guardando franja horaria...' })
      try {
        await api.post('/api/franjas-horarias', payload)
        Notify.create({
          type: 'positive',
          message: 'Franja horaria creada exitosamente'
        })
        await this.loadFranjas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateFranja(payload) {
      Loading.show({ message: 'Actualizando franja horaria...' })
      try {
        await api.put(`/api/franjas-horarias/${payload.id_franja}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Franja horaria actualizada exitosamente'
        })
        await this.loadFranjas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteFranja(id) {
      Loading.show({ message: 'Eliminando franja horaria...' })
      try {
        await api.delete(`/api/franjas-horarias/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Franja horaria eliminada exitosamente'
        })
        await this.loadFranjas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async addMultipleFranjas(franjas) {
      Loading.show({ message: `Guardando ${franjas.length} franjas horarias...` })
      try {
        // Crear todas las franjas en paralelo
        const promises = franjas.map(franja =>
          api.post('/api/franjas-horarias', franja)
        )
        await Promise.all(promises)

        Notify.create({
          type: 'positive',
          message: `${franjas.length} franjas horarias creadas exitosamente`,
          timeout: 2000
        })
        await this.loadFranjas()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    }
  }
})
