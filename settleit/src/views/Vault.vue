<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChevronLeft,
  Plus,
  FileText,
  CreditCard,
  Shield,
  Award,
  Home,
  X,
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-vue-next'

const router = useRouter()

// State
const vaultItems = ref([
  {
    id: 1,
    name: 'Health Insurance',
    category: 'Insurance',
    expiryDate: '2025-03-15',
    documentUrl: 'https://example.com/health-insurance.pdf',
    notes: 'Policy number: HI-2024-001'
  },
  {
    id: 2,
    name: 'Passport',
    category: 'ID',
    expiryDate: '2028-06-20',
    documentUrl: '',
    notes: 'Keep safe copy'
  }
])

const showAddModal = ref(false)
const newItem = ref({
  name: '',
  category: 'Insurance',
  expiryDate: '',
  documentUrl: '',
  notes: ''
})

const categories = [
  { id: 'Insurance', label: 'Insurance', icon: Shield, color: '#6366f1' },
  { id: 'ID', label: 'ID Cards', icon: CreditCard, color: '#10b981' },
  { id: 'Warranty', label: 'Warranties', icon: Award, color: '#f59e0b' },
  { id: 'Property', label: 'Property', icon: Home, color: '#ec4899' },
  { id: 'Other', label: 'Other', icon: FileText, color: '#64748b' }
]

const getCategoryIcon = (categoryId) => {
  return categories.find(c => c.id === categoryId)?.icon || FileText
}

const getCategoryColor = (categoryId) => {
  return categories.find(c => c.id === categoryId)?.color || '#64748b'
}

