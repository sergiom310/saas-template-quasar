<template>
  <q-dialog v-model="open" persistent maximized>
    <q-card>
      <q-card-section>
        <div ref="ticketHtml" class="ticket-area" style="background: #fff; padding: 0;">
          <div class="ticket" style="font-family: monospace; font-size: 13px; width: 260px;">
            <div v-if="ticket">Fecha entrada: <b>{{ formatFecha(ticket.factura?.fecha_entrada) }}</b></div>
            <div v-if="ticket">Hora entrada: <b>{{ formatHora(ticket.factura?.fecha_entrada) }}</b></div>
            <div v-if="ticket">Factura: <b>{{ ticket.factura?.id }}</b></div>
            <div v-if="ticket">Placa: <b>{{ ticket.factura?.placa }}</b></div>
            <div v-if="ticket && ticket.factura">
              Tipo vehículo: <b>{{ ticket.factura.tipoVehiculo?.nombre || ticket.factura.tipo_vehiculo?.nombre || 'N/D' }}</b>
            </div>
            <div v-if="ticket" style="margin: 10px 0; text-align: center;">
              <img v-if="barcodeImg" :src="barcodeImg" alt="Código de barras" style="width: 80%; height: 90px;" />
              <div style="font-size: 12px;">{{ ticket.factura?.placa }}</div>
            </div>
            <hr v-if="ticket" />
            <div v-if="ticket" style="text-align: center; font-size: 12px;">{{ mensajeRecibo }}</div>
            <div v-else style="color: red; text-align: center; font-weight: bold;">ERROR: No se encontraron datos de la factura.<br>Verifique el ID enviado.</div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="no-print">
        <q-btn color="primary" label="Imprimir" @click="imprimir" class="no-print" />
        <q-btn flat label="Cerrar" v-close-popup class="no-print" />
      </q-card-actions>
    </q-card>
  </q-dialog>
 </template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { api } from 'src/boot/axios'
import JsBarcode from 'jsbarcode'

const config = ref({
  imp_logo: 'S',
  imp_mensaje: 'S',
  imp_nit: 'S',
  imp_tel: 'S',
  imp_dir: 'S',
  imp_nombre: 'S',
  imp_horario: 'S'
});
const empresaData = ref({});
let logoDataUrl = ref('');
const props = defineProps({
  facturaId: { type: [String, Number], required: true },
  modelValue: { type: Boolean, default: false },
  mensajeRecibo: {
    type: [String, Object],
    default: () => ({ mensaje_recibo: '¡Gracias por su visita!' })
  }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(props.modelValue)
const ticket = ref(null)
const barcodeImg = ref('')

watch(() => props.modelValue, v => open.value = v)
watch(open, v => emit('update:modelValue', v))

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const d = new Date(fechaStr)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  return `${dia}-${mes}-${anio}`
}

function formatHora(fechaStr) {
  if (!fechaStr) return ''
  const d = new Date(fechaStr)
  const hora = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const seg = String(d.getSeconds()).padStart(2, '0')
  return `${hora}:${min}:${seg}`
}

function getLogoDataUrl(path) {
  // Construir URL directa - el navegador la cargará al imprimir sin restricciones CORS
  if (!path) return '';
  const { protocol, hostname } = window.location;
  const clean = path.replace(/^\/*/, '');
  // Usar el mismo hostname pero puerto 8000 para el backend
  return `${protocol}//${hostname.replace(':9000', '')}:8000/storage/${clean}`;
}

async function cargarTicket() {
  const { data } = await api.get(`/api/ticket/entrada/${props.facturaId}`)
  ticket.value = data
  // Cargar configuración y empresa
  try {
    const resConfig = await api.get('/api/configuracion');
    if (resConfig.data) config.value = resConfig.data;
  } catch { /* ignore error */ }
  try {
    const resEmpresa = await api.get('/api/empresa');
    if (resEmpresa.data) empresaData.value = resEmpresa.data;
    // Guardar URL del logo si corresponde
    if (config.value.imp_logo === 'S' && resEmpresa.data.logo_path) {
      logoDataUrl.value = getLogoDataUrl(resEmpresa.data.logo_path);
      console.log('Logo URL para impresión:', logoDataUrl.value);
    } else {
      logoDataUrl.value = '';
    }
  } catch { /* ignore error */ }
  await nextTick()
  if (data?.factura?.placa) {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, data.factura.placa, { format: 'CODE128', width: 1.5, height: 90 })
    barcodeImg.value = canvas.toDataURL('image/png')
  }
}

