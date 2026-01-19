<script setup>
import { useAppStore } from '../stores/app'
import { useToastStore } from '../stores/toast'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import { 
  ArrowLeft, 
  Plus, 
  Receipt, 
  CreditCard, 
  Filter, 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag,
  ChevronDown,
  Users,
  Trash2,
  Pencil,
  Tv,
  Stethoscope,
  BookOpen,
  Plane,
  Coffee,
  FileText
} from 'lucide-vue-next'
import AddExpenseModal from '../components/AddExpenseModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import EditGroupModal from '../components/EditGroupModal.vue'

const store = useAppStore()
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
  
  console.log('[GroupDetail] Adding member:', newMemberEmail.value, 'to group:', group.value.id)
  
  try {
    await store.inviteMemberByEmail(group.value.id, newMemberEmail.value)
    newMemberEmail.value = ''
  } catch (err) {
    console.error('[GroupDetail] Error adding member:', err)
    // Error toast is shown by the store
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
    console.log('[GroupDetail] Updating group:', group.value.id, data)
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
  expenseToDelete.value = null // Use this to distinguish group delete
}

const confirmDeleteGroup = async () => {
  if (!group.value) {
    toastStore.error('Group not found')
    return
  }
  
  try {
    console.log('[GroupDetail] Deleting group:', group.value.id)
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
    console.log('[GroupDetail] Mounted with group:', groupData.name, 'ID:', groupData.id)
    store.subscribeToExpenses(groupData.id)
  } else {
    console.error('[GroupDetail] Group not found for param:', route.params.id)
  }
})

// Watch for route changes (when navigating between different groups)
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    const groupData = store.getGroupById(newId)
    if (groupData) {
      console.log('[GroupDetail] Route changed, reloading group:', groupData.name, 'ID:', groupData.id)
      store.subscribeToExpenses(groupData.id)
    } else {
      console.error('[GroupDetail] Group not found for param:', newId)
    }
  }
})


const group = computed(() => store.getGroupById(route.params.id))
const expenses = computed(() => {
  // Use the actual group ID, not the route param (which might be a slug)
  if (!group.value) return []
  return store.getExpensesByGroup(group.value.id)
})

// Calculate total spent from actual expenses
const totalSpent = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + (expense.amount || 0), 0)
})

// Calculate user's share
const yourShare = computed(() => {
  if (!group.value || group.value.members.length === 0) return 0
  return totalSpent.value / group.value.members.length
})

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: group.value?.currency || currency,
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

const getMemberName = (id) => group.value?.members.find(m => m.id === id)?.name || 'Unknown'
const getMemberColor = (id) => group.value?.members.find(m => m.id === id)?.color || 'var(--primary)'
</script>

