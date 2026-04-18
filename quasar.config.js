import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig((ctx) => {
  return {
    boot: ['i18n', 'api', 'router-auth', 'directives'],

    css: ['app.scss'],

    extras: [
      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    build: {
      env: {
        __ENV__: process.env.VITE_API_URL,
        __VERSION__: 0.01,
        __API_URL__: process.env.VITE_API_URL + '/',
        __API_REPO_URL__: process.env.VITE_API_REPO_URL,
        VITE_RECAPTCHA_SITE_KEY: process.env.VITE_RECAPTCHA_SITE_KEY,
        VITE_API_URL: process.env.VITE_API_URL,
        VITE_API_REPO_URL: process.env.VITE_API_REPO_URL,
      },
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'

      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            ssr: ctx.modeName === 'ssr',

            include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
          },
        ],

        [
          'vite-plugin-checker',
          {
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],

      extendViteConf(viteConf) {
        if (!viteConf.server) {
          viteConf.server = {}
        }
        viteConf.server.host = '0.0.0.0'
        viteConf.server.port = 9000
        viteConf.server.strictPort = false
        // Permitir cualquier host
        viteConf.server.allowedHosts = true
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // https: true,
      open: true, // abre la ventana del navegador automáticamente
      host: '0.0.0.0', // permite acceso desde la red y dominios personalizados
      port: 9000,
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        dark: 'false',
      },

      components: [
        'QLayout',
        'QHeader',
        'QDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QExpansionItem',

        'QFooter',
        'QTabs',
        'QTab',
        'QRouteTab',
        'QCheckbox',
        'QDialog',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QSpace',
        'QInput',
        'QDate',
        'QPopupProxy',
        'QTime',
        'QBanner',
        'QSelect',
        'QScrollArea',
        'QToggle',
        'QTabPanels',
        'QTabPanel',
        'QSeparator',
        'QSpinner',
        'QTable',
        'QTr',
        'QTd',
        'QAvatar',
        'QBadge',
        'QUploader',
        'QImg',
      ],
      directives: ['Ripple', 'ClosePopup', 'TouchHold'],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'LocalStorage', 'Loading'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: ['zoomIn', 'zoomOut'],

    ssr: {
      prodPort: 3000, // The default port that the production server should use

      middlewares: [
        ctx.prod ? 'compression' : '',
        'render', // keep this as last one
      ],

      pwa: false,
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
      },

      builder: {
        appId: 'quasar-scaffold-store',
      },
    },

    bex: {
      extraScripts: [],
    },
  }
})