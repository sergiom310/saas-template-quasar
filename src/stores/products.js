import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { Notify, Loading } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    productsList: [],
    categoryProduct: {},
    productDetail: {},
    imagesProduct: [],
  }),

  getters: {
    getProducts: (state) => state.products,
    getListProducts: (state) => state.productsList,
    getProductCategory: (state) => state.categoryProduct,
    getProductDetail: (state) => state.productDetail,
    getImagesProduct: (state) => state.imagesProduct,
  },

  actions: {
    async loadProducts() {
      try {
        const response = await api.get('/api/products')
        this.products = response.data
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async listProducts(payload) {
      try {
        const response = await api.get(`/api/productslist/${payload}`)
        this.productsList = response.data.data
        this.categoryProduct = response.data.category
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async fetchProductDetail(productId) {
      try {
        const response = await api.get(`/api/productdetail/${productId}`)
        this.categoryProduct = response.data.data.categories[0] || {}
        this.productDetail = response.data.data
        this.imagesProduct = response.data.images || []
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      }
    },

    async addProduct(payload) {
      try {
        Loading.show()
        let formData = new FormData()
        formData.append('name', payload.name)
        formData.append('brand_id', payload.brand.id)
        formData.append('description', payload.description)
        formData.append('cost', payload.cost !== '' ? Number(payload.cost) : '')
        formData.append('price', payload.price !== '' ? Number(payload.price) : '')
        if (payload.cover_imgFile) {
          formData.append('image', payload.cover_imgFile, payload.cover_imgFile.name)
        }
        const vector_categories = JSON.stringify(payload.category_id.map((cat) => cat.id))
        formData.append('category_id', vector_categories)
        formData.append('show_price', payload.show_price ? 1 : 0)
        formData.append('is_featured', payload.is_featured ? 1 : 0)
        formData.append('stock_visible', payload.stock_visible ? 1 : 0)
        formData.append('allow_backorder', payload.allow_backorder ? 1 : 0)
        formData.append('discount_active', payload.discount_active ? 1 : 0)
        formData.append('discount_percent', payload.discount_percent)
        formData.append('min_order_qty', payload.min_order_qty ?? 0)
        formData.append('max_order_qty', payload.max_order_qty)
        formData.append('show_related', payload.show_related ? 1 : 0)

        const response = await api.post('/api/products/', formData)
        console.log('response', response)
        await this.loadProducts()
        Notify.create('Registro creado!')
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateProduct(payload) {
      try {
        Loading.show()
        let formData = new FormData()
        formData.append('id', payload.id)
        formData.append('name', payload.name)
        formData.append('brand_id', payload.brand.id)
        formData.append('description', payload.description)
        formData.append('cost', payload.cost !== '' ? Number(payload.cost) : '')
        formData.append('price', payload.price !== '' ? Number(payload.price) : '')
        if (payload.cover_imgFile) {
          formData.append('image', payload.cover_imgFile, payload.cover_imgFile.name)
        }
        const vector_categories = JSON.stringify(payload.category_id.map((cat) => cat.id))
        formData.append('category_id', vector_categories)
        formData.append('show_price', payload.show_price ? 1 : 0)
        formData.append('is_featured', payload.is_featured ? 1 : 0)
        formData.append('stock_visible', payload.stock_visible ? 1 : 0)
        formData.append('allow_backorder', payload.allow_backorder ? 1 : 0)
        formData.append('discount_active', payload.discount_active ? 1 : 0)
        formData.append('discount_percent', payload.discount_percent)
        formData.append('min_order_qty', payload.min_order_qty ?? 0)
        formData.append('max_order_qty', payload.max_order_qty)
        formData.append('show_related', payload.show_related ? 1 : 0)
        formData.append('_method', 'PUT')

        await api.post(`/api/products/${payload.id}`, formData)
        await this.loadProducts()
        Notify.create('Registro modificado!')
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async updateImage(payload) {
      try {
        Loading.show()
        let formData = new FormData()
        formData.append('file', payload.galery_img)
        formData.append('description', payload.detail_img1)
        formData.append('id', payload.id)

        await api.post(`/api/products/${payload.id}/images`, formData)
        await this.loadProducts()
        Notify.create('Imagen cargada!')
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async deleteImage(payload) {
      try {
        Loading.show()
        await api.delete(`/api/products/images/${payload}`)
        await this.loadProducts()
      } catch (error) {
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },

    async activateProduct(payload) {
      Loading.show()
      try {
        await api.put(`/api/products/${payload.id}/status`, { status: payload.status })
        Notify.create('Registro actualizado!')
        await this.loadProducts()
      } catch (error) {
        showErrorMessage(error)
      } finally {
        Loading.hide()
      }
    },

    async deleteProduct(payload) {
      try {
        Loading.show()
        await api.delete(`/api/products/${payload}`)
        await this.loadProducts()
      } catch (error) {
        console.log('error', error)
        showErrorMessage(error.response?.data?.errors)
      } finally {
        Loading.hide()
      }
    },
  },
})
