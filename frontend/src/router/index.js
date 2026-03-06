// src/router/index.js - NO ERRORS
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // PUBLIC
  { path: '/', name: 'Landing', component: () => import('@/views/Landing.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/Login.vue') },
  { path: '/register-org', name: 'RegisterOrg', component: () => import('@/views/auth/OrgRegister.vue') },

  // SUPERADMIN (SIMPLE - NO LAYOUT NEEDED YET)
  { path: '/superadmin', name: 'SuperAdmin', component: () => import('@/views/admin/SuperAdminDashboard.vue') },

  // ORGANIZATION 
  { 
    path: '/:orgSlug',
    component: () => import('@/layouts/TenantLayout.vue'),
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', name: 'OrgDashboard', component: () => import('@/views/tenant/Dashboard.vue') },
      { path: 'users', name: 'OrgUsers', component: () => import('@/views/tenant/Users.vue') },
      { path: 'departments', name: 'OrgDepartments', component: () => import('@/views/tenant/Departments.vue') },
      { path: 'checkin', name: 'OrgCheckin', component: () => import('@/views/tenant/Checkin.vue') },
      { path: 'settings', name: 'OrgSettings', component: () => import('@/views/tenant/Settings.vue') }
    ]
  },

  // 404 (SIMPLE)
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// SIMPLE GUARD (no Pinia dependency)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (['Landing', 'Login', 'RegisterOrg'].includes(to.name)) {
    next()
    return
  }
  
  if (!token && to.params.orgSlug) {
    next({ name: 'Login' })
    return
  }
  
  next()
})

export default router
