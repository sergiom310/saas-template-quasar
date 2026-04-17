import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: JSON.parse(localStorage.getItem('cart')) || [],
  }),
  getters: {
    totalItems: (state) => state.cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    totalPrice: (state) =>
      state.cart.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity
      }, 0),
    totalPriceUsd: (state) =>
      state.cart.reduce((sum, item) => {
        return sum + Number(item.price_usd) * item.quantity
      }, 0),
    totalDiscount: (state) =>
      state.cart.reduce((sum, item) => {
        const price = Number(item.price)
        let dcto = 0

        if (item.discount_active && item.discount_percent > 0) {
          dcto += (price * item.discount_percent) / 100
        }

        return sum + dcto * item.quantity
      }, 0),
    totalDiscountUsd: (state) =>
      state.cart.reduce((sum, item) => {
        const price = Number(item.price_usd)
        let dcto = 0

        if (item.discount_active && item.discount_percent > 0) {
          dcto += (price * item.discount_percent) / 100
        }

        return sum + dcto * item.quantity
      }, 0),
  },
  actions: {
    addToCart(product) {
      const index = this.cart.findIndex((item) => item.id === product.id)
      if (index !== -1) {
        this.cart[index].quantity += 1
      } else {
        this.cart.push({ ...product, quantity: 1 })
      }
      this.saveCart()
    },
    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => item.id !== productId)
      this.saveCart()
    },
    updateQuantity(productId, quantity) {
      const item = this.cart.find((item) => item.id === productId)

      if (item) {
        item.quantity = Number(quantity) > 0 ? Number(quantity) : 1
        this.cart = [...this.cart]
        this.saveCart()
      }
    },
    clearCart() {
      this.cart = []
      this.saveCart()
    },
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
  },
})
