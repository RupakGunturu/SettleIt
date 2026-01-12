import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { dataService } from '../services/dataService'
import { useAuthStore } from './auth'

export const useAppStore = defineStore('app', () => {
    const authStore = useAuthStore()
    const groups = ref([])
    const expenses = ref([])
    const loading = ref(false)

    const fetchGroups = async () => {
        if (!authStore.user) return
        loading.value = true
        try {
            groups.value = await dataService.getGroups(authStore.user.uid)
        } finally {
            loading.value = false
        }
    }

    const fetchExpensesByGroup = async (groupId) => {
        loading.value = true
        try {
            expenses.value = await dataService.getExpenses(groupId)
        } finally {
            loading.value = false
        }
    }

    // Watch for auth state changes to fetch data
    // Moved below function definitions to avoid hoisting issues
    watch(() => authStore.user, async (newUser) => {
        if (newUser) {
            await fetchGroups()
        } else {
            groups.value = []
            expenses.value = []
        }
    }, { immediate: true })

    const getGroupById = (id) => groups.value.find(g => g.id === id)
    const getExpensesByGroup = (groupId) => expenses.value.filter(e => e.groupId === groupId)

    const addExpense = async (expense) => {
        const newExpense = await dataService.addExpense(expense)
        expenses.value.push(newExpense)

        // Refresh group to update totalSpent or handle it optimistically
        await fetchGroups()
    }

    const createGroup = async (groupName, description) => {
        if (!authStore.user) return
        const newGroup = await dataService.createGroup({
            name: groupName,
            description,
            memberIds: [authStore.user.uid],
            members: [{ id: authStore.user.uid, name: authStore.user.displayName || 'Me', color: '#6366f1' }],
            totalSpent: 0,
            currency: 'USD',
            createdBy: authStore.user.uid,
            createdAt: new Date().toISOString()
        })
        groups.value.push(newGroup)
        return newGroup
    }

    return {
        groups,
        expenses,
        loading,
        fetchGroups,
        fetchExpensesByGroup,
        getGroupById,
        getExpensesByGroup,
        addExpense,
        createGroup
    }
})
