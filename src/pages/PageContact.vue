<template>
  <q-page>
    <div class="q-pa-md">
      <q-bar dark class="bg-secondary text-white">
        <q-btn dense flat round icon="lens" size="8.5px" color="red" />
        <q-btn dense flat round icon="lens" size="8.5px" color="yellow" />
        <q-btn dense flat round icon="lens" size="8.5px" color="green" />
        <div class="col text-center text-weight-bold text-uppercase">{{ t('contactTitle') }}</div>
      </q-bar>
      <div class="row text-center q-pt-lg">
        <div class="col-md-8 fit row wrap justify-center col-xs-12 q-pt-md">
          <q-card flat bordered class="my-card">
            <!-- Ubicación -->
            <q-card-section class="row items-center q-gutter-md">
              <q-icon name="place" color="primary" size="32px" />
              <div class="text-body1">
                Bucaramanga - Colombia
              </div>
            </q-card-section>

            <q-separator inset />

            <!-- Email -->
            <q-card-section class="row items-center q-gutter-md">
              <q-icon name="email" color="primary" size="32px" />
              <a href="mailto:sergiogiovanny05@gmail.com" class="contact-link text-body1">
                sergiogiovanny05@gmail.com
              </a>
            </q-card-section>

            <q-separator inset />

            <!-- WhatsApp -->
            <q-card-section class="row items-center q-gutter-md">
              <q-icon name="whatsapp" color="positive" size="32px" />
              <a :href="whatsappUrl" target="_blank" class="contact-link text-body1">
                +57 316 3737253
              </a>
            </q-card-section>

            <q-separator inset />

            <!-- Botón de contacto por WhatsApp -->
            <q-card-section>
              <q-btn
                :href="whatsappUrl"
                target="_blank"
                color="positive"
                icon="whatsapp"
                :label="t('contactWhatsApp')"
                unelevated
                rounded
                no-caps
                class="full-width"
              />
            </q-card-section>
            
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const { t } = useI18n()

// Número de WhatsApp (sin espacios, sin +, solo dígitos)
const phoneNumber = '573163737253'

// Mensaje inicial para WhatsApp
const whatsappMessage = computed(() => {
  return encodeURIComponent('Hola, me gustaría información sobre sus servicios.')
})

// URL de WhatsApp
const whatsappUrl = computed(() => {
  return `https://wa.me/${phoneNumber}?text=${whatsappMessage.value}`
})
</script>

<style scoped>
.link {
  color: grey;
  text-decoration: none;
}
.my-card {
  width: 100%;
  max-width: 500px;
}
.contact-link {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.3s;
}
.contact-link:hover {
  color: #1565c0;
  text-decoration: underline;
}
</style>
