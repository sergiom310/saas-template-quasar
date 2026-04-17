<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="people" />
      <q-toolbar-title> Clientes </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="filteredClientes"
        :columns="columns"
        row-key="cod_cli"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingC"
      >
        <template v-slot:top>
          <div class="row items-center q-pl-sm q-pr-sm q-py-sm">
            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; width:100%;">
              <div style="min-width:220px; flex: 0 0 auto;">
                <q-select
                  outlined
                  v-model="statusFilter"
                  :options="statusFilterOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Estado de Pago"
                  clearable
                />
              </div>
              <div style="min-width:160px; flex: 0 0 auto;">
                <q-btn
                  style="display:flex; align-items:center; justify-content:flex-start; padding:8px 12px;"
                  color="green"
                  unelevated
                  @click="printFiltered"
                >
                  <q-icon name="print" class="q-mr-sm" />
                  <span style="font-weight:600">Imprimir registros</span>
                </q-btn>
              </div>
              <div style="min-width:160px; flex: 0 0 auto;">
                <q-btn
                  style="display:flex; align-items:center; justify-content:flex-start; padding:8px 12px;"
                  color="primary"
                  unelevated
                  @click="exportExcel"
                >
                  <q-icon name="file_download" class="q-mr-sm" />
                  <span style="font-weight:600">Exportar Excel</span>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="cod_cli" :props="props">
              {{ props.row.cod_cli }}
            </q-td>
            <q-td key="nom_cli" :props="props">
              {{ props.row.nom_cli }}
            </q-td>
            <q-td key="telefono" :props="props">
              {{ props.row.telefono }}
            </q-td>
            <q-td key="tipo_vehiculo" :props="props">
              {{ props.row.tipo_vehiculo?.nombre }}
            </q-td>
            <q-td key="placa" :props="props">
              {{ props.row.placa }}
            </q-td>
              <q-td key="valor_mensual" :props="props">
                {{ formatMoneda(props.row.valor_mensual) }}
              </q-td>
            <q-td key="ultimo_pago" :props="props">
              {{ getUltimoPagoFecha(props.row.cod_cli) }}
            </q-td>
            <q-td key="ultimo_monto" :props="props">
              {{ getUltimoPagoMonto(props.row.cod_cli) }}
            </q-td>
            <q-td key="ultimo_forma" :props="props">
              {{ getUltimoPagoMetodo(props.row.cod_cli) }}
            </q-td>
            <q-td key="ultimo_hasta" :props="props">
              {{ getUltimoPagoHasta(props.row.cod_cli) }}
            </q-td>
            <q-td key="dias_resto" :props="props">
              {{ getDiasParaVencer(props.row.cod_cli) }}
            </q-td>
            <q-td key="estado_pago" :props="props">
              <q-badge
                :color="getEstadoPago(props.row.cod_cli) === 'Al día' ? 'green' : 'red'"
                outline
                class="text-weight-bold"
              >
                {{ getEstadoPago(props.row.cod_cli) }}
              </q-badge>
            </q-td>

           <q-td key="desde" :props="props">
            <div class="hidden">{{ formatFecha(props.row.desde) }}</div>
          </q-td>
          <q-td key="hasta" :props="props">
            <div class="hidden">{{ formatFecha(props.row.hasta) }}</div>
          </q-td>

            <q-td key="estado" :props="props">
              <q-badge
                outline
                class="text-weight-bold"
                :color="props.row.estado === 'A' ? 'green' : 'red'"
              >
                {{ props.row.estado === 'A' ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
            <q-td key="action" :props="props">
              <q-btn
                icon="unpublished"
                color="primary"
                @click.stop="desActivar(props.row)"

                title="Des/Activar"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="$"
                color="warning"
                @click.stop="showPagosModal(props.row)"

                title="Pagos"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="visibility"
                color="green"
                @click.stop="showViewModal(props.row)"

                flat
                dense
              ></q-btn>
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="showEditModal(props.row)"

                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.cod_cli)"

                flat
                dense
              ></q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>

    <div
      class="absolute-bottom text-center q-mb-lg no-pointer-events"

    >
      <q-btn
        @click.stop="openDialog"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 680px; max-width: 780px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-px-md q-col-gutter-sm">
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.nom_cli"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Nombre"
                maxlength="80"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.telefono"
                label="Teléfono"
                maxlength="40"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model.number="editedItem.valor_mensual"
                label="Valor mensual"
                type="number"
                step="0.01"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.tipo_vehi"
                :options="tipoVehiculosOptions"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                label="Vehículo"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.placa"
                label="Placa"
                maxlength="20"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.desde"
                type="date"
                label="Desde"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model="editedItem.hasta"
                type="date"
                label="Hasta"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.estado"
                :options="estadoOptions"
                emit-value
                label="Estado"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.imp"
                :options="impOptions"
                emit-value
                label="Impreso"
              />
            </div>
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
          <q-btn flat label="Guardar" color="primary" @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="details" class="q-pa-md q-gutter-sm">
      <q-card style="width: 760px; max-width: 800px">
        <q-toolbar>
          <q-avatar>
            <q-icon name="people" size="md" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">Detalle</span> Cliente</q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Código:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.cod_cli }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Nombre:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.nom_cli }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Teléfono:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.telefono }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Tipo Vehículo:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.tipo_vehiculo?.nombre }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Placa:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.placa }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Valor mensual:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatMoneda(showItem.valor_mensual) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Desde:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatFecha(showItem.desde) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Hasta:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ formatFecha(showItem.hasta) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Estado:</div></div>
            <div class="col-md-8">
              <q-badge :color="showItem.estado === 'A' ? 'green' : 'red'">
                {{ showItem.estado === 'A' ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Impreso:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.imp === 'S' ? 'Sí' : 'No' }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Cerrar"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo de Pagos -->
    <q-dialog v-model="pagosDialog" persistent>
      <q-card style="width: 800px; max-width: 900px">
        <q-toolbar>
          <q-icon name="payment" size="md" />
          <q-toolbar-title class="q-ml-md"
            >Pagos de {{ clientePagos?.nom_cli }}</q-toolbar-title
          >
          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <!-- Formulario para agregar nuevo pago -->
          <q-expansion-item
            icon="add"
            label="Agregar Nuevo Pago"
            header-class="bg-blue-2"
            expand-separator
          >
            <q-form ref="formPagoRef" @submit.prevent="savePago" class="q-gutter-md">
              <div class="row q-col-gutter-sm">
                <div class="col-md-4 col-xs-12">
                  <q-input
                    outlined
                    v-model="newPago.fecha_pag"
                    type="date"
                    label="Fecha del Pago"
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-input
                    outlined
                    v-model="newPago.val_pag"
                    type="number"
                    label="Monto"
                    :rules="[(val) => !!val || 'Campo requerido']"
                  />
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-select
                    outlined
                    v-model="newPago.cod_forp"
                    :options="metodosPagoOptions"
                    option-value="id"
                    option-label="detalle"
                    emit-value
                    map-options
                    label="Forma de Pago"
                    :rules="[(val) => val !== null || 'Campo requerido']"
                  />
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input
                    outlined
                    v-model="newPago.desde"
                    type="date"
                    label="Pago Válido Desde"
                  />
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input
                    outlined
                    v-model="newPago.hasta"
                    type="date"
                    label="Pago Válido Hasta"
                  />
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input
                    outlined
                    v-model="newPago.periodo"
                    type="month"
                    label="Periodo (AAAA-MM)"
                  />
                </div>
              </div>
              <div class="row justify-end q-gutter-sm">
                <q-btn flat label="Cancelar" color="primary" @click="resetPagoForm" />
                <q-btn flat label="Guardar Pago" color="primary" type="submit" />
              </div>
            </q-form>
          </q-expansion-item>

          <!-- Lista de pagos -->
          <div class="q-mt-lg">
            <div class="text-h6 q-mb-md">Listado de Pagos</div>
            <q-table
              :rows="pagosList"
              :columns="columnsPagos"
              row-key="id_pago"
              flat
              bordered
              :loading="loadingPagos"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="fecha_pag" :props="props">
                    {{ formatFecha(props.row.fecha_pag) }}
                  </q-td>
                  <q-td key="val_pag" :props="props" >
                    ${{ new Intl.NumberFormat('es-CO').format(props.row.val_pag) }}
                  </q-td>
                  <q-td key="forma_pago" :props="props">
                    {{ props.row.metodo_pago?.detalle || 'N/A' }}
                  </q-td>
                  <q-td key="desde" :props="props">
                    {{ formatFecha(props.row.desde) }}
                  </q-td>
                  <q-td key="hasta" :props="props">
                    {{ formatFecha(props.row.hasta) }}
                  </q-td>
                  <q-td key="acciones" :props="props">
                    <q-btn
                      icon="print"
                      color="primary"
                      @click="imprimirTicketPago(props.row)"
                      flat
                      dense
                      size="sm"
                      title="Imprimir Ticket"
                    />
                    <q-btn
                      icon="delete"
                      color="red"
                      @click="deletePago(props.row.id_pago)"
                      flat
                      dense
                      size="sm"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <div v-if="pagosList.length === 0" class="text-center q-pa-md text-grey">
              No hay pagos registrados
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useClientesStore } from 'src/stores/clientes'
import { useTipoVehiculosStore } from 'src/stores/tipoVehiculos'
import { usePagosStore } from 'src/stores/pagos'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'

const clientesStore = useClientesStore()
const tipoVehiculosStore = useTipoVehiculosStore()
const pagosStore = usePagosStore()
const $q = useQuasar()

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const clientes = computed(() => clientesStore.clientes)
const tipoVehiculosOptions = computed(() => tipoVehiculosStore.tipoVehiculos)

const details = ref(false)
const dialog = ref(false)
const pagosDialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const loadingPagos = ref(false)
const formRef = ref(null)
const formPagoRef = ref(null)

const currentCuadreId = ref(null)

const pagosList = ref([])
const clientePagos = ref(null)

// Función para obtener el último pago de un cliente (no muta el store)
const getUltimoPago = (cod_cli) => {
  const pagos = Array.isArray(pagosStore.pagos) ? pagosStore.pagos.filter(p => String(p.cod_cli) === String(cod_cli)) : []
  if (!pagos.length) return null

  const parseDate = (s) => {
    if (!s) return NaN
    return Date.parse(String(s).replace(' ', 'T'))
  }

  // Priorizar 'hasta' (rango pagado). Si no existe, usar 'fecha_pag'.
  return pagos.reduce((max, p) => {
    const pKey = p?.hasta ? parseDate(p.hasta) : (p?.fecha_pag ? parseDate(p.fecha_pag) : NaN)
    const mKey = max?.hasta ? parseDate(max.hasta) : (max?.fecha_pag ? parseDate(max.fecha_pag) : NaN)
    const pTime = isNaN(pKey) ? 0 : pKey
    const mTime = isNaN(mKey) ? 0 : mKey
    return pTime > mTime ? p : max
  }, pagos[0])
}

const getUltimoPagoFecha = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  return p ? formatFecha(p.fecha_pag) : ''
}