function imprimir() {
  // Encabezado empresa limpio y solo si existen datos válidos
  // Encabezado igual que ticket de salida
  const empresa = empresaData.value || {};
  const conf = config.value || {};
  let ticketHtml = document.querySelector('.ticket-area').innerHTML;
  // Elimina cualquier impresión accidental de JSON.stringify u objeto empresa
  ticketHtml = ticketHtml.replace(/<hr[^>]*>.*?(\{[\s\S]*?\})/g, '');
  ticketHtml = ticketHtml.replace(/\n?\s*\{[\s\S]*?\}\s*/g, '');
  // Eliminar encabezado anterior (Mi Parqueadero, dirección, NIT, etc) del ticketHtml si existe
  ticketHtml = ticketHtml.replace(/<div[^>]*style="text-align: center; font-weight: bold; font-size: 16px;"[^>]*>.*?<\/div>/, '');
  ticketHtml = ticketHtml.replace(/<div[^>]*style="text-align: center;"[^>]*>.*?<br>\s*NIT:.*?<\/div>/, '');
  // Eliminar cualquier impresión accidental de JSON.stringify u objeto empresa
  ticketHtml = ticketHtml.replace(/<hr[^>]*>.*?(\{[\s\S]*?\})/g, '');
  ticketHtml = ticketHtml.replace(/\n?\s*\{[\s\S]*?\}\s*/g, '');

  // Construir encabezado según configuración
  let encabezado = `<div style="text-align:center; margin-bottom:8px; font-size:13px;">`;
  //console.log('=== DEBUG IMPRESIÓN ===');
  //console.log('conf.imp_logo:', conf.imp_logo);
  //console.log('logoDataUrl.value:', logoDataUrl.value);
  //console.log('Condición cumplida:', conf.imp_logo === 'S' && logoDataUrl.value);
  if (conf.imp_logo === 'S' && logoDataUrl.value) {
    encabezado += `<img src='${logoDataUrl.value}' alt='Logo' style='max-width:80px; max-height:80px; margin-bottom:4px; display:block; margin-left:auto; margin-right:auto;' />`;
    //console.log('Logo agregado al encabezado');
  }
  if (conf.imp_nombre === 'S' && empresa.nombre) encabezado += `<div style='font-weight:bold; text-transform:uppercase;'>${empresa.nombre}</div>`;
  if (conf.imp_dir === 'S' && empresa.direccion) encabezado += `<div style='font-weight:bold;'>${empresa.direccion}</div>`;
  if (conf.imp_nit === 'S' && empresa.nit) encabezado += `<div>NIT: ${empresa.nit}</div>`;
  if (conf.imp_tel === 'S' && empresa.telefono) encabezado += `<div style='font-weight:bold;'>Tel: ${empresa.telefono}</div>`;
  if (conf.imp_horario === 'S' && empresa.horario_atencion) encabezado += `<div style='font-weight:bold;'>${empresa.horario_atencion}</div>`;
  encabezado += `</div>`;

  // Mensaje según configuración
  let mensajeRecibo = '';
  if (conf.imp_mensaje === 'S' && empresa.mensaje_recibo) {
    mensajeRecibo = `<div style='margin-top:10px;text-align:center;font-weight:bold;'>${empresa.mensaje_recibo}</div>`;
  }
  const printWindow = window.open('', '', 'width=350,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Ticket Entrada</title>
        <style>
          @media print {
            body { margin: 0; }
            .ticket { width: 58mm; }
            img, svg { width: 100%; height: auto; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          ${encabezado}
          ${ticketHtml}
          ${mensajeRecibo}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  // Esperar a que las imágenes carguen antes de imprimir
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 1000);
}

onMounted(async () => {
  await cargarTicket();
  // Espera a que el ticket y el código de barras estén listos
  setTimeout(() => {
    imprimir();
    // Cierra el diálogo después de imprimir
    emit('update:modelValue', false);
  }, 800);
});
</script>

<style>
@media print {
  .no-print { display: none !important; }
  .q-notification, .q-dialog__backdrop, .q-dialog__inner, .q-dialog__title, .q-dialog__message {
    display: none !important;
  }
  .q-card-actions, .q-card-section + .q-card-actions {
    display: none !important;
  }
  .ticket-area { overflow: visible !important; box-shadow: none !important; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
}
.ticket-area { overflow: auto; }
</style>
