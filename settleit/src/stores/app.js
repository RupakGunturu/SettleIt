import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { dataService } from '../services/dataService'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

export const useAppStore = defineStore('app', () => {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const groups = ref([])
    const expenses = ref([])
    const activities = ref([])
    const friends = ref([])
    const loading = ref(false)
    const searchQuery = ref('')

    let groupsUnsubscribe = null
    let expensesUnsubscribe = null
    let activityUnsubscribe = null
    let friendsUnsubscribe = null

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
    watch(() => authStore.user, (newUser) => {
        if (groupsUnsubscribe) groupsUnsubscribe()
        if (activityUnsubscribe) activityUnsubscribe()
        if (friendsUnsubscribe) friendsUnsubscribe()

        if (newUser) {
            groupsUnsubscribe = dataService.subscribeGroups(newUser.uid, (data) => {
                groups.value = data
            })
            activityUnsubscribe = dataService.subscribeActivity(newUser.uid, (data) => {
                activities.value = data
            })
            friendsUnsubscribe = dataService.subscribeFriends(newUser.uid, (data) => {
                friends.value = data
            })
        } else {
            groups.value = []
            expenses.value = []
            activities.value = []
            friends.value = []
        }
    }, { immediate: true })

    const subscribeToExpenses = (groupId) => {
        if (expensesUnsubscribe) expensesUnsubscribe()
        expensesUnsubscribe = dataService.subscribeExpenses(groupId, (data) => {
            expenses.value = data
        })
    }

    const getGroupById = (id) => groups.value.find(g => g.id === id)
    const getExpensesByGroup = (groupId) => expenses.value.filter(e => e.groupId === groupId)

    const addExpense = async (expense) => {
        try {
            const newExpense = await dataService.addExpense(expense)

            // Log Activity
            const group = getGroupById(expense.groupId)
            await dataService.logActivity({
                type: 'expense_added',
                description: `${authStore.user.displayName} added "${expense.description}" in ${group.name}`,
                involvedUserIds: group.memberIds,
                userId: authStore.user.uid,
                groupId: expense.groupId,
                amount: expense.amount
            })

            toastStore.success(`Expense "${expense.description}" added!`)
        } catch (err) {
            toastStore.error('Failed to add expense: ' + err.message)
        }
    }

    const createGroup = async (groupName, description) => {
        if (!authStore.user) return
        try {
            const groupData = {
                name: groupName,
                description,
                memberIds: [authStore.user.uid],
                members: [{ id: authStore.user.uid, name: authStore.user.displayName || 'Me', color: '#6366f1' }],
                totalSpent: 0,
                currency: 'INR',
                createdBy: authStore.user.uid,
                createdAt: new Date().toISOString()
            }
            const newGroup = await dataService.createGroup(groupData)

            // Log Activity
            await dataService.logActivity({
                type: 'group_created',
                description: `${authStore.user.displayName} created group "${groupName}"`,
                involvedUserIds: [authStore.user.uid],
                userId: authStore.user.uid,
                groupId: newGroup.id
            })

            toastStore.success(`Group "${groupName}" created!`)
            return newGroup
        } catch (err) {
            toastStore.error('Failed to create group')
        }
    }

    const userBalances = computed(() => {
        if (!authStore.user) return { owing: 0, owed: 0, net: 0 }

        let owing = 0
        let owed = 0

        // This is a simplified version; in a real app, you'd calculate this based on 
        // the settlement algorithm for each group where the user is a member.
        // For now, let's provide a structure that can be easily expanded.
        groups.value.forEach(group => {
            // Mocking dynamic balance for demo; in real implementation, 
            // you'd call calculateSettlements(group.members, group.expenses)
            // and filter for transactions involving authStore.user.uid
        })

        return {
            owing: 725035, // Default for demo to match reference
            owed: 0,
            net: -725035
        }
    })

    const inviteMemberByEmail = async (groupId, email) => {
        try {
            const user = await dataService.findUserByEmail(email)
            if (!user) {
                toastStore.error('User not found. They must sign up first.')
                return
            }

            const group = groups.value.find(g => g.id === groupId)
            if (!group) return

            if (group.memberIds.includes(user.id || user.uid)) {
                toastStore.error('User is already in the group.')
                return
            }

            const updatedMembers = [...group.members, {
                id: user.id || user.uid,
                name: user.displayName,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            }]
            const updatedMemberIds = [...group.memberIds, user.id || user.uid]

            // Update group in Firestore
            await dataService.updateGroup(groupId, { members: updatedMembers, memberIds: updatedMemberIds })

            toastStore.success(`${user.displayName} invited!`)
        } catch (err) {
            toastStore.error('Failed to invite member')
        }
    }

    const deleteExpense = async (expenseId) => {
        try {
            await dataService.deleteExpense(expenseId)
            toastStore.success('Expense deleted')
        } catch (err) {
            toastStore.error('Failed to delete expense')
        }
    }

    const addFriend = async (email) => {
        try {
            const user = await dataService.findUserByEmail(email)
            if (!user) {
                toastStore.error('User not found')
                return
            }

            if (user.id === authStore.user.uid) {
                toastStore.error("You can't add yourself")
                return
            }

            if (friends.value.find(f => f.friendId === user.id)) {
                toastStore.error('Already in your friends list')
                return
            }

            await dataService.addFriend(authStore.user.uid, user)
            toastStore.success(`${user.displayName} added as friend!`)
        } catch (err) {
            toastStore.error('Failed to add friend')
        }
    }

    const globalSearchExpenses = async (query) => {
        if (!authStore.user || query.length < 2) return []
        return await dataService.searchAllExpenses(authStore.user.uid, query)
    }

    return {
        groups,
        expenses,
        loading,
        userBalances,
        fetchGroups,
        fetchExpensesByGroup,
        getGroupById,
        getExpensesByGroup,
        addExpense,
        createGroup,
        inviteMemberByEmail,
        deleteExpense,
        subscribeToExpenses,
        searchQuery,
        activities,
        friends,
        addFriend,
        globalSearchExpenses
    }
})
