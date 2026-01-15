<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import ScannerModal from '../components/ScannerModal.vue'
import { 
  Plus, 
  Users, 
  Search, 
  ChevronRight, 
  Coffee, 
  Utensils, 
  ShoppingBag, 
  Music, 
  Camera,
  Maximize2,
  Activity,
  History,
  X,
  Mail,
  UserPlus,
  Loader2
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchGroups()
})

const showAddFriendModal = ref(false)
const friendEmail = ref('')
const isAddingFriend = ref(false)
const showScannerModal = ref(false)

const handleAddFriend = async () => {
  if (!friendEmail.value) return
  isAddingFriend.value = true
  await store.addFriend(friendEmail.value)
  isAddingFriend.value = false
  showAddFriendModal.value = false
  friendEmail.value = ''
}

const handleScanSuccess = (scannedData) => {
  showScannerModal.value = false
  // Navigate to add expense page with pre-filled data
  router.push({
    path: '/add-expense',
    query: {
      description: scannedData.description || '',
      amount: scannedData.amount || '',
      category: scannedData.category || 'Other',
      notes: scannedData.notes || '',
      source: scannedData.source || 'qr'
    }
  })
}

const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'coffee': return Coffee
    case 'food': return Utensils
    case 'shopping': return ShoppingBag
    case 'music': return Music
    default: return Camera
  }
}

