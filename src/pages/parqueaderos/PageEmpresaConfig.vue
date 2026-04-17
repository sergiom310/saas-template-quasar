<template>
  <q-page padding>
    <q-card class="q-pa-lg q-mb-lg">
      <div class="text-h5 q-mb-md">Configuración de Empresa</div>
      <div v-if="empresa.logo_path" class="q-mb-lg flex flex-center">
        <q-card class="q-pa-md" style="max-width:260px; min-width:180px; margin:auto; text-align:center;">
          <div class="text-subtitle2 q-mb-sm">Logo actual</div>
          <img
            :src="getLogoUrl(empresa.logo_path)"
            alt="Logo de la empresa"
            style="max-width:200px; max-height:200px; border-radius:8px; border:1px solid #eee; background:#fafafa; display:block; margin:auto;"
          />
        </q-card>
      </div>
      <q-form @submit.prevent="guardarEmpresa">
        <q-input v-model="empresa.nombre" label="Nombre" :rules="[val => !!val || 'Requerido']" class="q-mb-md" />
        <q-input v-model="empresa.direccion" label="Dirección" maxlength="500" class="q-mb-md" />
        <q-input v-model="empresa.telefono" label="Teléfono" maxlength="20" class="q-mb-md" />
        <q-input v-model="empresa.nit" label="NIT" maxlength="50" class="q-mb-md" />
        <q-input v-model="empresa.mensaje_recibo" label="Mensaje para recibo" type="textarea" class="q-mb-md" />
        <q-input v-model="empresa.horario_atencion" label="Horarios de atención" type="textarea" class="q-mb-md" />
        <div class="row q-gutter-sm q-mb-md">
          <q-btn label="Guardar" color="positive" type="submit" />
        </div>
        <q-uploader
          v-model="logo"
          label="Subir logo (solo JPG)"
          accept=".jpg"
          :max-file-size="2048000"
          :auto-upload="false"
          @added="files => onFileAdded(files[0])"
          class="q-mb-md"
        />
        <div class="row q-gutter-sm q-mb-md">
          <q-btn label="Subir Logo" color="orange" @click="subirLogo" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const empresa = ref({
  nombre: '',
  direccion: '',
  telefono: '',
  nit: '',
  mensaje_recibo: '',
  horario_atencion: '',
  logo: '',
  logo_path: ''
})
const logo = ref(null)

function getLogoUrl(path) {
  if (!path) return ''
  // Si ya es URL absoluta
  if (/^https?:\/\//.test(path)) return path
  // Construir URL absoluta usando la baseURL del backend
  // En producción usa VITE_API_URL del .env, en desarrollo detecta automáticamente
  let backendUrl = import.meta.env.VITE_API_URL
  if (!backendUrl) {
    // Fallback dinámico: usa el origen del navegador cambiando el puerto a 8000 si es dev local
    const { protocol, hostname } = window.location
    const backendPort = (hostname.includes('localhost') || hostname.includes('.local')) ? '8000' : ''
    backendUrl = `${protocol}//${hostname}${backendPort ? ':' + backendPort : ''}`
  }
  let clean = path.replace(/^\/*/, '')
  return `${backendUrl}/storage/${clean}`
}

async function cargarEmpresa() {
  try {
    const res = await api.get('/api/empresa')
    if (res.data) {
      empresa.value = {
        nombre: res.data.nombre || '',
        direccion: res.data.direccion || '',
        telefono: res.data.telefono || '',
        nit: res.data.nit || '',
        mensaje_recibo: res.data.mensaje_recibo || '',
        horario_atencion: res.data.horario_atencion || '',
        logo: res.data.logo ? `${process.env.VITE_API_URL}/${res.data.logo}` : null,
        logo_path: res.data.logo_path || '',
      }
    } else {
      $q.notify({ type: 'warning', message: 'No se encontraron datos de la empresa.' })
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar los datos de la empresa.' })
  }
}

async function guardarEmpresa() {
  try {
    await api.post('/api/empresa', empresa.value)
    $q.notify({ type: 'positive', message: 'Datos guardados' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  }
}

async function onFileAdded(file) {
  if (!file || !file.name) {
    $q.notify({ type: 'negative', message: 'Archivo inválido o no seleccionado.' })
    logo.value = null
    return
  }

  const extension = file.name.split('.').pop().toLowerCase()
  if (extension === 'jpg') {
    logo.value = file
    $q.notify({ type: 'positive', message: 'Archivo válido seleccionado.' })
  } else {
    $q.notify({ type: 'negative', message: 'Solo se permiten archivos JPG' })
    logo.value = null
  }
}

async function subirLogo() {
  if (!logo.value) {
    $q.notify({ type: 'negative', message: 'No se ha seleccionado un archivo válido' })
    return
  }

  const formData = new FormData()
  formData.append('logo', logo.value)

  try {
    await api.post('/api/empresa/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    $q.notify({ type: 'positive', message: 'Logo subido correctamente' })
    // Recargar la página para mostrar el nuevo logo
    window.location.reload()
  } catch {
    $q.notify({ type: 'negative', message: 'Error al subir el logo' })
  }
}

onMounted(cargarEmpresa)
</script>
