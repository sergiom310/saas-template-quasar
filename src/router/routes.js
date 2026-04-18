const routes = [
  {
    path: '/',
    component: () => import('layouts/PageLayout.vue'),
    children: [
      // Público
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

      // Requiere autenticación
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

      // System
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

      // Tienda / E-commerce
      {
        path: '/tienda/marcas',
        component: () => import('pages/basicos/PageBrands.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tienda/categories',
        component: () => import('pages/basicos/PageCategories.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tienda/tags',
        component: () => import('pages/basicos/PageTags.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tienda/products',
        component: () => import('pages/basicos/PageProducts.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tienda/metodos-pagos',
        component: () => import('pages/basicos/PageMetodosPagos.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/tienda/empresa',
        component: () => import('pages/basicos/PageEmpresa.vue'),
        meta: { requiresAuth: true },
      },      
      {
        path: '/ventas',
        component: () => import('pages/ventas/PageVentas.vue'),
        meta: { requiresAuth: true, title: 'Ventas de Productos' },
      },
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
