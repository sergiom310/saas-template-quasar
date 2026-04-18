<template>
  <div class="cart-container">
    <h6 class="text-center">🛍 Factura de Venta</h6>

    <div v-if="cart.length > 0">
      <q-card class="q-mx-md">
        <div v-for="item in cart" :key="item.id" class="list-cart-items q-pa-md">
          <div class="info-1" style="display: grid; cursor: pointer" @click="goToProduct(item.id)">
            <div style="justify-self: center">
              <img :src="urlRepo + item.cover_img" style="width: 80px; height: auto" />
            </div>

            <div class="q-px-sm">
              <q-item-label>{{ locale == 'es-CO' ? item.name : item.name_en }}</q-item-label>
              <q-item-label lines="1"
                >{{ locale == 'es-CO' ? 'COP' : 'USD' }}
                <span
                  :class="`${item.discount_active && item.discount_percent > 0 ? 'price-discount ' : ''}`"
                >
                  {{ locale == 'es-CO' ? formatPrice(item.price) : formatPrice(item.price_usd) }}
                </span>
                <span
                  v-if="item.discount_active && item.discount_percent > 0"
                  class="price-discounted"
                >
                  {{
                    locale == 'es-CO'
                      ? priceDiscount(item.price, item.discount_percent)
                      : priceDiscount(item.price_usd, item.discount_percent)
                  }}
                </span></q-item-label
              >
              <q-item-label
                v-if="item.discount_active && item.discount_percent > 0"
                caption
                color="orange"
                lines="1"
                ><q-badge color="orange" text-color="black" :label="`-${item.discount_percent}%`" />
              </q-item-label>
            </div>
          </div>

          <div class="info-2">
            <div class="quantity-container">
              <q-btn
                flat
                round
                
                icon="remove"
                class="buton-less"
                @click="decreaseQuantity(item.id)"
              />

              <q-input
                outlined
                dense
                :hide-bottom-space="false"
                style=""
                v-model="item.quantity"
                min="1"
                class="custom-class"
                @update:model-value="updateQuantity(item.id, $event)"
              />

              <q-btn flat round  icon="add" @click="increaseQuantity(item.id)" />

              <q-btn flat round  icon="delete" @click="removeFromCart(item.id)" />
            </div>
          </div>
        </div>
      </q-card>

      <q-card class="q-my-lg q-mx-md">
        <q-card-section>
          <div style="margin: 2px 0 3px 0">
            <b>Subtotal:</b>
            {{
              locale == 'es-CO'
                ? `${formatPrice(totalPrice)} COP`
                : `${formatPrice(totalPriceUsd)} USD`
            }}
          </div>
          <div style="margin: 2px 0 3px 0">
            <b>{{ t('descuento') }}:</b>
            {{
              locale == 'es-CO'
                ? `${formatPrice(totalDiscount)} COP`
                : `${formatPrice(totalDiscountUsd)} USD`
            }}
          </div>
          <div style="margin: 10px 0 3px 0">
            <b>TOTAL:</b>
            {{
              locale == 'es-CO'
                ? `${formatPrice(totalPrice - totalDiscount)} COP`
                : `${formatPrice(totalPriceUsd - totalDiscountUsd)} USD`
            }}
          </div>
          <div style="margin: 6px 0 3px 0">
            <b>{{ t('cantCart') }}:</b> {{ totalItems }}
          </div>

          <q-btn
            
            outline
            style="margin: 10px 5px 5px 0"
            :label="locale == 'es-CO' ? 'Proceder a Pagar' : 'Checkout'"
            @click="abrirCheckout"
          >
            <q-icon right size="1.5em" color="green" name="payment" />
          </q-btn>

          <q-btn
            
            outline
            @click="clearCart"
            style="margin: 10px 5px 5px 0"
            label="Limpiar relación de venta"
          >
            <q-icon right size="1.5em" color="red" name="delete" />
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <p v-else>Sin productos seleccionados.</p>

    <hr />

    <!-- Diálogo de Checkout -->
    <q-dialog v-model="dialogCheckout" persistent>
      <q-card style="width: 600px; max-width: 90vw">
        <q-toolbar class="toolbar-header">
          <q-toolbar-title>
            <q-icon name="payment" class="q-mr-sm" />
            Procesar Pago
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <!-- Resumen de la Venta -->
          <div class="text-h6 q-mb-md">Resumen de la Venta</div>
          <q-list bordered>
            <q-item>
              <q-item-section>
                <q-item-label>Subtotal</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ formatPrice(totalPrice) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Descuento</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>{{ formatPrice(totalDiscount) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-section>
                <q-item-label class="text-bold">TOTAL</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-bold text-primary text-h6">
                  {{ formatPrice(totalPrice - totalDiscount) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <!-- Método de Pago -->
          <div class="text-h6 q-mb-md">Pago</div>
          
          <q-select
            outlined
            v-model="checkoutForm.metodo_pago_id"
            :options="metodosPago"
            option-value="id"
            option-label="detalle"
            emit-value
            map-options
            label="Seleccione el método de pago *"
            :rules="[(val) => !!val || 'El método de pago es requerido']"
            class="q-mb-md"
          />

          <!-- Monto del Pago -->
          <q-input
            outlined
            v-model.number="checkoutForm.monto"
            label="Monto del Pago *"
            type="number"
            step="0.01"
            min="0"
            :max="totalPrice - totalDiscount"
            prefix="$"
            :rules="[
              (val) => !!val || 'El monto es requerido',
              (val) => val > 0 || 'El monto debe ser mayor a 0',
              (val) => val <= (totalPrice - totalDiscount) || 'El monto excede el total de la venta'
            ]"
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                label="Total"
                
                size="sm"
                @click="checkoutForm.monto = totalPrice - totalDiscount"
              >
                <q-tooltip>Pagar el total</q-tooltip>
              </q-btn>
            </template>
            <template v-slot:hint>
              {{ checkoutForm.monto && checkoutForm.monto < (totalPrice - totalDiscount) 
                ? '⚠️ Pago parcial - La venta quedará PENDIENTE' 
                : 'Pagar el total completo' }}
            </template>
          </q-input>

          <!-- Referencia de Pago (Opcional) -->
          <q-input
            outlined
            v-model="checkoutForm.referencia"
            label="Referencia o número de transacción (opcional)"
            class="q-mt-md"
          />

          <!-- Observaciones -->
          <q-input
            outlined
            v-model="checkoutForm.observaciones"
            label="Observaciones (opcional)"
            type="textarea"
            rows="3"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn
            label="Confirmar Pago"
            
            @click="procesarCheckout"
            :disable="!checkoutForm.metodo_pago_id || !checkoutForm.monto || checkoutForm.monto <= 0"
            :loading="processingCheckout"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from 'src/stores/shoppingCart'
import { useVentasStore } from 'src/stores/ventas'
import { useAuthStore } from 'src/stores/auth'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUtils } from 'src/composables/useUtils'
import { useQuasar } from 'quasar'

const { formatPrice, priceDiscount } = useUtils()
const $q = useQuasar()

const urlRepo = `${import.meta.env.VITE_API_URL}/`
const router = useRouter()

// Importar stores
const cartStore = useCartStore()
const ventasStore = useVentasStore()
const authStore = useAuthStore()

const { cart, totalItems, totalPrice, totalPriceUsd, totalDiscount, totalDiscountUsd } =
  storeToRefs(cartStore)
const { removeFromCart, updateQuantity, clearCart } = cartStore

const metodosPago = computed(() => ventasStore.metodosPago)

const { locale, t } = useI18n({ useScope: 'global' })

// Estados del checkout
const dialogCheckout = ref(false)
const processingCheckout = ref(false)
const checkoutForm = ref({
  metodo_pago_id: null,
  monto: 0,
  referencia: '',
  observaciones: ''
})

// Computed para el total de la venta
const totalVenta = computed(() => totalPrice.value - totalDiscount.value)

// Funciones para modificar el carrito
const increaseQuantity = (id) => {
  const item = cart.value.find((p) => p.id === id)
  if (item) updateQuantity(id, Number(item.quantity) + 1)
}

const decreaseQuantity = (id) => {
  const item = cart.value.find((p) => p.id === id)
  if (item && item.quantity > 1) {
    updateQuantity(id, item.quantity - 1)
  }
}

const goToProduct = (id) => {
  router.push(`/productdetail/${id}`)
}

// Función para imprimir recibo de venta
const imprimirRecibo = async (venta) => {
  if (!venta) return

  // Si la venta no tiene detalles completos, cargarlos
  let ventaCompleta = venta
  if (!venta.detalles || !venta.pagos) {
    ventaCompleta = await ventasStore.loadVentaDetalle(venta.id)
    if (!ventaCompleta) {
      console.error('Error al cargar detalles de la venta para imprimir')
      return
    }
  }

  // Calcular totales
  const totalPagado = ventaCompleta.pagos?.reduce((sum, pago) => sum + parseFloat(pago.monto), 0) || 0
  const saldoPendiente = ventaCompleta.total - totalPagado

  const config = { 
    imp_logo: 'S', imp_nombre: 'S', imp_nit: 'S', 
    imp_tel: 'S', imp_dir: 'S', imp_horario: 'S' 
  }

  // Si no hay datos, intentar obtenerlos del backend
  if (!window.empresaData) {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/api/empresa', false)
      xhr.send(null)
      if (xhr.status === 200) {
        window.empresaData = JSON.parse(xhr.responseText)
      }
    } catch (e) {
       /* ignorar */ 
       console.log(e);
    }
  }

  const empresaData = window.empresaData || {}
  const nombre = empresaData.nombre || ''
  const nit = empresaData.nit || ''
  const direccion = empresaData.direccion || ''
  const telefono = empresaData.telefono || ''
  const horario = empresaData.horario_atencion || ''
  const logo_path = empresaData.logo_path || ''

  // Construir encabezado con logo
  let encabezado = `<div style='text-align:center; margin-bottom:8px; font-size:13px;'>`
  if (config.imp_logo === 'S' && logo_path) {
    const { protocol, hostname } = window.location
    const clean = logo_path.replace(/^\/*/, '')
    const logoUrl = `${protocol}//${hostname.replace(':9000', '')}:8000/storage/${clean}`
    encabezado += `<img src='${logoUrl}' alt='Logo' style='max-width:80px; max-height:80px; margin-bottom:4px; display:block; margin-left:auto; margin-right:auto;' />`
  }
  if (config.imp_nombre === 'S' && nombre) encabezado += `<div style='font-weight:bold; text-transform:uppercase;'>${nombre}</div>`
  if (config.imp_nit === 'S' && nit) encabezado += `<div>NIT: ${nit}</div>`
  if (config.imp_dir === 'S' && direccion) encabezado += `<div style='font-weight:bold;'>${direccion}</div>`
  if (config.imp_tel === 'S' && telefono) encabezado += `<div style='font-weight:bold;'>Tel: ${telefono}</div>`
  if (config.imp_horario === 'S' && horario) encabezado += `<div style='font-weight:bold;'>${horario}</div>`
  encabezado += `</div>`

  // Función local para formatear fecha/hora
  const formatDateTime = (datetime) => {
    if (!datetime) return '-'
    const date = new Date(datetime)
    return date.toLocaleString('es-CO', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Construir HTML del recibo
  const estadoTexto = ventaCompleta.estado === 'pendiente' 
    ? `<div style="color:orange; font-weight:bold; margin-top:8px;">ESTADO: PENDIENTE - Saldo: ${formatPrice(saldoPendiente)}</div>`
    : `<div style="color:green; font-weight:bold; margin-top:8px;">ESTADO: PAGADA</div>`

  const html = `
    <html>
      <head>
        <title>Recibo de Venta #${ventaCompleta.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; font-size: 12px; }
          .encabezado { text-align: center; margin-bottom: 12px; }
          .info { margin-bottom: 12px; }
          .label { font-weight: bold; }
          .valor { float: right; }
          .row { margin-bottom: 6px; overflow: auto; }
          .center { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .estado { margin-top: 12px; padding: 8px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="encabezado">
          ${encabezado}
        </div>
        <h2 style="text-align:center; margin: 12px 0;">Recibo de Venta #${ventaCompleta.id}</h2>
        
        <div class="info">
          <div class="row"><span class="label">Fecha:</span> <span class="valor">${formatDateTime(ventaCompleta.fecha_venta)}</span></div>
          <div class="row"><span class="label">Usuario:</span> <span class="valor">${ventaCompleta.usuario?.name || 'N/A'}</span></div>
          ${ventaCompleta.cliente ? `<div class="row"><span class="label">Cliente:</span> <span class="valor">${ventaCompleta.cliente.nombre}</span></div>` : ''}
          ${ventaCompleta.cliente?.telefono ? `<div class="row"><span class="label">Teléfono:</span> <span class="valor">${ventaCompleta.cliente.telefono}</span></div>` : ''}
        </div>

        <h3>Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align:center;">Cant.</th>
              <th style="text-align:right;">P. Unit.</th>
              <th style="text-align:right;">Subtotal</th>
              <th style="text-align:right;">Desc.</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${ventaCompleta.detalles?.map(detalle => `
              <tr>
                <td>${detalle.producto_nombre}</td>
                <td style="text-align:center;">${detalle.cantidad}</td>
                <td style="text-align:right;">${formatPrice(detalle.precio_unitario)}</td>
                <td style="text-align:right;">${formatPrice(detalle.subtotal)}</td>
                <td style="text-align:right;">${formatPrice(detalle.descuento)}</td>
                <td style="text-align:right;">${formatPrice(detalle.total)}</td>
              </tr>
            `).join('') || ''}
            <tr class="total-row">
              <td colspan="5" style="text-align:right;">Subtotal:</td>
              <td style="text-align:right;">${formatPrice(ventaCompleta.subtotal)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="5" style="text-align:right;">Descuento:</td>
              <td style="text-align:right;">${formatPrice(ventaCompleta.descuento)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="5" style="text-align:right;">TOTAL:</td>
              <td style="text-align:right;">${formatPrice(ventaCompleta.total)}</td>
            </tr>
          </tbody>
        </table>

        <h3>Pagos Registrados</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Método</th>
              <th style="text-align:right;">Monto</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            ${ventaCompleta.pagos?.map(pago => `
              <tr>
                <td>${formatDateTime(pago.fecha_pago)}</td>
                <td>${pago.metodo_pago?.detalle || 'N/A'}</td>
                <td style="text-align:right;">${formatPrice(pago.monto)}</td>
                <td>${pago.referencia || '-'}</td>
              </tr>
            `).join('') || ''}
            <tr class="total-row">
              <td colspan="2" style="text-align:right;">Total Pagado:</td>
              <td style="text-align:right;">${formatPrice(totalPagado)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        ${ventaCompleta.observaciones ? `<div style="margin-top: 12px;"><strong>Observaciones:</strong> ${ventaCompleta.observaciones}</div>` : ''}

        <div class="estado">
          ${estadoTexto}
        </div>

        <div class="center" style="margin-top: 20px; font-size: 11px; color: #666;">
          ¡Gracias por su compra!
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

// Función para abrir el diálogo de checkout
const abrirCheckout = () => {
  // Inicializar el monto con el total de la venta
  checkoutForm.value.monto = totalVenta.value
  dialogCheckout.value = true
}

// Función para procesar el checkout
const procesarCheckout = async () => {
  if (!checkoutForm.value.metodo_pago_id) {
    $q.notify({
      type: 'negative',
      message: 'Debe seleccionar un método de pago'
    })
    return
  }

  if (!checkoutForm.value.monto || checkoutForm.value.monto <= 0) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar un monto válido'
    })
    return
  }

  if (cart.value.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Relación de venta vacío'
    })
    return
  }

  processingCheckout.value = true

  try {
    const user = authStore.localUser
    if (!user || !user.id) {
      $q.notify({
        type: 'negative',
        message: 'Debe iniciar sesión para realizar una compra'
      })
      processingCheckout.value = false
      return
    }

    // Construir el payload para la venta
    const payload = {
      user_id: user.id,
      cliente_id: checkoutForm.value.cliente_id || null,
      productos: cart.value.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      descuento: totalDiscount.value,
      observaciones: checkoutForm.value.observaciones,
      pagos: [
        {
          metodo_pago_id: checkoutForm.value.metodo_pago_id,
          monto: checkoutForm.value.monto,
          referencia: checkoutForm.value.referencia || null
        }
      ]
    }

    // Mostrar confirmación si es pago parcial
    if (checkoutForm.value.monto < totalVenta.value) {
      const confirmar = await new Promise((resolve) => {
        $q.dialog({
          title: 'Pago Parcial',
          message: `Está pagando $${checkoutForm.value.monto.toLocaleString('es-CO', { minimumFractionDigits: 2 })} de un total de $${totalVenta.value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}. La venta quedará en estado PENDIENTE. ¿Desea continuar?`,
          cancel: { label: 'Cancelar', flat: true, color: 'grey' },
          ok: { label: 'Continuar', flat: true, color: 'secondary' },
          persistent: true
        }).onOk(() => resolve(true))
          .onCancel(() => resolve(false))
      })

      if (!confirmar) {
        processingCheckout.value = false
        return
      }
    }

    // Llamar al store para crear la venta
    const ventaCreada = await ventasStore.crearVenta(payload)

    if (ventaCreada) {
      $q.notify({
        type: 'positive',
        message: 'Venta procesada exitosamente',
        icon: 'check_circle'
      })

      // Limpiar el carrito y cerrar el diálogo
      clearCart()
      dialogCheckout.value = false
      checkoutForm.value = {
        cliente_id: null,
        metodo_pago_id: null,
        monto: 0,
        referencia: '',
        observaciones: ''
      }

      // Imprimir recibo automáticamente
      setTimeout(() => {
        imprimirRecibo(ventaCreada)
      }, 500)

      // Redirigir a la página de ventas después de un delay para que se imprima el recibo
      setTimeout(() => {
        router.push('/ventas')
      }, 1000)
    }
  } catch (error) {
    console.error('Error al procesar la venta:', error)
  } finally {
    processingCheckout.value = false
  }
}

// Cargar métodos de pago al montar el componente
onMounted(async () => {
  await ventasStore.loadMetodosPago()
})
</script>

<style lang="scss" scoped>
.list-cart-items {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  .info-1 {
    width: 100%;
    display: grid;
    grid-template-columns: 90px 1fr;

    @media (min-width: 1024px) {
      border-bottom: 1px solid rgba(#000000, 0.14);
    }
  }

  .info-2 {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    justify-content: center;
    justify-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(#000000, 0.14);
  }
}
::v-deep(.custom-class .q-field__control) {
  width: 55px;
  height: 28px !important;
  max-height: 28px !important;
  text-align: center !important;
}
::v-deep(.boton-less .q-btn--round) {
  min-width: 1.5em;
  min-height: 1.53em;
}
.cart-container {
  width: 100%;
  max-width: 900px;
  display: grid;
  justify-content: center;
  margin: 0 auto;
}
.cart-item,
.product {
  padding: 10px;
}
.quantity-container {
  display: flex;
  align-items: center;
  gap: 5px;
}
.price-discount {
  text-decoration: line-through;
  color: #9e9e9e !important;
  font-weight: 400;
}
.price-discounted {
  font-weight: 500;
  margin-left: 8px;
}
</style>
