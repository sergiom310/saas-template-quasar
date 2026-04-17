<template>
  <q-page padding>
    <q-card class="q-pa-lg q-mb-lg">
      <div class="text-h5 q-mb-md">Configuraciones Generales</div>
      <q-toggle v-model="config.imp_logo" label="Imprimir Logo" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_mensaje" label="Imprimir Mensaje" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_nit" label="Imprimir NIT" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_tel" label="Imprimir Teléfono" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_dir" label="Imprimir Dirección" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_nombre" label="Imprimir Nombre" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
      <q-toggle v-model="config.imp_horario" label="Imprimir Horario" true-value="S" false-value="N" color="positive" class="q-mb-md" @update:model-value="actualizarConfig" />
    </q-card>
  </q-page>
</template>

<script setup>
async function actualizarConfig() {
  try {
    await api.post('/api/configuracion/update', config.value)
    $q.notify({ type: 'positive', message: 'Configuración actualizada' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al actualizar configuración' })
  }
}
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const config = ref({
  imp_logo: 'S',
  imp_mensaje: 'S',
  imp_nit: 'S',
  imp_tel: 'S',
  imp_dir: 'S',
  imp_nombre: 'S',
  imp_horario: 'S'
})

async function cargarConfig() {
  try {
    const res = await api.get('/api/configuracion')
    if (res.data) {
      config.value = {
        imp_logo: res.data.imp_logo || 'S',
        imp_mensaje: res.data.imp_mensaje || 'S',
        imp_nit: res.data.imp_nit || 'S',
        imp_tel: res.data.imp_tel || 'S',
        imp_dir: res.data.imp_dir || 'S',
        imp_nombre: res.data.imp_nombre || 'S',
        imp_horario: res.data.imp_horario || 'S'
      }
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar configuración' })
  }
}


onMounted(cargarConfig)
</script>
