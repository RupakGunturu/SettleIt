<script setup>
import { useAppStore } from '../stores/app'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
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
  MoreVertical
} from 'lucide-vue-next'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  if (route.params.id) {
    await store.fetchExpensesByGroup(route.params.id)
  }
})

const group = computed(() => store.getGroupById(route.params.id))
const expenses = computed(() => store.getExpensesByGroup(route.params.id))

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: group.value?.currency || currency
  }).format(amount)
}

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'food': return Utensils
    case 'transport': return Car
    case 'utilities': return Home
    case 'shopping': return ShoppingBag
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
      </div>
    </div>

    <section class="expenses-section">
      <div class="section-header">
        <div class="title-with-count">
          <h2>Expenses</h2>
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
            </p>
          </div>
          
          <div class="expense-amount-box">
            <span class="expense-amount">{{ formatCurrency(expense.amount) }}</span>
            <span class="your-share">Your share: {{ formatCurrency(expense.amount / group.members.length) }}</span>
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

.expense-icon.food { background: rgba(236, 72, 153, 0.1); color: var(--secondary); }
.expense-icon.transport { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
.expense-icon.utilities { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

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
</style>
