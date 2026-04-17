import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'
import { Quasar } from 'quasar'

// Importar el idioma español de Quasar
import langEs from 'quasar/lang/es'

export default defineBoot(({ app }) => {
  const userLocale = navigator.language || 'es-CO'

  const i18n = createI18n({
    locale: userLocale,
    fallbackLocale: 'es-CO',
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)

  // Configurar el idioma español para los componentes de Quasar (date, time, etc.)
  Quasar.lang.set(langEs)
})
