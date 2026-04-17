<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="rule" />
      <q-toolbar-title> Reglas de Tarifas </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="filteredTarifaReglas"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingC"
      >
        <template v-slot:top-right>
          <div class="row items-center">
            <div class="q-mr-md">
              <q-item-label class="text-caption text-grey-7">Filtrar por tipo de vehículo</q-item-label>
              <q-select
                dense
                outlined
                v-model="selectedTipoVehiculo"
                :options="tipoVehiculosOptionsWithAll"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                placeholder="Seleccione un tipo"
                style="width: 200px;"
              />
            </div>
            <div class="q-mr-md">
              <q-item-label class="text-caption text-grey-7">Filtrar por contexto</q-item-label>
              <q-select
                dense
                outlined
                v-model="selectedContexto"
                :options="contextoOptionsWithAll"
                emit-value
                placeholder="Seleccione un contexto"
                style="width: 200px;"
              />
            </div>
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
              <template v-slot:append>
                <q-icon name="search"></q-icon>
              </template>
            </q-input>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              {{ props.row.id }}
            </q-td>
            <q-td key="tarifa" :props="props">
              {{ props.row.tarifa?.nombre }}
            </q-td>
            <q-td key="tipo_vehiculo" :props="props">
              {{ props.row.tipo_vehiculo?.nombre }}
            </q-td>
            <q-td key="rango" :props="props">
              {{ props.row.minutos_desde }} - {{ props.row.minutos_hasta }} min
            </q-td>
            <q-td key="contexto" :props="props">
              <q-badge :color="props.row.contexto === 'TOTAL' ? 'blue' : 'orange'">
                {{ props.row.contexto }}
              </q-badge>
            </q-td>
            <q-td key="tipo_calculo" :props="props">
              <q-badge :color="getColorTipoCalculo(props.row.tipo_calculo)">
                {{ props.row.tipo_calculo }}
              </q-badge>
            </q-td>
            <q-td key="valor" :props="props"> ${{ formatNumber(props.row.valor) }} </q-td>
            <q-td key="prioridad" :props="props">
              {{ props.row.prioridad }}
            </q-td>
            <q-td key="action" :props="props">
              <q-btn
                icon="visibility"
                color="green"
                @click.stop="showViewModal(props.row)"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="showEditModal(props.row)"
                v-if="laravelCan('admin.update')"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id)"
                v-if="laravelCan('admin.destroy')"
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
      v-if="laravelCan('admin.create')"
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
              <q-select
                outlined
                v-model="editedItem.tarifa_id"
                :options="tarifasOptions"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Tarifa"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.tipo_vehiculo_id"
                :options="tipoVehiculosOptions"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Tipo Vehículo"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model.number="editedItem.minutos_desde"
                type="number"
                :rules="[(val) => val >= 0 || 'Debe ser mayor o igual a 0']"
                label="Minutos Desde"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model.number="editedItem.minutos_hasta"
                type="number"
                :rules="[
                  (val) => val >= 0 || 'Debe ser mayor o igual a 0',
                  (val) =>
                    val >= editedItem.minutos_desde || 'Debe ser mayor o igual a Minutos Desde',
                ]"
                label="Minutos Hasta"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.contexto"
                :options="contextoOptions"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Contexto"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select
                outlined
                v-model="editedItem.tipo_calculo"
                :options="tipoCalculoOptions"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Tipo de Cálculo"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model.number="editedItem.valor"
                type="number"
                :rules="[(val) => val >= 0 || 'Debe ser mayor o igual a 0']"
                label="Valor"
                prefix="$"
              />
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                outlined
                v-model.number="editedItem.prioridad"
                type="number"
                :rules="[(val) => val >= 1 || 'Debe ser mayor o igual a 1']"
                label="Prioridad"
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
            <q-icon name="rule" size="md" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">Detalle</span> Regla de Tarifa</q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup></q-btn>
        </q-toolbar>

        <q-card-section>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">ID:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.id }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Tarifa:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.tarifa?.nombre }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Tipo Vehículo:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.tipo_vehiculo?.nombre }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Rango Minutos:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">
                {{ showItem.minutos_desde }} - {{ showItem.minutos_hasta }} min
              </div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Contexto:</div></div>
            <div class="col-md-8">
              <q-badge :color="showItem.contexto === 'TOTAL' ? 'blue' : 'orange'">
                {{ showItem.contexto }}
              </q-badge>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Tipo Cálculo:</div></div>
            <div class="col-md-8">
              <q-badge :color="getColorTipoCalculo(showItem.tipo_calculo)">
                {{ showItem.tipo_calculo }}
              </q-badge>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Valor:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">${{ formatNumber(showItem.valor) }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Prioridad:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.prioridad }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="Cerrar"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { laravelCan } from 'src/functions/function-general'
