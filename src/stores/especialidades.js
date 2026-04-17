import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useEspecialidadesStore = defineStore('especialidades', {
  state: () => ({
    especialidades: [],
  }),

  getters: {
    getEspecialidades: (state) => state.especialidades,
  },

  actions: {
    async loadEspecialidades() {
      try {
        const response = await api.get('/api/especialidades')
        this.especialidades = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addEspecialidad(payload) {
      Loading.show()
      try {
        await api.post('/api/especialidades/', {
          nombre: payload.nombre,
          descripcion: payload.descripcion,
          activo: payload.activo ?? 1
        })

        Notify.create('Registro creado!')
        await this.loadEspecialidades()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateEspecialidad(payload) {
      Loading.show()
      try {
        await api.put(`/api/especialidades/${payload.id_especialidad}`, {
          nombre: payload.nombre,
          descripcion: payload.descripcion,
          activo: payload.activo
        })

        Notify.create('Registro modificado!')
        await this.loadEspecialidades()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteEspecialidad(id) {
      Loading.show()
      try {
        await api.delete(`/api/especialidades/${id}`)
        await this.loadEspecialidades()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      Loading.show()
      try {
        await api.put(`/api/especialidades/status/${payload.id_especialidad}`, { activo: payload.activo })
        Notify.create('Registro actualizado!')
        await this.loadEspecialidades()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    }
  },
})
