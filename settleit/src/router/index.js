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
            component: () => import('../views/Groups.vue')
        },
        {
            path: '/about',
            name: 'About',
            component: () => import('../views/About.vue'),
            meta: { public: true }
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Wait for auth to initialize if it's still loading
    if (authStore.loading) {
        // We can't use await here because authStore.init() is usually called in App.vue
        // and onAuthStateChanged is async. We need a way to wait for loading to be false.
    }

    // A better approach for the guard:
    const checkAuth = () => {
        const isAuthenticated = !!authStore.user
        if (!to.meta.public && !isAuthenticated) {
            next({ name: 'Login' })
        } else if (to.name === 'Login' && isAuthenticated) {
            next({ name: 'Dashboard' })
        } else {
            next()
        }
    }

    if (authStore.loading) {
        // Simple polling/watch-like mechanism for the guard
        const unwatch = authStore.$subscribe((mutation, state) => {
            if (!state.loading) {
                unwatch()
                checkAuth()
            }
        })
    } else {
        checkAuth()
    }
})

export default router
