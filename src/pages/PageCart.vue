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
            :label="locale == 'es-CO' ? 'Generar Pedido' : 'Place Order'"
            @click="abrirDialogoPedido"
          >
            <q-icon right size="1.5em" color="positive" name="shopping_bag" />
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

    <!-- Diálogo Generar Pedido -->
    <q-dialog v-model="dialogPedido" persistent>
      <q-card style="width: 480px; max-width: 90vw">
        <q-toolbar class="toolbar-header">
          <q-toolbar-title>
            <q-icon name="shopping_bag" class="q-mr-sm" />
            Confirmar Pedido
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup :disable="processingPedido" />
        </q-toolbar>

        <q-card-section>
          <!-- Resumen -->
          <q-list bordered class="q-mb-md">
            <q-item>
              <q-item-section><q-item-label>Subtotal</q-item-label></q-item-section>
              <q-item-section side><q-item-label>{{ formatPrice(totalPrice) }}</q-item-label></q-item-section>
            </q-item>
            <q-item v-if="totalDiscount > 0">
              <q-item-section><q-item-label>Descuento</q-item-label></q-item-section>
              <q-item-section side><q-item-label class="text-negative">-{{ formatPrice(totalDiscount) }}</q-item-label></q-item-section>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-section><q-item-label class="text-bold">TOTAL</q-item-label></q-item-section>
              <q-item-section side>
                <q-item-label class="text-bold text-positive text-h6">{{ formatPrice(totalPrice - totalDiscount) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-input
            v-model="pedidoNotes"
            label="Notas u observaciones (opcional)"
            outlined
            dense
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup :disable="processingPedido" />
          <q-btn
            color="positive"
            icon="check"
            label="Confirmar Pedido"
            @click="confirmarPedido"
            :loading="processingPedido"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from 'src/stores/shoppingCart'
import { usePedidosStore } from 'src/stores/pedidos'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUtils } from 'src/composables/useUtils'
import { useQuasar } from 'quasar'
import { apiBaseURL } from 'src/boot/api'

const { formatPrice, priceDiscount } = useUtils()
const $q = useQuasar()

const urlRepo = `${apiBaseURL}/`
const router = useRouter()

const cartStore = useCartStore()
const pedidosStore = usePedidosStore()

const { cart, totalItems, totalPrice, totalPriceUsd, totalDiscount, totalDiscountUsd } =
  storeToRefs(cartStore)
const { removeFromCart, updateQuantity, clearCart } = cartStore

const { locale, t } = useI18n({ useScope: 'global' })

// Estado diálogo pedido
const dialogPedido = ref(false)
const processingPedido = ref(false)
const pedidoNotes = ref('')

// Funciones carrito
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

const abrirDialogoPedido = () => {
  pedidoNotes.value = ''
  dialogPedido.value = true
}

const confirmarPedido = async () => {
  if (cart.value.length === 0) {
    $q.notify({ type: 'negative', message: 'El carrito está vacío' })
    return
  }

  processingPedido.value = true

  try {
    const payload = {
      productos: cart.value.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      discount: totalDiscount.value,
      notes: pedidoNotes.value || null,
    }

    await pedidosStore.crearPedido(payload)

    $q.notify({ type: 'positive', message: 'Pedido generado correctamente', icon: 'check_circle' })
    clearCart()
    dialogPedido.value = false
    router.push('/dashboard')
  } catch (error) {
    console.error('Error al generar pedido:', error)
    $q.notify({ type: 'negative', message: 'Error al generar el pedido' })
  } finally {
    processingPedido.value = false
  }
}

onMounted(() => {})
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