const getEstadoPago = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  if (!p) return 'Pendiente'
  try {
    const hoy = new Date()
    // Preferir la validación por rango 'hasta' cuando exista
    if (p.hasta) {
      const hasta = new Date(String(p.hasta).replace(' ', 'T'))
      // Normalizar a fin del día para comparar inclusive
      const hastaFin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999)
      const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
      return hoyInicio.getTime() <= hastaFin.getTime() ? 'Al día' : 'Pendiente'
    }

    // Si no hay 'hasta', usar fecha de pago como fallback (mismo día)
    const fechaPago = p.fecha_pag ? new Date(String(p.fecha_pag).replace(' ', 'T')) : null
    if (fechaPago) {
      const fp = new Date(fechaPago.getFullYear(), fechaPago.getMonth(), fechaPago.getDate())
      const hd = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
      if (fp.getTime() === hd.getTime()) return 'Al día'
    }

    return 'Pendiente'
  } catch {
    return 'Pendiente'
  }
}

const getUltimoPagoMonto = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  if (!p || p.val_pag == null) return ''
  try {
    return `$${Number(p.val_pag).toLocaleString('es-CO')}`
  } catch {
    return String(p.val_pag)
  }
}

const getUltimoPagoMetodo = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  return p?.metodo_pago?.detalle || p?.cod_forp || ''
}

