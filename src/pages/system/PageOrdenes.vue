<template>
  <q-page class="q-pa-md">
    <div class="toolbar-header q-pa-sm q-mb-md row items-center justify-between">
      <div class="text-h6">Órdenes de Pedido</div>
      <q-btn icon="refresh" label="Actualizar" color="secondary" dense @click="cargar" :loading="loading" />
    </div>

    <!-- Estadísticas -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-6 col-md-2" v-for="stat in statsCards" :key="stat.label">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm text-center">
            <div class="text-caption text-grey-7">{{ stat.label }}</div>
            <div class="text-h6 text-weight-bold" :class="stat.color">{{ stat.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-gutter-sm q-mb-md">
      <q-select
        v-model="filtroStatus"
        :options="statusOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="Estado"
        outlined
        dense
        clearable
        color="secondary"
        style="min-width: 160px"
        @update:model-value="cargar"
      />
      <q-select
        v-model="filtroPayment"
        :options="paymentOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        label="Pago"
        outlined
        dense
        clearable
        color="secondary"
        style="min-width: 160px"
        @update:model-value="cargar"
      />
    </div>

    <!-- Tabla -->
    <q-table
      :rows="pedidos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:body-cell-usuario="props">
        <q-td :props="props">
          <div class="text-bold">{{ props.row.user?.name }}</div>
          <div class="text-caption text-grey">{{ props.row.user?.email }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="statusColor(props.row.status)" :label="props.row.status" />
        </q-td>
      </template>

      <template v-slot:body-cell-status_payment="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status_payment === 'pagado' ? 'positive' : 'warning'"
            :label="props.row.status_payment === 'pagado' ? 'Pagado' : 'Pendiente'"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-total="props">
        <q-td :props="props">
          <span class="text-bold text-positive">${{ formatPrice(props.row.total_payment) }}</span>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          {{ formatFecha(props.row.created_at) }}
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn size="sm" flat round icon="visibility" color="secondary" @click="verDetalle(props.row)">
            <q-tooltip>Ver detalle</q-tooltip>
          </q-btn>
          <q-btn size="sm" flat round icon="edit" color="secondary" @click="abrirEditar(props.row)">
            <q-tooltip>Cambiar estado</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog: Detalle del pedido -->
    <q-dialog v-model="dialogDetalle">
      <q-card style="width: 600px; max-width: 90vw">
        <q-toolbar class="toolbar-header">
          <q-toolbar-title>Pedido #{{ pedidoSeleccionado?.id }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section v-if="pedidoSeleccionado">
          <div class="q-mb-sm">
            <span class="text-caption text-grey-6">Cliente:</span>
            <span class="q-ml-sm">{{ pedidoSeleccionado.user?.name }} — {{ pedidoSeleccionado.user?.email }}</span>
          </div>
          <div class="q-mb-md" v-if="pedidoSeleccionado.notes">
            <span class="text-caption text-grey-6">Notas:</span>
            <span class="q-ml-sm">{{ pedidoSeleccionado.notes }}</span>
          </div>

          <q-table
            :rows="pedidoSeleccionado.details"
            :columns="columnsDetalle"
            row-key="id"
            flat
            bordered
            hide-bottom
            dense
          />

          <q-separator class="q-my-md" />
          <div class="row justify-between">
            <div>
              <q-badge :color="statusColor(pedidoSeleccionado.status)" :label="pedidoSeleccionado.status" class="q-mr-sm" />
              <q-badge
                :color="pedidoSeleccionado.status_payment === 'pagado' ? 'positive' : 'warning'"
                :label="pedidoSeleccionado.status_payment === 'pagado' ? 'Pagado' : 'Pago pendiente'"
              />
            </div>
            <div class="text-h6 text-positive">${{ formatPrice(pedidoSeleccionado.total_payment) }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog: Cambiar estado + pago -->
    <q-dialog v-model="dialogEditar" persistent>
      <q-card style="width: 440px; max-width: 90vw">
        <q-toolbar class="toolbar-header">
          <q-toolbar-title>Actualizar Pedido #{{ pedidoEditando?.id }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="q-gutter-md" v-if="pedidoEditando">
          <q-select
            v-model="editForm.status"
            :options="statusOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Estado del pedido"
            outlined
            dense
            color="secondary"
          />

          <q-select
            v-model="editForm.status_payment"
            :options="paymentOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Estado de pago"
            outlined
            dense
            color="secondary"
          />

          <q-input
            v-model="editForm.notes"
            label="Notas internas (opcional)"
            outlined
            dense
            type="textarea"
            rows="2"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup :disable="loadingSave" />
          <q-btn color="secondary" label="Guardar" @click="guardarEstado" :loading="loadingSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePedidosStore } from 'src/stores/pedidos'
import { storeToRefs } from 'pinia'
import { Notify } from 'quasar'
import { date } from 'quasar'

const pedidosStore = usePedidosStore()
const { pedidos } = storeToRefs(pedidosStore)

const loading = ref(false)
const loadingSave = ref(false)
const filtroStatus = ref(null)
const filtroPayment = ref(null)

const dialogDetalle = ref(false)
const dialogEditar = ref(false)
const pedidoSeleccionado = ref(null)
const pedidoEditando = ref(null)
const editForm = ref({ status: '', status_payment: '', notes: '' })

const statusOptions = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Procesando', label: 'Procesando' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const paymentOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
]

const columns = [
  { name: 'id', label: '#', field: 'id', align: 'left', sortable: true },
  { name: 'usuario', label: 'Cliente', field: 'user', align: 'left' },
  { name: 'status', label: 'Estado', field: 'status', align: 'center' },
  { name: 'status_payment', label: 'Pago', field: 'status_payment', align: 'center' },
  { name: 'total', label: 'Total', field: 'total_payment', align: 'right', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'created_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

const columnsDetalle = [
  { name: 'product', label: 'Producto', field: (r) => r.product?.name ?? '-', align: 'left' },
  { name: 'quantity', label: 'Cant.', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Precio', field: (r) => `$${formatPrice(r.price)}`, align: 'right' },
  { name: 'total', label: 'Total', field: (r) => `$${formatPrice(r.total)}`, align: 'right' },
]

const statsCards = computed(() => {
  const s = pedidosStore.estadisticas
  if (!s) return []
  return [
    { label: 'Total', value: s.total, color: '' },
    { label: 'Pendientes', value: s.pendientes, color: 'text-warning' },
    { label: 'Procesando', value: s.procesando, color: 'text-secondary' },
    { label: 'Completados', value: s.completados, color: 'text-positive' },
    { label: 'Cancelados', value: s.cancelados, color: 'text-negative' },
    { label: 'Por cobrar', value: `$${formatPrice(s.por_cobrar)}`, color: 'text-orange' },
  ]
})

const statusColor = (status) => {
  const map = { Pendiente: 'warning', Procesando: 'blue', Completado: 'positive', Cancelado: 'negative' }
  return map[status] ?? 'grey'
}

const formatPrice = (val) => {
  if (!val) return '0'
  return parseFloat(val).toLocaleString('es-CO', { minimumFractionDigits: 0 })
}

const formatFecha = (val) => {
  if (!val) return '-'
  return date.formatDate(val, 'DD/MM/YYYY HH:mm')
}

const cargar = async () => {
  loading.value = true
  const filters = {}
  if (filtroStatus.value) { filters.status = filtroStatus.value }
  if (filtroPayment.value) { filters.status_payment = filtroPayment.value }
  await Promise.all([
    pedidosStore.loadPedidos(filters),
    pedidosStore.loadEstadisticas(),
  ])
  loading.value = false
}

const verDetalle = (pedido) => {
  pedidoSeleccionado.value = pedido
  dialogDetalle.value = true
}

const abrirEditar = (pedido) => {
  pedidoEditando.value = pedido
  editForm.value = {
    status: pedido.status,
    status_payment: pedido.status_payment,
    notes: pedido.notes ?? '',
  }
  dialogEditar.value = true
}

const guardarEstado = async () => {
  loadingSave.value = true
  try {
    await pedidosStore.updateStatus(pedidoEditando.value.id, editForm.value)
    Notify.create({ type: 'positive', message: 'Pedido actualizado' })
    dialogEditar.value = false
    await pedidosStore.loadEstadisticas()
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar el pedido' })
  } finally {
    loadingSave.value = false
  }
}

onMounted(cargar)
</script>
