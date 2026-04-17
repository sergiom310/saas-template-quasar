<template>
  <q-page>
    <q-list>
      <q-item v-for="pedido in pedidos" :key="pedido.id">
        <q-item-section>{{ pedido.restaurante }}</q-item-section>
        <q-item-section side>
          <q-btn label="Aceptar" @click="aceptarPedido(pedido.id)" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const pedidos = ref([])

onMounted(async () => {
  const { data } = await supabase.from('pedidos').select('*')
  pedidos.value = data

  supabase
    .channel('pedidos')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
      pedidos.value.push(payload.new)
    })
    .subscribe()
})

const aceptarPedido = async (id) => {
  await supabase.from('pedidos').update({ estado: 'aceptado' }).match({ id })
}
</script>
