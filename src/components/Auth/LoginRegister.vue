<template>
  <form @submit.prevent="submitForm" class="modern-form">
    <!-- Header Banner Mejorado -->
    <div class="form-header q-mb-lg">
      <div class="icon-wrapper">
        <q-icon :name="tab === 'login' ? 'lock_open' : 'person_add'" size="24px" class="header-icon" />
      </div>
      <h5 class="form-title q-mt-md q-mb-xs">
        {{ tab === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta' }}
      </h5>
      <p class="form-subtitle text-grey-7">
        {{ tab === 'login' ? 'Ingresa tus credenciales para continuar' : 'Completa el formulario para registrarte' }}
      </p>
    </div>

    <!-- Email Field -->
    <div class="q-mb-lg modern-input-wrapper">
      <q-input
        v-model="formData.email"
        :rules="[(val) => isValidEmailAddress(val) || 'Ingresa un email válido']"
        ref="email"
        type="email"
        lazy-rules
        filled
        v-autofocus="{ delayCordova: 500 }"
        class="modern-input"
        label="Correo electrónico"
        hide-bottom-space
      >
        <template v-slot:prepend>
          <q-icon name="email" class="input-icon" />
        </template>
      </q-input>
    </div>

    <!-- Name Field - Solo Registro -->
    <div class="q-mb-lg modern-input-wrapper" v-if="tab === 'register'">
      <q-input
        v-model="formData.name"
        :rules="[(val) => val && val.length >= 4 || 'Ingresa tu nombre completo (mínimo 4 caracteres)']"
        ref="name"
        lazy-rules
        filled
        class="modern-input"
        label="Nombre completo"
        hide-bottom-space
      >
        <template v-slot:prepend>
          <q-icon name="person" class="input-icon" />
        </template>
      </q-input>
    </div>

    <!-- Company Name - Solo Registro Main Domain -->
    <div class="q-mb-lg modern-input-wrapper" v-if="tab === 'register' && isMainDomain">
      <q-input
        v-model="formData.name_company"
        :rules="[(val) => val && val.length >= 2 || 'Ingresa el nombre de la empresa (mínimo 2 caracteres)']"
        ref="name_company"
        lazy-rules
        filled
        class="modern-input"
        label="Nombre de la empresa"
        hide-bottom-space
      >
        <template v-slot:prepend>
          <q-icon name="business" class="input-icon" />
        </template>
      </q-input>
    </div>

    <!-- Domain Field - Solo Registro Main Domain -->
    <div class="q-mb-lg modern-input-wrapper" v-if="tab === 'register' && isMainDomain">
      <q-input
        v-model="formData.domain"
        :rules="[
          (val) => val && val.length >= 2 || 'Ingresa el dominio (mínimo 2 caracteres)',
          (val) => !/\s/.test(val) || 'El dominio no puede contener espacios',
          (val) => /^[a-z0-9-]+$/.test(val) || 'Solo se permiten letras minúsculas, números y guiones'
        ]"
        ref="domain"
        lazy-rules
        filled
        class="modern-input"
        label="Dominio"
        hide-bottom-space
        @input="sanitizeDomain"
      >
        <template v-slot:prepend>
          <q-icon name="domain" class="input-icon" />
        </template>
        <template v-slot:hint>
          <span class="text-caption text-grey-6">Tu URL será: {{formData.domain || 'tudominio'}}.{{ tenantBaseDomain }}</span>
        </template>
      </q-input>
    </div>

    <!-- Password Field -->
    <div class="q-mb-lg modern-input-wrapper">
      <q-input
        v-model="formData.password"
        :rules="[(val) => val.length >= 6 || 'Ingresa al menos 6 caracteres']"
        ref="password"
        lazy-rules
        :type="show1 ? 'password' : 'text'"
        filled
        class="modern-input"
        label="Contraseña"
        hide-bottom-space
      >
        <template v-slot:prepend>
          <q-icon name="lock" class="input-icon" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="show1 ? 'visibility_off' : 'visibility'"
            class="cursor-pointer password-toggle"
            @click="show1 = !show1"
          />
        </template>
      </q-input>
    </div>

    <!-- Forgot Password Link -->
    <div class="row q-mb-lg" v-if="tab === 'login'">
      <div @click="goToSend()" class="forgot-password-link">
        ¿Olvidaste tu contraseña?
      </div>
    </div>

    <!-- reCAPTCHA v3 es invisible -->

    <!-- Submit Button -->
    <div class="q-mb-md">
      <q-btn 
        unelevated
        no-caps
        class="modern-submit-btn full-width"
        :label="tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'"
        type="submit"
        :loading="isSubmitting"
        size="lg"
      >
        <template v-slot:loading>
          <q-spinner-dots color="white" />
        </template>
      </q-btn>
    </div>

    <!-- reCAPTCHA Badge Info -->
    <div class="text-center q-mt-md">
      <p class="text-caption text-grey-6">
        Protegido por reCAPTCHA. Aplican la 
        <a href="https://policies.google.com/privacy" target="_blank" style="color: var(--header-bg); color: var(--header-text)">Política de privacidad</a> 
        y los 
        <a href="https://policies.google.com/terms" target="_blank" style="color: var(--header-bg); color: var(--header-text)">Términos de servicio</a> 
        de Google.
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import { showErrorMessage } from 'src/functions/function-show-error-message'

const props = defineProps({
  tab: String,
})

// Variables de entorno para dominios
const subdomain = import.meta.env.VITE_SUBDOMAIN || 'template'
const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'bitwia.com'
const localDomain = import.meta.env.VITE_LOCAL_DOMAIN || 'template.local'

// Construir el dominio completo para producción
const mainDomainUrl = `${subdomain}.${baseDomain}`

// Detectar si estamos en la url principal (sin subdominio de cliente)
// localhost o bitwia.com = principal
// cliente1.bitwia.com = subdominio
const hostname = window.location.hostname;

// Dominio base donde vivirán los tenants (empresa1.bitwia.com o empresa1.template.local)
const tenantBaseDomain = (hostname === 'localhost' || hostname.includes('.local')) ? localDomain : baseDomain

const isMainDomain = hostname === 'localhost' || 
                      hostname === 'bitwia.com' || 
                      hostname === mainDomainUrl || 
                      hostname === localDomain ||
                      hostname.split('.').length <= 2; // Para otros casos de desarrollo

const router = useRouter()
const authStore = useAuthStore()
const { authError } = storeToRefs(authStore)

const show1 = ref(true)
const isSubmitting = ref(false)

// Site key de reCAPTCHA v3 desde variables de entorno
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

const formData = ref({
  email: '',
  password: '',
  name: '', // Campo requerido para registro
  name_company: '', // Campo nombre de empresa para registro
  domain: '', // Campo Dominio para registro
})

const isValidEmailAddress = (email) => {
  var re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Sanitizar el campo dominio para eliminar espacios y caracteres no válidos
const sanitizeDomain = () => {
  if (formData.value.domain) {
    // Convertir a minúsculas, eliminar espacios y caracteres no válidos
    formData.value.domain = formData.value.domain
      .toLowerCase()
      .replace(/\s+/g, '') // Eliminar todos los espacios
      .replace(/[^a-z0-9-]/g, '') // Solo permitir letras, números y guiones
      .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y al final
  }
}

// Cargar el script de reCAPTCHA v3
const loadRecaptchaScript = () => {
  return new Promise((resolve) => {
    if (window.grecaptcha) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
    script.async = true
    
    script.onload = () => {
      resolve()
    }
    
    document.head.appendChild(script)
  })
}

// Inicializar reCAPTCHA v3
const initRecaptcha = async () => {
  if (!recaptchaSiteKey) return
  
  try {
    await loadRecaptchaScript()
    
    // Para v3, solo necesitamos cargar el script
    // La ejecución se hace dinámicamente en cada acción
  } catch (error) {
    console.error('Error loading reCAPTCHA v3:', error)
  }
}

// Ejecutar reCAPTCHA v3 para una acción específica
const executeRecaptcha = (action) => {
  return new Promise((resolve, reject) => {
    const maxWait = 10000 // 10 segundos máximo
    const interval = 100
    let elapsed = 0

    const tryExecute = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(recaptchaSiteKey, { action })
            .then(token => resolve(token))
            .catch(error => reject(error))
        })
      } else if (elapsed >= maxWait) {
        reject(new Error('reCAPTCHA no está listo después de esperar'))
      } else {
        elapsed += interval
        setTimeout(tryExecute, interval)
      }
    }

    tryExecute()
  })
}

