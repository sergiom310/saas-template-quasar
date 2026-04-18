import { defineStore } from 'pinia'
import { api } from 'boot/api'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
  }),

  actions: {
    async loadUsers() {
      try {
        const response = await api.get('/api/users')
        this.users = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addUser(payload) {
      try {
        Loading.show()
        await api.post('/api/users/', payload)
        await this.loadUsers()
        Notify.create('Usuario creado!')
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateUser(payload) {
      try {
        Loading.show()
        await api.put(`/api/users/${payload.id}`, payload)
        await this.loadUsers()
        Notify.create('Usuario modificado!')
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteUser(id) {
      try {
        Loading.show()
        await api.delete(`/api/users/${id}`)
        await this.loadUsers()
        Notify.create('Usuario eliminado!')
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      try {
        Loading.show()
        await api.put(`/api/users/status/${payload.id}`, { estado: payload.status })
        await this.loadUsers()
        Notify.create('Usuario actualizado!')
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },
  },
})
