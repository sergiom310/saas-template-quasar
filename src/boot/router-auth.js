import { LocalStorage } from 'quasar'

export default ({ router }) => {
  router.beforeEach((to, from, next) => {
    let loggedIn = LocalStorage.getItem('user')
    let requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (!loggedIn && to.path !== '/auth' && requiresAuth) {
      next('/auth')
    } else if (loggedIn && to.path === '/auth') {
      next('/dashboard')
    } else if (to.path == '/') {
      next('/home')
    } else {
      next()
    }
  })
}
