<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">Historial de Pagos</div>
          <div class="row q-gutter-sm">
            <!-- Filtro por tenant -->
            <q-select
              v-model="filtroTenant"
              :options="tenantsOptions"
              option-value="id"
              option-label="label"
              outlined
              dense
              clearable
              emit-value
              map-options
              label="Filtrar por Tenant"
              style="min-width: 250px"
              @update:model-value="aplicarFiltro"
            >
              <template v-slot:prepend>
                <q-icon name="filter_alt" />
              </template>
            </q-select>
            
            <q-btn 
              icon="refresh" 
              label="Actualizar"
              @click="cargarPagos"
              :loading="loading"
            />
          </div>
        </div>

        <!-- Resumen de estadísticas -->
        <div class="row q-gutter-md q-mb-md">
          <q-card flat bordered class="col-auto">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-7">Total Pagos</div>
              <div class="text-h6">{{ pagosCount }}</div>
            </q-card-section>
          </q-card>
          
          <q-card flat bordered class="col-auto">
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-grey-7">Monto Total</div>
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

          <template v-slot:body-cell-tenant_info="props">
            <q-td :props="props">
              <div class="text-bold">{{ props.row.tenant_name }}</div>
              <div class="text-caption text-grey">{{ props.row.name_company }}</div>
              <div class="text-caption">{{ props.row.owner_email }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-monto="props">
            <q-td :props="props">
              <span class="text-bold text-positive">
                ${{ formatoPrecio(props.row.monto) }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-tipo_periodo="props">
            <q-td :props="props">
              <q-badge
                v-if="props.row.tipo_periodo"
                :color="props.row.tipo_periodo === 'anual' ? 'deep-purple' : 'blue'"
                :label="props.row.tipo_periodo === 'anual' ? 'Anual' : 'Mensual'"
              />
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-metodo_pago="props">
            <q-td :props="props">
              <span v-if="props.row.metodo_pago">{{ props.row.metodo_pago }}</span>
              <span v-else class="text-grey-5">-</span>
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
                <div>Inicio: {{ formatearFecha(props.row.fecha_inicio_periodo) }}</div>
                <div>Fin: {{ formatearFecha(props.row.fecha_fin_periodo) }}</div>
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
              <div v-if="props.row.notas" class="ellipsis" style="max-width: 150px">
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
import { usePagosTenantsStore } from 'src/stores/pagosTenants'
import { Notify, Loading } from 'quasar'
import { date } from 'quasar'

const pagosStore = usePagosTenantsStore()

const loading = ref(false)
const filtroTenant = ref(null)
const busqueda = ref('')

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
    name: 'tenant_info', 
    label: 'Tenant / Cliente', 
    field: 'tenant_name', 
    align: 'left',
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
    name: 'tipo_periodo', 
    label: 'Periodo', 
    field: 'tipo_periodo', 
    align: 'center',
    sortable: true 
  },
  { 
    name: 'metodo_pago', 
    label: 'Método Pago', 
    field: 'metodo_pago', 
    align: 'center',
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
    label: 'Período', 
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

const pagos = computed(() => pagosStore.pagos)
const pagosCount = computed(() => pagosStore.pagosCount)
const totalMonto = computed(() => pagosStore.totalPagos)

const tenantsOptions = computed(() => {
  return pagosStore.tenantsFiltro.map(tenant => ({
    id: tenant.id,
    label: `${tenant.name} - ${tenant.name_company} (${tenant.owner_email})`
  }))
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

const cargarPagos = async () => {
  loading.value = true
  Loading.show()
  try {
    await pagosStore.fetchPagos(filtroTenant.value)
  } catch (e) {
    console.error('Error al cargar pagos:', e)
    Notify.create({ 
      type: 'negative', 
      message: e.message || 'Error al cargar pagos' 
    })
  } finally {
    loading.value = false
    Loading.hide()
  }
}

const cargarTenants = async () => {
  try {
    await pagosStore.fetchTenantsFiltro()
  } catch (e) {
    console.error('Error al cargar tenants:', e)
  }
}

const aplicarFiltro = async () => {
  await cargarPagos()
}

onMounted(async () => {
  await Promise.all([
    cargarTenants(),
    cargarPagos()
  ])
})
</script>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
