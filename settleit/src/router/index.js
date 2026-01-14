import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Landing',
            component: () => import('../views/Landing.vue'),
            meta: { public: true }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue')
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/Login.vue'),
            meta: { public: true }
        },
        {
            path: '/signup',
            name: 'Signup',
            component: () => import('../views/Login.vue'),
            meta: { public: true }
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
            component: () => import('../views/Groups.vue')
        },
        {
            path: '/activity',
            name: 'Activity',
            component: () => import('../views/Activity.vue')
        },
        {
            path: '/about',
            name: 'About',
            component: () => import('../views/About.vue'),
            meta: { public: true }
        },
        // Fallback for malformed group routes
        {
            path: '/group/:pathMatch(.*)*',
            redirect: '/groups'
        }
    ]
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Wait for auth to initialize if it's still loading
    if (authStore.loading) {
        await new Promise((resolve) => {
            const stop = authStore.$subscribe((mutation, state) => {
                if (!state.loading) {
                    stop()
                    resolve()
                }
            })
            // Safety timeout
            setTimeout(resolve, 5000)
        })
    }

    const isAuthenticated = !!authStore.user

    if (!to.meta.public && !isAuthenticated) {
        return { name: 'Login' }
    }

    if ((to.name === 'Login' || to.name === 'Signup') && isAuthenticated) {
        return { name: 'Dashboard' }
    }

    return true
})

export default router