const getUltimoPagoHasta = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  return p && p.hasta ? formatFecha(p.hasta) : ''
}

const getDiasParaVencer = (cod_cli) => {
  const p = getUltimoPago(cod_cli)
  if (!p) return ''
  try {
    if (!p.hasta) return ''
    const hasta = new Date(String(p.hasta).replace(' ', 'T'))
    const hastaFin = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate(), 23, 59, 59, 999)
    const hoy = new Date()
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const msDia = 1000 * 60 * 60 * 24
    const diff = Math.ceil((hastaFin - hoyInicio) / msDia)
    if (diff > 0) return diff + ' días'
    if (diff === 0) return 'Hoy'
    return 'Vencido ' + Math.abs(diff) + 'd'
  } catch {
    return ''
  }
}

// Ordenar pagos por fecha (más reciente primero)
const sortPagosByFecha = (arr) => {
  if (!Array.isArray(arr)) return []
  return arr.slice().sort((a, b) => {
    const da = a?.fecha_pag ? Date.parse(String(a.fecha_pag).replace(' ', 'T')) : 0
    const db = b?.fecha_pag ? Date.parse(String(b.fecha_pag).replace(' ', 'T')) : 0
    return db - da
  })
}

const formatFecha = (fecha) => {
  if (!fecha) return ''

  const [anio, mes, dia] = fecha.split('T')[0].split('-')
  return `${dia}-${mes}-${anio}`
}

