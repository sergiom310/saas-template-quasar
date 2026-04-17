<template>
  <q-page>
    <div class="q-pa-md">
      <q-bar dark class="bg-secondary text-white">
        <q-btn dense flat round icon="lens" size="8.5px" color="red" />
        <q-btn dense flat round icon="lens" size="8.5px" color="yellow" />
        <q-btn dense flat round icon="lens" size="8.5px" color="green" />
        <div class="col text-center text-weight-bold text-uppercase">{{ t('whoTitle') }}</div>
      </q-bar>

      <div class="row text-center q-pt-lg">
        <div class="col-md-8 offset-md-2 col-xs-12 q-pa-md">
          <q-img src="SaaS-header.jpg"></q-img>
        </div>
      </div>

      <div class="row text-center q-pt-lg">
        <div class="col-md-8 offset-md-2 col-xs-12 q-pa-md">
          <q-card>
            <p class="q-pa-sm">
              {{ t('homeTitle') }}
            </p>
            <p class="q-pa-sm">
              {{ t('homeSubtitle') }}
            </p>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { QBar } from 'quasar'
const { t } = useI18n()
</script>

<style scoped></style>
