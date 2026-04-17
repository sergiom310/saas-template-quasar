import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useBrandsStore = defineStore('brands', {
  state: () => ({
    brands: [],
  }),

  getters: {
    getBrands: (state) => state.brands,
  },

  actions: {
    async loadBrands() {
      try {
        const response = await api.get('/api/brands')
        this.brands = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addBrand(payload) {
      console.log('payload', payload)
      Loading.show()
      try {
        let formData = new FormData()
        formData.append('name', payload.name)
        if (payload.photoFile) {
          formData.append('image', payload.photoFile, payload.photoFile.name)
        }

        const response = await api.post('/api/brands', formData)
        console.log('response', response)

        Notify.create('Registro creado!')
        await this.loadBrands()
      } catch (error) {
        console.log('error', error)
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateBrand(payload) {
      Loading.show()
      try {
        let formData = new FormData()
        formData.append('name', payload.name)
        formData.append('_method', 'PUT')
        if (payload.photoFile) formData.append('image', payload.photoFile, payload.photoFile.name)

        await api.post(`/api/brands/${payload.id}`, formData)

        Notify.create('Registro modificado!')
        await this.loadBrands()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteBrand(id) {
      Loading.show()
      try {
        await api.delete(`/api/brands/${id}`)
        await this.loadBrands()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      Loading.show()
      try {
        await api.put(`/api/brands/brandstatus/${payload.id}`, { status: payload.status })
        Notify.create('Registro actualizado!')
        await this.loadBrands()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    }
  },
})
