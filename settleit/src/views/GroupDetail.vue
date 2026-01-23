<script setup>
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import { 
  ArrowLeft, Plus, MoreVertical, Users, Trash2, Pencil,
  Utensils, Car, Home, ShoppingBag, Tv, Stethoscope,
  BookOpen, Plane, Coffee, Receipt
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

// All existing functions preserved
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

onMounted(async () => {
  console.log('[GroupDetail] Component mounted, route param:', route.params.id)
  
  // Wait for groups to load if they haven't yet
  let attempts = 0
  while (store.groups.length === 0 && attempts < 50) {
    console.log('[GroupDetail] Waiting for groups to load... attempt', attempts + 1)
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }
  
  if (store.groups.length === 0) {
    console.error('[GroupDetail] Groups failed to load after 5 seconds')
    return
  }
  
  const groupData = store.getGroupById(route.params.id)
  if (groupData) {
    console.log('[GroupDetail] Group found:', groupData.name, 'ID:', groupData.id)
    store.subscribeToExpenses(groupData.id)
  } else {
    console.error('[GroupDetail] Group not found for param:', route.params.id)
  }
})

watch(() => route.params.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    console.log('[GroupDetail] Route changed to:', newId)
    
    // Wait for groups to load if they haven't yet
    let attempts = 0
    while (store.groups.length === 0 && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    const groupData = store.getGroupById(newId)
    if (groupData) {
      console.log('[GroupDetail] Reloading group:', groupData.name)
      store.subscribeToExpenses(groupData.id)
    } else {
      console.error('[GroupDetail] Group not found for param:', newId)
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
  const icons = {
    food: Utensils, coffee: Coffee, groceries: ShoppingBag,
    transport: Car, utilities: Home, entertainment: Tv,
    health: Stethoscope, education: BookOpen, travel: Plane
  }
  return icons[category?.toLowerCase()] || Receipt
}

const getCategoryColor = (category) => category?.toLowerCase() || 'default'

const getMemberName = (id) => group.value?.members.find(m => m.id === id)?.name || 'Unknown'
</script>

<template>
  <div v-if="group" class="modern-group-detail">
    <!-- Modern Header -->
    <header class="modern-header">
      <button class="icon-btn" @click="router.push('/groups')">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-title">
        <h1>{{ group.name }}</h1>
        <p v-if="group.description">{{ group.description }}</p>
      </div>
      <button class="icon-btn" @click="showGroupMenu = !showGroupMenu">
        <MoreVertical :size="20" />
      </button>
      
      <div v-if="showGroupMenu" class="dropdown-overlay" @click="showGroupMenu = false">
        <div class="dropdown-content" @click.stop>
          <button class="dropdown-item" @click="showEditModal = true; showGroupMenu = false">
            <Pencil :size="18" />
            <span>Edit Group</span>
          </button>
          <button class="dropdown-item" @click="showMembers = true; showGroupMenu = false">
            <Users :size="18" />
            <span>Manage Members</span>
          </button>
          <button class="dropdown-item danger" @click="handleDeleteGroup(); showGroupMenu = false">
            <Trash2 :size="18" />
            <span>Delete Group</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Balance Cards -->
    <div class="balance-cards">
      <div class="balance-card">
        <span class="balance-label">Group Total</span>
        <span class="balance-value">{{ formatCurrency(totalSpent) }}</span>
      </div>
      
      <div class="balance-card">
        <span class="balance-label">{{ yourBalance >= 0 ? 'You are owed' : 'You owe' }}</span>
        <span class="balance-value" :class="{ 'positive': yourBalance > 0, 'negative': yourBalance < 0, 'settled': yourBalance === 0 }">
          {{ formatCurrency(Math.abs(yourBalance)) }}
        </span>
      </div>
    </div>

    <!-- Expenses List -->
    <div class="expenses-section">
      <div class="section-header">
        <h2>Transactions</h2>
        <span class="expense-count">{{ expenses.length }}</span>
      </div>

      <div class="expenses-list">
        <div v-for="expense in expenses" :key="expense.id" class="expense-card">
          <div class="expense-icon" :class="getCategoryColor(expense.category)">
            <component :is="getCategoryIcon(expense.category)" :size="20" />
          </div>
          
          <div class="expense-details">
            <h3>{{ expense.description }}</h3>
            <p class="expense-meta">
              Paid by {{ getMemberName(expense.paidBy) }} • 
              {{ new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
            </p>
          </div>
          
          <div class="expense-amount-section">
            <span class="expense-amount">{{ formatCurrency(expense.amount) }}</span>
            <button class="delete-icon-btn" @click="deleteExpense(expense.id)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        
        <div v-if="expenses.length === 0" class="empty-state">
          <Receipt :size="48" class="empty-icon" />
          <p>No expenses yet</p>
          <span>Add your first expense to get started</span>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" @click="showExpenseModal = true">
      <Plus :size="24" />
    </button>

    <!-- Members Modal -->
    <transition name="modal">
      <div v-if="showMembers" class="modal-overlay" @click="showMembers = false">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <h3>Group Members</h3>
            <button class="close-btn" @click="showMembers = false">×</button>
          </div>
          
          <div class="members-list">
            <div v-for="member in group.members" :key="member.id" class="member-item">
              <div class="member-avatar" :style="{ backgroundColor: member.color }">
                {{ member.name[0] }}
              </div>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.id === group.createdBy ? 'Admin' : 'Member' }}</span>
              </div>
            </div>
          </div>
          
          <div class="add-member-section">
            <input v-model="newMemberEmail" type="email" placeholder="Enter email to add member" class="member-input">
            <button class="add-member-btn" @click="addMember">Add</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Existing Modals -->
    <AddExpenseModal 
      v-if="showExpenseModal"
      :group-id="group.id"
      @close="showExpenseModal = false"
      @success="showExpenseModal = false"
    />

    <EditGroupModal
      v-if="showEditModal"
      :group="group"
      @close="showEditModal = false"
      @update="handleUpdateGroup"
      @delete="handleDeleteGroup"
    />

    <ConfirmModal
      v-if="showDeleteConfirm"
      :title="expenseToDelete ? 'Delete Expense?' : 'Delete Group?'"
      :message="expenseToDelete ? 'Are you sure you want to delete this expense?' : 'Are you sure you want to delete this group? All expenses will be removed.'"
      confirm-text="Delete"
      type="danger"
      @confirm="expenseToDelete ? confirmDeleteExpense() : confirmDeleteGroup()"
      @cancel="showDeleteConfirm = false; expenseToDelete = null"
    />
  </div>
  <div v-else class="loading">
    <p>Loading...</p>
  </div>
</template>

<style scoped>
.modern-group-detail {
  min-height: 100vh;
  background: #F9FAFB;
  padding: 1rem;
  padding-bottom: 100px;
}

.modern-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.icon-btn:hover {
  background: white;
  transform: scale(1.05);
}

.header-title {
  flex: 1;
  min-width: 0;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-title p {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0.25rem 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
}

.dropdown-content {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border-radius: 16px;
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 101;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: #F3F4F6;
}

.dropdown-item.danger {
  color: #EF4444;
}

.dropdown-item.danger:hover {
  background: #FEF2F2;
}

.balance-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 640px) {
  .balance-cards {
    grid-template-columns: 1fr;
  }
}

.balance-card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.balance-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.balance-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
}

.balance-value.positive { color: #10B981; }
.balance-value.negative { color: #EF4444; }
.balance-value.settled { color: #6B7280; }

.expenses-section {
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.expense-count {
  background: #F3F4F6;
  color: #6B7280;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.expense-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 16px;
  transition: all 0.2s;
}

.expense-card:hover {
  background: #F3F4F6;
  transform: translateX(4px);
}

.expense-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.expense-icon.food { background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); }
.expense-icon.coffee { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); }
.expense-icon.groceries { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); }
.expense-icon.transport { background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); }
.expense-icon.utilities { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
.expense-icon.entertainment { background: linear-gradient(135deg, #EF4444 0%, #F87171 100%); }
.expense-icon.health { background: linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%); }
.expense-icon.education { background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); }
.expense-icon.travel { background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%); }
.expense-icon.default { background: linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%); }

.expense-details {
  flex: 1;
  min-width: 0;
}

.expense-details h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-meta {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin: 0;
}

.expense-amount-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.expense-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  white-space: nowrap;
}

.delete-icon-btn {
  background: transparent;
  border: none;
  color: #EF4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0.6;
}

.delete-icon-btn:hover {
  opacity: 1;
  background: #FEF2F2;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9CA3AF;
}

.empty-icon {
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1rem;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 0.5rem 0;
}

.empty-state span {
  font-size: 0.875rem;
  color: #9CA3AF;
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
  transition: all 0.3s;
  z-index: 50;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5);
}

.fab:active {
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .fab {
    bottom: 2rem;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #F3F4F6;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F3F4F6;
  border: none;
  font-size: 1.5rem;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #E5E7EB;
}

.members-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1F2937;
}

.member-role {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.add-member-section {
  padding: 1.5rem;
  border-top: 1px solid #F3F4F6;
  display: flex;
  gap: 0.75rem;
}

.member-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;
}

.member-input:focus {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.add-member-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-member-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.9) translateY(20px);
}

.loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
}
</style>
