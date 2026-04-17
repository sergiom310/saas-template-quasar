import { defineBoot } from '#q-app/wrappers'
import router from 'src/router'
import axios from 'axios'
// import { setAuthorization } from 'src/functions/function-general'
// import { getLocalUser } from 'src/functions/function-auth'
// import { useAuthStore } from 'src/stores/auth'

// Usar el origen actual del navegador para multitenancy dinámico
// Usar el puerto del frontend solo si existe (en desarrollo), en producción no se agrega puerto
// Preferimos las variables con prefijo VITE_, ya que Quasar/Vite las expone automáticamente en el frontend
//const baseURL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;
//const { hostname, protocol, port } = window.location;
let baseURL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

// // Si estamos en .bitwia.com (producción SaaS)
// if (
//   hostname.endsWith('.bitwia.com') &&
//   baseURL === 'https://api.bitwia.com'
// ) {
//   const matches = hostname.match(/^([^.]+)\.bitwia\.com$/);
//   if (matches && matches[1]) {
//     baseURL = `https://api.${matches[1]}.bitwia.com`;
//   }
// }
// else if (
//   hostname.endsWith('.saas.local') &&
//   (baseURL === 'http://saas.local:8000' || baseURL === undefined)
// ) {
//   // Si el frontend está en cliente1.saas.local:9000, el backend debe ser api.cliente1.saas.local:8000
//   let apiPort = port === '9000' ? '8000' : port || '8000';
//   let apiHost = hostname.startsWith('api.') ? hostname : `api.${hostname}`;
//   baseURL = `${protocol}//${apiHost}:${apiPort}`;
// }

// Configurar axios para enviar cookies automáticamente
const api = axios.create({
  baseURL,
  withCredentials: true // Las cookies httpOnly se envían automáticamente
})

// Configurar interceptores de respuesta
api.interceptors.response.use(
  response => response, 
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && 
          window.location.pathname !== '/auth' && 
          window.location.pathname !== '/verificar' &&
          window.location.pathname !== '/forgot-password' &&
          window.location.pathname !== '/reset-password') {
        
        // Verificar si es por tenant inactivo
        const isTenantInactive = error.response.data?.tenant_inactive === true;
        
        if (isTenantInactive) {
          console.log('Tenant inactivo, cerrando sesión');
          // Mostrar mensaje específico si Quasar Notify está disponible
          if (window.Quasar && window.Quasar.Notify) {
            window.Quasar.Notify.create({
              type: 'negative',
              message: 'Su cuenta ha sido desactivada. Contacte al administrador del sistema.',
              timeout: 5000,
              position: 'top'
            });
          } else {
            alert('Su cuenta ha sido desactivada. Contacte al administrador del sistema.');
          }
        } else {
          console.log('Sesión expirada, redirigiendo a login');
        }

        // Redirección manual sin usar logoutUser
        localStorage.removeItem('user')
        localStorage.removeItem('permisos')
        localStorage.removeItem('roleuser')
        // Usar vue-router para evitar recarga completa
        router.push('/auth')
      }
    }
    return Promise.reject(error)
  }
)


// Configurar interceptor de solicitud global para establecer los encabezados Content-Type y Accept
api.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  // Solo establecer Content-Type si no es una solicitud multipart/form-data
  if (!config.data || !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  config.headers['Accept'] = 'application/json'
  config.params = config.params || {}
  // Ya NO añadimos Authorization ni token manualmente
  return config
})


export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
