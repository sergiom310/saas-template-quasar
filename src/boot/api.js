import { defineBoot } from '#q-app/wrappers'

/**
 * Construye la URL base del API de forma dinámica.
 * Si el hostname actual tiene un subdominio (ej: lotus.template.local),
 * lo preserva para que Spatie Multitenancy identifique el tenant correcto.
 * En caso contrario usa la URL del .env.
 */
function buildBaseURL() {
  const envURL = new URL(process.env.__ENV__)
  const currentHostname = window.location.hostname

  // Extraer el dominio base del env (sin subdominio)
  // ej: "template.local" de "http://template.local:8000"
  const envHostname = envURL.hostname

  // Si el hostname actual termina con el dominio base del env
  // y es diferente (tiene subdominio), usarlo en la URL del backend
  if (currentHostname !== envHostname && currentHostname.endsWith(envHostname)) {
    return `${envURL.protocol}//${currentHostname}:${envURL.port}`
  }

  return process.env.__ENV__
}

const baseURL = buildBaseURL()

const AUTH_EXEMPT_PATHS = ['/auth', '/verificar', '/forgot-password', '/reset-password']

/**
 * Error personalizado que replica la forma de error de axios:
 * error.response.status
 * error.response.data
 */
class ApiError extends Error {
  constructor(status, data) {
    super(`HTTP Error ${status}`)
    this.name = 'ApiError'
    this.response = { status, data }
  }
}

async function request(method, url, data = null) {
  const headers = {
    Accept: 'application/json',
  }

  let body = null

  if (data !== null) {
    if (data instanceof FormData) {
      // No establecer Content-Type para FormData; el navegador lo hace con el boundary
      body = data
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data)
    }
  }

  let response
  try {
    response = await fetch(`${baseURL}${url}`, {
      method,
      headers,
      credentials: 'include', // equivalente a withCredentials: true de axios
      body,
    })
  } catch {
    throw new ApiError(0, { detail: 'Error de red. Verifica tu conexión.' })
  }

  const contentType = response.headers.get('content-type') ?? ''
  const responseData = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    if (
      response.status === 401 &&
      !AUTH_EXEMPT_PATHS.includes(window.location.pathname)
    ) {
      const isTenantInactive = responseData?.tenant_inactive === true

      if (isTenantInactive) {
        if (window.Quasar && window.Quasar.Notify) {
          window.Quasar.Notify.create({
            type: 'negative',
            message: 'Su cuenta ha sido desactivada. Contacte al administrador del sistema.',
            timeout: 5000,
            position: 'top',
          })
        } else {
          alert('Su cuenta ha sido desactivada. Contacte al administrador del sistema.')
        }
      }

      localStorage.removeItem('user')
      localStorage.removeItem('permisos')
      localStorage.removeItem('roleuser')
      window.location.href = '/auth'
    }

    throw new ApiError(response.status, responseData)
  }

  // Retorna { data, status } para mantener compatibilidad con el uso de axios en los stores
  return { data: responseData, status: response.status }
}

export const api = {
  get(url, config = {}) {
    const queryString =
      config.params && Object.keys(config.params).length > 0
        ? '?' + new URLSearchParams(config.params).toString()
        : ''
    return request('GET', url + queryString)
  },

  post(url, data = null) {
    return request('POST', url, data)
  },

  put(url, data = null) {
    return request('PUT', url, data)
  },

  delete(url) {
    return request('DELETE', url)
  },
}

/** URL base del backend con el subdominio correcto para usar en src de imágenes */
export const apiBaseURL = baseURL

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = api
})
