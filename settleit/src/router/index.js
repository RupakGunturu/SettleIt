import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/Login.vue'),
            meta: { public: true }
        },
        {
            path: '/',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue')
        },
        {
            path: '/group/:id',
            name: 'GroupDetail',
            component: () => import('../views/GroupDetail.vue')
        },
        {
            path: '/add-expense',
            name: 'AddExpense',
            component: () => import('../views/AddExpense.vue')
        },
        {
            path: '/group/:id/settle',
            name: 'SettleUp',
            component: () => import('../views/SettleUp.vue')
        },
        {
            path: '/reports',
            name: 'Reports',
            component: () => import('../views/Reports.vue')
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('../views/Settings.vue')
        },
        {
            path: '/groups',
            name: 'Groups',
            component: () => import('../views/Dashboard.vue') // For now, reuse dashboard
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    // Ensure auth is initialized
    if (authStore.loading) {
        // Basic wait or just proceed if initialization is handled in main.js/App.vue
    }

    const isAuthenticated = !!authStore.user
    if (!to.meta.public && !isAuthenticated) {
        next({ name: 'Login' })
    } else if (to.name === 'Login' && isAuthenticated) {
        next({ name: 'Dashboard' })
    } else {
        next()
    }
})

export default router
