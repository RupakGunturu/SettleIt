<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  X, 
  Check, 
  ChevronRight,
  Info,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()
const route = useRoute()

const step = ref(1) // 1: Amount/Desc, 2: Splitting
const form = ref({
  description: '',
  amount: null,
  groupId: store.groups[0]?.id || '',
  paidBy: 'u1', // Default to current user
  date: new Date().toISOString().split('T')[0],
  category: 'Food',
  splitMethod: 'equal' // equal, percentage, custom
})

const selectedGroup = computed(() => store.getGroupById(form.value.groupId))
const members = computed(() => selectedGroup.value?.members || [])

const categories = [
  { id: 'Food', color: 'var(--secondary)' },
  { id: 'Transport', color: 'var(--accent)' },
  { id: 'Utilities', color: 'var(--primary)' },
  { id: 'Shopping', color: '#8b5cf6' },
  { id: 'Entertainment', color: '#10b981' },
  { id: 'Other', color: '#64748b' }
]

const nextStep = () => {
  if (form.value.description && form.value.amount > 0) {
    step.value = 2
  }
}

const saveExpense = () => {
  store.addExpense({
    ...form.value,
    amount: parseFloat(form.value.amount)
  })
  router.push(`/group/${form.value.groupId}`)
}
</script>

<template>
  <div class="add-expense-page">
    <header class="page-header">
      <button class="back-btn" @click="step === 1 ? router.back() : step = 1">
        <ArrowLeft :size="20" />
      </button>
      <h1>Add New Expense</h1>
    </header>

    <div class="stepper">
      <div v-for="s in [1, 2]" :key="s" class="step" :class="{ active: step >= s }">
        <div class="step-num">{{ s }}</div>
        <div v-if="s < 2" class="step-line" :class="{ active: step > s }"></div>
      </div>
    </div>

    <div v-if="step === 1" class="step-container glass-card">
      <div class="form-group">
        <label>What was it for?</label>
        <div class="input-with-icon">
          <Tag class="icon" :size="20" />
          <input 
            v-model="form.description" 
            type="text" 
            placeholder="e.g. Dinner at Joey's" 
            autofocus
          />
        </div>
      </div>

      <div class="form-group">
        <label>How much?</label>
        <div class="input-with-icon amount">
          <DollarSign class="icon" :size="24" />
          <input 
            v-model="form.amount" 
            type="number" 
            placeholder="0.00" 
            step="0.01"
          />
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Pick a Group</label>
          <select v-model="form.groupId">
            <option v-for="group in store.groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Category</label>
          <div class="category-grid">
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              class="cat-chip"
              :class="{ active: form.category === cat.id }"
              :style="{ '--cat-color': cat.color }"
              @click="form.category = cat.id"
            >
              {{ cat.id }}
            </button>
          </div>
        </div>
      </div>

      <button 
        class="btn btn-primary next-btn" 
        :disabled="!form.description || !form.amount"
        @click="nextStep"
      >
        <span>Next</span>
        <ChevronRight :size="20" />
      </button>
    </div>

    <div v-else class="step-container glass-card">
      <div class="split-header">
        <h3>Splitting: {{ form.description }}</h3>
        <p class="amount-summary">{{ form.amount }} {{ selectedGroup?.currency }}</p>
      </div>

      <div class="split-methods">
        <button 
          class="method-btn" 
          :class="{ active: form.splitMethod === 'equal' }"
          @click="form.splitMethod = 'equal'"
        >
          <span class="icon">=</span>
          <span>Equally</span>
        </button>
        <button 
          class="method-btn" 
          :class="{ active: form.splitMethod === 'percentage' }"
          @click="form.splitMethod = 'percentage'"
        >
          <span class="icon">%</span>
          <span>By %</span>
        </button>
      </div>

      <div class="members-split-list">
        <div v-for="member in members" :key="member.id" class="split-item">
          <div class="member-info">
            <div class="avatar" :style="{ backgroundColor: member.color }">
              {{ member.name[0] }}
            </div>
            <span>{{ member.name }}</span>
          </div>
          
          <div v-if="form.splitMethod === 'equal'" class="share-info">
            {{ (form.amount / members.length).toFixed(2) }}
          </div>
          <div v-else class="share-input">
            <input type="number" placeholder="0" class="mini-input">
            <span v-if="form.splitMethod === 'percentage'">%</span>
          </div>
        </div>
      </div>

      <div class="summary-box">
        <Info :size="16" />
        <p v-if="form.splitMethod === 'equal'">
          Everyone will pay an equal share of {{ (form.amount / members.length).toFixed(2) }}
        </p>
        <p v-else>
          Enter the percentages for each member.
        </p>
      </div>

      <button class="btn btn-primary next-btn" @click="saveExpense">
        <Check :size="20" />
        <span>Save Expense</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.add-expense-page {
  max-width: 600px;
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

.stepper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  margin-bottom: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-num {
  background: var(--primary);
  color: white;
}

.step-line {
  width: 60px;
  height: 2px;
  background: var(--surface-light);
}

.step-line.active {
  background: var(--primary);
}

.step-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.input-with-icon input {
  padding-left: 3rem;
  font-size: 1.125rem;
}

.input-with-icon.amount input {
  font-size: 2rem;
  font-weight: 700;
  padding-left: 3.5rem;
  height: 80px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.cat-chip {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass);
  color: var(--text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.cat-chip:hover {
  background: var(--glass-border);
}

.cat-chip.active {
  background: var(--cat-color);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.next-btn {
  width: 100%;
  height: 56px;
  font-size: 1.125rem;
}

/* Split View Styles */
.split-header {
  text-align: center;
}

.amount-summary {
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary);
  margin-top: 0.5rem;
}

.split-methods {
  display: flex;
  gap: 0.75rem;
}

.method-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
}

.method-btn.active {
  background: var(--surface-light);
  color: white;
  border-color: var(--primary);
}

.members-split-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.split-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid var(--glass-border);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.mini-input {
  width: 60px;
  padding: 0.5rem;
  text-align: right;
}

.summary-box {
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--primary-light);
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
