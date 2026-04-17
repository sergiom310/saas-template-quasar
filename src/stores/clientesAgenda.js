import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useClientesAgendaStore = defineStore('clientesAgenda', {
  state: () => ({
    clientes: []
  }),

  actions: {
    async loadClientes() {
      Loading.show({ message: 'Cargando clientes...' })
      try {
        const response = await api.get('/api/clientes-agenda')
        this.clientes = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async addCliente(payload) {
      Loading.show({ message: 'Guardando cliente...' })
      try {
        await api.post('/api/clientes-agenda', payload)
        Notify.create({
          type: 'positive',
          message: 'Cliente creado exitosamente'
        })
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateCliente(payload) {
      Loading.show({ message: 'Actualizando cliente...' })
      try {
        await api.put(`/api/clientes-agenda/${payload.id_cliente}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Cliente actualizado exitosamente'
        })
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteCliente(id) {
      Loading.show({ message: 'Eliminando cliente...' })
      try {
        await api.delete(`/api/clientes-agenda/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Cliente eliminado exitosamente'
        })
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    }
  }
})
