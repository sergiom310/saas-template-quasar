<template>
  <q-page padding class="my-page">
    <q-toolbar class="toolbar-header">
      <q-btn flat round dense icon="payment" />
      <q-toolbar-title> Métodos de Pago </q-toolbar-title>
      <q-btn v-if="laravelCan('admin.create')" color="secondary" icon="add" label="Incluir" @click.stop="openDialog" />
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="metodosPagos"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingC"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id" :props="props">
              {{ props.row.id }}
            </q-td>
            <q-td key="detalle" :props="props">
              {{ props.row.detalle }}
            </q-td>
            <q-td key="activo" :props="props">
              <q-badge :color="props.row.activo ? 'green' : 'red'">
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
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

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 600px; max-width: 680px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-px-md q-col-gutter-sm">
            <div class="col-12">
              <q-input
                outlined
                v-model="editedItem.detalle"
                :rules="[(val) => !!val || 'Campo requerido']"
                label="Detalle"
              />
            </div>
            <div class="col-12">
              <q-toggle
                v-model="editedItem.activo"
                label="Activo"
                color="green"
              />
            </div>
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar"  @click="close"></q-btn>
          <q-btn flat label="Guardar"  @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="details" class="q-pa-md q-gutter-sm">
      <q-card style="width: 600px; max-width: 680px">
        <q-toolbar>
          <q-avatar>
            <q-icon name="payment" size="md" />
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Detalle</span> Método de Pago</q-toolbar-title>

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
            <div class="col-md-4"><div class="text-subtitle1">Detalle:</div></div>
            <div class="col-md-8">
              <div class="text-subtitle2">{{ showItem.detalle }}</div>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-md-4"><div class="text-subtitle1">Estado:</div></div>
            <div class="col-md-8">
              <q-badge :color="showItem.activo ? 'green' : 'red'">
                {{ showItem.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-separator></q-separator>

        <q-card-actions align="right">
          <q-btn v-close-popup flat  label="Cerrar"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { laravelCan } from 'src/functions/function-general'
import { useMetodosPagosStore } from 'src/stores/MetodosPagos'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const metodosPagosStore = useMetodosPagosStore()
const $q = useQuasar()
const router = useRouter()

const metodosPagos = computed(() => metodosPagosStore.metodosPagos)

const details = ref(false)
const dialog = ref(false)
const editCreate = ref(false)
const loadingC = ref(true)
const formRef = ref(null)

const defaultItem = {
  id: '',
  detalle: '',
  activo: true,
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
  { name: 'detalle', align: 'left', label: 'Detalle', field: 'detalle', sortable: true },
  { name: 'activo', align: 'center', label: 'Estado', field: 'activo', sortable: true },
  { name: 'action', align: 'center', label: 'Acciones' },
])

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
    metodosPagosStore.updateMetodoPago(editedItem.value)
  } else {
    metodosPagosStore.addMetodoPago(editedItem.value)
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
    detalle: item.detalle,
    activo: item.activo,
  }

  editCreate.value = true
  setTimeout(() => {
    dialog.value = true
  }, 200)
}

const deleteItem = (item) => {
  $q.dialog({
    title: 'Confirmar',
    message: 'Realmente desea eliminar este método de pago?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Eliminar', flat: true, color: 'negative' },
    persistent: true,
  }).onOk(() => {
    metodosPagosStore.deleteMetodoPago(item.id)
  })
}

// Computed properties
const formTitle = computed(() => (editCreate.value ? 'Editar Método de Pago' : 'Nuevo Método de Pago'))

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('admin.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await metodosPagosStore.loadMetodosPagos()
    loadingC.value = false
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
