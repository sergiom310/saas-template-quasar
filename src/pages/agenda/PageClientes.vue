<template>
  <q-page padding class="my-page">
    <q-toolbar class="bg-blue-grey-4 text-white">
      <q-btn flat round dense icon="people" />
      <q-toolbar-title> Clientes Agenda </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="clientes"
        :columns="columns"
        row-key="id_cliente"
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
            <q-td key="id_cliente" :props="props">
              {{ props.row.id_cliente }}
            </q-td>
            <q-td key="cedula" :props="props">
              {{ props.row.cedula || 'N/A' }}
            </q-td>
            <q-td key="nombre" :props="props">
              {{ props.row.nombre }}
            </q-td>
            <q-td key="telefono" :props="props">
              {{ props.row.telefono }}
            </q-td>
            <q-td key="observaciones" :props="props">
              {{ props.row.observaciones || '-' }}
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
                @click.stop="deleteItem(props.row.id_cliente)"
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
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.cedula"
                label="Cédula"
                maxlength="20"
              >
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.nombre"
                :rules="[(val) => !!val || 'Campo requerido']"
                ref="nombre"
                label="Nombre"
                maxlength="100"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.telefono"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Teléfono"
                maxlength="20"
              >
              </q-input>
            </div>
            <div class="col-md-12 col-xs-12 q-px-sm">
              <q-input
                outlined
                v-model="editedItem.observaciones"
                label="Observaciones"
                type="textarea"
                rows="3"
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
import { useClientesAgendaStore } from 'src/stores/clientesAgenda'

const clientesStore = useClientesAgendaStore()

const clientes = computed(() => clientesStore.clientes)
const dialog = ref(false)
const formRef = ref(null)
const dialogDelete = ref(false)
const filter = ref('')

const pagination = ref({
  sortBy: 'id_cliente',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

const columns = [
  {
    name: 'id_cliente',
    required: true,
    label: 'ID',
    align: 'left',
    field: row => row.id_cliente,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'cedula',
    align: 'left',
    label: 'Cédula',
    field: 'cedula',
    sortable: true
  },
  {
    name: 'nombre',
    align: 'left',
    label: 'Nombre',
    field: 'nombre',
    sortable: true
  },
  {
    name: 'telefono',
    align: 'left',
    label: 'Teléfono',
    field: 'telefono',
    sortable: true
  },
  {
    name: 'observaciones',
    align: 'left',
    label: 'Observaciones',
    field: 'observaciones',
    sortable: false
  },
  { name: 'actions', align: 'center', label: 'Acciones', field: '', sortable: false }
]

const defaultItem = {
  id_cliente: 0,
  cedula: '',
  nombre: '',
  telefono: '',
  observaciones: ''
}

const editedIndex = ref(-1)
const editedItem = ref({ ...defaultItem })

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Cliente' : 'Editar Cliente'
})

const editItem = (item) => {
  editedIndex.value = clientes.value.indexOf(item)
  editedItem.value = { ...item }
  dialog.value = true
}

const deleteItem = (id) => {
  editedItem.value.id_cliente = id
  dialogDelete.value = true
}

const deleteItemConfirm = async () => {
  await clientesStore.deleteCliente(editedItem.value.id_cliente)
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
    await clientesStore.updateCliente(editedItem.value)
  } else {
    await clientesStore.addCliente(editedItem.value)
  }
  close()
}

const openDialog = () => {
  editedItem.value = { ...defaultItem }
  editedIndex.value = -1
  dialog.value = true
}

onMounted(async () => {
  await clientesStore.loadClientes()
})
</script>
