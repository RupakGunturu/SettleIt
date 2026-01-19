<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { 
  X, 
  ChevronDown,
  Plus, 
  Trash2, 
  Receipt,
  Users,
  Tag,
  Calendar,
  Check,
  Upload,
  FileText,
  QrCode,
  Scan
} from 'lucide-vue-next'
import ScannerModal from './ScannerModal.vue'

const props = defineProps({
  groupId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const store = useAppStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// --- State ---
const billName = ref('')
const selectedCategory = ref('Food')
const expenseDate = ref(new Date().toISOString().split('T')[0])
const showCategoryDropdown = ref(false)
const items = ref([
  { id: Date.now(), name: '', quantity: 1, amount: null }
])

const documentUrl = ref('')
const isUploading = ref(false)
const showScanner = ref(false)
const scannerMode = ref('qr')

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
const selectedGroup = computed(() => store.getGroupById(props.groupId))
const members = computed(() => selectedGroup.value?.members || [])

// Split Logic (Default to all members)
const splitMembers = ref([...(selectedGroup.value?.memberIds || [])])

// Watch for group changes
watch(() => props.groupId, (newGroupId) => {
  const group = store.getGroupById(newGroupId)
  if (group) {
    splitMembers.value = [...group.memberIds]
  }
}, { immediate: true })

// Watch for members changes to update split members
watch(() => selectedGroup.value?.members, (newMembers) => {
  if (newMembers && selectedGroup.value) {
    // Update splitMembers to include all current member IDs
    const currentMemberIds = selectedGroup.value.memberIds || []
    // Only update if there are new members
    if (currentMemberIds.length > splitMembers.value.length) {
      splitMembers.value = [...currentMemberIds]
      console.log('[AddExpenseModal] Members updated, split members refreshed:', splitMembers.value)
    }
  }
}, { deep: true })

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  isUploading.value = true
  setTimeout(() => {
    documentUrl.value = 'https://firebasestorage.googleapis.com/v0/b/demo/o/receipts%2F' + file.name
    isUploading.value = false
  }, 1000)
}

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

const subtotal = computed(() => {
  return items.value.reduce((sum, item) => sum + (parseFloat(item.amount || 0) * (item.quantity || 1)), 0)
})

const currentCategoryIcon = computed(() => {
  return categories.find(c => c.id === selectedCategory.value)?.icon || '📦'
})

const handleSave = async () => {
  if (!billName.value || subtotal.value <= 0) {
    toastStore.error('Please fill in all required fields')
    return
  }

  if (splitMembers.value.length === 0) {
    toastStore.error('Please select at least one member to split with')
    return
  }

  if (!selectedGroup.value) {
    toastStore.error('Group not found')
    return
  }

  console.log('[AddExpenseModal] Saving expense to group:', selectedGroup.value.id)

  const expenseData = {
    description: billName.value,
    amount: subtotal.value,
    groupId: selectedGroup.value.id,  // Use actual group ID, not the prop
    date: new Date(expenseDate.value).toISOString(),
    category: selectedCategory.value,
    items: items.value.map(i => ({ ...i })),
    splitWith: splitMembers.value,
    paidBy: authStore.user?.uid,
    documentUrl: documentUrl.value,
    isPersonal: false
  }

  console.log('[AddExpenseModal] Expense data:', expenseData)

  try {
    await store.addExpense(expenseData)
    emit('success')
    emit('close')
  } catch (err) {
    console.error('[AddExpenseModal] Error adding expense:', err)
    toastStore.error('Failed to add expense: ' + err.message)
  }
}

const openScanner = (mode) => {
  scannerMode.value = mode
  showScanner.value = true
}

const handleScanSuccess = (data) => {
  if (data.description && !billName.value) billName.value = data.description
  if (data.date) expenseDate.value = data.date
  
  if (data.items && data.items.length > 0) {
    items.value = data.items
    
    if (data.amount > 0) {
      const itemsTotal = items.value.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
      const diff = data.amount - itemsTotal
      
      if (diff > 1.0) { 
        items.value.push({
          id: Date.now() + 999,
          name: 'Tax / Other Charges',
          quantity: 1,
          amount: parseFloat(diff.toFixed(2))
        })
      }
    }
  } else if (data.amount) {
    items.value = [{ id: Date.now(), name: billName.value, quantity: 1, amount: data.amount }]
  }
  
  if (data.category) selectedCategory.value = data.category
  showScanner.value = false
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>Add Expense to {{ selectedGroup?.name }}</h2>
        <button class="close-btn" @click="emit('close')">
          <X :size="24" />
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Bill Description -->
        <section class="card">
          <div class="input-group">
            <label class="label">Bill Description</label>
            <div class="input-wrapper large">
              <Receipt :size="20" class="input-icon" />
              <input 
                v-model="billName" 
                type="text" 
                placeholder="e.g. Dinner at Mario's" 
                class="text-input"
                autofocus
              />
            </div>
            
            <!-- Scanner Buttons -->
            <div class="scanner-buttons">
              <button type="button" class="scanner-btn qr-btn" @click="openScanner('qr')">
                <QrCode :size="18" />
                <span>Scan QR</span>
              </button>
              <button type="button" class="scanner-btn ocr-btn" @click="openScanner('ocr')">
                <Scan :size="18" />
                <span>Scan Receipt</span>
              </button>
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
              <div class="input-wrapper">
                <Calendar :size="16" class="input-icon" />
                <input 
                  v-model="expenseDate" 
                  type="date" 
                  class="text-input"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Split With -->
        <section class="card">
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

        <!-- Itemization -->
        <section class="card">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <Tag :size="18" class="text-indigo-600" />
              <h3>Itemization</h3>
            </div>
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

        <!-- Attachments -->
        <section class="card">
          <div class="section-header">
            <div class="flex items-center gap-2">
              <Upload :size="18" class="text-indigo-600" />
              <h3>Attachments</h3>
            </div>
          </div>

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
        </section>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="summary-info">
          <div class="total-amount">
            <span class="label">Total:</span>
            <span class="value">₹{{ subtotal.toLocaleString('en-IN') }}</span>
          </div>
          <div class="per-person">
            ₹{{ splitMembers.length ? (subtotal / splitMembers.length).toFixed(2) : 0 }} per person
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
          <button 
            class="btn btn-primary"
            :disabled="!billName || subtotal <= 0"
            @click="handleSave"
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>

    <!-- Scanner Modal -->
    <ScannerModal 
      v-if="showScanner"
      :mode="scannerMode"
      @close="showScanner = false"
      @scan-success="handleScanSuccess"
    />
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .modal-footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.total-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-amount .label {
  font-size: 0.875rem;
  color: #64748b;
}

.total-amount .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #5025d1;
}

.per-person {
  font-size: 0.875rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #5025d1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4318b8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Reuse styles from AddExpense.vue */
.card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

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
  color: #0f172a;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 1rem;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #5025d1;
  box-shadow: 0 0 0 3px rgba(80, 37, 209, 0.1);
}

.input-wrapper.large { padding: 0.25rem 1rem; }

.input-icon { color: #64748b; }

.text-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #0f172a;
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

.select-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s;
}

.select-btn:hover { background: #f8fafc; }

.cat-preview {
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
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 20;
  padding: 0.5rem;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.text-indigo-600 {
  color: #5025d1;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.75rem;
}

.member-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.member-chip:hover {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.member-chip.active {
  border-color: #5025d1;
  background: #eef2ff;
}

.avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.check-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #0f172a;
  text-align: center;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.item-math {
  display: flex;
  gap: 0.5rem;
}

.qty-wrapper, .price-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.x, .currency {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.item-qty, .item-price {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  outline: none;
}

.delete-btn {
  background: #fee2e2;
  border: none;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fecaca;
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn:hover {
  border-color: #5025d1;
  color: #5025d1;
  background: #f8fafc;
}

.scanner-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.scanner-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border-radius: 8px;
  border: 2px solid;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
}

.qr-btn {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #5025d1;
}

.qr-btn:hover {
  background: #e0e7ff;
  border-color: #a5b4fc;
}

.ocr-btn {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #059669;
}

.ocr-btn:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
}

.upload-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #5025d1;
  background: #f8fafc;
}

.upload-area.has-file {
  border-color: #10b981;
  background: #ecfdf5;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.doc-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
}

.remove-doc {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-pulse {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #5025d1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-gray-400 {
  color: #9ca3af;
}

.text-green-500 {
  color: #10b981;
}
</style>
