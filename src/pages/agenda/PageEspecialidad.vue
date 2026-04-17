<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Especialidades</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="form.nombre" label="Nombre" :rules="[val => !!val || 'Requerido']" />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.descripcion" label="Descripción" />
            </div>
            <div class="col-12 col-md-6">
              <q-toggle v-model="form.activo" label="Activo" true-value="1" false-value="0" />
            </div>
          </div>
          <div class="q-mt-md">
            <q-btn label="Guardar" type="submit" color="primary" />
            <q-btn label="Limpiar" flat @click="resetForm" class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id_especialidad"
          flat
          :loading="loading"
          v-model:pagination="pagination"
        >
          <template v-slot:body-cell-acciones="props">
            <q-td align="center">
              <q-btn size="sm" color="primary" icon="edit" flat @click="editRow(props.row)" />
              <q-btn size="sm" color="negative" icon="delete" flat @click="deleteRow(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const pagination = ref({ rowsPerPage: 10 })
const form = ref({
  id_especialidad: null,
  nombre: '',
  descripcion: '',
  activo: 1
})

const columns = [
  { name: 'id_especialidad', label: 'ID', field: 'id_especialidad', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center', format: val => val ? 'Sí' : 'No' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

function fetchEspecialidades() {
  loading.value = true
  api.get('/especialidades')
    .then(res => {
      rows.value = res.data
    })
    .finally(() => loading.value = false)
}

function onSubmit() {
  loading.value = true
  const method = form.value.id_especialidad ? 'put' : 'post'
  const url = form.value.id_especialidad ? `/especialidades/${form.value.id_especialidad}` : '/especialidades'
  api[method](url, form.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Guardado correctamente' })
      fetchEspecialidades()
      resetForm()
    })
    .catch(() => $q.notify({ type: 'negative', message: 'Error al guardar' }))
    .finally(() => loading.value = false)
}

function editRow(row) {
  form.value = { ...row }
}

function deleteRow(row) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar especialidad?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    loading.value = true
    api.delete(`/especialidades/${row.id_especialidad}`)
      .then(() => {
        $q.notify({ type: 'positive', message: 'Eliminado correctamente' })
        fetchEspecialidades()
      })
      .catch(() => $q.notify({ type: 'negative', message: 'Error al eliminar' }))
      .finally(() => loading.value = false)
  })
}

function resetForm() {
  form.value = { id_especialidad: null, nombre: '', descripcion: '', activo: 1 }
}

onMounted(fetchEspecialidades)
</script>