import { useTarifaReglaStore } from 'src/stores/tarifaRegla'
import { useTarifasStore } from 'src/stores/tarifas'
import { useTipoVehiculosStore } from 'src/stores/tipoVehiculos'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const tarifaReglaStore = useTarifaReglaStore()
const tarifasStore = useTarifasStore()
const tipoVehiculosStore = useTipoVehiculosStore()
const $q = useQuasar()
const router = useRouter()

const tarifaReglas = computed(() => tarifaReglaStore.tarifaReglas)
const tarifasOptions = computed(() => tarifasStore.tarifas)
const tipoVehiculosOptions = computed(() => tipoVehiculosStore.tipoVehiculos)
const tipoVehiculosOptionsWithAll = computed(() => [{ id: null, nombre: 'Todos' }, ...tipoVehiculosOptions.value])
const contextoOptions = ['TOTAL', 'FRACCION']
const tipoCalculoOptions = ['FIJO', 'POR_HORA', 'COBRO_LIBRE']
const contextoOptionsWithAll = computed(() => ['Todos', ...contextoOptions])

const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const formRef = ref(null)

const defaultItem = {
  id: '',
  tarifa_id: null,
  tipo_vehiculo_id: null,
  minutos_desde: 0,
  minutos_hasta: 0,
  contexto: '',
  tipo_calculo: '',
  valor: 0,
  prioridad: 1,
}

const showItem = ref({ ...defaultItem })
const editedItem = ref({ ...defaultItem })

const filter = ref('')
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const columns = ref([
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  {
    name: 'tarifa',
    align: 'left',
    label: 'Tarifa',
    field: (row) => row.tarifa?.nombre,
    sortable: true,
  },
  {
    name: 'tipo_vehiculo',
    align: 'left',
    label: 'Tipo Vehículo',
    field: (row) => row.tipo_vehiculo?.nombre,
    sortable: true,
  },
  { name: 'rango', align: 'left', label: 'Rango (min)', sortable: false },
  { name: 'contexto', align: 'left', label: 'Contexto', field: 'contexto', sortable: true },
  {
    name: 'tipo_calculo',
    align: 'center',
    label: 'Tipo Cálculo',
    field: 'tipo_calculo',
    sortable: true,
  },
  { name: 'valor', align: 'right', label: 'Valor', field: 'valor', sortable: true },
  { name: 'prioridad', align: 'center', label: 'Prioridad', field: 'prioridad', sortable: true },
  { name: 'action', align: 'center', label: 'Acciones' },
])

// Helper functions
const formatNumber = (value) => {
  return new Intl.NumberFormat('es-CO').format(value)
}

const getColorTipoCalculo = (tipo) => {
  switch (tipo) {
    case 'FIJO':
      return 'green'
    case 'POR_HORA':
      return 'blue'
    case 'COBRO_LIBRE':
      return 'purple'
    default:
      return 'grey'
  }
}

// methods
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
    tarifaReglaStore.updateTarifaRegla(editedItem.value)
  } else {
    tarifaReglaStore.addTarifaRegla(editedItem.value)
  }
  close()
}

const openDialog = () => {
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
    id: item.id,
    tarifa_id: item.tarifa_id,
    tipo_vehiculo_id: item.tipo_vehiculo_id,
    minutos_desde: item.minutos_desde,
    minutos_hasta: item.minutos_hasta,
    contexto: item.contexto,
    tipo_calculo: item.tipo_calculo,
    valor: item.valor,
    prioridad: item.prioridad,
  }

  editCreate.value = true
  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Realmente desea eliminar esta regla?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    tarifaReglaStore.deleteTarifaRegla(item)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar Regla' : 'Nueva Regla'))

const selectedTipoVehiculo = ref(null)
const selectedContexto = ref('Todos')

const filteredTarifaReglas = computed(() => {
  return tarifaReglas.value.filter((regla) => {
    const matchesTipoVehiculo = !selectedTipoVehiculo.value || regla.tipo_vehiculo_id === selectedTipoVehiculo.value
    const matchesContexto = selectedContexto.value === 'Todos' || regla.contexto === selectedContexto.value
    return matchesTipoVehiculo && matchesContexto
  })
})

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
  } else {
    try {
      await Promise.all([
        tarifaReglaStore.loadTarifaReglas(),
        tarifasStore.loadTarifas(),
        tipoVehiculosStore.loadTipoVehiculos(),
      ])
      console.log('Tarifas cargadas:', tarifasStore.tarifas)
      console.log('Tipos de vehículos cargados:', tipoVehiculosStore.tipoVehiculos)
      loadingC.value = false
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
.my-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.text-subtitle1 {
  font-weight: 600;
}
.q-gutter-sm > * {
  margin-top: 0;
  margin-left: 0;
}
</style>
