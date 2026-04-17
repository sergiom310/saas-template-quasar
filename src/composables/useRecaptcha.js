// composables/useRecaptcha.js
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRecaptchaCleanup() {
  const hideRecaptchaBadge = () => {
    try {
      const badge = document.querySelector('.grecaptcha-badge')
      if (badge) {
        badge.style.display = 'none'
      }
    } catch (error) {
      console.error('Error al ocultar badge de reCAPTCHA:', error)
    }
  }

  const showRecaptchaBadge = () => {
    try {
      const badge = document.querySelector('.grecaptcha-badge')
      if (badge) {
        badge.style.display = 'block'
      }
    } catch (error) {
      console.error('Error al mostrar badge de reCAPTCHA:', error)
    }
  }

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
      
      console.log('reCAPTCHA limpiado completamente')
    } catch (error) {
      console.error('Error al limpiar reCAPTCHA:', error)
    }
  }

  return {
    hideRecaptchaBadge,
    showRecaptchaBadge,
    cleanupRecaptcha
  }
}

// Composable para manejar reCAPTCHA basado en la ruta actual
export function useRecaptchaRouteHandler() {
  const route = useRoute()
  const { hideRecaptchaBadge, showRecaptchaBadge } = useRecaptchaCleanup()

  const authRoutes = ['/auth', '/login', '/register', '/forgot-password', '/reset-password']

  const checkRoute = () => {
    const currentPath = route.path
    const isAuthRoute = authRoutes.some(authPath => currentPath.startsWith(authPath))
    
    setTimeout(() => {
      if (isAuthRoute) {
        showRecaptchaBadge()
      } else {
        hideRecaptchaBadge()
      }
    }, 200) // Delay para asegurar que el DOM esté listo
  }

  onMounted(() => {
    checkRoute()
  })

  // Observar cambios de ruta
  watch(() => route.path, () => {
    checkRoute()
  })

  return {
    hideRecaptchaBadge,
    showRecaptchaBadge
  }
}

// Composable específico para páginas que NO deben mostrar reCAPTCHA
export function useHideRecaptcha() {
  const { hideRecaptchaBadge } = useRecaptchaCleanup()

  onMounted(() => {
    // Ocultar el badge al montar el componente
    setTimeout(() => {
      hideRecaptchaBadge()
    }, 100) // Small delay to ensure DOM is ready
  })

  return {
    hideRecaptchaBadge
  }
}
