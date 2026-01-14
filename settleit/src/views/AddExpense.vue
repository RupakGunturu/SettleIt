<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, 
  ChevronDown,
  Plus, 
  Trash2, 
  Receipt,
  Users,
  Tag,
  Calendar,
  Image as ImageIcon,
  Check,
  Bell,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-vue-next'

const store = useAppStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// --- State ---
const billName = ref('')
const selectedCategory = ref('Food')
const showCategoryDropdown = ref(false)
const items = ref([
  { id: Date.now(), name: '', quantity: 1, amount: null }
])

// New Features State
const isPersonal = ref(false)
const reminderDate = ref('')
const hasReminder = ref(false)
const documentUrl = ref('')
const isUploading = ref(false)

// Categories
const categories = [
  { id: 'Food', label: 'Dining', icon: '🍽️' },
  { id: 'Groceries', label: 'Groceries', icon: '🛒' },
  { id: 'Transport', label: 'Transport', icon: '🚕' },
  { id: 'Utilities', label: 'Utilities', icon: '⚡' },
  { id: 'Entertainment', label: 'Fun', icon: '🎉' },
  { id: 'Travel', label: 'Travel', icon: '✈️' },
  { id: 'Health', label: 'Health', icon: '💊' },
  { id: 'Other', label: 'Other', icon: '📦' }
]

// Group Logic
const groupId = ref(route.query.groupId || store.groups[0]?.id || '')
const selectedGroup = computed(() => store.getGroupById(groupId.value))
const members = computed(() => selectedGroup.value?.members || [])

// Split Logic (Default to all)
const splitMembers = ref([])

onMounted(async () => {
  if (store.groups.length === 0) {
    await store.fetchGroups()
  }
  
  const initialGroupId = route.query.groupId || store.groups[0]?.id
  if (initialGroupId) {
    groupId.value = initialGroupId
    // Default split with everyone
    splitMembers.value = [...(store.getGroupById(initialGroupId)?.memberIds || [])]
  }
})

// Watch personal toggle to reset group/split
watch(isPersonal, (val) => {
  if (val) {
    splitMembers.value = [authStore.user?.uid]
  } else {
    const initialGroupId = route.query.groupId || store.groups[0]?.id
    if (initialGroupId) {
      groupId.value = initialGroupId
      splitMembers.value = [...(store.getGroupById(initialGroupId)?.memberIds || [])]
    }
  }
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  isUploading.value = true
  // Simulate upload delay
  setTimeout(() => {
    documentUrl.value = 'https://firebasestorage.googleapis.com/v0/b/demo/o/receipts%2F' + file.name
    isUploading.value = false
  }, 1000)
}

// --- Actions ---

const addItem = () => {
  items.value.push({ id: Date.now(), name: '', quantity: 1, amount: null })
}

const removeItem = (id) => {
  if (items.value.length > 1) {
    items.value = items.value.filter(i => i.id !== id)
  }
}

const toggleMember = (memberId) => {
  if (splitMembers.value.includes(memberId)) {
    splitMembers.value = splitMembers.value.filter(id => id !== memberId)
  } else {
    splitMembers.value.push(memberId)
  }
}

const selectCategory = (catId) => {
  selectedCategory.value = catId
  showCategoryDropdown.value = false
}

// --- Computeds ---

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + (parseFloat(item.amount || 0) * (item.quantity || 1)), 0)
})

const currentCategoryIcon = computed(() => {
  return categories.find(c => c.id === selectedCategory.value)?.icon || '📦'
})

const handleSave = async () => {
  if (!billName.value || subtotal.value <= 0) return

  const expenseData = {
    description: billName.value,
    amount: subtotal.value,
    groupId: isPersonal.value ? null : groupId.value,
    date: new Date().toISOString(),
    category: selectedCategory.value,
    items: items.value.map(i => ({ ...i })),
    splitWith: isPersonal.value ? [authStore.user?.uid] : splitMembers.value,
    paidBy: authStore.user?.uid,
    reminderDate: hasReminder.value ? reminderDate.value : null,
    documentUrl: documentUrl.value,
    isPersonal: isPersonal.value
  }

  // Simulate API call
  await store.addExpense(expenseData)
  
  if (isPersonal.value) {
    router.push('/activity')
  } else {
    router.push(`/group/${groupId.value}`)
  }
}
</script>

