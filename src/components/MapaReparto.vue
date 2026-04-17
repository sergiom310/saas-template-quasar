<template>
  <div>
    <button @click="locateMe" class="locate-btn">📍</button>
    <div id="map" style="height: 100vh"></div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map = null
let marker = null

onMounted(() => {
  map = L.map('map').setView([7.119, -73.122], 13)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  setTimeout(() => {
    locateMe()
  }, 100)
})

const locateMe = () => {
  if (!navigator.geolocation) {
    alert('La geolocalización no está soportada en tu navegador.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      // Si ya hay un marcador, lo movemos
      if (marker) {
        marker.setLatLng([latitude, longitude])
      } else {
        marker = L.marker([latitude, longitude]).addTo(map).openPopup() // bindPopup('¡Aquí estás!')
      }

      map.setView([latitude, longitude], 15) // Centra y hace zoom al mapa
    },
    (error) => {
      alert('No se pudo obtener tu ubicación: ' + error.message)
    },
  )
}
</script>

<style>
.locate-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
  padding: 8px 12px;
  background: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
.locate-btn:hover {
  background: #ebe6e6;
}
</style>
