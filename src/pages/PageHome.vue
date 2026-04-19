<template>
  <q-page>
    <div class="q-pa-md" style="display: none;">
      <q-carousel swipeable animated v-model="slide" arrows infinite class="homeCarousel">
        <q-carousel-slide :name="1" :img-src="urlRepo + 'banner_header/banner-1.jpeg'">
        </q-carousel-slide>
        <q-carousel-slide
          :name="2"
          :img-src="urlRepo + 'banner_header/banner-2.jpg'"
        ></q-carousel-slide>
        <q-carousel-slide
          :name="3"
          :img-src="urlRepo + 'banner_header/banner-3.jpg'"
        ></q-carousel-slide>
      </q-carousel>
    </div>

    <div class="q-pa-md" style="display: none;">
      <q-card flat class="my-card">
        <q-card-section>
          <div class="text-h6">{{ t('homeTitle') }}</div>
        </q-card-section>

        <q-separator inset></q-separator>

        <q-card-section>{{ t('homeSubtitle') }}</q-card-section>
      </q-card>
    </div>

    <div class="flex-center absolute-center hero-container">
      <div class="hero-content text-center">
        <img src="~assets/eshop.png" style="max-width: 120px; margin: 0 auto 1.5rem;">

        <h4 class="hero-title q-mt-none q-mb-sm">Tienda Virtual</h4>
        <p class="hero-subtitle text-grey-7 q-mb-xl">
          Sistema de gestión de productos por categorías, marcas y ventas.<br>
          Administra tu negocio de forma simple y eficiente.
        </p>

        <q-btn
          unelevated
          color="secondary"
          label="Ingresar al sistema"
          icon="login"
          size="lg"
          no-caps
          to="/auth"
          class="hero-btn"
        />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { QCarousel, QCarouselSlide } from 'quasar'
import { apiBaseURL } from 'src/boot/api'

const { t } = useI18n()

const urlRepo = `${apiBaseURL}${import.meta.env.VITE_API_REPO_URL}`
const slide = ref(1)
</script>

<style lang="scss" scoped>
.hero-container {
  width: 100%;
  padding: 2rem 1rem;
}

.hero-content {
  max-width: 480px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1rem;
  line-height: 1.6;
}

.hero-btn {
  min-width: 220px;
  border-radius: 12px;
}

.homeCarousel {
  height: 190px;

  @media only screen and (min-width: 768px) {
    height: 350px;
  }
  @media only screen and (min-width: 1024px) {
    .homeCarousel {
      height: 390px;
    }
  }
  @media only screen and (min-width: 1366px) {
    .homeCarousel {
      height: 540px;
    }
  }
}
.textsubtitle1 {
  font-size: 12px;

  @media only screen and (min-width: 768px) {
    font-size: 16px;
  }
}
.texthomeh2 {
  font-size: 32px;

  @media only screen and (min-width: 768px) {
    font-size: 60px;
  }
}
.custom-caption {
  text-align: center;
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
}

.ul-important {
  list-style-type: none;
  line-height: 50px;

  li {
    font-size: 16px;
  }
}
</style>
