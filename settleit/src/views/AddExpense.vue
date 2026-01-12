<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  ChevronRight,
  HelpCircle,
  Plus,
  Trash2,
  Coffee,
  Utensils,
  ShoppingBag,
  Camera,
  Music
} from 'lucide-vue-next'

const store = useAppStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const billName = ref('')
const selectedCategory = ref('Coffee')
const items = ref([
  { id: Date.now(), name: '', quantity: 1, amount: null }
])

const categories = [
  { id: 'Coffee', icon: Coffee },
  { id: 'Food', icon: Utensils },
  { id: 'Shopping', icon: ShoppingBag },
  { id: 'Music', icon: Music },
  { id: 'Other', icon: Camera }
]

// Default to first group if none specified
// Default to first group or route param
const groupId = ref(route.query.groupId || store.groups[0]?.id || '')
const selectedGroup = computed(() => store.getGroupById(groupId.value))
const members = computed(() => selectedGroup.value?.members || [])

// Split tracking
const splitMembers = ref([])

onMounted(async () => {
  if (store.groups.length === 0) {
    await store.fetchGroups()
  }
  
  const initialGroupId = route.query.groupId || store.groups[0]?.id
  if (initialGroupId) {
    groupId.value = initialGroupId
    splitMembers.value = [...(store.getGroupById(initialGroupId)?.memberIds || [])]
  }
})

const addItem = () => {
  items.value.push({ id: Date.now(), name: '', quantity: 1, amount: null })
}

const removeItem = (id) => {
  if (items.value.length > 1) {
    items.value = items.value.filter(i => i.id !== id)
  }
}

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + (parseFloat(item.amount || 0) * (item.quantity || 1)), 0)
})

const toggleMember = (memberId) => {
  if (splitMembers.value.includes(memberId)) {
    splitMembers.value = splitMembers.value.filter(id => id !== memberId)
  } else {
    splitMembers.value.push(memberId)
  }
}

const handleNext = async () => {
  if (!billName.value || subtotal.value <= 0) return

  const expenseData = {
    description: billName.value,
    amount: subtotal.value,
    groupId: groupId.value,
    date: new Date().toISOString(),
    category: selectedCategory.value,
    items: items.value.map(i => ({ ...i })),
    splitWith: splitMembers.value,
    paidBy: authStore.user?.uid
  }

  await store.addExpense(expenseData)
  router.push(`/group/${groupId.value}`)
}
</script>

<template>
  <div class="add-bill-page">
    <header class="header">
      <button class="icon-btn" @click="router.back()">
        <ArrowLeft :size="20" />
      </button>
      <h2>Split The Bill</h2>
      <button class="icon-btn">
        <HelpCircle :size="20" />
      </button>
    </header>

    <div class="form-content">
      <!-- Bill Name -->
      <div class="input-section">
        <label>Bill Name</label>
        <input 
          v-model="billName" 
          type="text" 
          placeholder="e.g. Ever gathering" 
          class="main-input"
        />
      </div>

      <!-- Category -->
      <div class="input-section">
        <label>Category</label>
        <div class="category-selector" @click="showCategoryList = !showCategoryList">
          <div class="selected-cat">
            <span class="cat-icon">☕</span>
            <span>{{ selectedCategory }}</span>
          </div>
          <ChevronRight :size="20" class="chevron" />
        </div>
      </div>

      <!-- Select Group -->
      <div v-if="store.groups.length > 1" class="input-section">
        <label>Select Group</label>
        <select v-model="groupId" class="main-input">
          <option v-for="g in store.groups" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>

      <!-- Split With -->
      <div class="input-section">
        <label>Split With</label>
        <div class="members-list">
          <div 
            v-for="member in members" 
            :key="member.id"
            class="member-chip"
            :class="{ active: splitMembers.includes(member.id) }"
            @click="toggleMember(member.id)"
          >
            <div class="avatar" :style="{ backgroundColor: member.color }">
              {{ member.name[0] }}
            </div>
            <span>{{ member.id === authStore.user?.uid ? 'You' : member.name }}</span>
            <div v-if="splitMembers.includes(member.id)" class="remove-dot">✓</div>
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="items-section">
        <div class="section-header">
          <label>Item</label>
          <button class="add-img-btn">
            <Plus :size="14" />
            <span>Add image</span>
          </button>
        </div>

        <div class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row glass-card">
            <div class="item-main">
              <input v-model="item.name" type="text" placeholder="Item name" class="item-name-input">
              <button class="delete-btn" @click="removeItem(item.id)"><Trash2 :size="16" /></button>
            </div>
            <div class="item-details">
              <div class="qty-input">
                <input v-model.number="item.quantity" type="number" min="1">
              </div>
              <div class="currency-label">₹</div>
              <div class="amount-input">
                <input v-model.number="item.amount" type="number" placeholder="0.00">
              </div>
            </div>
          </div>
          
          <button class="add-item-btn" @click="addItem">
            Add new Item
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-section">
        <label>Summary</label>
        <div class="summary-row">
          <span>Sub Total</span>
          <span class="subtotal-val">₹ {{ subtotal.toLocaleString('en-IN') }}</span>
        </div>
      </div>
    </div>

    <!-- Footer Action -->
    <footer class="footer">
      <button 
        class="next-btn" 
        :disabled="!billName || subtotal <= 0"
        @click="handleNext"
      >
        Next
      </button>
    </footer>
  </div>
</template>

<style scoped>
.add-bill-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  gap: 1.5rem;
  padding-bottom: 100px;
  max-width: 500px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.header h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.icon-btn {
  background: white;
  border: 1px solid #e2e8f0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-section label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.main-input {
  background: white;
  border: 1px solid #f1f5f9;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
}

.category-selector {
  background: white;
  border: 1px solid #f1f5f9;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.selected-cat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
}

.cat-icon {
  font-size: 1.25rem;
}

.chevron {
  color: #94a3b8;
}

.members-list {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: none;
}

.members-list::-webkit-scrollbar { display: none; }

.member-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
  position: relative;
  cursor: pointer;
}

.member-chip .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.member-chip.active .avatar {
  border-color: #5025d1;
}

.remove-dot {
  position: absolute;
  top: -2px;
  right: 5px;
  background: #f1f5f9;
  color: #ef4444;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  border: 2px solid white;
}

.member-chip span {
  font-size: 0.75rem;
  color: #64748b;
}

.avatar.dashed {
  border: 1.5px dashed #cbd5e1;
  background: transparent;
  color: #94a3b8;
}

.items-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.items-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-section .section-header label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.add-img-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: pointer;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-row {
  background: white;
  padding: 1rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name-input {
  border: none;
  background: none;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  padding: 0;
}

.delete-btn {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
}

.item-details {
  display: grid;
  grid-template-columns: 60px 40px 1fr;
  align-items: center;
  gap: 0.5rem;
}

.qty-input input {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.currency-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  text-align: center;
}

.amount-input input {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 700;
}

.add-item-btn {
  background: white;
  border: 1px solid #f1f5f9;
  padding: 1rem;
  border-radius: 14px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-section label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
}

.subtotal-val {
  font-weight: 700;
  color: #0f172a;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  z-index: 100;
}

.next-btn {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  display: block;
  background: #5025d1;
  color: white;
  border: none;
  height: 56px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Adjust for Laptop View */
@media (min-width: 768px) {
  .footer {
    position: relative;
    padding: 0;
    border: none;
    background: none;
  }
}
</style>
