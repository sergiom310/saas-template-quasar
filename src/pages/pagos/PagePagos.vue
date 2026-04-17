<template>
  <q-page padding>
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="payments" />
      <q-toolbar-title> Gestión de Pagos </q-toolbar-title>
      <q-space />
      <q-btn-dropdown
        color="white"
        text-color="blue-grey-4"
        label="Generar Reporte"
        icon="description"
        dense
      >
        <q-list>
          <q-item clickable v-close-popup @click="generarReportePDF">
            <q-item-section avatar>
              <q-icon name="picture_as_pdf" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Exportar a PDF</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="generarReporteExcel">
            <q-item-section avatar>
              <q-icon name="table_chart" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Exportar a Excel</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>

    <div class="q-pa-md">
      <!-- Filtros -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-md-3 col-xs-12">
          <q-select
            outlined
            v-model="filtros.id_cliente"
            :options="clientesOptions"
            option-value="id_cliente"
            option-label="nombre"
            emit-value
            map-options
            label="Cliente"
            clearable
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-select>
        </div>

        <div class="col-md-3 col-xs-12">
          <q-select
            outlined
            v-model="filtros.id_profesional"
            :options="profesionalesOptions"
            option-value="id_profesional"
            option-label="nombre"
            emit-value
            map-options
            label="Profesional"
            clearable
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:prepend>
              <q-icon name="medical_services" />
            </template>
          </q-select>
        </div>

        <div class="col-md-3 col-xs-12">
          <q-input
            outlined
            v-model="filtros.fecha"
            label="Fecha de Cita"
            clearable
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date 
                    v-model="filtros.fecha" 
                    mask="YYYY-MM-DD"
                    default-year-month="2026/02"
                    today-btn
                    title="Seleccionar Fecha"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-md-3 col-xs-12">
          <q-select
            outlined
            v-model="filtros.metodo_pago"
            :options="metodosPagoOptions"
            option-value="id"
            option-label="detalle"
            emit-value
            map-options
            label="Método de Pago"
            clearable
            @update:model-value="aplicarFiltros"
          >
            <template v-slot:prepend>
              <q-icon name="payment" />
            </template>
          </q-select>
        </div>
      </div>

      <q-table
        :rows="pagos"
        :columns="columns"
        row-key="id_pago"
        :pagination="pagination"
        :loading="loading"
        flat
        bordered
      >
        <template v-slot:body-cell-monto="props">
          <q-td :props="props">
            <q-chip color="positive" text-color="white" dense>
              ${{ Number(props.row.monto).toLocaleString('es-CO') }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-fecha_pago="props">
          <q-td :props="props">
            {{ formatearFecha(props.row.fecha_pago) }}
          </q-td>
        </template>

        <template v-slot:body-cell-fecha_cita="props">
          <q-td :props="props">
            <div>{{ formatearFechaSola(props.row.fecha_cita) }}</div>
            <div class="text-caption text-grey-7">{{ props.row.franja_horaria }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="getEstadoColor(props.row.estado)">
              {{ getEstadoLabel(props.row.estado) }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar pago</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar pago</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Diálogo para editar pago -->
    <q-dialog v-model="dialogEditar" persistent>
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section class="row items-center bg-primary text-white">
          <q-icon name="edit" size="sm" class="q-mr-sm" />
          <span class="text-h6">Editar Pago</span>
        </q-card-section>

        <q-form @submit="guardarCambios" ref="formRef">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Cliente</div>
                <div class="text-body1 text-weight-medium">
                  {{ pagoSeleccionado?.cliente }}
                </div>
              </div>

              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Procedimiento</div>
                <div class="text-body1 text-grey-8">
                  {{ pagoSeleccionado?.procedimiento }}
                </div>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model.number="editForm.monto"
                  type="number"
                  step="0.01"
                  min="0"
                  label="Monto *"
                  prefix="$"
                  :rules="[
                    (val) => val !== null && val !== '' || 'Campo requerido',
                    (val) => val > 0 || 'El monto debe ser mayor a 0'
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_money" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-select
                  outlined
                  v-model="editForm.metodo_pago"
                  :options="metodosPagoOptions"
                  option-value="id"
                  option-label="detalle"
                  emit-value
                  map-options
                  label="Método de pago *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:prepend>
                    <q-icon name="credit_card" />
                  </template>
                </q-select>
              </div>

              <div class="col-12">
                <q-input
                  outlined
                  v-model="editForm.fecha_pago"
                  label="Fecha de pago *"
                  :rules="[(val) => !!val || 'Campo requerido']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date 
                          v-model="editForm.fecha_pago" 
                          mask="YYYY-MM-DD"
                          default-year-month="2026/02"
                          today-btn
                          title="Fecha de Pago"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="cerrarDialogo" />
            <q-btn flat label="Guardar Cambios" color="positive" type="submit" icon="check" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePagoStore } from 'src/stores/pago'
import { useClientesAgendaStore } from 'src/stores/clientesAgenda'
import { useProfesionalesStore } from 'src/stores/profesionales'
import { date, useQuasar, Loading } from 'quasar'
import { api } from 'boot/axios'

const pagoStore = usePagoStore()
const clientesStore = useClientesAgendaStore()
const profesionalesStore = useProfesionalesStore()
const $q = useQuasar()

const dialogEditar = ref(false)
const pagoSeleccionado = ref(null)
const formRef = ref(null)
const loading = ref(false)

const filtros = ref({
  id_cliente: null,
  id_profesional: null,
  fecha: null,
  metodo_pago: null
})

const editForm = ref({
  monto: null,
  metodo_pago: null,
  fecha_pago: null
})

const pagination = ref({
  page: 1,
  rowsPerPage: 10
})

const columns = [
  { name: 'id_pago', label: 'ID', field: 'id_pago', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'profesional', label: 'Profesional', field: 'profesional', align: 'left', sortable: true },
  { name: 'procedimiento', label: 'Procedimiento', field: 'procedimiento', align: 'left', sortable: true },
  { name: 'fecha_cita', label: 'Fecha Cita', field: 'fecha_cita', align: 'left', sortable: true },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'center', sortable: true },
  { name: 'metodo_pago_detalle', label: 'Método de Pago', field: 'metodo_pago_detalle', align: 'left', sortable: true },
  { name: 'fecha_pago', label: 'Fecha de Pago', field: 'fecha_pago', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const pagos = computed(() => pagoStore.pagos)
const metodosPagoOptions = computed(() => pagoStore.metodosPago)
const clientesOptions = computed(() => clientesStore.clientes)
const profesionalesOptions = computed(() => profesionalesStore.profesionales)

const aplicarFiltros = async () => {
  loading.value = true
  await pagoStore.loadPagos(filtros.value)
  loading.value = false
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return date.formatDate(fecha, 'DD/MM/YYYY HH:mm')
}

const formatearFechaSola = (fecha) => {
  if (!fecha) return 'N/A'
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

const formatearMoneda = (monto) => {
  if (!monto && monto !== 0) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(monto)
}

const getEstadoColor = (estado) => {
  const colors = {
    pagado: 'positive',
    pendiente: 'warning',
    anulado: 'negative'
  }
  return colors[estado] || 'grey'
}

const getEstadoLabel = (estado) => {
  const labels = {
    pagado: 'Pagado',
    pendiente: 'Pendiente',
    anulado: 'Anulado'
  }
  return labels[estado] || estado
}

const abrirDialogoEditar = (pago) => {
  pagoSeleccionado.value = pago
  editForm.value = {
    monto: pago.monto,
    metodo_pago: pago.metodo_pago,
    fecha_pago: date.formatDate(pago.fecha_pago, 'YYYY-MM-DD')
  }
  dialogEditar.value = true
}

const cerrarDialogo = () => {
  dialogEditar.value = false
  pagoSeleccionado.value = null
  editForm.value = {
    monto: null,
    metodo_pago: null,
    fecha_pago: null
  }
}

const guardarCambios = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  try {
    await pagoStore.updatePago(pagoSeleccionado.value.id_pago, editForm.value)
    cerrarDialogo()
  } catch (error) {
    console.error('Error al actualizar pago:', error)
  }
}

const confirmarEliminar = (pago) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Está seguro de eliminar el pago de ${formatearMoneda(pago.monto)}? La cita será actualizada a estado "reservado".`,
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Eliminar',
      flat: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(async () => {
    try {
      await pagoStore.deletePago(pago.id_pago)
    } catch (error) {
      console.error('Error al eliminar pago:', error)
    }
  })
}

const generarReportePDF = async () => {
  Loading.show({ message: 'Generando reporte PDF...' })
  try {
    const params = {}
    if (filtros.value.id_cliente) params.id_cliente = filtros.value.id_cliente
    if (filtros.value.id_profesional) params.id_profesional = filtros.value.id_profesional
    if (filtros.value.fecha) params.fecha = filtros.value.fecha
    if (filtros.value.metodo_pago) params.metodo_pago = filtros.value.metodo_pago

    const response = await api.get('/api/pagos/reporte/pdf', {
      params,
      responseType: 'blob'
    })

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-pagos-${new Date().getTime()}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte PDF'
    })
  } finally {
    Loading.hide()
  }
}

const generarReporteExcel = async () => {
  Loading.show({ message: 'Generando reporte Excel...' })
  try {
    const params = {}
    if (filtros.value.id_cliente) params.id_cliente = filtros.value.id_cliente
    if (filtros.value.id_profesional) params.id_profesional = filtros.value.id_profesional
    if (filtros.value.fecha) params.fecha = filtros.value.fecha
    if (filtros.value.metodo_pago) params.metodo_pago = filtros.value.metodo_pago

    const response = await api.get('/api/pagos/reporte/excel', {
      params,
      responseType: 'blob'
    })

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte-pagos-${new Date().getTime()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar Excel:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte Excel'
    })
  } finally {
    Loading.hide()
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    pagoStore.loadPagos(),
    pagoStore.loadMetodosPago(),
    clientesStore.loadClientes(),
    profesionalesStore.loadProfesionales()
  ])
  loading.value = false
})
</script>

<style scoped>
/* Asegurar que el header del datepicker siempre sea visible */
:deep(.q-date__header) {
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.q-date__header-title) {
  opacity: 1 !important;
  visibility: visible !important;
}

:deep(.q-date__view) {
  opacity: 1 !important;
}
</style>
