import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/api'
import { Loading, Notify } from 'quasar'
import { showErrorMessage } from 'src/functions/function-show-error-message'

export const useEmpresaStore = defineStore('empresa', () => {
  const empresa = ref(null)

  const loadEmpresa = async () => {
    Loading.show()
    try {
      const response = await api.get('/api/empresa')
      empresa.value = response.data
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  const saveEmpresa = async (formData) => {
    Loading.show()
    try {
      let response
      if (empresa.value?.id) {
        formData.append('_method', 'PUT')
        response = await api.post(`/api/empresa/${empresa.value.id}`, formData)
      } else {
        response = await api.post('/api/empresa', formData)
      }
      empresa.value = response.data
      Notify.create({
        color: 'positive',
        message: 'Información de empresa guardada exitosamente',
        icon: 'check',
        position: 'top-right',
      })
    } catch (error) {
      showErrorMessage(error)
    } finally {
      Loading.hide()
    }
  }

  return {
    empresa,
    loadEmpresa,
    saveEmpresa,
  }
})