const sortedActivities = computed(() => {
  return [...store.activities].sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.date || 0)
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.date || 0)
    return dateB - dateA
  })
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'Just now'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="dashboard-ref">
    <!-- Header -->
    <header class="header">
      <div class="logo">SettleIt</div>
    </header>

    <!-- Summary Card -->
    <section class="summary-section">
      <div class="summary-card glass-card">
        <p class="summary-label">
          {{ store.userBalances.filter(b => b.balance > 0).length }} Friends are owing you 
          <span class="info-circle" title="Net balance across all groups">?</span>
        </p>
        <h2 class="summary-amount" :class="{ 'text-success': store.totalBalance > 0, 'text-error': store.totalBalance < 0 }">
          {{ formatCurrency(store.totalBalance) }}
        </h2>
      </div>

      <div class="action-buttons">
        <button class="btn-manual" @click="router.push('/add-expense')">
          <Plus :size="18" />
          <span>Add Manually</span>
        </button>
        <button class="btn-scan" @click="showScannerModal = true">
          <Maximize2 :size="18" />
          <span>Quick Scan</span>
        </button>
      </div>
    </section>

    <!-- Friends List -->
    <section class="friends-section">
      <div class="section-header">
        <h3>Friends List</h3>
        <button class="see-more" @click="showAddFriendModal = true">+ Add Friend</button>
      </div>
      <div class="friends-scroll">
        <div v-for="friend in store.friends" :key="friend.id" class="friend-item">
          <div class="avatar" :style="{ backgroundColor: friend.color }">
            {{ friend.name[0] }}
          </div>
          <span class="friend-name">{{ friend.name }}</span>
        </div>
        
        <div v-if="store.friends.length === 0" class="empty-friends-hint">
          No friends added yet.
        </div>
      </div>
    </section>

    <!-- Activity Feed (Replacing Mock History) -->
    <section class="history-section">
      <div class="section-header">
        <h3>Activity Feed</h3>
        <button class="see-more" @click="router.push('/activity')">View All</button>
      </div>

      <div class="history-list">
        <div 
          v-for="activity in sortedActivities.slice(0, 5)" 
          :key="activity.id" 
          class="history-card glass-card"
          @click="activity.groupId ? router.push(`/group/${activity.groupId}`) : null"
        >
          <div class="card-top">
            <div class="item-icon" :class="activity.type">
              <Activity v-if="activity.type === 'expense_added'" :size="20" />
              <Users v-else-if="activity.type === 'group_created' || activity.type === 'member_joined'" :size="20" />
              <History v-else :size="20" />
            </div>
            <div class="item-info">
              <h4>{{ activity.description }}</h4>
              <p>{{ formatDate(activity.timestamp) }}</p>
            </div>
            <div v-if="activity.amount" class="activity-amount">
              {{ formatCurrency(activity.amount) }}
            </div>
            <ChevronRight :size="16" class="arrow-icon" />
          </div>
        </div>

        <div v-if="sortedActivities.length === 0" class="empty-feed glass-card">
          <p>No recent activity. Start by adding an expense!</p>
        </div>
      </div>
    </section>

    <!-- Scanner Modal -->
    <ScannerModal 
      v-if="showScannerModal" 
      mode="qr"
      @close="showScannerModal = false"
      @scan-success="handleScanSuccess"
    />

    <!-- Add Friend Modal -->
    <transition name="modal-fade">
      <div v-if="showAddFriendModal" class="modern-modal-overlay" @click.self="showAddFriendModal = false">
        <div class="modern-modal-content">
          <!-- Modal Header -->
          <div class="modern-modal-header">
            <div class="modal-icon-wrapper">
              <Users :size="24" class="modal-icon" />
            </div>
            <h3>Add New Friend</h3>
            <p class="modal-subtitle">Connect with friends to split expenses together</p>
            <button class="modern-close-btn" @click="showAddFriendModal = false">
              <X :size="20" />
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="modern-modal-body">
            <div class="input-group">
              <label for="friend-email">
                <Mail :size="16" />
                <span>Friend's Email Address</span>
              </label>
              <input 
                id="friend-email"
                v-model="friendEmail" 
                type="email" 
                placeholder="friend@example.com"
                @keyup.enter="handleAddFriend"
                :disabled="isAddingFriend"
              >
              <span class="input-hint">They must have a SettleIt account with this email</span>
            </div>
          </div>
          
          <!-- Modal Footer -->
          <div class="modern-modal-footer">
            <button 
              class="modern-btn modern-btn-secondary" 
              @click="showAddFriendModal = false"
              :disabled="isAddingFriend"
            >
              Cancel
            </button>
            <button 
              class="modern-btn modern-btn-primary" 
              :disabled="!friendEmail || isAddingFriend"
              @click="handleAddFriend"
            >
              <Loader2 v-if="isAddingFriend" :size="18" class="spin" />
              <UserPlus v-else :size="18" />
              <span>{{ isAddingFriend ? 'Adding...' : 'Add Friend' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dashboard-ref {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #0f172a;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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
  transition: all 0.2s;
  position: relative;
  z-index: 10;
}

.icon-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: scale(1.05);
}

.icon-btn:active {
  transform: scale(0.95);
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-card {
  background: white;
  padding: 2rem;
  text-align: center;
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.03);
}

.summary-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.info-circle {
  border: 1px solid #cbd5e1;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.summary-amount {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-manual, .btn-scan {
  height: 52px;
  border-radius: 14px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.btn-manual {
  background: #5025d1;
  color: white;
}

.btn-scan {
  background: #000000;
  color: white;
}

.btn-manual:active, .btn-scan:active {
  transform: scale(0.98);
}

.btn-manual:hover, .btn-scan:hover {
  opacity: 0.9;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.see-more {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: #94a3b8;
  cursor: pointer;
}

.friends-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.friends-scroll::-webkit-scrollbar {
  display: none;
}

.friend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
}

.friend-item .avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.friend-name {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  white-space: nowrap;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 20px;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon.coffee { background: #f8fafc; color: #64748b; }
.item-icon.food { background: #fee2e2; color: #ef4444; }
.item-icon.music { background: #ecfdf5; color: #10b981; }

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.125rem;
}

.item-info p {
  font-size: 0.75rem;
  color: #94a3b8;
}

.item-members {
  display: flex;
  align-items: center;
}

.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
}

.mini-avatar:first-child { margin-left: 0; }
.mini-avatar.more { background: #f1f5f9; color: #64748b; }

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px dashed #f1f5f9;
}

.total-info .label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.paid-20 { color: #f59e0b; }
.paid-100 { color: #10b981; }

.activity-amount {
  font-weight: 700;
  color: var(--primary);
  font-size: 1rem;
}

.empty-feed {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

.item-icon.group_created { background: #eef2ff; color: #6366f1; }
.item-icon.expense_added { background: #fef2f2; color: #ef4444; }
.item-icon.member_joined { background: #ecfdf5; color: #10b981; }

.history-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.history-card:hover { transform: scale(1.02); }
.arrow-icon { color: #cbd5e1; margin-left: 0.5rem; }

.empty-friends-hint {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-width: 450px;
  background: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { font-size: 1.25rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

.modal-body p {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.slide-up-modal {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Desktop view adjustments */
@media (min-width: 768px) {
  .dashboard-ref {
    max-width: 1000px;
    padding: 2rem;
  }
}

/* Modern Add Friend Modal Styles */
.modern-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modern-modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalSlideUp 0.3s ease-out;
}

.modern-modal-header {
  background: linear-gradient(135deg, #5025d1 0%, #7c3aed 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
  color: white;
}

.modal-icon-wrapper {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.modal-icon {
  color: white;
}

.modern-modal-header h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: white;
}

.modal-subtitle {
  font-size: 0.9375rem;
  opacity: 0.9;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.modern-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.modern-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modern-modal-body {
  padding: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s;
  outline: none;
}

.input-group input:focus {
  border-color: #5025d1;
  background: white;
  box-shadow: 0 0 0 4px rgba(80, 37, 209, 0.1);
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: -0.25rem;
}

.modern-modal-footer {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.modern-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  outline: none;
}

.modern-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modern-btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.modern-btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.modern-btn-primary {
  background: linear-gradient(135deg, #5025d1 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(80, 37, 209, 0.3);
}

.modern-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(80, 37, 209, 0.4);
}

.modern-btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes modalSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modern-modal-content {
  animation: modalSlideUp 0.3s ease-out;
}

@media (max-width: 640px) {
  .modern-modal-header {
    padding: 1.5rem;
  }

  .modern-modal-body {
    padding: 1.5rem;
  }

  .modern-modal-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }

  .modern-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
