<template>
  <q-page padding>
    <div class="row justify-center items-center" style="min-height: 50vh">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <q-card class="q-pa-lg">
          <q-card-section class="text-center">
            <!-- Estado de formulario -->
            <div v-if="!emailSent">
              <q-icon
                name="lock_reset"
                color="primary"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-primary q-mb-md">Recuperar Contraseña</h5>
              <p class="text-grey-7 q-mb-lg">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <q-form @submit="sendResetEmail" class="q-gutter-md">
                <q-input
                  v-model="email"
                  type="email"
                  label="Email"
                  outlined
                  :rules="[
                    val => !!val || 'El email es requerido',
                    val => isValidEmail(val) || 'Ingresa un email válido'
                  ]"
                  :loading="loading"
                  autofocus
                />
                
                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Enviar Enlace"
                    :loading="loading"
                    unelevated
                    class="col"
                  />
                  <q-btn
                    color="grey-7"
                    label="Volver al Login"
                    @click="goToLogin"
                    unelevated
                    outline
                    class="col"
                  />
                </div>
              </q-form>
            </div>

            <!-- Estado de éxito -->
            <div v-else class="text-center">
              <q-icon
                name="mark_email_read"
                color="positive"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-positive q-mb-md">¡Email Enviado!</h5>
              <p class="text-grey-7 q-mb-lg">
                Si el email está registrado, recibirás un correo con instrucciones para restablecer tu contraseña.
              </p>
              <p class="text-grey-6 q-mb-lg">
                Revisa tu bandeja de entrada y carpeta de spam.
              </p>
              
              <div class="row q-gutter-sm">
                <q-btn
                  color="primary"
                  label="Reenviar Email"
                  @click="resendEmail"
                  :loading="loading"
                  unelevated
                  outline
                  class="col"
                />
                <q-btn
                  color="grey-7"
                  label="Volver al Login"
                  @click="goToLogin"
                  unelevated
                  class="col"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export default {
  name: 'ForgotPassword',
  setup() {
    const router = useRouter()
    const $q = useQuasar()

    // Estados reactivos
    const email = ref('')
    const loading = ref(false)
    const emailSent = ref(false)

    // Validación de email
    const isValidEmail = (email) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(email)
    }

    // Función para enviar email de recuperación
    const sendResetEmail = async () => {
      try {
        loading.value = true

        const response = await api.post('/api/auth/reset-password', {
          email: email.value
        })

        if (response.data?.success) {
          emailSent.value = true
          $q.notify({
            type: 'positive',
            message: response.data.message,
            position: 'top',
            timeout: 5000
          })
        }

      } catch (error) {
        console.error('Error al enviar email de recuperación:', error)
        
        let message = 'Error al enviar email de recuperación'
        if (error.response?.data?.detail) {
          message = error.response.data.detail
        }
        
        $q.notify({
          type: 'negative',
          message: message,
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }

    // Función para reenviar email
    const resendEmail = async () => {
      emailSent.value = false
      await sendResetEmail()
    }

    // Función para ir al login
    const goToLogin = () => {
      router.push('/auth')
    }

    return {
      email,
      loading,
      emailSent,
      isValidEmail,
      sendResetEmail,
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
