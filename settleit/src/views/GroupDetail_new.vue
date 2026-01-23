<script setup>
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import { 
  ArrowLeft, 
  Plus, 
  MoreVertical,
  Users,
  Trash2,
  Pencil,
  Utensils, 
  Car, 
  Home, 
  ShoppingBag,
  Tv,
  Stethoscope,
  BookOpen,
  Plane,
  Coffee,
  Receipt
} from 'lucide-vue-next'
import AddExpenseModal from '../components/AddExpenseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import EditGroupModal from '../components/EditGroupModal.vue'

const store = useAppStore()
const authStore = useAuthStore()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()

const showMembers = ref(false)
const showExpenseModal = ref(false)
const showGroupMenu = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const expenseToDelete = ref(null)
const newMemberEmail = ref('')

const addMember = async () => {
  if (!newMemberEmail.value) {
    toastStore.error('Please enter an email address')
    return
  }
  
  if (!group.value) {
    toastStore.error('Group not found')
    return
  }
  
  try {
    await store.inviteMemberByEmail(group.value.id, newMemberEmail.value)
    newMemberEmail.value = ''
  } catch (err) {
    console.error('[GroupDetail] Error adding member:', err)
  }
}

const deleteExpense = async (expenseId) => {
  expenseToDelete.value = expenseId
  showDeleteConfirm.value = true
}

const confirmDeleteExpense = async () => {
  if (expenseToDelete.value) {
    await store.deleteExpense(expenseToDelete.value)
    showDeleteConfirm.value = false
    expenseToDelete.value = null
  }
}

const handleUpdateGroup = async (data) => {
  if (!group.value) {
    toastStore.error('Group not found')
    return
  }
  
  try {
    await store.updateGroup(group.value.id, {
      name: data.name,
      description: data.description,
      slug: data.name.toLowerCase().replace(/\s+/g, '-')
    })
    showEditModal.value = false
    toastStore.success('Group updated successfully!')
  } catch (err) {
    console.error('[GroupDetail] Update group error:', err)
    toastStore.error('Failed to update group: ' + err.message)
  }
}

const handleDeleteGroup = async () => {
  showEditModal.value = false
  showDeleteConfirm.value = true
  expenseToDelete.value = null
}

const confirmDeleteGroup = async () => {
  if (!group.value) {
    toastStore.error('Group not found')
    return
  }
  
  try {
    await store.deleteGroup(group.value.id)
    showDeleteConfirm.value = false
    toastStore.success('Group deleted successfully!')
    router.push('/groups')
  } catch (err) {
    console.error('[GroupDetail] Delete group error:', err)
    toastStore.error('Failed to delete group: ' + err.message)
  }
}

onMounted(() => {
  const groupData = store.getGroupById(route.params.id)
  if (groupData) {
    store.subscribeToExpenses(groupData.id)
  }
})

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    const groupData = store.getGroupById(newId)
    if (groupData) {
      store.subscribeToExpenses(groupData.id)
    }
  }
})

const group = computed(() => store.getGroupById(route.params.id))
const expenses = computed(() => {
  if (!group.value) return []
  return store.getExpensesByGroup(group.value.id)
})

const totalSpent = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + (expense.amount || 0), 0)
})

const yourBalance = computed(() => {
  if (!group.value || !authStore.user) return 0
  
  const userId = authStore.user.uid
  const memberCount = group.value.members.length
  
  if (memberCount === 0) return 0
  
  const totalYouPaid = expenses.value
    .filter(e => e.paidBy === userId)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0)
  
  const yourTotalShare = expenses.value.reduce((sum, expense) => {
    if (expense.splitWith && expense.splitWith.includes(userId)) {
      return sum + (expense.amount / expense.splitWith.length)
    }
    return sum + (expense.amount / memberCount)
  }, 0)
  
  return totalYouPaid - yourTotalShare
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'food': return Utensils
    case 'coffee': return Coffee
    case 'groceries': return ShoppingBag
    case 'transport': return Car
    case 'utilities': return Home
    case 'entertainment': return Tv
    case 'health': return Stethoscope
    case 'education': return BookOpen
    case 'travel': return Plane
    default: return Receipt
  }
}

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'food': return 'food'
    case 'coffee': return 'coffee'
    case 'groceries': return 'groceries'
    case 'transport': return 'transport'
    case 'utilities': return 'utilities'
    case 'entertainment': return 'entertainment'
    case 'health': return 'health'
    case 'education': return 'education'
    case 'travel': return 'travel'
    default: return 'default'
  }
}

const getMemberName = (id) => group.value?.members.find(m => m.id === id)?.name || 'Unknown'
</script>
