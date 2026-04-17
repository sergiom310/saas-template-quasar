import { storeToRefs } from 'pinia'
import { useI18nStore } from 'src/stores/i18nStore'

export function useUtils() {
  const i18nStore = useI18nStore()
  const { locale } = storeToRefs(i18nStore)

  // 💰 Formatear precio según el locale
  const formatPrice = (value) => {
    const format = locale.value === 'en-US' ? 'en-US' : 'es-CO'
    const currency = locale.value === 'en-US' ? 'USD' : 'COP'
    const maxDigits = locale.value === 'en-US' ? 2 : 0

    return new Intl.NumberFormat(format, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits,
    }).format(value)
  }

  // realizar descuento de precio con porcentaje y formatear
  const priceDiscount = (price, discount) => {
    return formatPrice(price - price * (discount / 100))
  }

  // 🔢 Formatear números con separadores
  const formatNumber = (number) => {
    return new Intl.NumberFormat(locale.value).format(number)
  }

  return {
    formatPrice,
    priceDiscount,
    formatNumber,
  }
}
