<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useToastStore } from '../stores/toast'
import { useRoute, useRouter } from 'vue-router'
import { calculateSettlements } from '../utils/calculator'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-vue-next'

const store = useAppStore()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()

const group = computed(() => store.getGroupById(route.params.id))
const expenses = computed(() => store.getExpensesByGroup(route.params.id))

const settlements = computed(() => {
  if (!group.value) return []
  return calculateSettlements(group.value.members, expenses.value)
})

const getMemberName = (id) => group.value?.members.find(m => m.id === id)?.name || 'Unknown'
const getMemberColor = (id) => group.value?.members.find(m => m.id === id)?.color || 'var(--primary)'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: group.value?.currency || 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const settleTransaction = async (tx) => {
  try {
    await store.addExpense({
      groupId: group.value.id,
      description: `Settlement: ${getMemberName(tx.from)} paid ${getMemberName(tx.to)}`,
      amount: tx.amount,
      paidBy: tx.from,
      date: new Date().toISOString(),
      category: 'Settlement',
      splitMethod: 'custom',
      splitWith: [tx.to],
      splitData: { [tx.to]: tx.amount },
      isSettlement: true
    })
    toastStore.success('Transaction marked as settled!')
    await store.fetchExpensesByGroup(group.value.id)
  } catch (err) {
    toastStore.error('Error settling transaction')
  }
}
</script>

<template>
  <div v-if="group" class="settle-up-page">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="20" />
      </button>
      <h1>Settle Up</h1>
    </header>

    <div class="settlement-card glass-card">
      <div v-if="settlements.length > 0" class="settlements-list">
        <h3>Balances to settle</h3>
        <p class="subtitle">Here is the most efficient way to settle all debts in {{ group.name }}</p>

        <div v-for="(tx, index) in settlements" :key="index" class="transaction-item">
          <div class="party from">
            <div class="avatar" :style="{ backgroundColor: getMemberColor(tx.from) }">
              {{ getMemberName(tx.from)[0] }}
            </div>
            <span class="name">{{ getMemberName(tx.from) }}</span>
          </div>

          <div class="arrow-box">
            <span class="amount">{{ formatCurrency(tx.amount) }}</span>
            <div class="arrow">
              <ArrowRight :size="16" />
            </div>
          </div>

          <div class="party to">
            <div class="avatar" :style="{ backgroundColor: getMemberColor(tx.to) }">
              {{ getMemberName(tx.to)[0] }}
            </div>
            <span class="name">{{ getMemberName(tx.to) }}</span>
          </div>
          
          <button class="btn-check" @click="settleTransaction(tx)">
            <CheckCircle2 :size="20" />
          </button>
        </div>
      </div>

      <div v-else class="all-settled">
        <div class="success-icon">
          <CheckCircle2 :size="64" />
        </div>
        <h2>Everyone is settled!</h2>
        <p>No transactions needed. Great work!</p>
        <button class="btn btn-primary" @click="router.push(`/group/${group.id || group.slug}`)">
          Back to Group
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settle-up-page {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
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
}

.settlement-card {
  padding: 2.5rem;
}

.settlements-list h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  margin-bottom: 2.5rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: var(--surface);
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid var(--glass-border);
}

.party {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.125rem;
}

.name {
  font-size: 0.875rem;
  font-weight: 500;
}

.arrow-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.amount {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary-light);
}

.arrow {
  height: 2px;
  background: var(--glass-border);
  width: 60%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-check {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s ease;
  margin-left: 1rem;
}

.btn-check:hover {
  color: var(--success);
}

.all-settled {
  text-align: center;
  padding: 2rem 0;
}

.success-icon {
  color: var(--success);
  margin-bottom: 1.5rem;
}

.all-settled h2 {
  margin-bottom: 0.5rem;
}

.all-settled p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}
</style>