const formatMoneda = (valor) => {
  if (valor == null || valor === '') return ''
  try {
    return `$${Number(valor).toLocaleString('es-CO')}`
  } catch {
    return String(valor)
  }
}

const estadoOptions = [
  { label: 'Activo', value: 'A' },
  { label: 'Inactivo', value: 'I' }
]
const impOptions = [
  { label: 'Sí', value: 'S' },
  { label: 'No', value: 'N' }
]

const metodosPagoOptions = ref([])

const defaultItem = {
  cod_cli: '',
  nom_cli: '',
  telefono: '',
  tipo_vehi: null,
  placa: '',
  valor_mensual: null,
  desde: '',
  hasta: '',
  estado: 'A',
  imp: 'N',
}

const defaultPago = {
  cod_cli: null,
  fecha_pag: new Date().toISOString().split('T')[0],
  val_pag: null,
  cod_forp: null,
  desde: null,
  hasta: null,
  periodo: new Date().toISOString().slice(0,7), // formato YYYY-MM
  horap: null,
}

const showItem = ref({ ...defaultItem })
const editedItem = ref({ ...defaultItem })
const newPago = ref({ ...defaultPago })

const filter = ref('')
const statusFilter = ref('')

const statusFilterOptions = [
  { label: 'Al día', value: 'Al día' },
  { label: 'Pendiente', value: 'Pendiente' },
]

const filteredClientes = computed(() => {
  const list = clientes.value || []
  if (!statusFilter.value) return list
  try {
    return list.filter(c => getEstadoPago(c.cod_cli) === statusFilter.value)
  } catch {
    return list
  }
})
const pagination = ref({
  sortBy: 'cod_cli',
  descending: false,
  page: 1,
  rowsPerPage: 20,
})

