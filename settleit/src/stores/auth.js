import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { authService } from '../services/authService'
import { isConfigured } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const loading = ref(true)

    const init = () => {
        authService.onAuthStateChanged((firebaseUser) => {
            user.value = firebaseUser
            loading.value = false
        })
    }

    const register = async (email, password, name) => {
        const newUser = await authService.register(email, password, name)
        user.value = newUser
    }

    const login = async (email, password) => {
        const loggedInUser = await authService.login(email, password)
        user.value = loggedInUser
    }

    const logout = async () => {
        await authService.logout()
        user.value = null
    }

    const initDemoSession = () => {
        user.value = {
            uid: 'guest_user',
            displayName: 'Guest Explorer',
            email: 'guest@example.com'
        }
    }

    return {
        user,
        loading,
        isConfigured,
        init,
        register,
        login,
        logout,
        initDemoSession
    }
})
