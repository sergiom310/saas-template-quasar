import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useMetodosAgdPagosStore = defineStore('metodosAgdPagos', () => {
  const metodosPagos = ref([])

  // Cargar métodos de pago
  const loadMetodosPagos = async () => {
    Loading.show()
    try {
      const response = await api.get('/api/agd-metodos-pago')
      metodosPagos.value = response.data
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  // Agregar método de pago
  const addMetodoPago = async (metodoPago) => {
    Loading.show()
    try {
      const response = await api.post('/api/agd-metodos-pago', metodoPago)
      metodosPagos.value.push(response.data)
      Notify.create({
        color: 'positive',
        message: 'Método de pago creado exitosamente',
        icon: 'check',
        position: 'top-right',
      })
      await loadMetodosPagos()
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  // Actualizar método de pago
  const updateMetodoPago = async (metodoPago) => {
    Loading.show()
    try {
      const response = await api.put(
        `/api/agd-metodos-pago/${metodoPago.id}`,
        {
          detalle: metodoPago.detalle,
          activo: metodoPago.activo,
        }
      )
      const index = metodosPagos.value.findIndex((t) => t.id === metodoPago.id)
      if (index !== -1) {
        metodosPagos.value[index] = response.data
      }
      Notify.create({
        color: 'positive',
        message: 'Método de pago actualizado exitosamente',
        icon: 'check',
        position: 'top-right',
      })
      await loadMetodosPagos()
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  // Eliminar método de pago
  const deleteMetodoPago = async (id) => {
    Loading.show()
    try {
      await api.delete(`/api/agd-metodos-pago/${id}`)
      const index = metodosPagos.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        metodosPagos.value.splice(index, 1)
      }
      Notify.create({
        color: 'positive',
        message: 'Método de pago eliminado exitosamente',
        icon: 'check',
        position: 'top-right',
      })
      await loadMetodosPagos()
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  return {
    metodosPagos,
    loadMetodosPagos,
    addMetodoPago,
    updateMetodoPago,
    deleteMetodoPago,
  }
})