const columns = ref([
  { name: 'cod_cli', align: 'left', label: 'Código', field: 'cod_cli', sortable: true },
  { name: 'nom_cli', align: 'left', label: 'Nombre', field: 'nom_cli', sortable: true },
  { name: 'telefono', align: 'left', label: 'Teléfono', field: 'telefono', sortable: true },
  { name: 'tipo_vehiculo', align: 'left', label: 'Tipo Vehículo', field: row => row.tipo_vehiculo?.nombre, sortable: true },
  { name: 'placa', align: 'left', label: 'Placa', field: 'placa', sortable: true },
  { name: 'valor_mensual', align: 'right', label: 'Valor mensual', field: row => formatMoneda(row.valor_mensual), sortable: true },
  { name: 'ultimo_pago', align: 'left', label: 'Último Pago', field: row => getUltimoPagoFecha(row.cod_cli) },
  { name: 'ultimo_monto', align: 'right', label: 'Monto Últ. Pago', field: row => getUltimoPagoMonto(row.cod_cli) },
  { name: 'ultimo_forma', align: 'left', label: 'Forma Pago', field: row => getUltimoPagoMetodo(row.cod_cli) },
  { name: 'ultimo_hasta', align: 'left', label: 'Válido Hasta', field: row => getUltimoPagoHasta(row.cod_cli) },
  { name: 'dias_resto', align: 'right', label: 'Faltan Dias', field: row => getDiasParaVencer(row.cod_cli) },
  { name: 'estado_pago', align: 'left', label: 'Estado Pago', field: row => getEstadoPago(row.cod_cli) },
  { name: 'desde', align: 'left', label: 'Desde', field: 'desde', sortable: true, classes: 'hidden', headerClasses: 'hidden' },
  { name: 'hasta', align: 'left', label: 'Hasta', field: 'hasta', sortable: true, classes: 'hidden', headerClasses: 'hidden' },
  { name: 'estado', align: 'left', label: 'Estado', field: 'estado', sortable: true },
  { name: 'action', align: 'center', label: 'Acciones' },
])

const columnsPagos = [
  { name: 'fecha_pag', align: 'left', label: 'Fecha Pago', field: 'fecha_pag' },
  { name: 'val_pag', align: 'left', label: 'Monto', field: 'val_pag' },
  { name: 'forma_pago', align: 'left', label: 'Forma de Pago', field: row => row.metodo_pago?.detalle },
  { name: 'desde', align: 'left', label: 'Desde', field: 'desde' },
  { name: 'hasta', align: 'left', label: 'Hasta', field: 'hasta' },
  { name: 'acciones', align: 'center', label: 'Acciones' },
]

// methods
const desActivar = (item) => {
  const status = item.estado === 'A' ? 'Desactivar' : 'Activar'
  let intStatus = item.estado === 'A' ? 'I' : 'A'
  $q.dialog({
    title: 'Confirmar',
    message: 'Desea ' + status + ' registro?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    let cliente = {
      cod_cli: item.cod_cli,
      estado: intStatus,
    }
    clientesStore.activateCliente(cliente)
  })
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editCreate.value = false
  }, 200)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  if (editCreate.value) {
    clientesStore.updateCliente(editedItem.value)
  } else {
    clientesStore.addCliente(editedItem.value)
  }
  close()
}

