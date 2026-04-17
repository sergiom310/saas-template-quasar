import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useClientesStore = defineStore('clientes', {
  state: () => ({
    clientes: [],
  }),

  getters: {
    getClientes: (state) => state.clientes,
  },

  actions: {
    async loadClientes() {
      Loading.show({ message: 'Cargando clientes...' })
      try {
        const response = await api.get('/clientes')
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
        await api.post('/api/clientes', payload)

        Notify.create('Registro creado!')
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateCliente(payload) {
      Loading.show()
      try {
        await api.put(`/api/clientes/${payload.cod_cli}`, payload)

        Notify.create('Registro modificado!')
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteCliente(id) {
      Loading.show()
      try {
        await api.delete(`/api/clientes/${id}`)
        await this.loadClientes()
        Notify.create('Registro eliminado!')
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async activateCliente(payload) {
      Loading.show()
      try {
        await api.put(`/api/clientes/${payload.cod_cli}/status`, { estado: payload.estado })
        Notify.create('Registro actualizado!')
        await this.loadClientes()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    }
  },
})
