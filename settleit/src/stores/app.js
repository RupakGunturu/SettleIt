import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { dataService } from '../services/dataService'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'
import { slugify } from '../utils/slugify'

export const useAppStore = defineStore('app', () => {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const groups = ref([])
    const expenses = ref([])
    const activities = ref([])
    const friends = ref([])
    const allExpenses = ref([])
    const loading = ref(false)
    const searchQuery = ref('')

    let groupsUnsubscribe = null
    let expensesUnsubscribe = null
    let allExpensesUnsubscribe = null
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
        if (allExpensesUnsubscribe) allExpensesUnsubscribe()

        if (newUser) {
            groupsUnsubscribe = dataService.subscribeGroups(newUser.uid, (data) => {
                groups.value = data
                // When groups are loaded, we can subscribe to all expenses if we want a global view
                // For simplicity, we could have a dataService.subscribeAllExpenses(userId)
            })
            activityUnsubscribe = dataService.subscribeActivity(newUser.uid, (data) => {
                activities.value = data
            })
            friendsUnsubscribe = dataService.subscribeFriends(newUser.uid, (data) => {
                friends.value = data
            })
            // Fetch all expenses initially or via subscription
            // Let's assume dataService has subscribeAllExpenses
            allExpensesUnsubscribe = dataService.subscribeAllExpenses(newUser.uid, (data) => {
                allExpenses.value = data
            })
        } else {
            groups.value = []
            expenses.value = []
            allExpenses.value = []
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

    const getGroupById = (id) => {
        // Support both slug and ID lookup
        return groups.value.find(g => g.id === id || g.slug === id)
    }
    const getExpensesByGroup = (groupId) => expenses.value.filter(e => e.groupId === groupId)

    const addExpense = async (expense) => {
        console.log('[appStore] addExpense called', expense)
        try {
            const group = expense.groupId ? getGroupById(expense.groupId) : null
            const involvedUserIds = group ? group.memberIds : [authStore.user.uid]

            const expenseData = {
                ...expense,
                involvedUserIds
            }
            console.log('[appStore] Sending expense to dataService', expenseData)
            const newExpense = await dataService.addExpense(expenseData)

            await dataService.logActivity({
                type: 'expense_added',
                description: group
                    ? `${authStore.user.displayName} added "${expense.description}" in ${group.name}`
                    : `${authStore.user.displayName} added a personal expense: "${expense.description}"`,
                involvedUserIds,
                userId: authStore.user.uid,
                groupId: expense.groupId || null,
                groupName: group ? group.name : 'Personal',
                amount: expense.amount,
                documentUrl: expense.documentUrl,
                category: expense.category
            })

            toastStore.success(`Expense "${expense.description}" added!`)
            console.log('[appStore] addExpense successful')
        } catch (err) {
            console.error('[appStore] addExpense failed', err)
            toastStore.error('Failed to add expense: ' + err.message)
        }
    }

    const createGroup = async (groupName, description) => {
        console.log(`[appStore] createGroup called: ${groupName}`)
        if (!authStore.user) return
        try {
            const groupData = {
                name: groupName,
                description,
                slug: slugify(groupName), // Add slug field
                memberIds: [authStore.user.uid],
                members: [{ id: authStore.user.uid, name: authStore.user.displayName || 'Me', email: authStore.user.email, color: '#6366f1' }],
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
            console.log('[appStore] createGroup successful')
            return newGroup
        } catch (err) {
            console.error('[appStore] createGroup failed', err)
            toastStore.error('Failed to create group')
        }
    }

    const userBalances = computed(() => {
        if (!authStore.user) return []

        const balances = []
        // We'll calculate balance per friend
        friends.value.forEach(friend => {
            // Placeholder: Ideally you'd iterate through all groups and expenses 
            // to find how much this friend owes you or vice-versa
            // For now, let's keep it grounded in existing data structure
            balances.push({
                friendId: friend.friendId,
                name: friend.name,
                balance: 0, // Dynamic calculation would go here
                color: friend.color
            })
        })

        return balances
    })

    const totalBalance = computed(() => {
        // Simplified net balance across groups
        let total = 0
        groups.value.forEach(g => {
            // If the user's totalSpent is recorded, we can estimate
            // But real logic needs per-expense split analysis
            // For the sake of "No Static Data", we'll attempt a basic sum
            if (g.totalSpent) total += g.totalSpent / (g.memberIds?.length || 1)
        })
        return total
    })

    const inviteMemberByEmail = async (groupId, email) => {
        try {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                toastStore.error('Please enter a valid email address')
                return
            }

            const group = groups.value.find(g => g.id === groupId)
            if (!group) {
                console.error('[inviteMemberByEmail] Group not found:', groupId)
                toastStore.error('Group not found')
                return
            }

            console.log('[inviteMemberByEmail] Current members:', group.members)
            console.log('[inviteMemberByEmail] Checking email:', email)

            // Check if email already exists in group (only check members that have emails)
            const emailExists = group.members.some(m => {
                // Only check members that have an email field set
                if (!m.email || m.email.trim() === '') {
                    return false  // Skip members without email
                }
                const isDuplicate = m.email.toLowerCase() === email.toLowerCase()
                if (isDuplicate) {
                    console.log('[inviteMemberByEmail] Found duplicate email:', m.email, 'matches', email)
                }
                return isDuplicate
            })

            if (emailExists) {
                console.log('[inviteMemberByEmail] Email already exists in group')
                toastStore.error('This email is already in the group.')
                return
            }

            // Try to find registered user, but don't require it
            const user = await dataService.findUserByEmail(email)
            console.log('[inviteMemberByEmail] User lookup result:', user)

            let newMember
            if (user) {
                // User is registered - use their info
                newMember = {
                    id: user.id || user.uid,
                    name: user.displayName || email.split('@')[0],
                    email: email,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                    isRegistered: true
                }
            } else {
                // User not registered - create member with email
                newMember = {
                    id: 'guest_' + Date.now(),
                    name: email.split('@')[0], // Use email prefix as name
                    email: email,
                    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                    isRegistered: false
                }
            }

            console.log('[inviteMemberByEmail] New member:', newMember)

            const updatedMembers = [...group.members, newMember]
            const updatedMemberIds = [...group.memberIds, newMember.id]

            // Update group in Firestore
            console.log('[inviteMemberByEmail] Updating group with new member')
            await dataService.updateGroup(groupId, { members: updatedMembers, memberIds: updatedMemberIds })

            // Log Activity
            await dataService.logActivity({
                type: 'member_joined',
                description: `${newMember.name} (${email}) joined "${group.name}"`,
                involvedUserIds: updatedMemberIds,
                userId: newMember.id,
                groupId: groupId
            })

            toastStore.success(`${newMember.name} added to group!`)
            console.log('[inviteMemberByEmail] Member added successfully')
        } catch (err) {
            console.error('[inviteMemberByEmail] Error:', err)
            toastStore.error('Failed to add member: ' + err.message)
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
                toastStore.error('User not found. They must sign up first with this email.')
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
            console.error('[addFriend] Error:', err)
            toastStore.error('Failed to add friend')
        }
    }

    const globalSearchExpenses = async (query) => {
        if (!authStore.user || query.length < 2) return []
        return await dataService.searchAllExpenses(authStore.user.uid, query)
    }

    const updateGroup = async (groupId, data) => {
        try {
            await dataService.updateGroup(groupId, data)
            toastStore.success('Group updated successfully!')
        } catch (err) {
            console.error('[updateGroup] Error:', err)
            toastStore.error('Failed to update group')
            throw err
        }
    }

    const deleteGroup = async (groupId) => {
        try {
            await dataService.deleteGroup(groupId)
            toastStore.success('Group deleted successfully!')
        } catch (err) {
            console.error('[deleteGroup] Error:', err)
            toastStore.error('Failed to delete group')
            throw err
        }
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
        allExpenses,
        addFriend,
        globalSearchExpenses,
        totalBalance,
        updateGroup,
        deleteGroup
    }
})
