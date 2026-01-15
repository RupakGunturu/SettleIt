<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { 
  ChevronLeft,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  X,
  AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const store = useAppStore()

// Get reminders from expenses
const upcomingReminders = computed(() => {
  return store.allExpenses
    .filter(e => e.reminderDate && new Date(e.reminderDate) >= new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
})

const pastReminders = computed(() => {
  return store.allExpenses
    .filter(e => e.reminderDate && new Date(e.reminderDate) < new Date().setHours(0,0,0,0))
    .sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate))
    .slice(0, 10)
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const getDaysUntil = (dateStr) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reminderDate = new Date(dateStr)
  reminderDate.setHours(0, 0, 0, 0)
  const days = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 0) return `${Math.abs(days)} days ago`
  return `In ${days} days`
}

const navigateToExpense = (reminder) => {
  if (reminder.groupId) {
    router.push(`/group/${reminder.groupId}`)
  } else {
    router.push('/activity')
  }
}
</script>

<template>
  <div class="reminders-container">
    
    <header class="reminders-header">
      <div class="header-left">
        <button class="back-btn" @click="router.back()">
          <ChevronLeft :size="22" />
        </button>
        <div>
          <h1>Reminders</h1>
          <p class="subtitle">Never miss a payment or settlement</p>
        </div>
      </div>
      
      <button class="icon-btn bell-btn">
        <Bell :size="20" />
      </button>
    </header>

    <main class="reminders-content">
      
      <!-- Upcoming Reminders -->
      <section class="reminder-section">
        <div class="section-header">
          <div class="header-icon upcoming">
            <Clock :size="20" />
          </div>
          <h2>Upcoming</h2>
          <span class="count">{{ upcomingReminders.length }}</span>
        </div>

        <div v-if="upcomingReminders.length > 0" class="reminders-list">
          <div 
            v-for="reminder in upcomingReminders" 
            :key="reminder.id" 
            class="reminder-card upcoming"
            @click="navigateToExpense(reminder)"
          >
            <div class="card-left">
              <div class="reminder-icon">
                <Bell :size="18" />
              </div>
              <div class="reminder-details">
                <h3>{{ reminder.description }}</h3>
                <div class="reminder-meta">
                  <span class="group-name" v-if="reminder.groupId">
                    {{ store.getGroupById(reminder.groupId)?.name || 'Group' }}
                  </span>
                  <span class="personal-tag" v-else>Personal</span>
                  <span class="amount">{{ formatCurrency(reminder.amount) }}</span>
                </div>
              </div>
            </div>

            <div class="card-right">
              <div class="date-box">
                <Calendar :size="14" />
                <span class="date-text">{{ formatDate(reminder.reminderDate) }}</span>
              </div>
              <div class="urgency-badge" :class="getDaysUntil(reminder.reminderDate) === 'Today' || getDaysUntil(reminder.reminderDate) === 'Tomorrow' ? 'urgent' : ''">
                {{ getDaysUntil(reminder.reminderDate) }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-section">
          <CheckCircle :size="40" class="empty-icon" />
          <p>No upcoming reminders</p>
        </div>
      </section>

      <!-- Past Reminders -->
      <section class="reminder-section">
        <div class="section-header">
          <div class="header-icon past">
            <CheckCircle :size="20" />
          </div>
          <h2>Past</h2>
          <span class="count">{{ pastReminders.length }}</span>
        </div>

        <div v-if="pastReminders.length > 0" class="reminders-list past">
          <div 
            v-for="reminder in pastReminders" 
            :key="reminder.id" 
            class="reminder-card past"
            @click="navigateToExpense(reminder)"
          >
            <div class="card-left">
              <div class="reminder-icon past">
                <CheckCircle :size="18" />
              </div>
              <div class="reminder-details">
                <h3>{{ reminder.description }}</h3>
                <div class="reminder-meta">
                  <span class="group-name" v-if="reminder.groupId">
                    {{ store.getGroupById(reminder.groupId)?.name || 'Group' }}
                  </span>
                  <span class="personal-tag" v-else>Personal</span>
                  <span class="amount">{{ formatCurrency(reminder.amount) }}</span>
                </div>
              </div>
            </div>

            <div class="card-right">
              <div class="date-box past">
                <Calendar :size="14" />
                <span class="date-text">{{ formatDate(reminder.reminderDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-section">
          <AlertCircle :size="40" class="empty-icon" />
          <p>No past reminders</p>
        </div>
      </section>

      <!-- Info Card -->
      <div class="info-card">
        <Bell :size="24" class="info-icon" />
        <div class="info-content">
          <h3>How Reminders Work</h3>
          <p>Set reminders when adding expenses to get notified about upcoming settlements. Reminders will appear here and in your Activity feed.</p>
        </div>
      </div>

    </main>

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

.reminders-container {
  min-height: 100vh;
  background-color: var(--bg-app);
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

/* Header */
.reminders-header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn, .icon-btn {
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
}

.bell-btn { background: #eef2ff; color: var(--primary); border-color: transparent; }

.reminders-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
.subtitle { font-size: 0.875rem; color: var(--text-sub); margin-top: 0.25rem; }

/* Content */
.reminders-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.reminder-section { display: flex; flex-direction: column; gap: 1.5rem; }

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon.upcoming { background: #fffbeb; color: var(--warning); }
.header-icon.past { background: #ecfdf5; color: var(--success); }

.section-header h2 { font-size: 1.125rem; font-weight: 700; color: var(--text-main); flex: 1; }
.count { font-size: 0.875rem; font-weight: 600; color: var(--text-sub); }

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reminder-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reminder-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.reminder-card.upcoming { border-left: 3px solid var(--warning); }
.reminder-card.past { opacity: 0.7; }

.card-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.reminder-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fffbeb;
  color: var(--warning);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reminder-icon.past { background: #f1f5f9; color: var(--text-sub); }

.reminder-details { display: flex; flex-direction: column; gap: 0.5rem; }
.reminder-details h3 { font-size: 1rem; font-weight: 700; color: var(--text-main); }

.reminder-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.group-name {
  color: var(--primary);
  font-weight: 600;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.personal-tag {
  color: var(--text-sub);
  font-weight: 600;
}

.amount {
  color: var(--text-main);
  font-weight: 700;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.date-box {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-sub);
}

.date-box.past { color: #94a3b8; }

.urgency-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--warning);
  background: #fffbeb;
  padding: 4px 10px;
  border-radius: 6px;
}

.urgency-badge.urgent {
  background: #fef2f2;
  color: var(--danger);
}

.empty-section {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon { color: #cbd5e1; }
.empty-section p { color: var(--text-sub); font-size: 0.9375rem; }

/* Info Card */
.info-card {
  background: linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.info-icon { color: var(--primary); flex-shrink: 0; }
.info-content h3 { font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; }
.info-content p { font-size: 0.875rem; color: var(--text-sub); line-height: 1.6; }

@media (max-width: 640px) {
  .card-right { display: none; }
  
  .reminder-card {
    padding: 1rem;
  }
  
  .reminder-details h3 {
    font-size: 0.9375rem;
  }
}
</style>