const openDialog = () => {
  // Inicializar fechas por defecto al crear un nuevo cliente:
  // 'desde' = hoy, 'hasta' = un mes después (formato YYYY-MM-DD)
  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const desde = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
  const hasta = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-${pad(nextMonth.getDate())}`

  editedItem.value = { ...defaultItem, desde, hasta }
  editCreate.value = false
  dialog.value = true
}

const showViewModal = (item) => {
  showItem.value = { ...item }
  setTimeout(() => {
    details.value = true
  }, 200)
}

const showEditModal = (item) => {
  editedItem.value = {
    cod_cli: item.cod_cli,
    nom_cli: item.nom_cli,
    telefono: item.telefono,
    tipo_vehi: item.tipo_vehi,
    placa: item.placa,
    valor_mensual: item.valor_mensual || null,
    desde: item.desde,
    hasta: item.hasta,
    estado: item.estado,
    imp: item.imp,
  }

  editCreate.value = true
  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Realmente desea eliminar este cliente?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    clientesStore.deleteCliente(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar Cliente' : 'Nuevo Cliente'))

// Métodos de pagos
const showPagosModal = async (cliente) => {
  clientePagos.value = cliente
  loadingPagos.value = true
  pagosList.value = [] // Limpiar pagos antes de cargar
  pagosDialog.value = true
  // Prellenar monto con el valor_mensual del cliente si existe
  const defaultPeriod = new Date().toISOString().slice(0,7)
  newPago.value = { ...defaultPago, cod_cli: cliente.cod_cli, val_pag: cliente.valor_mensual != null ? Number(cliente.valor_mensual) : defaultPago.val_pag, periodo: defaultPeriod }

  // Cargar cuadre abierto (si existe) para asociar el pago
  try {
    const resCuadres = await api.get('/api/cuadres')
    const myEmail = currentUser.value?.email || ''
    const abierto = (resCuadres.data || []).find(c => c.estado === 'ABIERTO' && c.usuario === myEmail)
    currentCuadreId.value = abierto ? abierto.id_cuadre : null
  } catch {
    currentCuadreId.value = null
  }

  try {
    await pagosStore.loadPagosPorCliente(cliente.cod_cli)
    pagosList.value = sortPagosByFecha(pagosStore.pagos)
  } catch (error) {
    console.error('Error al cargar pagos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los pagos',
    })
  } finally {
    loadingPagos.value = false
  }
}

const resetPagoForm = () => {
  newPago.value = { ...defaultPago, cod_cli: clientePagos.value?.cod_cli }
  if (formPagoRef.value) {
    formPagoRef.value.resetValidation()
  }
}

const savePago = async () => {
  const isValid = await formPagoRef.value.validate()
  if (!isValid) return

  try {
    // Requerir cuadre abierto para el usuario actual
    if (!currentCuadreId.value) {
      $q.notify({ type: 'negative', message: 'No hay cuadre de caja abierto para su usuario. Abra un cuadre antes de registrar pagos.' })
      return
    }
    // Preparar datos
    const pagoData = {
      ...newPago.value,
      val_pag: newPago.value.val_pag ? parseFloat(newPago.value.val_pag) : null,
      cod_cli: clientePagos.value?.cod_cli,
        desde: newPago.value.desde || null,
        hasta: newPago.value.hasta || null,
        periodo: newPago.value.periodo || (newPago.value.fecha_pag ? String(newPago.value.fecha_pag).slice(0,7) : null),
        id_cuadre: currentCuadreId.value || null,
    }

    await pagosStore.addPago(pagoData)
    // Recargar solo los pagos del cliente actual
    await pagosStore.loadPagosPorCliente(clientePagos.value?.cod_cli)
    pagosList.value = sortPagosByFecha(pagosStore.pagos)
    resetPagoForm()
    $q.notify({
      type: 'positive',
      message: 'Pago guardado exitosamente',
    })
  } catch (error) {
    console.error('Error al guardar pago:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el pago: ' + (error.response?.data?.error || error.message),
    })
  }
}

const deletePago = (idPago) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Desea eliminar este pago?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loadingPagos.value = true
    try {
      await pagosStore.deletePago(idPago)
      // Recargar pagos del cliente actualmente seleccionado
      await pagosStore.loadPagosPorCliente(clientePagos.value?.cod_cli)
      pagosList.value = sortPagosByFecha(pagosStore.pagos)
      $q.notify({ type: 'positive', message: 'Pago eliminado exitosamente' })
    } catch (err) {
      console.error('Error eliminando pago:', err)
      $q.notify({ type: 'negative', message: 'No se pudo eliminar el pago' })
    } finally {
      loadingPagos.value = false
    }
  })
}

// Imprimir ticket POS para un pago
const imprimirTicketPago = async (pago) => {
  if (!pago) return
  const cliente = clientePagos.value || {}

  // Intentar obtener datos de la empresa si no están cacheados
  let empresa = window.empresaData || null
  if (!empresa) {
    try {
      const res = await api.get('/api/empresa')
      empresa = res.data || null
      if (empresa) window.empresaData = empresa
    } catch {
      empresa = null
    }
  }

  const escapeHtml = (str) => (str == null ? '' : String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))

  const formatToDDMMYYYY = (s) => {
    if (!s) return ''
    const datePart = String(s).split('T')[0]
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-')
      return `${d}-${m}-${y}`
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) {
      return datePart
    }
    const dt = new Date(s)
    if (!isNaN(dt)) {
      const dd = String(dt.getDate()).padStart(2, '0')
      const mm = String(dt.getMonth() + 1).padStart(2, '0')
      const yy = dt.getFullYear()
      return `${dd}-${mm}-${yy}`
    }
    return datePart
  }

  const fechaPago = formatToDDMMYYYY(pago.fecha_pag)
  const horaPago = pago.fecha_pag && String(pago.fecha_pag).includes('T') ? String(pago.fecha_pag).split('T')[1].slice(0,5) : ''
  const monto = pago.val_pag != null ? Number(pago.val_pag) : 0
  const metodo = pago.metodo_pago?.detalle || pago.cod_forp || ''

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Ticket Pago</title>
      <style>
        body { font-family: monospace, Arial, sans-serif; font-size: 13px; margin: 8px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="center bold">${escapeHtml(empresa?.nombre || '')}</div>
      <div class="center">${escapeHtml(empresa?.direccion || '')}</div>
      <div class="center">${escapeHtml(empresa?.telefono || '')}</div>
      <div class="center">NIT: ${escapeHtml(empresa?.nit || '')}</div>
      <div class="line"></div>
      <div class="row"><span class="bold">Cliente:</span> ${escapeHtml(cliente.nom_cli || '')}</div>
      <div class="row"><span class="bold">Placa:</span> ${escapeHtml(cliente.placa || '')}</div>
      <div class="row"><span class="bold">Fecha:</span> ${escapeHtml(fechaPago)} ${escapeHtml(horaPago)}</div>
      <div class="row"><span class="bold">Monto:</span> $${new Intl.NumberFormat('es-CO').format(monto)}</div>
      <div class="row"><span class="bold">Forma Pago:</span> ${escapeHtml(metodo)}</div>
      <div class="row"><span class="bold">Válido Desde:</span> ${escapeHtml(formatToDDMMYYYY(pago.desde) || '')}</div>
      <div class="row"><span class="bold">Válido Hasta:</span> ${escapeHtml(formatToDDMMYYYY(pago.hasta) || '')}</div>
      <div class="line"></div>
      <div class="center">Gracias por su pago</div>
    </body>
  </html>`

  const printWindow = window.open('', '_blank', 'width=350,height=500')
  if (!printWindow) {
    $q.notify({ type: 'negative', message: 'No se pudo abrir la ventana de impresión.' })
    return
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    try {
      printWindow.print()
    } catch (e) {
      console.error('Error al imprimir', e)
    }
    printWindow.close()
  }, 500)
}

