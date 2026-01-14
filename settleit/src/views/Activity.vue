<script setup>
import { onMounted, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import { 
  Activity, 
  History, 
  PlusCircle, 
  UserPlus, 
  CreditCard,
  ChevronLeft,
  Calendar,
  Bell,
  FileText
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

const sortedActivities = computed(() => {
  return [...store.activities].sort((a, b) => {
    const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.date || 0)
    const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.date || 0)
    return dateB - dateA
  })
})

const upcomingReminders = computed(() => {
  return store.allExpenses
    .filter(e => e.reminderDate && new Date(e.reminderDate) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
})

const getActivityIcon = (type) => {
  switch (type) {
    case 'expense_added': return CreditCard
    case 'group_created': return PlusCircle
    case 'member_joined': return UserPlus
    default: return Activity
  }
}

const getActivityColor = (type) => {
  switch (type) {
    case 'expense_added': return '#ef4444'
    case 'group_created': return '#6366f1'
    case 'member_joined': return '#10b981'
    default: return '#64748b'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

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
  <div class="activity-page">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">
        <ChevronLeft :size="20" />
      </button>
      <div class="header-content">
        <h1>Activity Feed</h1>
        <p>Keep track of every split and settlement</p>
      </div>
    </header>

    <div v-if="upcomingReminders.length > 0" class="reminders-section">
      <div class="reminders-header">
        <Bell :size="18" class="text-indigo-600" />
        <h3>Upcoming Reminders</h3>
      </div>
      <div class="reminders-container">
        <div v-for="rem in upcomingReminders" :key="rem.id" class="reminder-item glass-card">
          <div class="rem-main">
            <span class="rem-title">{{ rem.description }}</span>
            <span class="rem-date">{{ new Date(rem.reminderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }}</span>
          </div>
          <button class="rem-action" @click="rem.groupId ? router.push(`/group/${rem.groupId}`) : null">
            View
          </button>
        </div>
      </div>
    </div>

    <div class="activity-list">
      <div 
        v-for="activity in sortedActivities" 
        :key="activity.id" 
        class="activity-card glass-card"
        :class="activity.type"
      >
        <div class="activity-icon-wrapper" :style="{ backgroundColor: getActivityColor(activity.type) + '1A', color: getActivityColor(activity.type) }">
          <component :is="getActivityIcon(activity.type)" :size="20" />
        </div>
        
        <div class="activity-main">
          <div class="activity-header">
             <span class="activity-description">{{ activity.description }}</span>
             <span v-if="activity.amount" class="activity-amount">{{ formatCurrency(activity.amount) }}</span>
          </div>
          <div class="activity-meta">
            <span class="activity-time">
              <Calendar :size="12" />
              {{ formatDate(activity.timestamp) }}
            </span>
            <span v-if="activity.groupName" class="group-tag">
              {{ activity.groupName }}
            </span>
            <span v-if="activity.hasDocument || activity.documentUrl" class="doc-badge" title="Has receipt">
              <FileText :size="12" />
              Receipt
            </span>
          </div>
        </div>
      </div>

      <div v-if="sortedActivities.length === 0" class="empty-state glass-card">
        <Activity :size="48" class="empty-icon" />
        <h3>No activity yet</h3>
        <p>When you add expenses or join groups, they'll show up here.</p>
        <button class="btn btn-primary" @click="router.push('/dashboard')">Go to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
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

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.header-content p {
  color: #64748b;
  font-size: 0.9375rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-card {
  display: flex;
  padding: 1.25rem;
  gap: 1rem;
  align-items: flex-start;
  transition: transform 0.2s;
}

.activity-card:hover {
  transform: translateX(4px);
}

.activity-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.activity-description {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.activity-amount {
  font-weight: 700;
  color: #0f172a;
  font-size: 1rem;
  white-space: nowrap;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.group-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5025d1;
  background: #5025d110;
  padding: 2px 8px;
  border-radius: 4px;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.empty-icon {
  color: #cbd5e1;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  max-width: 300px;
  margin: 0 auto;
}

/* Mobile Adjustments */
@media (max-width: 640px) {
  .activity-card {
    padding: 1rem;
  }
  
  .activity-description {
    font-size: 0.9375rem;
  }
}

/* Reminders Styles */
.reminders-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reminders-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reminders-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.reminders-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.reminder-item {
  min-width: 200px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: white;
  border: 1px solid #e0e7ff;
}

.rem-main {
  display: flex;
  flex-direction: column;
}

.rem-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.rem-date {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
}

.rem-action {
  background: #f5f3ff;
  color: #5025d1;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.doc-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
  background: #10b98110;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
