<template>
  <q-page padding>
    <div class="row justify-center items-center" style="min-height: 50vh">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <q-card class="q-pa-lg">
          <q-card-section class="text-center">
            <!-- Estado de carga -->
            <div v-if="loading" class="text-center">
              <q-spinner-facebook
                color="primary"
                size="3em"
                class="q-mb-md"
              />
              <h6 class="text-grey-7 q-mb-none">Verificando email...</h6>
            </div>

            <!-- Estado de éxito -->
            <div v-else-if="verified" class="text-center">
              <q-icon
                name="check_circle"
                color="positive"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-positive q-mb-md">¡Email Verificado!</h5>
              <p class="text-grey-7 q-mb-lg">
                Tu cuenta ha sido verificada exitosamente. 
                Ya puedes iniciar sesión con normalidad.
              </p>
              <q-btn
                color="primary"
                label="Iniciar Sesión"
                @click="goToLogin"
                unelevated
                class="full-width"
              />
            </div>

            <!-- Estado de error -->
            <div v-else class="text-center">
              <q-icon
                name="error"
                color="negative"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-negative q-mb-md">Error de Verificación</h5>
              <p class="text-grey-7 q-mb-lg">
                {{ errorMessage }}
              </p>
              <div class="row q-gutter-sm">
                <q-btn
                  v-if="canResend"
                  color="primary"
                  label="Reenviar Email"
                  @click="resendEmail"
                  unelevated
                  class="col"
                  :loading="resending"
                />
                <q-btn
                  color="grey-7"
                  label="Volver al Login"
                  @click="goToLogin"
                  unelevated
                  outline
                  :class="canResend ? 'col' : 'full-width'"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/api'

export default {
  name: 'VerificarEmail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()

    // Estados reactivos
    const loading = ref(true)
    const verified = ref(false)
    const errorMessage = ref('')
    const resending = ref(false)
    const canResend = ref(false)
    const userEmail = ref('')

    // Función para verificar el email
    const verifyEmail = async () => {
      try {
        loading.value = true
        verified.value = false
        errorMessage.value = ''
        canResend.value = false

        const token = route.query.token

        if (!token) {
          throw new Error('Token de verificación no encontrado')
        }

        const response = await api.get('/api/auth/verify-email', {
          params: { token }
        })

        if (response.data) {
          verified.value = true
          $q.notify({
            type: 'positive',
            message: 'Email verificado exitosamente',
            position: 'top'
          })
        }

      } catch (error) {
        console.error('Error al verificar email:', error)
        
        // Intentar obtener más información sobre el token
        await checkTokenStatus(route.query.token)
        
      } finally {
        loading.value = false
        console.log('Verificación completada. Estado:', { 
          verified: verified.value, 
          canResend: canResend.value, 
          errorMessage: errorMessage.value 
        })
      }
    }

    // Función para verificar el estado del token
    const checkTokenStatus = async (token) => {
      console.log('Verificando estado del token:', token)
      try {
        if (!token) return
        
        const response = await api.get('/api/auth/check-verification-token', {
          params: { token }
        })
        
        const tokenInfo = response.data
        console.log('Estado del token:', tokenInfo)
        
        if (tokenInfo.already_verified) {
          errorMessage.value = 'Este email ya ha sido verificado. Puedes iniciar sesión normalmente.'
          canResend.value = false
        } else if (tokenInfo.expired) {
          errorMessage.value = 'El enlace de verificación ha expirado. Puedes solicitar un nuevo email de verificación.'
          canResend.value = true
        } else if (tokenInfo.can_resend) {
          errorMessage.value = tokenInfo.reason || 'Error en la verificación. Puedes solicitar un nuevo email.'
          canResend.value = true
        } else {
          errorMessage.value = tokenInfo.reason || 'Error al verificar el email.'
          canResend.value = false
        }
        
        // Si tenemos el email del usuario, guardarlo para el reenvío
        if (tokenInfo.email) {
          userEmail.value = tokenInfo.email
        }
        
      } catch (error) {
        console.error('Error al verificar estado del token:', error)
        errorMessage.value = 'El enlace de verificación es inválido o ha expirado.'
        canResend.value = true
      }
    }

    // Función para reenviar email de verificación
    const resendEmail = async () => {
      try {
        resending.value = true

        // Usar el email del usuario si lo tenemos, sino solicitar
        let email = userEmail.value
        if (!email) {
          email = await getEmailFromUser()
        }
        
        if (!email) {
          $q.notify({
            type: 'warning',
            message: 'Por favor proporciona tu email para reenviar la verificación',
            position: 'top'
          })
          return
        }

        const response = await api.post('/api/auth/resend-verification-email', { email })

        if (response.data?.success) {
          $q.notify({
            type: 'positive',
            message: response.data.message || 'Email de verificación reenviado exitosamente',
            position: 'top',
            timeout: 5000
          })
          
          // Actualizar mensaje
          errorMessage.value = 'Nuevo email enviado. Revisa tu bandeja de entrada y carpeta de spam.'
          canResend.value = false // Desactivar botón temporalmente
        }

      } catch (error) {
        console.error('Error al reenviar email:', error)
        
        let message = 'Error al reenviar email'
        if (error.response?.data?.detail) {
          message = error.response.data.detail
        }
        
        $q.notify({
          type: 'negative',
          message: message,
          position: 'top'
        })
      } finally {
        resending.value = false
      }
    }

    // Función para obtener email del usuario
    const getEmailFromUser = async () => {
      return new Promise((resolve) => {
        $q.dialog({
          title: 'Reenviar Verificación',
          message: 'Ingresa tu email para reenviar el correo de verificación:',
          prompt: {
            model: '',
            type: 'email',
            placeholder: 'tu-email@ejemplo.com'
          },
          cancel: true,
          persistent: true
        }).onOk(email => {
          resolve(email)
        }).onCancel(() => {
          resolve(null)
        })
      })
    }

    // Función para ir al login
    const goToLogin = () => {
      console.log('Redirigiendo a auth...')
      router.push('/auth')
    }

    // Verificar email al montar el componente
    onMounted(() => {
      verifyEmail()
    })

    return {
      loading,
      verified,
      errorMessage,
      resending,
      canResend,
      verifyEmail,
      resendEmail,
      goToLogin
    }
  }
}
</script>

<style scoped>
.q-card {
  max-width: 400px;
  margin: 0 auto;
}

.q-icon {
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