const submitForm = async () => {
  if (!formData.value.email || !formData.value.password) {
    showErrorMessage('Por favor completa todos los campos')
    return
  }

  // Validar nombre para registro
  if (props.tab === 'register' && (!formData.value.name || formData.value.name.trim().length < 2)) {
    showErrorMessage('Por favor ingresa tu nombre completo')
    return
  }
  // Validar dominio para registro
  if (isMainDomain && props.tab === 'register' && (!formData.value.name_company || formData.value.name_company.trim().length < 2)) {
    showErrorMessage('Por favor ingresa el nombre de la empresa')
    return
  }
  // Validar dominio para registro
  if (isMainDomain && props.tab === 'register' && (!formData.value.domain || formData.value.domain.trim().length < 2)) {
    showErrorMessage('Por favor ingresa el dominio')
    return
  }

  isSubmitting.value = true

  try {
    // Ejecutar reCAPTCHA v3 con la acción correspondiente
    const action = props.tab === 'login' ? 'login' : 'register'
    const captchaToken = await executeRecaptcha(action)

    if (props.tab === 'login') {
      // Preparar datos de login con token de reCAPTCHA
      const loginData = {
        ...formData.value,
        recaptcha_token: captchaToken
      }
      const res = await authStore.login(loginData)

      if (res) {
        authStore.loginSuccess(res)
        router.push('/dashboard')
      } else {
        showErrorMessage(authError.value || 'Error al iniciar sesión')
      }
    } else {
      // Detectar si es dominio principal o subdominio de cliente
      let endpoint = '/api/auth/register';
      
      // Si estamos en el dominio principal, usar register-tenant
      if (isMainDomain) {
        endpoint = '/api/auth/register-tenant';
      }

      // Solo enviar name_company y domain si es dominio principal
      const registerData = {
        ...formData.value,
        recaptcha_token: captchaToken,
      };
      
      if (isMainDomain) {
        registerData.name_company = formData.value.name_company;
        registerData.domain = formData.value.domain;
      } else {
        delete registerData.name_company;
        delete registerData.domain;
      }

      // no modificar la siguiente linea, es para evitar conflictos con el backend
      try {        
        const response = await authStore.register(registerData, endpoint)
        console.log('[submitForm] register response:', response)

        if (response.status === 201) {
          if (endpoint === '/api/auth/register-tenant') {
            // Redireccionar al nuevo tenant en su subdominio: empresa1.bitwia.com
            const newDomain = formData.value.domain;
            const protocol = window.location.protocol;
            const currentPort = window.location.port ? `:${window.location.port}` : '';
            const redirectUrl = `${protocol}//${newDomain}.${tenantBaseDomain}${currentPort}`;
            window.location.href = redirectUrl;
            return;
          }
          if (endpoint === '/api/auth/register') {
            window.location.href = '/auth'
            return
          }
        }        
      } catch (errors) {
        console.log('[submitForm] Error capturado:', errors)
        
        // El authStore.register lanza directamente error.response?.data
        // Formatos posibles:
        // 1. {error: 'mensaje', status: 422} - error directo del backend (QueryException)
        // 2. {errors: {...}, message: '...', status: 422} - errores de validación Laravel (nuevo formato Handler)
        // 3. {errors: {...}, message: '...'} - errores de validación Laravel (sin status)
        // 4. String simple 'Error en registro'
        
        if (typeof errors === 'object' && errors !== null) {
          // Verificar si tiene errores de validación (prioridad)
          if (errors.errors && typeof errors.errors === 'object') {
            console.log('[submitForm] Mostrando errores de validación múltiples')
            const validationErrors = errors.errors
            const errorMessages = []
            Object.keys(validationErrors).forEach(field => {
              const messages = validationErrors[field]
              if (Array.isArray(messages)) {
                errorMessages.push(...messages)
              } else {
                errorMessages.push(messages)
              }
            })
            // Mostrar todos los errores con viñetas
            const fullMessage = errorMessages.join('\n• ')
            showErrorMessage('• ' + fullMessage)
          } else if (errors.error) {
            // Error singular directo (QueryException)
            console.log('[submitForm] Mostrando error directo:', errors.error)
            showErrorMessage(errors.error)
          } else if (errors.message) {
            // Fallback al mensaje general
            console.log('[submitForm] Mostrando mensaje de error:', errors.message)
            showErrorMessage(errors.message)
          } else {
            console.log('[submitForm] Error objeto sin estructura conocida')
            showErrorMessage('Error al registrar usuario o tenant')
          }
        } else if (typeof errors === 'string') {
          console.log('[submitForm] Error string:', errors)
          showErrorMessage(errors)
        } else {
          console.log('[submitForm] Error desconocido:', errors)
          showErrorMessage('Error al registrar usuario o tenant')
        }

        isSubmitting.value = false
        return
      }

    }
  } catch (error) {
    console.log('[submitForm] Error catch externo:', error)
    
    // El error puede venir en diferentes formatos
    if (typeof error === 'object' && error !== null) {
      // Prioridad 1: Verificar si tiene errores de validación
      if (error.errors && typeof error.errors === 'object') {
        console.log('[submitForm] Errores de validación detectados en catch externo')
        const validationErrors = error.errors
        const errorMessages = []
        Object.keys(validationErrors).forEach(field => {
          const messages = validationErrors[field]
          if (Array.isArray(messages)) {
            errorMessages.push(...messages)
          } else {
            errorMessages.push(messages)
          }
        })
        const fullMessage = errorMessages.join('\n• ')
        showErrorMessage('• ' + fullMessage)
      } else if (error.error) {
        // Error directo del authStore: {error: '...', status: 422}
        showErrorMessage(error.error)
      } else if (error.message) {
        // Mensaje general
        showErrorMessage(error.message)
      } else if (error.response) {
        // Error formato Axios estándar (por si acaso)
        if (error.response.data?.errors) {
          const validationErrors = error.response.data.errors
          const errorMessages = []
          Object.keys(validationErrors).forEach(field => {
            const messages = validationErrors[field]
            if (Array.isArray(messages)) {
              errorMessages.push(...messages)
            } else {
              errorMessages.push(messages)
            }
          })
          const fullMessage = errorMessages.join('\n• ')
          showErrorMessage('• ' + fullMessage)
        } else if (error.response.data?.error) {
          showErrorMessage(error.response.data.error)
        } else {
          showErrorMessage(error.response.data?.message || 'Error en la respuesta del servidor.')
        }
      } else {
        showErrorMessage('Error al procesar la solicitud. Por favor intenta de nuevo.')
      }
    } else if (typeof error === 'string') {
      showErrorMessage(error)
    } else {
      showErrorMessage('Error al procesar la solicitud. Por favor intenta de nuevo.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const goToSend = () => {
  router.push('/forgot-password')
}

// Función para limpiar reCAPTCHA
const cleanupRecaptcha = () => {
  try {
    // Remover el script de reCAPTCHA
    const scripts = document.querySelectorAll('script[src*="recaptcha"]')
    scripts.forEach(script => script.remove())
    
    // Remover el badge de reCAPTCHA
    const badge = document.querySelector('.grecaptcha-badge')
    if (badge) {
      badge.remove()
    }
    
    // Limpiar el objeto global de reCAPTCHA
    if (window.grecaptcha) {
      delete window.grecaptcha
    }
    
    console.log('reCAPTCHA limpiado')
  } catch (error) {
    console.error('Error al limpiar reCAPTCHA:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  // Limpiar cualquier error previo del store
  authStore.clearAuthError()
  // Inicializar reCAPTCHA v3
  initRecaptcha()
})

onBeforeUnmount(() => {
  // Limpiar reCAPTCHA al salir del componente
  cleanupRecaptcha()
})
</script>

<style scoped>
/* Formulario moderno */
.modern-form {
  max-width: 480px;
  margin: 0 auto;
  padding: 0.5rem 2rem;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header del formulario */
.form-header {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(26, 115, 232, 0.1);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #EEEFE0;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(238, 239, 224, 0.3);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(238, 239, 224, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(238, 239, 224, 0.4);
  }
}

.header-icon {
  color: #2c3e50;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.form-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 0.95rem;
  margin: 0;
  color: #64748b;
  font-weight: 400;
}

/* Inputs modernos */
.modern-input-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.modern-input-wrapper:hover {
  transform: translateY(-2px);
}

:deep(.modern-input .q-field__control) {
  border-radius: 12px;
  height: 56px;
  background: #FEFEFE;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.modern-input .q-field__prepend) {
  background: transparent;
}

:deep(.modern-input .q-field__append) {
  background: transparent;
}

:deep(.modern-input .q-field__control:hover) {
  background: #ffffff;
  border-color: rgba(238, 239, 224, 0.2);
  box-shadow: 0 4px 12px rgba(238, 239, 224, 0.1);
}

:deep(.modern-input.q-field--focused .q-field__control) {
  background: #ffffff;
  border-color: #EEEFE0;
  box-shadow: 0 8px 24px rgba(238, 239, 224, 0.2);
}

:deep(.modern-input .q-field__label) {
  color: #64748b;
  font-weight: 500;
  font-size: 0.95rem;
}

:deep(.modern-input.q-field--focused .q-field__label) {
  color: #8B8C7A;
}

:deep(.modern-input .q-field__native) {
  color: #2c3e50;
  font-size: 1rem;
  padding-top: 8px;
}

:deep(.modern-input .q-field__native::placeholder) {
  color: #cbd5e1;
}

.input-icon {
  color: #94a3b8;
  transition: color 0.3s ease;
}

:deep(.modern-input.q-field--focused) .input-icon {
  color: #8B8C7A;
}

.password-toggle {
  color: #94a3b8;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #8B8C7A;
  transform: scale(1.1);
}

/* Botón de submit moderno */
.modern-submit-btn {
  height: 56px;
  border-radius: 12px;
  background: #EEEFE0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 24px rgba(238, 239, 224, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.modern-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.modern-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(238, 239, 224, 0.45);
}

.modern-submit-btn:hover::before {
  left: 100%;
}

.modern-submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(238, 239, 224, 0.3);
}

/* Link de recuperar contraseña */
.forgot-password-link {
  color: #8B8C7A;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  margin-left: auto;
}

.forgot-password-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #e5e6e1;
  transition: width 0.3s ease;
}

.forgot-password-link:hover {
  color: #6B6C5A;
}

.forgot-password-link:hover::after {
  width: 100%;
}

/* Texto de reCAPTCHA */
:deep(.text-caption a) {
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

:deep(.text-caption a:hover) {
  text-decoration: underline;
}

/* Loading spinner personalizado */
:deep(.q-spinner-dots) {
  font-size: 2rem;
}

/* Mensajes de error mejorados */
:deep(.q-field__messages) {
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  padding-top: 0.5rem;
}

/* Hint text */
:deep(.q-field__bottom) {
  padding-top: 0.5rem;
}

/* Responsive */
@media (max-width: 600px) {
  .modern-form {
    padding: .75rem 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-subtitle {
    font-size: 0.875rem;
  }

  .icon-wrapper {
    width: 70px;
    height: 70px;
  }

  .header-icon {
    font-size: 40px !important;
  }
}

/* Animación de entrada para cada campo */
.modern-input-wrapper {
  animation: slideIn 0.4s ease-out backwards;
}

.modern-input-wrapper:nth-child(1) { animation-delay: 0.1s; }
.modern-input-wrapper:nth-child(2) { animation-delay: 0.2s; }
.modern-input-wrapper:nth-child(3) { animation-delay: 0.3s; }
.modern-input-wrapper:nth-child(4) { animation-delay: 0.4s; }
.modern-input-wrapper:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Estilos para selector de módulos */
:deep(.modern-input .q-field__control-container) {
  min-height: 56px;
}

/* Chips personalizados para módulos seleccionados */
:deep(.q-chip) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.q-chip:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.q-chip .q-avatar) {
  border-radius: 6px;
}

/* Opciones del dropdown mejoradas */
:deep(.q-menu .q-item) {  
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease;
}

:deep(.q-menu .q-item:hover) {
  background: rgba(238, 239, 224, 0.1);
  transform: translateX(4px);
}

:deep(.q-menu .q-item--active) {
  background: rgba(238, 239, 224, 0.2);
}

/* Avatar en las opciones */
:deep(.q-menu .q-avatar) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Mejorar el aspecto del select cuando tiene múltiples valores */
:deep(.modern-input.q-select--multiple .q-field__control) {
  min-height: 56px;
  height: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
