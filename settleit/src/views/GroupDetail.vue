<script setup>
import { useAppStore } from '../stores/app'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
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
  MoreVertical,
  Users,
  Trash2,
  Tv,
  Stethoscope,
  BookOpen,
  Plane,
  Coffee,
  FileText
} from 'lucide-vue-next'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const showMembers = ref(false)
const newMemberEmail = ref('')

const addMember = async () => {
  if (!newMemberEmail.value) return
  try {
    await store.inviteMemberByEmail(route.params.id, newMemberEmail.value)
    newMemberEmail.value = ''
    alert('Member added successfully!')
  } catch (err) {
    alert(err.message)
  }
}

const deleteExpense = async (expenseId) => {
  if (confirm('Are you sure you want to delete this expense?')) {
    await store.deleteExpense(expenseId)
  }
}

onMounted(() => {
  if (route.params.id) {
    store.subscribeToExpenses(route.params.id)
  }
})

const group = computed(() => store.getGroupById(route.params.id))
const expenses = computed(() => store.getExpensesByGroup(route.params.id))

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
      <button class="back-btn" @click="router.push('/')">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-content">
        <h1>{{ group.name }}</h1>
        <p>{{ group.description }}</p>
      </div>
      <button class="btn btn-secondary icon-only">
        <MoreVertical :size="20" />
      </button>
    </header>

    <div class="group-actions">
      <div class="balance-summary glass-card">
        <div class="summary-item">
          <span class="label">Group Total</span>
          <span class="value">{{ formatCurrency(group.totalSpent) }}</span>
        </div>
        <div class="divider"></div>
        <div class="summary-item">
          <span class="label">Your Share</span>
          <span class="value">{{ formatCurrency(group.totalSpent / group.members.length) }}</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-primary" @click="router.push('/add-expense')">
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
  </div>
  <div v-else class="loading">
    <p>Loading group details...</p>
  </div>
</template>

<style scoped>
.group-detail {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.group-page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: var(--glass-border);
  transform: translateX(-3px);
}

.header-content h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.header-content p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.group-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .group-actions {
    flex-direction: row;
    align-items: stretch;
  }
}

.balance-summary {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.summary-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-item .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.divider {
  width: 1px;
  height: 40px;
  background: var(--glass-border);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-buttons .btn {
  flex: 1;
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

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expense-item {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.expense-item:hover {
  transform: scale(1.01);
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
