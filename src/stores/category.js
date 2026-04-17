import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    categoriesHome: [],
  }),

  getters: {
    getCategory: (state) => state.categories,
  },

  actions: {
    async loadCategory() {
      try {
        const response = await api.get('/api/categories')
        this.categories = response.data
      } catch (error) {
        // No mostrar error si es por tenant inactivo (ya se maneja en axios interceptor)
        if (error.response?.data?.tenant_inactive) {
          console.log('Tenant inactivo - redirigiendo a login')
          return
        }
        
        // Solo registrar en consola otros errores
        console.error('Error al cargar categorías:', error)
        // Mostrar error solo si es una acción explícita del usuario
        // showErrorMessage(error.response?.data?.errors)
      }
    },

    async loadCategoryHome() {
      try {
        const response = await api.get('/api/categoriesHome')
        this.categoriesHome = response.data
      } catch (error) {
        // No mostrar error si es por tenant inactivo (ya se maneja en axios interceptor)
        if (error.response?.data?.tenant_inactive) {
          console.log('Tenant inactivo - redirigiendo a login')
          return
        }
        
        // Solo registrar en consola otros errores para no molestar al usuario en la carga
        console.error('Error al cargar categorías home:', error)
        // No mostrar popup de error en la carga inicial
      }
    },

    async addCategory(payload) {
      Loading.show()
      try {
        let formData = new FormData()
        if (payload.parent_id) {
          formData.append('parent_id', payload.parent_id)
        }
        formData.append('orden', payload.orden)
        formData.append('name', payload.name)
        formData.append('name_en', payload.name_en)
        if (payload.icono) {
          formData.append('icono', payload.icono)
        }
        if (payload.imagenFile) {
          formData.append('image', payload.imagenFile, payload.imagenFile.name)
        }
        formData.append('description', payload.description)
        formData.append('description_en', payload.description_en)
        if (payload.bannerFile) {
          formData.append('banner', payload.bannerFile, payload.bannerFile.name)
        }
        formData.append('slug', payload.slug)

        await api.post('/api/categories/', formData)

        Notify.create('Registro creado!')
        await this.loadCategory()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateCategory(payload) {
      Loading.show()
      try {
        let formData = new FormData()
        formData.append('id', payload.id)
        formData.append('name', payload.name)
        formData.append('description', payload.description)
        formData.append('name_en', payload.name_en)
        formData.append('description_en', payload.description_en)
        formData.append('url', payload.url)
        formData.append('slug', payload.slug)
        formData.append('orden', payload.orden)
        formData.append('_method', 'PUT')
        if (payload.icono) {
          formData.append('icono', payload.icono)
        }
        if (payload.imagenFile) {
          formData.append('image', payload.imagenFile, payload.imagenFile.name)
        }
        if (payload.bannerFile) {
          formData.append('banner', payload.bannerFile, payload.bannerFile.name)
        }
        formData.append('parent_id', payload.parent_id)

        await api.post(`/api/categories/${payload.id}`, formData)

        Notify.create('Registro modificado!')
        await this.loadCategory()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteCategory(id) {
      Loading.show()
      try {
        await api.delete(`/api/categories/${id}`)
        await this.loadCategory()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async desactivar(payload) {
      Loading.show()
      try {
        await api.put(`/api/categories/categorystatus/${payload.id}`, { status: payload.status })
        Notify.create('Registro actualizado!')
        await this.loadCategory()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async deleteImage(payload) {
      try {
        Loading.show()
        await api.delete(`/api/categories/deletecategoryimage/${payload}`)
        await this.loadCategory()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },
  },
})
