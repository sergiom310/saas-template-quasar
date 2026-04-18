<template>
  <q-page padding>
    <q-toolbar class="toolbar-header">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title>Permissions</q-toolbar-title>
      <q-btn v-if="laravelCan('system.create')" color="secondary" icon="add" label="Incluir" @click.stop="dialog = true" />
    </q-toolbar>

    <q-table
      :rows="permissions"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :filter="filter"
      :loading="loadingP"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:body-cell-action="{ row }">
        <q-td>
          <q-btn
            icon="edit"
            @click.stop="showEditPermissionModal(row)"
            v-if="laravelCan('system.update')"
            flat
            dense
          />
          <q-btn
            icon="delete"
            color="red"
            @click.stop="deleteItem(row.id)"
            v-if="laravelCan('system.destroy')"
            flat
            dense
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 480px; max-width: 580px">
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ formTitle }}</span>
        </q-card-section>

        <q-form ref="formRef" @submit.prevent="save">
          <div class="row q-ma-md">
            <q-input
              outlined
              v-model="editedItem.name"
              :rules="[(val) => !!val || 'Campo requerido']"
              ref="nameRef"
              label="Detalle permiso"
              class="col"
            />
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar"  @click="close" />
          <q-btn flat label="Guardar"  @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePermissionsStore } from 'src/stores/permissions'
import { laravelCan } from 'src/functions/function-general'
import { useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'

// Stores y utilidades
const store = usePermissionsStore()
const router = useRouter()
const $q = useQuasar()

// Estados Reactivos
const dialog = ref(false)
const editCreate = ref(false)
const filter = ref('')
const editedItem = ref({ id: '', name: '' })
const loadingP = ref(true)
const formRef = ref(null)

// Paginación
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 7,
})

// Columnas de la tabla
const columns = [
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Nombre', field: 'name', sortable: true },
  {
    name: 'created_at',
    align: 'center',
    label: 'Creado en',
    field: 'created_at',
    sortable: true,
    format: (val) => date.formatDate(val, 'YYYY-MM-DD'),
  },
  { name: 'action', align: 'center', label: 'Acción' },
]

// Computed properties
const permissions = computed(() => store.permissions)
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

// Funciones
const close = () => {
  dialog.value = false
  setTimeout(() => {
    editedItem.value = { id: '', name: '' }
    editCreate.value = false
  }, 150)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  if (editCreate.value) {
    store.updatePermission(editedItem.value)
  } else {
    store.addPermission(editedItem.value)
  }
  close()
}

const showEditPermissionModal = (item) => {
  editedItem.value = { ...item }
  editCreate.value = true
  setTimeout(() => (dialog.value = true), 200)
}

const deleteItem = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Realmente deseas eliminar este permiso?',
    cancel: { label: 'Cancelar', flat: true, color: 'grey' },
    ok: { label: 'Eliminar', flat: true, color: 'negative' },
    persistent: true,
  }).onOk(() => {
    store.deletePermission(id)
  })
}

// Cargar datos al montar el componente
onMounted(async () => {
  if (!laravelCan('system.index')) {
    router.push({ path: '/dashboard' })
  } else {
    await store.loadPermissions()
    loadingP.value = false
  }
})
</script>
