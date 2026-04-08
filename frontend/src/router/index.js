// src/router/index.js - FIXED FOR SUPERADMIN
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // PUBLIC
  { path: '/', name: 'Landing', component: () => import('@/views/Landing.vue') },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/auth/Login.vue') },
  { path: '/register-org', name: 'RegisterOrg', component: () => import('@/views/auth/OrgRegister.vue') },
  { path: '/verify-email', name: 'VerifyEmail', component: () => import('@/views/auth/VerifyEmail.vue') },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('@/views/auth/ResetPassword.vue') },
  { path: '/activate/:token', name: 'EmployeeActivation', component: () => import('@/views/auth/EmployeeActivation.vue') },

  // SUPERADMIN (LOGIN + DASHBOARD + PAGES)
  { path: '/superadmin/login', name: 'SuperAdminLogin', component: () => import('@/views/admin/SuperAdminLogin.vue') },
  { path: '/superadmin', name: 'SuperAdmin', component: () => import('@/views/admin/SuperAdminDashboard.vue') },
  { path: '/superadmin/organizations', name: 'SuperAdminOrganizations', component: () => import('@/views/admin/SuperAdminOrganizations.vue') },
  { path: '/superadmin/revenue', name: 'SuperAdminRevenue', component: () => import('@/views/admin/SuperAdminRevenue.vue') },
  { path: '/superadmin/subscriptions', name: 'SuperAdminSubscriptions', component: () => import('@/views/admin/SuperAdminSubscriptions.vue') },
  { path: '/superadmin/analytics', name: 'SuperAdminAnalytics', component: () => import('@/views/admin/SuperAdminAnalytics.vue') },
  { path: '/superadmin/monitoring', name: 'SuperAdminMonitoring', component: () => import('@/views/admin/SuperAdminMonitoring.vue') },
  { path: '/superadmin/audit-logs', name: 'SuperAdminAuditLogs', component: () => import('@/views/admin/SuperAdminAuditLogs.vue') },
  { path: '/superadmin/settings', name: 'SuperAdminSettings', component: () => import('@/views/admin/SuperAdminSettings.vue') },
  { path: '/superadmin/feedback', name: 'SuperAdminFeedback', component: () => import('@/views/superadmin/FeedbackManagement.vue') },

  // ORGANIZATION 
  { path: '/:orgSlug', redirect: '/:orgSlug/dashboard' },
  {
    path: '/:orgSlug',
    component: () => import('@/layouts/TenantLayout.vue'),
    children: [
      { path: 'dashboard', name: 'OrgDashboard', component: () => import('@/views/tenant/Dashboard.vue') },
      { path: 'user-dashboard', name: 'UserDashboard', component: () => import('@/views/tenant/UserDashboard.vue') },
      { path: 'users', name: 'OrgUsers', component: () => import('@/views/tenant/Users.vue') },
      { path: 'employees', name: 'EmployeeManagement', component: () => import('@/views/admin/EmployeeManagement.vue') },
      { path: 'time-tracking', name: 'TimeTracking', component: () => import('@/views/admin/TimeTracking.vue') },
      { path: 'departments', name: 'OrgDepartments', component: () => import('@/views/tenant/Departments.vue') },
      { path: 'checkin', name: 'OrgCheckin', component: () => import('@/views/tenant/Checkin.vue') },
      { path: 'schedule', name: 'UserSchedule', component: () => import('@/views/tenant/UserSchedule.vue') },
      { path: 'admin-schedule', name: 'AdminSchedule', component: () => import('@/views/admin/AdminSchedule.vue') },
      { path: 'settings', name: 'OrgSettings', component: () => import('@/views/tenant/Settings.vue') },
      { path: 'checkins', name: 'UserCheckins', component: () => import('@/views/tenant/UserCheckins.vue') },
      { path: 'feedback', name: 'OrgFeedback', component: () => import('@/views/tenant/Feedback.vue') },
      { path: 'time-management', name: 'TimeManagement', component: () => import('@/views/tenant/TimeManagement.vue') }
    ]
  },

// 404 (SIMPLE)
{ path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ FIXED GUARD - SuperAdmin + Org support
router.beforeEach((to, from, next) => {
  const orgToken = localStorage.getItem('token')
  const superAdminToken = localStorage.getItem('superAdminToken')

  // Public routes
  if (['Landing', 'Login', 'RegisterOrg', 'VerifyEmail', 'ResetPassword', 'SuperAdminLogin', 'About', 'EmployeeActivation'].includes(to.name)) {
    next()
    return
  }

  // ✅ SUPERADMIN ROUTES - Special handling
  if (to.path.startsWith('/superadmin')) {
    if (superAdminToken) {
      next()  // Allow superadmin
    } else {
      next({ name: 'SuperAdminLogin' })  // redirect to superadmin login
    }
    return
  }

  // ✅ ORGANIZATION ROUTES - Require orgSlug + token
  if (to.params.orgSlug && !orgToken) {
    next('/login')
    return
  }

  next()
})

export default router
