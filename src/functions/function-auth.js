import { api } from 'boot/axios'
import { Loading } from 'quasar'
import { setAuthorization } from './function-general'

export function login(credentials) {
  Loading.show()
  return new Promise((res, rej) => {
    api
      .post('/api/auth/login', credentials)
      .then((response) => {
        Loading.hide()
        setAuthorization(response.data.access_token)
        res(response.data)
      })
      .catch((err) => {
        Loading.hide()
        rej(err.response.data.error)
      })
  })
}

export function register(dataRegister) {
  return new Promise((res, rej) => {
    api
      .post('/api/auth/register', dataRegister)
      .then((response) => {
        res(response.data)
      })
      .catch((err) => {
        rej(err.response.data.errors)
      })
  })
}

export function email(dataSend) {
  return new Promise((res, rej) => {
    api
      .post('/api/password/create', dataSend)
      .then((response) => {
        res(response)
      })
      .catch((err) => {
        rej(err.response.data.message)
      })
  })
}

export function reset(dataSend) {
  return new Promise((res, rej) => {
    api
      .post('/api/password/reset', dataSend)
      .then((response) => {
        res(response)
      })
      .catch((err) => {
        rej(err.response.data.message)
      })
  })
}

export function getLocalUser() {
  const userStr = localStorage.getItem('user')

  if (!userStr) {
    return null
  }

  return JSON.parse(userStr)
}

export function getPermsUser() {
  const permsStr = localStorage.getItem('permisos')

  return JSON.parse(permsStr)
}

export function getRoleUser() {
  const roleStr = localStorage.getItem('roleuser')

  return JSON.parse(roleStr)
}

export function getMenus() {
  const menus = localStorage.getItem('arraymenus')

  return JSON.parse(menus)
}
