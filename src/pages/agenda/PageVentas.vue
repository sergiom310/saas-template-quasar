<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="point_of_sale" />
      <q-toolbar-title> Ventas de Productos </q-toolbar-title>
    </q-toolbar>

    <!-- Filtros -->
    <q-card class="q-ma-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-3 col-xs-12">
            <q-select
              outlined
              v-model="filtros.estado"
              :options="estadoOptions"
              label="Estado"
              clearable
              emit-value
              map-options
              @update:model-value="aplicarFiltros"
            />
          </div>
          <div class="col-md-3 col-xs-12">
            <q-input
              outlined
              v-model="filtros.fecha_desde"
              label="Fecha Desde"
              type="date"
              @update:model-value="aplicarFiltros"
            />
          </div>
          <div class="col-md-3 col-xs-12">
            <q-input
              outlined
              v-model="filtros.fecha_hasta"
              label="Fecha Hasta"
              type="date"
              @update:model-value="aplicarFiltros"
            />
          </div>
          <div class="col-md-3 col-xs-12 flex items-center">
            <q-btn
              color="primary"
              label="Limpiar  Filtros"
              icon="clear"
              @click="limpiarFiltros"
              outline
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Estadísticas -->
    <q-card v-if="estadisticas" class="q-ma-md">
      <q-card-section>
        <div class="row q-col-gutter-md text-center">
          <div class="col-md-3 col-xs-6">
            <div class="text-h6">{{ estadisticas.total_ventas || 0 }}</div>
            <div class="text-caption">Total Ventas</div>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="text-h6">{{ estadisticas.ventas_pagadas || 0 }}</div>
            <div class="text-caption">Pagadas</div>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="text-h6">{{ formatPrice(estadisticas.monto_total || 0) }}</div>
            <div class="text-caption">Monto Total</div>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="text-h6 text-orange">{{ formatPrice(estadisticas.monto_pendiente || 0) }}</div>
            <div class="text-caption">Por Cobrar</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de ventas -->
    <div class="q-ma-md">
      <q-table
        :rows="ventas"
        :columns="columns"
        row-key="id"
        :filter="filter"
        v-model:pagination="pagination"
        :loading="loading"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              #{{ props.row.id }}
            </q-td>
            <q-td key="fecha_venta" :props="props">
              {{ formatDate(props.row.fecha_venta) }}
            </q-td>
            <q-td key="cliente" :props="props">
              {{ props.row.cliente?.nombre || 'Sin cliente' }}
            </q-td>
            <q-td key="usuario" :props="props">
              {{ props.row.usuario?.name || 'N/A' }}
            </q-td>
            <q-td key="subtotal" :props="props">
              {{ formatPrice(props.row.subtotal) }}
            </q-td>
            <q-td key="descuento" :props="props">
              {{ formatPrice(props.row.descuento) }}
            </q-td>
            <q-td key="total" :props="props">
              <strong>{{ formatPrice(props.row.total) }}</strong>
            </q-td>
            <q-td key="estado" :props="props">
              <q-badge
                :color="getEstadoColor(props.row.estado)"
                :label="props.row.estado"
              />
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                icon="visibility"
                color="primary"
                @click="verDetalle(props.row)"
                flat
                dense
                round
              >
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>
              <q-btn
                icon="print"
                color="info"
                @click="imprimirRecibo(props.row)"
                flat
                dense
                round
              >
                <q-tooltip>Imprimir Recibo</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estado === 'pendiente'"
                icon="payments"
                color="positive"
                @click="abrirDialogoPago(props.row)"
                flat
                dense
                round
              >
                <q-tooltip>Agregar Pago</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.estado === 'pendiente'"
                icon="cancel"
                color="red"
                @click="cancelarVenta(props.row.id)"
                flat
                dense
                round
              >
                <q-tooltip>Cancelar Venta</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <!-- Diálogo de detalle de venta -->
    <q-dialog v-model="dialogDetalle" persistent>
      <q-card style="width: 900px; max-width: 90vw">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="receipt" class="q-mr-sm" />
            Detalle de Venta #{{ ventaDetalle?.id }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section v-if="ventaDetalle">
          <!-- Información general -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-md-6 col-xs-12">
              <q-list bordered>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Fecha de Venta</q-item-label>
                    <q-item-label>{{ formatDateTime(ventaDetalle.fecha_venta) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Usuario</q-item-label>
                    <q-item-label>{{ ventaDetalle.usuario?.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="ventaDetalle.cliente">
                  <q-item-section>
                    <q-item-label overline>Cliente</q-item-label>
                    <q-item-label>{{ ventaDetalle.cliente.nombre }}</q-item-label>
                    <q-item-label caption v-if="ventaDetalle.cliente.telefono">
                      Tel: {{ ventaDetalle.cliente.telefono }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Estado</q-item-label>
                    <q-item-label>
                      <q-badge :color="getEstadoColor(ventaDetalle.estado)" :label="ventaDetalle.estado" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-list bordered>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Subtotal</q-item-label>
                    <q-item-label>{{ formatPrice(ventaDetalle.subtotal) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Descuento</q-item-label>
                    <q-item-label>{{ formatPrice(ventaDetalle.descuento) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label overline>Total</q-item-label>
                    <q-item-label class="text-h6 text-primary">
                      {{ formatPrice(ventaDetalle.total) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Productos vendidos -->
          <div class="text-h6 q-mb-md">Productos Vendidos</div>
          <q-table
            :rows="ventaDetalle.detalles || []"
            :columns="detalleColumns"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="producto_nombre" :props="props">
                  {{ props.row.producto_nombre }}
                </q-td>
                <q-td key="cantidad" :props="props">
                  {{ props.row.cantidad }}
                </q-td>
                <q-td key="precio_unitario" :props="props">
                  {{ formatPrice(props.row.precio_unitario) }}
                </q-td>
                <q-td key="subtotal" :props="props">
                  {{ formatPrice(props.row.subtotal) }}
                </q-td>
                <q-td key="descuento" :props="props">
                  {{ formatPrice(props.row.descuento) }}
                </q-td>
                <q-td key="total" :props="props">
                  <strong>{{ formatPrice(props.row.total) }}</strong>
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <q-separator class="q-my-md" />

          <!-- Pagos registrados -->
          <div class="text-h6 q-mb-md">Pagos Registrados</div>
          <q-table
            :rows="ventaDetalle.pagos || []"
            :columns="pagosColumns"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="fecha_pago" :props="props">
                  {{ formatDateTime(props.row.fecha_pago) }}
                </q-td>
                <q-td key="metodo_pago" :props="props">
                  {{ props.row.metodo_pago?.detalle || 'N/A' }}
                </q-td>
                <q-td key="monto" :props="props">
                  <strong>{{ formatPrice(props.row.monto) }}</strong>
                </q-td>
                <q-td key="referencia" :props="props">
                  {{ props.row.referencia || '-' }}
                </q-td>
              </q-tr>
            </template>
          </q-table>

          <!-- Observaciones -->
          <div v-if="ventaDetalle.observaciones" class="q-mt-md">
            <div class="text-subtitle2">Observaciones:</div>
            <div class="q-pa-sm bg-grey-2 rounded-borders">
              {{ ventaDetalle.observaciones }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Agregar Pago -->
    <q-dialog v-model="dialogPago" persistent>
      <q-card style="width: 500px; max-width: 90vw">
        <q-toolbar class="bg-positive text-white">
          <q-toolbar-title>
            <q-icon name="payments" class="q-mr-sm" />
            Agregar Pago a Venta #{{ ventaPendiente?.id }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section v-if="ventaPendiente">
          <!-- Información de la venta -->
          <q-list bordered class="q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label overline>Total de la Venta</q-item-label>
                <q-item-label class="text-h6">{{ formatPrice(ventaPendiente.total) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Total Pagado</q-item-label>
                <q-item-label class="text-positive">
                  {{ formatPrice(calcularTotalPagado(ventaPendiente)) }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Saldo Pendiente</q-item-label>
                <q-item-label class="text-h6 text-negative">
                  {{ formatPrice(ventaPendiente.total - calcularTotalPagado(ventaPendiente)) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <!-- Formulario de pago -->
          <div class="text-subtitle1 q-mb-md">Nuevo Pago</div>
          
          <q-select
            outlined
            v-model="formPago.metodo_pago_id"
            :options="metodosPago"
            option-value="id"
            option-label="detalle"
            emit-value
            map-options
            label="Método de Pago *"
            :rules="[(val) => !!val || 'El método de pago es requerido']"
            class="q-mb-md"
          />

          <q-input
            outlined
            v-model.number="formPago.monto"
            label="Monto del Pago *"
            type="number"
            step="0.01"
            min="0"
            :max="ventaPendiente.total - calcularTotalPagado(ventaPendiente)"
            prefix="$"
            :rules="[
              (val) => !!val || 'El monto es requerido',
              (val) => val > 0 || 'El monto debe ser mayor a 0',
              (val) => val <= (ventaPendiente.total - calcularTotalPagado(ventaPendiente)) || 'El monto excede el saldo pendiente'
            ]"
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                label="Saldo"
                color="primary"
                size="sm"
                @click="formPago.monto = ventaPendiente.total - calcularTotalPagado(ventaPendiente)"
              >
                <q-tooltip>Pagar el saldo completo</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <q-input
            outlined
            v-model="formPago.referencia"
            label="Referencia o número de transacción (opcional)"
            class="q-mb-md"
          />

          <q-input
            outlined
            v-model="formPago.observaciones"
            label="Observaciones (opcional)"
            type="textarea"
            rows="2"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn
            label="Registrar Pago"
            color="positive"
            @click="registrarPago"
            :disable="!formPago.metodo_pago_id || !formPago.monto"
            :loading="processingPago"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVentasStore } from 'src/stores/ventas'
import { useQuasar } from 'quasar'
import { formatDate as fmtDate } from 'src/functions/function-general'

const $q = useQuasar()
const ventasStore = useVentasStore()

const ventas = computed(() => ventasStore.ventas)
const estadisticas = computed(() => ventasStore.estadisticas)
const metodosPago = computed(() => ventasStore.metodosPago)

const dialogDetalle = ref(false)
const ventaDetalle = ref(null)
const dialogPago = ref(false)
const ventaPendiente = ref(null)
const processingPago = ref(false)
const loading = ref(false)
const filter = ref('')

const formPago = ref({
  metodo_pago_id: null,
  monto: null,
  referencia: '',
  observaciones: ''
})

const filtros = ref({
  estado: null,
  fecha_desde: null,
  fecha_hasta: null
})

const estadoOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Pagada', value: 'pagada' },
  { label: 'Cancelada', value: 'cancelada' }
]

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'fecha_venta', label: 'Fecha', field: 'fecha_venta', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: row => row.cliente?.nombre || 'Sin cliente', align: 'left' },
  { name: 'usuario', label: 'Usuario', field: row => row.usuario?.name, align: 'left' },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right', sortable: true },
  { name: 'descuento', label: 'Descuento', field: 'descuento', align: 'right', sortable: true },
  { name: 'total', label: 'Total', field: 'total', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const detalleColumns = [
  { name: 'producto_nombre', label: 'Producto', field: 'producto_nombre', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
  { name: 'precio_unitario', label: 'Precio Unit.', field: 'precio_unitario', align: 'right' },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' },
  { name: 'descuento', label: 'Descuento', field: 'descuento', align: 'right' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' }
]

const pagosColumns = [
  { name: 'fecha_pago', label: 'Fecha', field: 'fecha_pago', align: 'left' },
  { name: 'metodo_pago', label: 'Método de Pago', field: row => row.metodo_pago?.detalle, align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'referencia', label: 'Referencia', field: 'referencia', align: 'left' }
]

const formatPrice = (value) => {
  if (value === null || value === undefined) return '$0,00'
  const numValue = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(value)
  return `$${numValue}`
}

const formatDate = (date) => {
  if (!date) return '-'
  return fmtDate(date, 'DD-MMM-YYYY')
}

const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  return fmtDate(datetime, 'DD-MMM-YYYY HH:mm')
}

const getEstadoColor = (estado) => {
  const colors = {
    'pendiente': 'warning',
    'pagada': 'positive',
    'cancelada': 'negative'
  }
  return colors[estado] || 'grey'
}

const aplicarFiltros = async () => {
  loading.value = true
  await ventasStore.loadVentas(filtros.value)
  await ventasStore.loadEstadisticas(filtros.value)
  loading.value = false
}

const limpiarFiltros = () => {
  filtros.value = {
    estado: null,
    fecha_desde: null,
    fecha_hasta: null
  }
  aplicarFiltros()
}

const verDetalle = async (venta) => {
  const detalle = await ventasStore.loadVentaDetalle(venta.id)
  if (detalle) {
    ventaDetalle.value = detalle
    dialogDetalle.value = true
  }
}

const cancelarVenta = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de cancelar esta venta?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await ventasStore.cancelarVenta(id)
  })
}

const abrirDialogoPago = async (venta) => {
  // Cargar detalle completo de la venta si no tiene pagos cargados
  if (!venta.pagos) {
    const detalle = await ventasStore.loadVentaDetalle(venta.id)
    ventaPendiente.value = detalle
  } else {
    ventaPendiente.value = venta
  }
  
  // Calcular saldo pendiente
  const totalPagado = calcularTotalPagado(ventaPendiente.value)
  const saldoPendiente = ventaPendiente.value.total - totalPagado
  
  formPago.value = {
    metodo_pago_id: null,
    monto: saldoPendiente,
    referencia: '',
    observaciones: ''
  }
  
  dialogPago.value = true
}

const calcularTotalPagado = (venta) => {
  if (!venta || !venta.pagos) return 0
  return venta.pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0)
}

// Función para imprimir recibo de venta
const imprimirRecibo = async (venta) => {
  // Cargar detalle completo si es necesario
  let ventaCompleta = venta
  if (!venta.detalles || !venta.pagos) {
    ventaCompleta = await ventasStore.loadVentaDetalle(venta.id)
    if (!ventaCompleta) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar los detalles de la venta'
      })
      return
    }
  }

  // Calcular totales
  const totalPagado = calcularTotalPagado(ventaCompleta)
  const saldoPendiente = ventaCompleta.total - totalPagado

  // Obtener configuración de empresa (similar a PageRegistroEntrada.vue)
  let config = window.configuracionEmpresa || { 
    imp_logo: 'S', 
    imp_nombre: 'S', 
    imp_nit: 'S', 
    imp_tel: 'S', 
    imp_dir: 'S', 
    imp_horario: 'S' 
  }

  // Si no hay datos, intentar obtenerlos del backend
  if (!window.empresaData) {
    try {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/api/empresa', false)
      xhr.send(null)
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        window.empresaData = data
      }
    } catch (e) {
       /* ignorar */
       console.log(e);
      }
  }

  if (!window.configuracionEmpresa) {
    try {
      const xhr2 = new XMLHttpRequest()
      xhr2.open('GET', '/api/configuracion', false)
      xhr2.send(null)
      if (xhr2.status === 200) {
        config = JSON.parse(xhr2.responseText)
        window.configuracionEmpresa = config
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

const registrarPago = async () => {
  if (!formPago.value.metodo_pago_id || !formPago.value.monto) {
    $q.notify({
      type: 'negative',
      message: 'Complete los campos requeridos'
    })
    return
  }

  processingPago.value = true

  try {
    const success = await ventasStore.agregarPago(ventaPendiente.value.id, formPago.value)
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Pago registrado exitosamente',
        icon: 'check_circle'
      })
      
      dialogPago.value = false
      formPago.value = {
        metodo_pago_id: null,
        monto: null,
        referencia: '',
        observaciones: ''
      }
      
      // Recargar ventas
      await aplicarFiltros()
      
      // Imprimir recibo automáticamente
      const ventaActualizada = await ventasStore.loadVentaDetalle(ventaPendiente.value.id)
      if (ventaActualizada) {
        setTimeout(() => {
          imprimirRecibo(ventaActualizada)
        }, 500)
      }
    }
  } catch (error) {
    console.error('Error al registrar pago:', error)
  } finally {
    processingPago.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await ventasStore.loadVentas()
  await ventasStore.loadEstadisticas()
  await ventasStore.loadMetodosPago()
  loading.value = false
})
</script>

<style scoped>
.my-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
