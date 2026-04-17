import PageClientes from 'pages/parqueaderos/PageClientes.vue';

const routes = [
  {
    path: '/',
    component: () => import('layouts/PageLayout.vue'),
    children: [
      {
        path: '/parqueaderos/reportes-sistema',
        component: () => import('pages/parqueaderos/ReportesSistema.vue'),
        meta: { requiresAuth: true, title: 'Reportes del sistema' },
      },
      {
        path: '/parqueaderos/reportes-usuario',
        component: () => import('pages/parqueaderos/ReportesUsuario.vue'),
        meta: { requiresAuth: true, title: 'Reportes de Usuario' },
      },
      {
        path: '/parqueaderos/registro-entrada',
        component: () => import('pages/parqueaderos/PageRegistroEntrada.vue'),
        meta: { requiresAuth: true, title: 'Registro Entrada/Salida' },
      },
      {
        path: '/parqueaderos/cuadre-caja',
        component: () => import('pages/parqueaderos/CuadreDeCaja.vue'),
        meta: { requiresAuth: true, title: 'Cuadre de caja' },
      },
      {
        path: '/parqueaderos/empresa-config',
        component: () => import('pages/parqueaderos/PageEmpresaConfig.vue'),
        meta: { requiresAuth: true, title: 'Configuración Empresa' },
      },
      {
        path: '/parqueaderos/configuraciones-generales',
        component: () => import('pages/parqueaderos/PageConfiguracionesGenerales.vue'),
        meta: { requiresAuth: true, title: 'Configuraciones Generales' },
      },
      {
        path: '/home',
        component: () => import('pages/PageHome.vue'),
      },
      {
        path: '/about',
        component: () => import('pages/PageAbout.vue'),
      },
      {
        path: '/contact',
        component: () => import('pages/PageContact.vue'),
      },
      {
        path: '/cartlist',
        component: () => import('pages/PageCart.vue'),
      },
      {
        path: '/products/:slug',
        component: () => import('pages/ProductsCategory.vue'),
      },
      {
        path: '/productdetail/:id',
        component: () => import('pages/ProductDetail.vue'),
      },
      {
        path: '/auth',
        component: () => import('pages/PageAuth.vue'),
      },
      {
        path: '/verificar',
        component: () => import('pages/VerificarEmail.vue'),
      },
      {
        path: '/forgot-password',
        component: () => import('pages/ForgotPassword.vue'),
      },
      {
        path: '/reset-password',
        component: () => import('pages/ResetPassword.vue'),
      },
      {
        path: '/profileuser',
        component: () => import('pages/PageProfile.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/dashboard',
        component: () => import('pages/PageDashboard.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/permissions',
        component: () => import('pages/system/PagePermissions.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/roles',
        component: () => import('pages/system/PageRoles.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/users',
        component: () => import('pages/system/PageUsers.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/tenants',
        component: () => import('pages/system/PageTenants.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/modulos',
        component: () => import('pages/system/ModulosPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/pagos',
        component: () => import('pages/system/PagePagos.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/system/bitacora',
        component: () => import('pages/bitacora/PageBitacora.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/parqueaderos/TipoVehiculos',
        component: () => import('pages/parqueaderos/PageTiposVehiculos.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/parqueaderos/Tarifas',
        component: () => import('pages/parqueaderos/PageTarifas.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/parqueaderos/ReglasTarifas',
        component: () => import('pages/parqueaderos/PageReglasTarifas.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/parqueaderos/MetodosPagos',
        component: () => import('pages/parqueaderos/PageMetodosPagos.vue'),
        meta: { requiresAuth: true },
      },      
      {
        path: '/parqueaderos/mis-pagos',
        component: () => import('pages/agenda/PageMisPagos.vue'),
        meta: { requiresAuth: true },
      },      
      {
        path: '/mensualidades/clientes',
        component: PageClientes,
        meta: { requiresAuth: true },
      },
      {
        path: '/mensualidades/pagos',
        component: () => import('pages/parqueaderos/PagePagos.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agendas/marcas',
        component: () => import('pages/basicos/PageBrands.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agendas/categories',
        component: () => import('pages/basicos/PageCategories.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agendas/tags',
        component: () => import('pages/basicos/PageTags.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agendas/products',
        component: () => import('pages/basicos/PageProducts.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agendas/mis-ventas',
        component: () => import('pages/agenda/PageVentas.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/especialidades',
        component: () => import('pages/agenda/PageEspecialidades.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/clientes',
        component: () => import('pages/agenda/PageClientes.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/MetodosPagos',
        component: () => import('pages/agenda/PageMetodosPagos.vue'),
        meta: { requiresAuth: true },
      },      
      {
        path: '/agenda/mis-pagos',
        component: () => import('pages/agenda/PageMisPagos.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/franjas-horarias',
        component: () => import('pages/agenda/PageFranjasHorarias.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/profesionales',
        component: () => import('pages/agenda/PageProfesionales.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/agenda/agendar',
        component: () => import('pages/agenda/PageAgenda.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/ventas',
        component: () => import('pages/agenda/PageVentas.vue'),
        meta: { requiresAuth: true, title: 'Ventas de Productos' },
      },
      {
        path: '/calendario',
        component: () => import('pages/agenda/PageCalendario.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/pagos',
        component: () => import('pages/agenda/PagePagos.vue'),
        meta: { requiresAuth: true },
      },
        {
          path: '/gastos',
          component: () => import('pages/agenda/PageGastos.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/reportes',
          component: () => import('pages/agenda/PageReportes.vue'),
          meta: { requiresAuth: true },
        },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