<template>
  <div class="page-container">
    
    <header class="navbar">
      <div class="nav-content">
        <button class="icon-btn" @click="router.back()">
          <ArrowLeft :size="20" />
        </button>
        <h1 class="nav-title">New Expense</h1>
        <div class="w-10"></div> </div>
    </header>

    <main class="main-layout">
      
      <div class="form-panel">
        
        <section class="card type-card">
          <div class="flex items-center justify-between">
            <div class="type-info">
              <h3 class="text-lg font-bold">Personal Expense</h3>
              <p class="text-sm text-gray-500">Enable this if you don't want to split with anyone</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="isPersonal">
              <span class="slider round"></span>
            </label>
          </div>
        </section>

        <section class="card detail-card">
          <div class="input-group">
            <label class="label">Bill Description</label>
            <div class="input-wrapper large">
              <Receipt :size="20" class="input-icon" />
              <input 
                v-model="billName" 
                type="text" 
                placeholder="e.g. Dinner at Mario's" 
                class="text-input"
                autoFocus
              />
            </div>
          </div>

          <div class="row-group">
            <div class="input-group relative">
              <label class="label">Category</label>
              <button class="select-btn" @click="showCategoryDropdown = !showCategoryDropdown">
                <span class="cat-preview">{{ currentCategoryIcon }} {{ selectedCategory }}</span>
                <ChevronDown :size="16" />
              </button>

              <div v-if="showCategoryDropdown" class="dropdown-menu">
                <div 
                  v-for="cat in categories" 
                  :key="cat.id"
                  class="dropdown-item"
                  @click="selectCategory(cat.id)"
                >
                  <span>{{ cat.icon }} {{ cat.label }}</span>
                  <Check v-if="selectedCategory === cat.id" :size="14" class="text-indigo-600" />
                </div>
              </div>
            </div>

            <div class="input-group">
              <label class="label">Date</label>
              <div class="readonly-input">
                <Calendar :size="16" />
                <span>Today</span>
              </div>
            </div>
          </div>

          <div v-if="!isPersonal && store.groups.length > 0" class="input-group">
            <label class="label">Group</label>
            <div class="select-wrapper">
              <select v-model="groupId" class="native-select">
                <option v-for="g in store.groups" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
              <ChevronDown :size="16" class="select-arrow" />
            </div>
          </div>
        </section>

        <section v-if="!isPersonal" class="card">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <Users :size="18" class="text-indigo-600" />
              <h3>Split with</h3>
            </div>
            <span class="subtitle">{{ splitMembers.length }} selected</span>
          </div>

          <div class="members-grid">
            <button 
              v-for="member in members" 
              :key="member.id"
              class="member-chip"
              :class="{ active: splitMembers.includes(member.id) }"
              @click="toggleMember(member.id)"
            >
              <div class="avatar" :style="{ backgroundColor: member.color }">
                {{ member.name[0] }}
                <div v-if="splitMembers.includes(member.id)" class="check-badge">
                  <Check :size="10" />
                </div>
              </div>
              <span class="name">{{ member.id === authStore.user?.uid ? 'You' : member.name.split(' ')[0] }}</span>
            </button>
          </div>
        </section>

        <section class="card items-card">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <Tag :size="18" class="text-indigo-600" />
              <h3>Itemization</h3>
            </div>
            <button class="text-btn">
              <ImageIcon :size="16" />
              <span class="hidden sm:inline">Attach Receipt</span>
            </button>
          </div>

          <div class="items-list">
            <div v-for="(item, index) in items" :key="item.id" class="item-row">
              <div class="item-inputs">
                <input 
                  v-model="item.name" 
                  type="text" 
                  placeholder="Item name" 
                  class="item-name"
                >
                <div class="item-math">
                  <div class="qty-wrapper">
                    <span class="x">x</span>
                    <input v-model.number="item.quantity" type="number" min="1" class="item-qty">
                  </div>
                  <div class="price-wrapper">
                    <span class="currency">₹</span>
                    <input v-model.number="item.amount" type="number" placeholder="0" class="item-price">
                  </div>
                </div>
              </div>
              <button class="delete-btn" @click="removeItem(item.id)" title="Remove item">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <button class="add-item-btn" @click="addItem">
            <Plus :size="18" />
            <span>Add another item</span>
          </button>
        </section>

        <!-- Reminders & Documents -->
        <section class="card extra-card">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <Bell :size="18" class="text-indigo-600" />
              <h3>Reminder & Proof</h3>
            </div>
          </div>

          <div class="extra-options">
            <div class="input-group">
              <div class="flex items-center justify-between mb-2">
                <label class="label">Set Reminder</label>
                <label class="switch-sm">
                  <input type="checkbox" v-model="hasReminder">
                  <span class="slider round"></span>
                </label>
              </div>
              <input 
                v-if="hasReminder"
                v-model="reminderDate" 
                type="date" 
                class="native-select"
              />
            </div>

            <div class="divider-h"></div>

            <div class="input-group">
              <label class="label">Attach Receipt / Document</label>
              <div class="upload-area" :class="{ 'has-file': documentUrl }">
                <template v-if="!documentUrl && !isUploading">
                  <Upload :size="24" class="text-gray-400" />
                  <span>Click to upload doc</span>
                  <input type="file" @change="handleFileUpload" class="file-input">
                </template>
                <template v-else-if="isUploading">
                  <div class="loader-pulse"></div>
                  <span>Uploading...</span>
                </template>
                <template v-else>
                  <FileText :size="24" class="text-green-500" />
                  <span class="doc-name">Receipt Attached</span>
                  <button class="remove-doc" @click="documentUrl = ''">×</button>
                </template>
              </div>
            </div>
          </div>
        </section>

      </div>

      <aside class="summary-panel">
        <div class="sticky-wrapper">
          <div class="summary-card">
            <h3>Expense Summary</h3>
            
            <div class="summary-breakdown">
              <div class="breakdown-row">
                <span>Items ({{ items.length }})</span>
                <span>--</span>
              </div>
              <div class="breakdown-row">
                <span>Tax & Service</span>
                <span>₹0.00</span>
              </div>
              <div class="divider"></div>
              <div class="breakdown-row total">
                <span>Total Amount</span>
                <span class="total-val">₹{{ subtotal.toLocaleString('en-IN') }}</span>
              </div>
            </div>

            <div class="summary-footer">
              <div class="split-info">
                <span>{{ isPersonal ? 'Personal expense' : 'Splitting equally between' }}</span>
                <strong v-if="!isPersonal">{{ splitMembers.length }} people</strong>
              </div>
              <div class="per-person">
                ~ ₹{{ splitMembers.length ? (subtotal / splitMembers.length).toFixed(2) : 0 }} / person
              </div>
            </div>

            <button 
              class="primary-btn desktop-btn"
              :disabled="!billName || subtotal <= 0"
              @click="handleSave"
            >
              Create Expense
            </button>
          </div>
        </div>
      </aside>

    </main>

    <div class="mobile-footer">
      <div class="footer-content">
        <div class="footer-total">
          <span class="label">Total</span>
          <span class="value">₹{{ subtotal.toLocaleString('en-IN') }}</span>
        </div>
        <button 
          class="primary-btn mobile-btn"
          :disabled="!billName || subtotal <= 0"
          @click="handleSave"
        >
          Save
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Design Tokens --- */
:root {
  --primary: #4f46e5;
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --radius-lg: 16px;
  --radius-md: 12px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

* { box-sizing: border-box; }

.page-container {
  min-height: 100vh;
  background-color: var(--bg-app);
  font-family: 'Inter', system-ui, sans-serif;
  padding-bottom: 90px; /* Space for mobile footer */
}

/* --- Header --- */
.navbar {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-content {
  max-width: 1000px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}
@media (min-width: 768px) {
  .nav-content { padding: 0 1.5rem; }
}

.nav-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 8px;
  margin-left: -8px;
  border-radius: 50%;
  transition: background 0.2s;
}
.icon-btn:hover { background: #f1f5f9; color: var(--text-main); }

/* --- Layout --- */
.main-layout {
  max-width: 1000px;
  margin: 1rem auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .main-layout {
    margin: 2rem auto;
    padding: 0 1.5rem;
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 1.5fr 1fr; /* Form vs Summary */
    align-items: start;
  }
}

/* --- Left Panel --- */
.form-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}

/* Input Styling */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.input-group.relative { position: relative; }

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0 1rem;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-wrapper.large { padding: 0.25rem 1rem; }

.input-icon { color: var(--text-sub); }

.text-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: var(--text-main);
  outline: none;
  font-weight: 500;
}

