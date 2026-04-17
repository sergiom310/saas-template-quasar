import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useAgendaStore = defineStore('agenda', {
  state: () => ({
    agendas: [],
    disponibilidad: [],
    profesionales: [],
    clientes: [],
    selectedFecha: null,
    selectedProfesional: null
  }),

  actions: {
    async loadAgendas(filters = {}) {
      Loading.show({ message: 'Cargando agendas...' })
      try {
        const params = new URLSearchParams(filters).toString()
        const response = await api.get(`/api/agenda?${params}`)
        this.agendas = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async loadDisponibilidad(fecha, idProfesional) {
      Loading.show({ message: 'Verificando disponibilidad...' })
      try {
        const response = await api.get('/api/agenda/disponibilidad', {
          params: { fecha, id_profesional: idProfesional }
        })
        this.disponibilidad = response.data
        this.selectedFecha = fecha
        this.selectedProfesional = idProfesional
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async loadDisponibilidadTemp(fecha, idProfesional) {
      Loading.show({ message: 'Verificando disponibilidad...' })
      try {
        const response = await api.get('/api/agenda/disponibilidad', {
          params: { fecha, id_profesional: idProfesional }
        })
        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
        return []
      } finally {
        Loading.hide()
      }
    },

    async loadProfesionales() {
      try {
        const response = await api.get('/api/profesionales')
        this.profesionales = response.data.filter(p => p.activo == 1)
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async loadClientes() {
      try {
        const response = await api.get('/api/clientes-agenda')
        this.clientes = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addCliente(payload) {
      Loading.show({ message: 'Guardando cliente...' })
      try {
        const response = await api.post('/api/clientes-agenda', payload)
        Notify.create({
          type: 'positive',
          message: 'Cliente creado exitosamente'
        })
        // Recargar lista de clientes
        await this.loadClientes()
        return response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async addAgenda(payload, showNotification = true) {
      Loading.show({ message: 'Guardando reserva...' })
      try {
        await api.post('/api/agenda', payload)
        if (showNotification) {
          Notify.create({
            type: 'positive',
            message: 'Reserva creada exitosamente'
          })
        }
        // Recargar disponibilidad
        if (this.selectedFecha && this.selectedProfesional) {
          await this.loadDisponibilidad(this.selectedFecha, this.selectedProfesional)
        }
      } catch (error) {
        if (error.response?.status === 422) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error || 'Error al crear reserva'
          })
        } else {
          showErrorMessage(error.response?.data?.errors)
        }
        throw error // Re-lanzar para que el componente pueda manejarlo
      } finally {
        Loading.hide()
      }
    },

    async updateAgenda(idAgenda, payload) {
      Loading.show({ message: 'Actualizando reserva...' })
      try {
        await api.put(`/api/agenda/${idAgenda}`, payload)
        Notify.create({
          type: 'positive',
          message: 'Cita reprogramada exitosamente'
        })
        if (this.selectedFecha && this.selectedProfesional) {
          await this.loadDisponibilidad(this.selectedFecha, this.selectedProfesional)
        }
      } catch (error) {
        if (error.response?.status === 422) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error || 'Error al actualizar reserva'
          })
        } else {
          showErrorMessage(error.response?.data?.errors)
        }
      } finally {
        Loading.hide()
      }
    },

    async deleteAgenda(id) {
      Loading.show({ message: 'Eliminando reserva...' })
      try {
        await api.delete(`/api/agenda/${id}`)
        Notify.create({
          type: 'positive',
          message: 'Reserva eliminada exitosamente'
        })
        if (this.selectedFecha && this.selectedProfesional) {
          await this.loadDisponibilidad(this.selectedFecha, this.selectedProfesional)
        }
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async cambiarEstado(id, estado) {
      Loading.show({ message: 'Actualizando estado...' })
      try {
        await api.put(`/api/agenda/${id}/estado`, { estado })

        // No mostrar notificación si es parte de un cambio de cita
        // La notificación se mostrará cuando se cree la nueva cita
        if (estado !== 'cancelado') {
          Notify.create({
            type: 'positive',
            message: 'Estado actualizado exitosamente'
          })
        }

        if (this.selectedFecha && this.selectedProfesional) {
          await this.loadDisponibilidad(this.selectedFecha, this.selectedProfesional)
        }
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    }
  }
})
