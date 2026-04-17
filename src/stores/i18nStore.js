import { defineStore } from 'pinia'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    locale: localStorage.getItem('appLocale') || 'es-CO',
  }),
  actions: {
    setLocale(newLocale) {
      this.locale = newLocale
      localStorage.setItem('appLocale', newLocale)
    },
  },
})