// Imprimir listado filtrado de clientes (nombre, placa, teléfono)
const printFiltered = () => {
  const escapeHtml = (str) => (str == null ? '' : String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  const empresa = window.empresaData || null

  // Preferir la lista filtrada por estado; si está vacía, usar la lista completa
  let list = Array.isArray(filteredClientes.value) && filteredClientes.value.length ? filteredClientes.value : (clientes.value || [])

  // Si no hay filtro de estado y existe un filtro de texto global, aplicarlo
  if (!statusFilter.value && filter.value) {
    const q = String(filter.value).toLowerCase()
    list = (clientes.value || []).filter(c => {
      const text = `${c.nom_cli || ''} ${c.placa || ''} ${c.telefono || ''} ${c.tipo_vehiculo?.nombre || ''}`.toLowerCase()
      return text.includes(q)
    })
  }

  const statusText = statusFilter.value || (filter.value ? `Busqueda: ${filter.value}` : 'Todos')

  let rowsHtml = ''
  for (const c of list) {
    const nombre = escapeHtml(c.nom_cli || '')
    const tipo = escapeHtml(c.tipo_vehiculo?.nombre || '')
    const placa = escapeHtml(c.placa || '')
    const telefono = escapeHtml(c.telefono || '')
    rowsHtml += `<tr><td style="padding:6px;border:1px solid #ddd">${nombre}</td><td style="padding:6px;border:1px solid #ddd">${tipo}</td><td style="padding:6px;border:1px solid #ddd">${placa}</td><td style="padding:6px;border:1px solid #ddd">${telefono}</td></tr>`
  }

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Listado Clientes</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 12px; }
        .center { text-align: center }
        table { border-collapse: collapse; width: 100%; margin-top: 12px }
        th { text-align: left; padding: 8px; border:1px solid #ddd; background:#f5f5f5 }
      </style>
    </head>
    <body>
      <div class="center">
        <h3>${escapeHtml(empresa?.nombre || 'Listado de Clientes')}</h3>
        <div>Filtro: ${escapeHtml(statusText)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Vehículo</th>
            <th>Placa</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4" style="padding:8px">No hay registros</td></tr>'}
        </tbody>
      </table>
    </body>
  </html>`

  const w = window.open('', '_blank', 'width=800,height=600')
  if (!w) {
    $q.notify({ type: 'negative', message: 'No se pudo abrir la ventana de impresión.' })
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => {
    try { w.print() } catch (e) { console.error('Error al imprimir listado', e) }
    w.close()
  }, 500)
}

const exportExcel = () => {
  const empresa = window.empresaData || null

  let list = Array.isArray(filteredClientes.value) && filteredClientes.value.length ? filteredClientes.value : (clientes.value || [])
  if (!statusFilter.value && filter.value) {
    const q = String(filter.value).toLowerCase()
    list = (clientes.value || []).filter(c => {
      const text = `${c.nom_cli || ''} ${c.placa || ''} ${c.telefono || ''} ${c.tipo_vehiculo?.nombre || ''}`.toLowerCase()
      return text.includes(q)
    })
  }

  const headers = ['Código','Nombre','Teléfono','Tipo Vehículo','Placa','Valor mensual','Último Pago','Monto Últ. Pago','Forma Pago','Válido Hasta','Días resto','Estado Pago','Desde','Hasta','Estado']

  // Construir HTML table compatible con Excel (.xls)
  let table = '<table><thead><tr>' + headers.map(h => `<th style="background:#f0f0f0;padding:6px">${h}</th>`).join('') + '</tr></thead><tbody>'
  for (const c of list) {
    const rowCells = [
      c.cod_cli,
      c.nom_cli || '',
      c.telefono || '',
      c.tipo_vehiculo?.nombre || '',
      c.placa || '',
      formatMoneda(c.valor_mensual) || '',
      getUltimoPagoFecha(c.cod_cli) || '',
      getUltimoPagoMonto(c.cod_cli) || '',
      getUltimoPagoMetodo(c.cod_cli) || '',
      getUltimoPagoHasta(c.cod_cli) || '',
      getDiasParaVencer(c.cod_cli) || '',
      getEstadoPago(c.cod_cli) || '',
      formatFecha(c.desde) || '',
      formatFecha(c.hasta) || '',
      c.estado || '',
    ]
    table += '<tr>' + rowCells.map(cell => `<td style="padding:6px">${cell}</td>`).join('') + '</tr>'
  }
  table += '</tbody></table>'

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>${table}</body></html>`
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${empresa?.nombre ? empresa.nombre.replace(/\s+/g,'_') + '_' : ''}clientes.xls`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Cargar métodos de pago
const loadMetodosPago = async () => {
  try {
    const response = await api.get('/api/metodos-pago')
    metodosPagoOptions.value = response.data
  } catch (error) {
    console.error('Error al cargar métodos de pago:', error)
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    await Promise.all([
      clientesStore.loadClientes(),
      tipoVehiculosStore.loadTipoVehiculos(),
      loadMetodosPago(),
      // Cargar todos los pagos para poder calcular último pago en la lista
      pagosStore.loadPagos(),
    ])
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loadingC.value = false
  }
})

// Forzar placa a mayúsculas y sin espacios cuando se edita o crea
watch(
  () => editedItem.value.placa,
  (val) => {
    if (typeof val === 'string') {
      const nueva = val.replace(/\s+/g, '').toUpperCase()
      if (nueva !== val) editedItem.value.placa = nueva
    }
  }
)

// Refrescar datos principales cuando se cierre el modal de pagos
watch(pagosDialog, async (val) => {
  if (val === false) {
    loadingC.value = true
    try {
      await Promise.all([
        clientesStore.loadClientes(),
        pagosStore.loadPagos(),
        tipoVehiculosStore.loadTipoVehiculos(),
        loadMetodosPago(),
      ])
    } catch (e) {
      console.error('Error refrescando datos tras cerrar modal de pagos', e)
    } finally {
      loadingC.value = false
    }
  }
})
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  /* Ampliado para evitar scroll horizontal en pantallas anchas */
  max-width: 2000px;
  margin: 0 auto;
  padding-left: 8px;
  padding-right: 8px;
}
.text-subtitle1 {
  font-weight: 600;
}
.q-gutter-sm > * {
  margin-top: 0;
  margin-left: 0;
}
</style>