.row-group {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 480px) {
  .row-group { grid-template-columns: 1fr 1fr; }
}

/* Category & Selects */
.select-btn, .readonly-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn:hover { background: #f1f5f9; }

.cat-preview, .readonly-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 20;
  padding: 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.1s;
}
.dropdown-item:hover { background: #f8fafc; }

/* Group Select */
.select-wrapper {
  position: relative;
}
.native-select {
  width: 100%;
  appearance: none;
  background: #f8fafc;
  border: 1px solid var(--border);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  outline: none;
  cursor: pointer;
}
.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-sub);
}

/* --- Split Section --- */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.section-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}
.subtitle {
  font-size: 0.75rem;
  color: var(--text-sub);
}

.members-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.member-chip {
  background: none;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: background 0.2s;
  min-width: 64px;
}
.member-chip:hover { background: #f8fafc; }
.member-chip.active { background: #eef2ff; border-color: #e0e7ff; }

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.member-chip.active .avatar { transform: scale(1.05); }

.check-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.name {
  font-size: 0.75rem;
  color: var(--text-sub);
  font-weight: 500;
}
.member-chip.active .name { color: var(--primary); font-weight: 700; }

/* --- Items Section --- */
.text-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.item-row:focus-within {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.item-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .item-inputs {
    flex-direction: row;
    align-items: center;
  }
}

.item-name {
  flex: 1;
  background: transparent;
  border: none;
  font-weight: 500;
  color: var(--text-main);
  outline: none;
  min-width: 0;
  padding: 4px 0;
}

.item-math {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-wrapper, .price-wrapper {
  background: white;
  border: 1px solid var(--border);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  height: 32px;
}

.item-qty { width: 30px; text-align: center; }
.item-price { width: 60px; text-align: right; }
.item-qty, .item-price {
  border: none;
  outline: none;
  font-size: 0.875rem;
  background: transparent;
  padding: 0;
}
.x, .currency { font-size: 0.75rem; color: var(--text-sub); }

.delete-btn {
  background: white;
  border: 1px solid var(--border);
  color: #ef4444;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.delete-btn:hover { background: #fee2e2; border-color: #fecaca; }

.add-item-btn {
  width: 100%;
  background: white;
  border: 1px dashed #cbd5e1;
  padding: 1rem;
  border-radius: 12px;
  color: var(--text-sub);
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}
.add-item-btn:hover {
  background: #f8fafc;
  border-color: var(--primary);
  color: var(--primary);
}

/* --- Right Panel (Summary) --- */
.summary-panel {
  display: none;
}

@media (min-width: 1024px) {
  .summary-panel {
    display: block;
    height: 100%;
  }
}

.sticky-wrapper {
  position: sticky;
  top: 100px;
}

.summary-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}

.summary-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.summary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-sub);
}

.breakdown-row.total {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  align-items: flex-end;
}

.divider { height: 1px; background: var(--border); border-style: dashed; }

.summary-footer {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
}
.split-info { color: var(--text-sub); margin-bottom: 0.25rem; }
.per-person { font-weight: 700; color: var(--primary); }

.primary-btn {
  width: 100%;
  background: var(--primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.primary-btn:hover { background: #4338ca; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.desktop-btn { display: none; }
@media (min-width: 1024px) {
  .desktop-btn { display: block; }
}

/* --- Mobile Footer --- */
.mobile-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--border);
  padding: 1rem 1.5rem;
  z-index: 100;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}

@media (min-width: 1024px) {
  .mobile-footer { display: none; }
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-total {
  display: flex;
  flex-direction: column;
}
.footer-total .label { font-size: 0.75rem; color: var(--text-sub); }
.footer-total .value { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }

.mobile-btn { flex: 1; padding: 0.75rem 1rem; }

/* --- Switch Toggle --- */
.switch, .switch-sm {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch-sm { width: 32px; height: 18px; }

.switch input, .switch-sm input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e1;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
}
.switch-sm .slider:before { height: 12px; width: 12px; left: 3px; bottom: 3px; }

input:checked + .slider { background-color: #4f46e5; }
input:checked + .slider:before { transform: translateX(20px); }
.switch-sm input:checked + .slider:before { transform: translateX(14px); }

.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

/* --- Upload Area --- */
.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #f1f5f9;
}

.upload-area.has-file {
  border-color: #10b981;
  background: #ecfdf5;
}

.upload-area span {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.file-input {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
}

.remove-doc {
  position: absolute;
  top: 8px; right: 8px;
  background: #ef4444;
  color: white;
  border: none;
  width: 20px; height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.loader-pulse {
  width: 20px; height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider-h {
  height: 1px;
  background: #f1f5f9;
  margin: 1rem 0;
}

.extra-card { margin-top: 1rem; }
.type-card { margin-bottom: 0.5rem; border-color: #e0e7ff; background: #f5f3ff; }
.type-info h3 { margin: 0; color: #4338ca; }
</style>