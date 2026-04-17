import { Dialog, Loading } from 'quasar'

export function showErrorMessage(errorMessage, success = false) {
  Loading.hide()
  let msgErrorText = ''
  if (errorMessage === undefined || errorMessage === null) {
    msgErrorText = 'Ocurrió un error desconocido.'
  } else if (typeof errorMessage === 'string') {
    msgErrorText = errorMessage
  } else if (typeof errorMessage === 'object') {
    try {
      msgErrorText = JSON.stringify(errorMessage, null, 2)
    } catch {
      msgErrorText = String(errorMessage)
    }
  } else {
    msgErrorText = String(errorMessage)
  }
  // Limpieza visual
  if (typeof msgErrorText === 'string') {
    msgErrorText = msgErrorText.replace(/"/g, '')
    msgErrorText = msgErrorText.replace(/{/g, '')
    msgErrorText = msgErrorText.replace(/}/g, '')
  }
  let title = success ? 'Notificación' : 'Error'
  Dialog.create({
    title: title,
    message: msgErrorText,
  })
}