const getExpiryStatus = (date) => {
  if (!date) return 'none'
  const today = new Date()
  const expiry = new Date(date)
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'warning'
  return 'valid'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'No expiry'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const groupedItems = computed(() => {
  const grouped = {}
  categories.forEach(cat => {
    grouped[cat.id] = vaultItems.value.filter(item => item.category === cat.id)
  })
  return grouped
})

const handleAddItem = () => {
  if (!newItem.value.name) return
  
  vaultItems.value.push({
    id: Date.now(),
    ...newItem.value
  })
  
  showAddModal.value = false
  newItem.value = {
    name: '',
    category: 'Insurance',
    expiryDate: '',
    documentUrl: '',
    notes: ''
  }
}

const deleteItem = (id) => {
  vaultItems.value = vaultItems.value.filter(item => item.id !== id)
}
</script>

<template>
  <div class="vault-container">
    
    <header class="vault-header">
      <div class="header-left">
        <button class="back-btn" @click="router.back()">
          <ChevronLeft :size="22" />
        </button>
        <div>
          <h1>Document Vault</h1>
          <p class="subtitle">Your important documents in one secure place</p>
        </div>
      </div>
      
      <button class="primary-btn" @click="showAddModal = true">
        <Plus :size="18" />
        <span>Add Document</span>
      </button>
    </header>

    <main class="vault-content">
      
      <div v-for="category in categories" :key="category.id" class="category-section">
        <div v-if="groupedItems[category.id].length > 0">
          <div class="category-header">
            <div class="cat-icon" :style="{ backgroundColor: category.color + '1A', color: category.color }">
              <component :is="category.icon" :size="20" />
            </div>
            <h2>{{ category.label }}</h2>
            <span class="count">{{ groupedItems[category.id].length }}</span>
          </div>

          <div class="items-grid">
            <div v-for="item in groupedItems[category.id]" :key="item.id" class="vault-card">
              <div class="card-header">
                <h3>{{ item.name }}</h3>
                <button class="delete-btn" @click="deleteItem(item.id)" title="Delete">
                  <X :size="16" />
                </button>
              </div>

              <div class="card-body">
                <div class="info-row">
                  <Calendar :size="14" />
                  <span class="label">Expires:</span>
                  <span class="value">{{ formatDate(item.expiryDate) }}</span>
                </div>

                <div v-if="item.notes" class="info-row notes">
                  <FileText :size="14" />
                  <span class="notes-text">{{ item.notes }}</span>
                </div>

                <div v-if="item.documentUrl" class="doc-link">
                  <a :href="item.documentUrl" target="_blank" rel="noopener">
                    <FileText :size="14" />
                    View Document
                  </a>
                </div>
              </div>

              <div class="card-footer">
                <div 
                  class="status-badge" 
                  :class="getExpiryStatus(item.expiryDate)"
                >
                  <component 
                    :is="getExpiryStatus(item.expiryDate) === 'expired' ? AlertCircle : getExpiryStatus(item.expiryDate) === 'warning' ? Clock : CheckCircle" 
                    :size="12" 
                  />
                  <span v-if="getExpiryStatus(item.expiryDate) === 'expired'">Expired</span>
                  <span v-else-if="getExpiryStatus(item.expiryDate) === 'warning'">Expiring Soon</span>
                  <span v-else-if="getExpiryStatus(item.expiryDate) === 'valid'">Valid</span>
                  <span v-else>No Expiry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="vaultItems.length === 0" class="empty-state">
        <Shield :size="64" class="empty-icon" />
        <h3>Your vault is empty</h3>
        <p>Start adding your important documents for safekeeping</p>
        <button class="primary-btn" @click="showAddModal = true">
          <Plus :size="18" />
          Add First Document
        </button>
      </div>

    </main>

    <!-- Add Item Modal -->
    <transition name="fade">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="modal-panel">
          <div class="modal-header">
            <h2>Add Document</h2>
            <button class="close-btn" @click="showAddModal = false">
              <X :size="24" />
            </button>
          </div>

          <div class="modal-body">
            <div class="input-group">
              <label>Document Name *</label>
              <input 
                v-model="newItem.name" 
                type="text" 
                placeholder="e.g., Health Insurance"
                required
              >
            </div>

            <div class="input-group">
              <label>Category</label>
              <select v-model="newItem.category">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <div class="input-group">
              <label>Expiry Date</label>
              <input 
                v-model="newItem.expiryDate" 
                type="date"
              >
            </div>

            <div class="input-group">
              <label>Document URL (Optional)</label>
              <input 
                v-model="newItem.documentUrl" 
                type="url" 
                placeholder="https://..."
              >
            </div>

            <div class="input-group">
              <label>Notes</label>
              <textarea 
                v-model="newItem.notes" 
                rows="3" 
                placeholder="Add any important notes..."
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="text-btn" @click="showAddModal = false">Cancel</button>
            <button 
              class="primary-btn" 
              :disabled="!newItem.name"
              @click="handleAddItem"
            >
              <Plus :size="18" />
              Add Document
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
:root {
  --primary: #4f46e5;
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}

.vault-container {
  min-height: 100vh;
  background-color: var(--bg-app);
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

/* Header */
.vault-header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

@media (min-width: 768px) {
  .vault-header {
    padding: 1.5rem 2rem;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .header-left {
    gap: 1rem;
  }
}

.back-btn {
  background: white;
  border: 1px solid var(--border);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-app);
  border-color: var(--primary);
  color: var(--primary);
}

.vault-header h1 { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: var(--text-main); 
}

@media (min-width: 768px) {
  .vault-header h1 {
    font-size: 1.5rem;
  }
}

.subtitle { 
  font-size: 0.8125rem; 
  color: var(--text-sub); 
  margin-top: 0.25rem; 
  display: none;
}

@media (min-width: 768px) {
  .subtitle {
    display: block;
    font-size: 0.875rem;
  }
}

.primary-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover { background: #4338ca; }
.primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Content */
.vault-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.cat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-header h2 { font-size: 1.125rem; font-weight: 700; color: var(--text-main); flex: 1; }
.count { font-size: 0.875rem; font-weight: 600; color: var(--text-sub); }

.items-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .items-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .items-grid { grid-template-columns: repeat(3, 1fr); }
}

.vault-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: box-shadow 0.2s;
}

.vault-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h3 { font-size: 1rem; font-weight: 700; color: var(--text-main); flex: 1; }

.delete-btn {
  background: #fef2f2;
  color: var(--danger);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-body { display: flex; flex-direction: column; gap: 0.75rem; }

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-sub);
}

.info-row .label { font-weight: 500; }
.info-row .value { color: var(--text-main); font-weight: 600; }

.notes { flex-direction: column; align-items: flex-start; }
.notes-text { color: var(--text-main); line-height: 1.4; }

.doc-link a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

.card-footer { margin-top: auto; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.valid { background: #ecfdf5; color: var(--success); }
.status-badge.warning { background: #fffbeb; color: var(--warning); }
.status-badge.expired { background: #fef2f2; color: var(--danger); }
.status-badge.none { background: #f8fafc; color: var(--text-sub); }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon { color: #cbd5e1; }
.empty-state h3 { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
.empty-state p { color: var(--text-sub); }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-panel {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
.close-btn { background: none; border: none; color: var(--text-sub); cursor: pointer; }

.modal-body { display: flex; flex-direction: column; gap: 1.5rem; }

.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group label { font-weight: 600; font-size: 0.875rem; color: var(--text-main); }
.input-group input, .input-group select, .input-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
}

.input-group input:focus, .input-group select:focus, .input-group textarea:focus {
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.text-btn { background: none; border: none; font-weight: 600; color: var(--text-sub); cursor: pointer; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
