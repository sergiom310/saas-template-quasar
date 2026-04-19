<template>
  <q-page class="q-pa-md">

    <!-- Saludo -->
    <div class="q-mb-lg">
      <div class="text-h5 text-weight-bold">Bienvenido, {{ nombreUsuario }}</div>
      <div class="text-caption text-grey-6">{{ fechaHoy }}</div>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="row q-col-gutter-md q-mb-lg" v-if="laravelCan('admin.index')">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-7">Total Ventas</div>
              <div class="text-h5 text-weight-bold">{{ stats.total_ventas ?? '-' }}</div>
            </div>
            <q-icon name="receipt_long" size="40px" color="secondary" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3" v-if="laravelCan('admin.index')">
        <q-card flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-7">Ventas Pagadas</div>
              <div class="text-h5 text-weight-bold text-positive">{{ stats.ventas_pagadas ?? '-' }}</div>
            </div>
            <q-icon name="check_circle" size="40px" color="positive" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3" v-if="laravelCan('admin.index')">
        <q-card flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-7">Ventas Pendientes</div>
              <div class="text-h5 text-weight-bold text-warning">{{ stats.ventas_pendientes ?? '-' }}</div>
            </div>
            <q-icon name="pending" size="40px" color="warning" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3" v-if="laravelCan('admin.index')">
        <q-card flat bordered>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="text-caption text-grey-7">Monto Total</div>
              <div class="text-h5 text-weight-bold text-positive">${{ formatPrice(stats.monto_total) }}</div>
            </div>
            <q-icon name="payments" size="40px" color="positive" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Segunda fila: pendiente por cobrar + accesos rápidos -->
    <div class="row q-col-gutter-md" v-if="laravelCan('admin.index')">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Por cobrar</div>
            <div class="text-h4 text-weight-bold text-orange">${{ formatPrice(stats.monto_pendiente) }}</div>
            <div class="text-caption text-grey-6">Monto pendiente en ventas activas</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-8" v-if="laravelCan('admin.index')">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">Accesos rápidos</div>
            <div class="row q-gutter-sm">
              <q-btn flat color="secondary" icon="inventory_2" label="Productos" to="/tienda/products" no-caps />
              <q-btn flat color="secondary" icon="receipt_long" label="Ventas" to="/ventas" no-caps />
              <q-btn flat color="secondary" icon="list_alt" label="Órdenes" to="/tienda/ordenes" no-caps />
              <q-btn flat color="secondary" icon="category" label="Categorías" to="/tienda/categories" no-caps />
              <q-btn flat color="secondary" icon="domain" label="Marcas" to="/tienda/marcas" no-caps />
              <q-btn flat color="secondary" icon="person" label="Usuarios" to="/system/users" no-caps />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Cards para cliente (no admin) -->
    <div class="row q-col-gutter-md q-mt-md" v-if="laravelCan('usuario.index') && !laravelCan('admin.index')">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-sm">
            <q-icon name="shopping_bag" color="secondary" size="40px" />
            <div>
              <div class="text-caption text-grey-6">Mis pedidos</div>
              <div class="text-h5 text-weight-bold">{{ misPedidos.length }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-sm">
            <q-icon name="pending_actions" color="warning" size="40px" />
            <div>
              <div class="text-caption text-grey-6">Pedidos pendientes</div>
              <div class="text-h5 text-weight-bold text-warning">{{ pedidosPendientes }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">Accesos rápidos</div>
            <div class="row q-gutter-sm">
              <q-btn flat color="secondary" icon="storefront" label="Tienda" to="/" no-caps />
              <q-btn flat color="secondary" icon="shopping_cart" label="Carrito" to="/cartlist" no-caps />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useVentasStore } from 'src/stores/ventas'
import { usePedidosStore } from 'src/stores/pedidos'
import { storeToRefs } from 'pinia'
import { date } from 'quasar'
import { laravelCan } from 'src/functions/function-general'

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const ventasStore = useVentasStore()
const pedidosStore = usePedidosStore()

const { misPedidos } = storeToRefs(pedidosStore)

const pedidosPendientes = computed(() =>
  misPedidos.value.filter((p) => p.status === 'Pendiente' || p.status === 'Procesando').length
)

const stats = ref({})

const nombreUsuario = computed(() => {
  if (!currentUser.value?.name) return 'Usuario'
  const nombre = currentUser.value.name
  return nombre.length > 20 ? nombre.substring(0, 20) : nombre
})

const fechaHoy = computed(() => {
  return date.formatDate(new Date(), 'dddd, D [de] MMMM [de] YYYY')
})

const formatPrice = (valor) => {
  if (!valor) return '0'
  return parseFloat(valor).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

onMounted(async () => {
  if (laravelCan('admin.index')) {
    await ventasStore.loadEstadisticas()
    stats.value = ventasStore.estadisticas ?? {}
  } else {
    await pedidosStore.loadMisPedidos()
  }
})
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
