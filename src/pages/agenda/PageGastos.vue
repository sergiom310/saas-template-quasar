<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="money_off" />
      <q-toolbar-title> Gastos </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="gastos"
        :columns="columns"
        row-key="id"
        :filter="filter"
        v-model:pagination="pagination"
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
              {{ props.row.id }}
            </q-td>
            <q-td key="descripcion" :props="props">
              {{ props.row.descripcion }}
            </q-td>
            <q-td key="monto" :props="props">
              ${{ Number(props.row.monto).toFixed(2) }}
            </q-td>
            <q-td key="fecha" :props="props">
              {{ props.row.fecha ? props.row.fecha.split('T')[0] : '' }}
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn
                icon="edit"
                color="primary"
                @click.stop="editItem(props.row)"
                flat
                dense
              ></q-btn>
              <q-btn
                icon="delete"
                color="red"
                @click.stop="deleteItem(props.row.id)"
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
          <div class="row q-px-md">
            <div class="col-md-12 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.descripcion"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="descripcion"
                label="Descripción"
                maxlength="255"
              >
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model.number="editedItem.monto"
                :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
                label="Monto"
                type="number"
                step="0.01"
              >
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.fecha"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Fecha"
                type="date"
              >
              </q-input>
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" @click="close" />
            <q-btn flat label="Guardar" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogDelete" persistent>
      <q-card>
        <q-card-section>
          <span class="q-ml-sm">¿Está seguro de eliminar este registro?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="closeDelete" />
          <q-btn flat label="Eliminar" color="red" @click="deleteItemConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGastosStore } from 'src/stores/gastos'

const gastosStore = useGastosStore()

const gastos = computed(() => gastosStore.gastos)
const dialog = ref(false)
const formRef = ref(null)
const dialogDelete = ref(false)
const filter = ref('')

const pagination = ref({
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const columns = [
  {
    name: 'id',
    required: true,
    label: 'ID',
    align: 'left',
    field: row => row.id,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'descripcion',
    align: 'left',
    label: 'Descripción',
    field: 'descripcion',
    sortable: true
  },
  {
    name: 'monto',
    align: 'right',
    label: 'Monto',
    field: 'monto',
    format: val => `$${Number(val).toFixed(2)}`,
    sortable: true
  },
  {
    name: 'fecha',
    align: 'center',
    label: 'Fecha',
    field: 'fecha',
    format: val => val ? val.split(' ')[0] : '',
    sortable: true
  },
  { name: 'actions', align: 'center', label: 'Acciones', field: '', sortable: false }
]

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultItem = {
  id: 0,
  descripcion: '',
  monto: 0,
  fecha: getTodayDate()
}

const editedIndex = ref(-1)
const editedItem = ref({ ...defaultItem })

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Gasto' : 'Editar Gasto'
})

const editItem = (item) => {
  editedIndex.value = gastos.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

const deleteItem = (id) => {
  editedItem.value.id = id
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  await gastosStore.deleteGasto(editedItem.value.id)
  closeDelete()
}

const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

const closeDelete = () => {
  dialogDelete.value = false
  setTimeout(() => {
    editedItem.value = { ...defaultItem }
    editedIndex.value = -1
  }, 300)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  if (editedIndex.value > -1) {
    await gastosStore.updateGasto(editedItem.value)
  } else {
    await gastosStore.addGasto(editedItem.value)
  }
  close()
}

const openDialog = () => {
  editedItem.value = { ...defaultItem, fecha: getTodayDate() }
  editedIndex.value = -1
  dialog.value = true
}

onMounted(async () => {
  await gastosStore.loadGastos()
})
</script>
