import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    permissions: [],
    permissionToEdit: {
      id: '',
      permission: '',
    },
  }),

  getters: {
    getPermissions: (state) => state.permissions,
    getPermissionToEdit: (state) => state.permissionToEdit,
  },

  actions: {
    async loadPermissions() {
      try {
        const response = await api.get('/api/permissions')
        this.permissions = response.data
      } catch (error) {
        showErrorMessage(error)
      }
    },

    async addPermission(payload) {
      try {
        Loading.show()
        await api.post('/api/permissions/', payload)
        Loading.hide()
        await this.loadPermissions()
        Notify.create('Permiso creado!')
      } catch (error) {
        Loading.hide()
        console.log(error)
        showErrorMessage(error.response.data.errors)
      }
    },

    async updatePermission(payload) {
      try {
        Loading.show()
        await api.put(`/api/permissions/${payload.id}`, { id: payload.id, name: payload.name })
        Loading.hide()
        await this.loadPermissions()
        Notify.create('Permiso modificado!')
      } catch (error) {
        Loading.hide()
        showErrorMessage(error.response.data.errors)
      }
    },

    async deletePermission(id) {
      try {
        Loading.show()
        await api.delete(`/api/permissions/${id}`)
        Loading.hide()
        await this.loadPermissions()
        Notify.create('Permiso eliminado!')
      } catch (error) {
        Loading.hide()
        showErrorMessage(error.response.data.detail)
      }
    },

    setPermissionToEdit(payload) {
      this.permissionToEdit = payload
    },
  },
})
