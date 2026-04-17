import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [],
  }),

  getters: {
    getTags: (state) => state.tags,
  },

  actions: {
    async loadTags() {
      try {
        const response = await api.get('/api/tags')
        this.tags = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addTag(payload) {
      Loading.show()
      try {
        let formData = new FormData()
        formData.append('name', payload.name)

        await api.post('/api/tags/', formData)

        Notify.create('Registro creado!')
        await this.loadTags()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateTag(payload) {
      Loading.show()
      try {
        let formData = new FormData()
        formData.append('id', payload.id)
        formData.append('name', payload.name)

        await api.put(`/api/tags/${payload.id}`, formData)

        Notify.create('Registro modificado!')
        await this.loadTags()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteTag(id) {
      Loading.show()
      try {
        await api.delete(`/api/tags/${id}`)
        await this.loadTags()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },
  },
})
