<template>
  <q-page padding>
    <div class="row justify-center items-center" style="min-height: 50vh">
      <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4">
        <q-card class="q-pa-lg">
          <q-card-section class="text-center">
            <!-- Estado de éxito -->
            <div v-if="resetSuccess" class="text-center">
              <q-icon
                name="check_circle"
                color="positive"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-positive q-mb-md">¡Contraseña Restablecida!</h5>
              <p class="text-grey-7 q-mb-lg">
                Tu contraseña ha sido restablecida exitosamente. 
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <q-btn
                color="primary"
                label="Iniciar Sesión"
                @click="goToLogin"
                unelevated
                class="full-width"
              />
            </div>

            <!-- Formulario de nueva contraseña -->
            <div v-else-if="!loading">
              <q-icon
                name="lock"
                color="primary"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-primary q-mb-md">Nueva Contraseña</h5>
              <p class="text-grey-7 q-mb-lg">
                Ingresa tu nueva contraseña para completar el restablecimiento.
              </p>
              
              <q-form @submit="resetPassword" class="q-gutter-md">
                <q-input
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  label="Nueva Contraseña"
                  outlined
                  :rules="[
                    val => !!val || 'La contraseña es requerida',
                    val => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
                  ]"
                  autofocus
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
                
                <q-input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  label="Confirmar Contraseña"
                  outlined
                  :rules="[
                    val => !!val || 'Confirma tu contraseña',
                    val => val === newPassword || 'Las contraseñas no coinciden'
                  ]"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirmPassword = !showConfirmPassword"
                    />
                  </template>
                </q-input>
                
                <div class="row q-gutter-sm">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Restablecer Contraseña"
                    :loading="resetting"
                    unelevated
                    class="col"
                  />
                  <q-btn
                    color="grey-7"
                    label="Cancelar"
                    @click="goToLogin"
                    unelevated
                    outline
                    class="col"
                  />
                </div>
              </q-form>
            </div>

            <!-- Estado de carga inicial -->
            <div v-else class="text-center">
              <q-spinner-facebook
                color="primary"
                size="3em"
                class="q-mb-md"
              />
              <h6 class="text-grey-7 q-mb-none">Validando enlace...</h6>
            </div>

            <!-- Estado de error -->
            <div v-if="error" class="text-center q-mt-md">
              <q-icon
                name="error"
                color="negative"
                size="4em"
                class="q-mb-md"
              />
              <h5 class="text-negative q-mb-md">Error</h5>
              <p class="text-grey-7 q-mb-lg">
                {{ errorMessage }}
              </p>
              <q-btn
                color="primary"
                label="Solicitar Nuevo Enlace"
                @click="goToForgotPassword"
                unelevated
                outline
                class="full-width"
              />
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
import { api } from 'boot/axios'

export default {
  name: 'ResetPassword',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()

    // Estados reactivos
    const loading = ref(true)
    const resetting = ref(false)
    const resetSuccess = ref(false)
    const error = ref(false)
    const errorMessage = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const resetToken = ref('')

    // Función para validar el token al cargar la página
    const validateToken = async () => {
      try {
        const token = route.query.token

        if (!token) {
          throw new Error('Token de restablecimiento no encontrado')
        }

        resetToken.value = token
        
        // Aquí podrías hacer una validación previa del token si quisieras
        // pero por simplicidad, asumimos que si hay token, seguimos adelante
        
        loading.value = false

      } catch (err) {
        console.error('Error al validar token:', err)
        error.value = true
        errorMessage.value = 'El enlace de restablecimiento es inválido o ha expirado.'
        loading.value = false
      }
    }

    // Función para restablecer la contraseña
    const resetPassword = async () => {
      try {
        resetting.value = true

        const response = await api.post('/api/auth/confirm-reset-password', {
          token: resetToken.value,
          new_password: newPassword.value
        })

        if (response.data?.success) {
          resetSuccess.value = true
          $q.notify({
            type: 'positive',
            message: response.data.message,
            position: 'top',
            timeout: 5000
          })
        }

      } catch (err) {
        console.error('Error al restablecer contraseña:', err)
        
        let message = 'Error al restablecer contraseña'
        if (err.response?.data?.detail) {
          message = err.response.data.detail
        }
        
        if (err.response?.status === 400) {
          error.value = true
          errorMessage.value = message
        } else {
          $q.notify({
            type: 'negative',
            message: message,
            position: 'top'
          })
        }
      } finally {
        resetting.value = false
      }
    }

    // Funciones de navegación
    const goToLogin = () => {
      router.push('/auth')
    }

    const goToForgotPassword = () => {
      router.push('/forgot-password')
    }

    // Validar token al montar el componente
    onMounted(() => {
      validateToken()
    })

    return {
      loading,
      resetting,
      resetSuccess,
      error,
      errorMessage,
      newPassword,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      resetPassword,
      goToLogin,
      goToForgotPassword
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
