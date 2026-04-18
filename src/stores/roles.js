import { defineStore } from 'pinia'
import { api } from 'boot/api'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useRolesStore = defineStore('roles', {
  state: () => ({
    roles: [],
    permissions: {},
    permisos: [],
  }),

  getters: {
    getRoles: (state) => state.roles,
    getPermisos: (state) => state.permisos,
  },

  actions: {
    async loadRoles() {
      try {
        const response = await api.get('/api/roles')
        this.roles = response.data

        setTimeout(async () => {
          const { data } = await api.get('/api/permission2')
          this.permissions = { ...data.permissions }
        }, 200)
      } catch (error) {
        showErrorMessage(error)
      }
    },

    async loadPermissionsRole(payload) {
      try {
        const { data } = await api.get(`/api/permissionsrole/${payload.id}`)
        
        if (data.permissions && data.permissions.length > 0) {
          
          const vTempPermisos = data.permissions.map((perm) => {
            return perm.id ? perm.id.toString() : (perm.permission_id ? perm.permission_id.toString() : null)
          }).filter(Boolean)
          
          this.permisos = [...vTempPermisos]
        } else {
          this.permisos = []
        }
      } catch (error) {
        showErrorMessage(error)
      }
    },

    async addRole(payload) {
      Loading.show()
      try {
        await api.post('/api/roles/', payload)
        Notify.create('Role creado!')
        await this.loadRoles()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors || error)
      } finally {
        Loading.hide()
      }
    },

    async updateRole(payload) {
      Loading.show()
      try {
        await api.put(`/api/roles/${payload.id}`, payload)
        Notify.create('Role modificado!')
        await this.loadRoles()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors || error)
      } finally {
        Loading.hide()
      }
    },

    async deleteRole(payload) {
      Loading.show()
      try {
        await api.delete(`/api/roles/${payload}`)
        Notify.create('Role eliminado!')
        await this.loadRoles()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    resetPermisos() {
      this.permisos = []
    },
  },
})