<template>
  <div v-if="group" class="group-detail">
    <header class="group-page-header">
      <button class="back-btn" @click="router.push('/groups')">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-content">
        <h1>{{ group.name }}</h1>
        <p>{{ group.description }}</p>
      </div>
      <div class="header-actions">
        <div class="menu-wrapper">
          <button class="btn btn-secondary dropdown-trigger" @click="showGroupMenu = !showGroupMenu">
            <span>Options</span>
            <ChevronDown :size="16" />
          </button>
          <div v-if="showGroupMenu" class="dropdown-menu" @click.stop>
            <button class="menu-item" @click="showEditModal = true; showGroupMenu = false">
              <Pencil :size="16" />
              <span>Edit Group</span>
            </button>
            <button class="menu-item danger" @click="handleDeleteGroup(); showGroupMenu = false">
              <Trash2 :size="16" />
              <span>Delete Group</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="group-actions">
      <div class="balance-summary glass-card">
        <div class="summary-item">
          <span class="label">Group Total</span>
          <span class="value">{{ formatCurrency(totalSpent || 0) }}</span>
        </div>
        <div class="divider"></div>
        <div class="summary-item">
          <span class="label">Your Share</span>
          <span class="value">{{ formatCurrency(yourShare || 0) }}</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-primary" @click="showExpenseModal = true">
          <Plus :size="20" />
          <span>Add Expense</span>
        </button>
        <button class="btn btn-secondary" @click="router.push(`/group/${group.id}/settle`)">
          <CreditCard :size="20" />
          <span>Settle Up</span>
        </button>
        <button class="btn btn-secondary" @click="showMembers = !showMembers">
          <Users :size="20" />
          <span>Members</span>
        </button>
      </div>
    </div>

    <!-- Members Section -->
    <transition name="slide">
      <section v-if="showMembers" class="members-section glass-card">
        <div class="section-header">
          <h3>Group Members</h3>
        </div>
        <div class="members-grid">
          <div v-for="member in group.members" :key="member.id" class="member-card">
            <div class="avatar" :style="{ backgroundColor: member.color }">
              {{ member.name[0] }}
            </div>
            <div class="member-info">
              <span class="name">{{ member.name }}</span>
              <span class="role">{{ member.id === group.createdBy ? 'Admin' : 'Member' }}</span>
            </div>
          </div>
          
          <div class="add-member-form">
            <input v-model="newMemberEmail" type="email" placeholder="friend@example.com">
            <button class="btn btn-primary btn-sm" @click="addMember">Add</button>
          </div>
        </div>
      </section>
    </transition>

    <section class="expenses-section">
      <div class="section-header">
        <div class="title-with-count">
          <h2>Group Ledger</h2>
          <span class="count-badge">{{ expenses.length }}</span>
        </div>
        <button class="filter-btn">
          <Filter :size="18" />
          <span>Filter</span>
        </button>
      </div>

      <div class="expenses-list">
        <div 
          v-for="expense in expenses" 
          :key="expense.id" 
          class="expense-item glass-card"
        >
          <div class="expense-icon" :class="expense.category.toLowerCase()">
            <component :is="getCategoryIcon(expense.category)" :size="20" />
          </div>
          
          <div class="expense-info">
            <h4 class="expense-desc">{{ expense.description }}</h4>
            <p class="expense-meta">
                Paid by <span class="payer" :style="{ color: getMemberColor(expense.paidBy) }">{{ getMemberName(expense.paidBy) }}</span> 
                • {{ new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                <span v-if="expense.documentUrl" class="doc-badge-inline" title="Has receipt">
                  <FileText :size="10" />
                  Doc
                </span>
              </p>
          </div>
          
          <div class="expense-amount-box">
            <span class="expense-amount">{{ formatCurrency(expense.amount) }}</span>
            <span class="your-share">Your share: {{ formatCurrency(expense.amount / group.members.length) }}</span>
          </div>

          <div class="expense-actions">
            <button class="icon-btn-sm" @click="deleteExpense(expense.id)">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        
        <div v-if="expenses.length === 0" class="empty-state glass-card">
          <p>No expenses found. Time to add some!</p>
        </div>
      </div>
    </section>

    <!-- Add Expense Modal -->
    <AddExpenseModal 
      v-if="showExpenseModal"
      :group-id="route.params.id"
      @close="showExpenseModal = false"
      @success="showExpenseModal = false"
    />

    <!-- Edit Group Modal -->
    <EditGroupModal
      v-if="showEditModal"
      :group="group"
      @close="showEditModal = false"
      @update="handleUpdateGroup"
      @delete="handleDeleteGroup"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      :title="expenseToDelete ? 'Delete Expense?' : 'Delete Group?'"
      :message="expenseToDelete ? 'Are you sure you want to delete this expense? This action cannot be undone.' : 'Are you sure you want to delete this group? All expenses and data will be permanently removed.'"
      confirm-text="Delete"
      type="danger"
      @confirm="expenseToDelete ? confirmDeleteExpense() : confirmDeleteGroup()"
      @cancel="showDeleteConfirm = false; expenseToDelete = null"
    />
  </div>
  <div v-else class="loading">
    <p>Loading group details...</p>
  </div>
</template>

<style scoped>
.group-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.group-page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  margin: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.back-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #e2e8f0;
  transform: translateX(-3px);
}

.header-content {
  flex: 1;
}

.header-content h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #0f172a;
  font-weight: 700;
}

.header-content p {
  color: #64748b;
  font-size: 0.9375rem;
}

.header-actions .btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #0f172a;
}

.header-actions .btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.menu-wrapper {
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem !important;
  font-size: 0.875rem;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  min-width: 180px;
  z-index: 50;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: #fef2f2;
}


.group-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .group-actions {
    flex-direction: row;
    align-items: stretch;
    gap: 1.5rem;
  }
}

.balance-summary {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  flex: 1;
}

.summary-item .label {
  font-size: 0.8125rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.summary-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.divider {
  width: 1px;
  height: 50px;
  background: #e2e8f0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .action-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

.action-buttons .btn {
  flex: 1;
  justify-content: center;
  padding: 0.875rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.action-buttons .btn-primary {
  background: #5025d1;
  border: none;
  color: white;
}

.action-buttons .btn-primary:hover {
  background: #4318b8;
  transform: translateY(-1px);
}

.action-buttons .btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #0f172a;
}

.action-buttons .btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title-with-count {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.count-badge {
  background: var(--surface-light);
  color: var(--text-muted);
  padding: 0.125rem 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.expenses-section {
  padding: 0 1rem;
}

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.expense-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #e2e8f0;
}

.expense-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-light);
  color: var(--text-muted);
}

.expense-icon.food { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
.expense-icon.coffee { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.expense-icon.groceries { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.expense-icon.transport { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.expense-icon.utilities { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.expense-icon.entertainment { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.expense-icon.health { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
.expense-icon.education { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.expense-icon.travel { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }

.expense-info {
  flex: 1;
}

.expense-desc {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.expense-meta {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.payer {
  font-weight: 500;
}

.expense-amount-box {
  text-align: right;
}

.expense-amount {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.your-share {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.icon-only {
  width: 40px;
  height: 40px;
  padding: 0;
}
/* Members Section Styles */
.members-section {
  padding: 1.5rem;
  margin-top: -1rem;
}

.members-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 12px;
}

.member-card .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8125rem;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-info .name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.member-info .role {
  font-size: 0.75rem;
  color: #94a3b8;
}

.add-member-form {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.add-member-form input {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  font-size: 0.875rem;
}

.btn-sm {
  height: 38px;
  padding: 0 1.25rem;
  font-size: 0.8125rem;
}

/* Transitions */
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.doc-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #10b981;
  background: #10b98110;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 0.5rem;
  vertical-align: middle;
}
</style>
