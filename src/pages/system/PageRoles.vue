<template>
  <q-page padding>
    <q-toolbar class="bg-primary text-white">
      <q-btn flat round dense icon="perm_data_setting" />
      <q-toolbar-title> Roles </q-toolbar-title>
    </q-toolbar>
    <div class="">
      <q-table
        title=""
        :rows="roles"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :filter="filter"
        :loading="loadingR"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Búsqueda">
            <template v-slot:append>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-action="cellProperties">
          <q-td :props="cellProperties">
            <q-btn
              icon="edit"
              color="primary"
              @click.stop="showEditRoleModal(cellProperties.row)"
              v-if="laravelCan('system.update')"
              flat
              dense
            ></q-btn>
            <q-btn
              icon="delete"
              color="red"
              @click.stop="deleteItem(cellProperties.row.id)"
              v-if="laravelCan('system.destroy')"
              flat
              dense
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <div
      class="absolute-bottom text-center q-mb-lg no-pointer-events"
      v-if="laravelCan('system.create')"
    >
      <q-btn
        @click.stop="dialog = true"
        round
        class="all-pointer-events"
        color="primary"
        size="18px"
        icon="add"
      />
    </div>

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
              ref="name"
              label="Descripción Rol"
              class="col"
            >
            </q-input>
          </div>

          <div>
            <div class="row">
              <div class="col-md-4 q-pl-md q-pa-xs text-weight-bolder">Permiso</div>
              <div class="col-md-2"><q-btn flat icon="visibility"></q-btn></div>
              <div class="col-md-2"><q-btn flat icon="edit" color="blue"></q-btn></div>
              <div class="col-md-2"><q-btn flat icon="add_circle" color="green"></q-btn></div>
              <div class="col-md-2"><q-btn flat icon="delete" color="red"></q-btn></div>
            </div>
            <div class="row" v-for="permission in permissions" :key="permission.id">
              <div class="col-md-4 q-pl-md q-pa-xs">{{ permission.modulo }}</div>
              <div class="col-md-2">
                <q-checkbox
                  v-model="permisosLocal"
                  :val="permission.consultar.toString()"
                  color="cyan"
                ></q-checkbox>
              </div>
              <div class="col-md-2">
                <q-checkbox
                  v-model="permisosLocal"
                  :val="permission.modificar.toString()"
                  color="orange"
                ></q-checkbox>
              </div>
              <div class="col-md-2">
                <q-checkbox
                  v-model="permisosLocal"
                  :val="permission.incluir.toString()"
                  color="teal"
                ></q-checkbox>
              </div>
              <div class="col-md-2">
                <q-checkbox
                  v-model="permisosLocal"
                  :val="permission.eliminar.toString()"
                  color="red"
                ></q-checkbox>
              </div>
            </div>
          </div>
        </q-form>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" @click="close"></q-btn>
          <q-btn flat label="Guardar" color="primary" @click="save"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRolesStore } from 'src/stores/roles'
import { laravelCan } from 'src/functions/function-general'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const rolesStore = useRolesStore()
const dialog = ref(false)
const editCreate = ref(false)
const filter = ref('')
const permisosLocal = ref([])
const editedItem = ref({ id: '', name: '', permisosroles: '' })
const pagination = ref({ sortBy: 'id', descending: false, page: 1, rowsPerPage: 7 })
const loadingR = ref(true)
const formRef = ref(null)

const roles = computed(() => rolesStore.roles)
const permissions = computed(() => rolesStore.permissions)
const formTitle = computed(() => (editCreate.value ? 'Editar' : 'Incluir'))

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

const close = () => {
  dialog.value = false
  permisosLocal.value = []
  setTimeout(() => {
    editedItem.value = { id: '', name: '', permisosroles: '' }
    editCreate.value = false
  }, 200)
}

const save = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) {
    return
  }

  editedItem.value.permisosroles = permisosLocal.value
  editCreate.value ? rolesStore.updateRole(editedItem.value) : rolesStore.addRole(editedItem.value)
  close()
}

const showEditRoleModal = async (item) => {
  rolesStore.resetPermisos()
  editedItem.value = { ...item }

  await rolesStore.loadPermissionsRole(item)

  permisosLocal.value = rolesStore.getPermisos
  editCreate.value = true

  setTimeout(() => (dialog.value = true), 200)
}

const deleteItem = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este rol?',
    cancel: true,
    persistent: true,
  }).onOk(() => rolesStore.deleteRole(id))
}

onMounted(async () => {
  if (!laravelCan('system.index')) {
    window.location.href = '/dashboard'
  } else {
    await rolesStore.loadRoles()
    loadingR.value = false
  }
})
</script>
