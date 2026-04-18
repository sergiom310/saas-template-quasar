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

    <div class="flex-center absolute-center">
        <img src="~assets/eshop.png" style="max-width:280px;margin:auto;">
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { QCarousel, QCarouselSlide } from 'quasar'

const { t } = useI18n()

const urlRepo = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_REPO_URL}`
const slide = ref(1)
</script>

<style lang="scss" scoped>
.video-container {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin: auto;
  aspect-ratio: 9 / 16; /* Relación 9:16 */
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
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
