<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Mi Historial de Pagos</div>
          <q-btn 
            color="primary" 
            icon="refresh" 
            label="Actualizar"
            @click="cargarMisPagos"
            :loading="loading"
          />
        </div>

        <!-- Resumen de estadísticas -->
        <div class="row q-gutter-md q-mb-md">
          <q-card flat bordered class="col-auto">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-7">Total Pagos Realizados</div>
              <div class="text-h6">{{ pagosCount }}</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-auto">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-7">Monto Total Pagado</div>
              <div class="text-h6 text-positive">${{ formatoPrecio(totalMonto) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tabla de pagos -->
        <q-table
          :rows="pagos"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          :filter="busqueda"
          flat
          bordered
        >
          <template v-slot:top-right>
            <q-input
              v-model="busqueda"
              dense
              outlined
              placeholder="Buscar..."
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-modulo="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-sm">
                <q-badge color="primary">
                  {{ props.row.nombre_modulo }}
                </q-badge>
              </div>
              <div class="text-caption text-grey-7">
                {{ props.row.modulo_descripcion }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-monto="props">
            <q-td :props="props">
              <span class="text-bold text-positive">
                ${{ formatoPrecio(props.row.monto) }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-metodo_pago="props">
            <q-td :props="props">
              <q-badge 
                :color="props.row.metodo_pago === 'mensual' ? 'blue' : 'purple'"
                :label="props.row.metodo_pago === 'mensual' ? 'Mensual' : 'Anual'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-fecha_pago="props">
            <q-td :props="props">
              {{ formatearFechaHora(props.row.fecha_pago) }}
            </q-td>
          </template>

          <template v-slot:body-cell-periodo="props">
            <q-td :props="props">
              <div class="text-caption">
                <div><strong>Inicio:</strong> {{ formatearFecha(props.row.fecha_inicio_periodo) }}</div>
                <div><strong>Fin:</strong> {{ formatearFecha(props.row.fecha_fin_periodo) }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-referencia="props">
            <q-td :props="props">
              <span v-if="props.row.referencia_pago">
                {{ props.row.referencia_pago }}
              </span>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-notas="props">
            <q-td :props="props">
              <div v-if="props.row.notas" class="ellipsis" style="max-width: 200px">
                {{ props.row.notas }}
                <q-tooltip>{{ props.row.notas }}</q-tooltip>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify, Loading } from 'quasar'
import { date } from 'quasar'
import { api } from 'boot/axios'

const loading = ref(false)
const busqueda = ref('')
const pagos = ref([])

const pagination = ref({
  sortBy: 'fecha_pago',
  descending: true,
  page: 1,
  rowsPerPage: 15
})

const columns = [
  { 
    name: 'id', 
    label: 'ID', 
    field: 'id', 
    align: 'left',
    sortable: true 
  },
  { 
    name: 'modulo', 
    label: 'Módulo', 
    field: 'nombre_modulo', 
    align: 'left',
    sortable: true 
  },
  { 
    name: 'metodo_pago', 
    label: 'Método', 
    field: 'metodo_pago', 
    align: 'center',
    sortable: true 
  },
  { 
    name: 'monto', 
    label: 'Monto', 
    field: 'monto', 
    align: 'right',
    sortable: true 
  },
  { 
    name: 'fecha_pago', 
    label: 'Fecha Pago', 
    field: 'fecha_pago', 
    align: 'left',
    sortable: true 
  },
  { 
    name: 'periodo', 
    label: 'Período de Servicio', 
    field: 'fecha_inicio_periodo', 
    align: 'left' 
  },
  { 
    name: 'referencia', 
    label: 'Referencia', 
    field: 'referencia_pago', 
    align: 'left' 
  },
  { 
    name: 'notas', 
    label: 'Notas', 
    field: 'notas', 
    align: 'left' 
  }
]

const pagosCount = computed(() => pagos.value.length)

const totalMonto = computed(() => {
  return pagos.value.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0)
})

const formatoPrecio = (precio) => {
  if (!precio) return '0.00'
  return parseFloat(precio).toLocaleString('es-CO', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  try {
    const fechaStr = fecha.split('T')[0].split(' ')[0]
    const [year, month, day] = fechaStr.split('-')
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return fecha
  }
}

const formatearFechaHora = (fecha) => {
  if (!fecha) return '-'
  try {
    const fechaObj = new Date(fecha)
    return date.formatDate(fechaObj, 'DD/MM/YYYY HH:mm')
  } catch (error) {
    console.error('Error formateando fecha y hora:', error)
    return fecha
  }
}

const cargarMisPagos = async () => {
  loading.value = true
  Loading.show()
  try {
    const response = await api.get('/api/mis-pagos')
    pagos.value = response.data
  } catch (e) {
    console.error('Error al cargar mis pagos:', e)
    const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Error al cargar sus pagos'
    Notify.create({ 
      type: 'negative', 
      message: errorMsg
    })
  } finally {
    loading.value = false
    Loading.hide()
  }
}

onMounted(async () => {
  await cargarMisPagos()
})
</script>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
