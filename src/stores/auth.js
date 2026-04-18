import { defineStore } from 'pinia'
// import { setAuthorization } from 'src/functions/function-general'
import { getLocalUser, getPermsUser, getRoleUser } from 'src/functions/function-auth'
import { Loading, Dialog, Notify } from 'quasar'
import { api } from 'boot/api'
import { showErrorMessage } from 'src/functions/function-show-error-message'

// Función helper para obtener módulos del localStorage
const getModulosUser = () => {
  const modulos = localStorage.getItem('modulos')
  return modulos ? JSON.parse(modulos) : []
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    xloggedIn: false,
    localUser: getLocalUser(),
    loggedIn: !!getLocalUser(),
    permissions: getPermsUser(),
    roleuser: getRoleUser(),
    modulos: getModulosUser(),
    authError: null,
    resetValidate: null,
  }),

  getters: {
    currentUser: (state) => state.localUser,
    isLoggedIn: (state) => state.loggedIn,
    isValidtoken: (state) => state.resetValidate,
    permissionsUser: (state) => state.permissions,
    getAuthError: (state) => state.authError,
    currentRoleUser: (state) => state.roleuser,
    activeModulos: (state) => state.modulos,
    hasModulo: (state) => (slug) => state.modulos.includes(slug),
  },

  actions: {
    clearAuthError() {
      this.$patch({ authError: null })
    },

    async validateReset(token) {
      try {
        const response = await api.get(`/api/auth/validatereset/${token}`)
        this.resetValidate = response.data.data
      } catch (error) {
        console.error('Error en validateReset:', error)
      }
    },

    async login(payload) {
      Loading.show()
      try {
        const response = await api.post('/api/auth/login', payload)
        Loading.hide()
        return response.data
      } catch (error) {
        Loading.hide()
        
        // Capturar el mensaje de error del backend (puede venir en .message, .error o .detail)
        const errMsg = error.response?.data?.message 
          || error.response?.data?.error 
          || error.response?.data?.detail 
          || 'Error en login'
        
        // Si es por tenant inactivo, mostrar notificación específica
        if (error.response?.data?.tenant_inactive) {
          Notify.create({
            type: 'negative',
            message: errMsg,
            timeout: 5000,
            position: 'top'
          })
        }
        
        this.$patch({ authError: errMsg })
        return null
      }
    },

    async register(payload, endpoint) {
      Loading.show()
      try {
        const response = await api.post(endpoint, payload)
        Loading.hide()
        return response
      } catch (error) {
        Loading.hide()
        throw error.response?.data || 'Error en registro'
      }
    },

    loginSuccess(payload) {
      // El backend ahora envía el token en una cookie httpOnly, no lo guardamos ni lo usamos en el front
      const user = { ...payload.user } // SIN token

      // Guardar en localStorage solo datos no sensibles
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('permisos', JSON.stringify(payload.permission))
      localStorage.setItem('roleuser', JSON.stringify(payload.roleuser))
      localStorage.setItem('modulos', JSON.stringify(payload.modulos || []))

      this.$patch({
        loggedIn: true,
        authError: null,
        localUser: { ...user },
        permissions: [...payload.permission],
        roleuser: { ...payload.roleuser },
        modulos: payload.modulos || [],
      })

      // No llamar setAuthorization, las cookies se envían automáticamente
    },

    logoutUser(router) {
      const locale = localStorage.getItem('appLocale')

      Dialog.create({
        title: locale == 'es-CO' ? 'Confirmar' : 'Confirm',
        message: locale == 'es-CO' ? 'Realmente desea salir?' : 'Exit the application?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        // Llamar al backend para eliminar la cookie httpOnly
        try {
          await api.post('/api/auth/logout')
        } catch (e) {
          console.log(e)
          // Ignorar error si el backend ya no tiene cookie
        }
        localStorage.removeItem('user')
        localStorage.removeItem('permisos')
        localStorage.removeItem('roleuser')
        localStorage.removeItem('modulos')

        this.$patch({
          loggedIn: false,
          localUser: null,
          modulos: [],
        })

        router.replace('/home').catch((error) => {
          if (error.name !== 'NavigationDuplicated') {
            console.error('Error en la navegación:', error)
            throw error
          }
        })
      })
    },

    async updateProfile(payload) {
      Loading.show()
      try {
        if (payload.photoFile) {
          const formData = new FormData()
          
          formData.append('file', payload.photoFile, payload.photoFile.name)
          formData.append('user_id', payload.id)
                    
          try {
            const responsePhoto = await api.post('/api/upload-profile-photo/', formData)
            console.log('responsePhoto', responsePhoto)
          } catch (error) {
            showErrorMessage(error.response?.data?.detail || 'Error al subir la foto')
          }
        }

        const payloadToSend = { ...payload }
        delete payloadToSend.photoFile
        delete payloadToSend.photo

        const response = await api.post('/api/updateprofilejson/', payloadToSend);

        const user = { ...response.data, token: this.localUser.token }

        localStorage.setItem('user', JSON.stringify(user))

        this.$patch({
          localUser: { ...user },
        })
        Notify.create('Registro Actualizado!')
      } catch (error) {
        console.error('Error en updateProfile:', error)
        showErrorMessage(error.response?.data?.errors || error.response?.data?.detail || 'Error al actualizar el perfil')
      } finally {
        Loading.hide()
      }
    },

    async updatePassword(payload) {
      Loading.show()
      try {
        const response = await api.post('/api/update-password', payload)
        const user = { ...response.data.user, token: response.data.access_token }

        localStorage.setItem('user', JSON.stringify(user))

        this.$patch({
          localUser: { ...user },
        })
        Loading.hide()
        Notify.create('Password Actualizado!')
        return response
      } catch (e) {
        Loading.hide()
        console.log(e)
        const errMsg = 'Contraseña actual incorrecta'
        this.$patch({ authError: errMsg })
        return null
      }
    },

    // async sendEmail(payload) {
    //   Loading.show()
    //   try {
    //     const response = await api.post('/api/auth/sendemail', payload)
    //     Loading.hide()
    //     return response.data
    //   } catch (error) {
    //     Loading.hide()
    //     throw error.response?.data?.error || 'Error al enviar email'
    //   }
    // },

    async resetPassword(payload) {
      Loading.show()
      try {
        const response = await api.post('/api/auth/resetpassword', payload)
        Loading.hide()
        return response.data
      } catch (error) {
        Loading.hide()
        throw error.response?.data?.error || 'Error al resetear contraseña'
      }
    },
  },
})
