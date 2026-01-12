<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { Plus, Users, ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const store = useAppStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchGroups()
})

const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}
</script>

<template>
  <div class="dashboard">
    <section class="welcome-section">
      <div class="welcome-text">
        <h1>Welcome back, Rupak!</h1>
        <p>You're all settled up with most people.</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/add-group')">
        <Plus :size="20" />
        <span>New Group</span>
      </button>
    </section>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon total">
          <TrendingUp :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Balance</span>
          <span class="stat-value">$1,240.00</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon owe">
          <ArrowUpRight :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-label">You Owe</span>
          <span class="stat-value text-error">$150.00</span>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon owed">
          <ArrowDownLeft :size="24" />
        </div>
        <div class="stat-content">
          <span class="stat-label">You are Owed</span>
          <span class="stat-value text-success">$320.00</span>
        </div>
      </div>
    </div>

    <section class="groups-section">
      <div class="section-header">
        <h2>Your Groups</h2>
        <a href="#" class="view-all">View All</a>
      </div>

      <div class="groups-grid">
        <div 
          v-for="group in store.groups" 
          :key="group.id" 
          class="group-card glass-card"
          @click="router.push(`/group/${group.id}`)"
        >
          <div class="group-header">
            <div class="group-icon">
              <Users :size="24" />
            </div>
            <div class="group-info">
              <h3>{{ group.name }}</h3>
              <p>{{ group.members.length }} members</p>
            </div>
          </div>
          <div class="group-footer">
            <div class="total-spent">
              <span class="label">Total Spent</span>
              <span class="amount">{{ formatCurrency(group.totalSpent, group.currency) }}</span>
            </div>
            <div class="member-avatars">
              <div 
                v-for="member in group.members.slice(0, 3)" 
                :key="member.id"
                class="mini-avatar"
                :style="{ backgroundColor: member.color }"
              >
                {{ member.name[0] }}
              </div>
              <div v-if="group.members.length > 3" class="mini-avatar more">
                +{{ group.members.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.welcome-text p {
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
.stat-icon.owe { background: rgba(239, 68, 68, 0.1); color: var(--error); }
.stat-icon.owed { background: rgba(34, 197, 94, 0.1); color: var(--success); }

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.text-error { color: var(--error); }
.text-success { color: var(--success); }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-all {
  color: var(--primary-light);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.group-card {
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.group-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-light);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.group-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--surface-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.group-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.group-info p {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.group-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}

.total-spent .label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.total-spent .amount {
  font-weight: 600;
  font-size: 1rem;
}

.member-avatars {
  display: flex;
  align-items: center;
}

.mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--surface);
  margin-left: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.mini-avatar:first-child { margin-left: 0; }
.mini-avatar.more {
  background: var(--surface-light);
  color: var(--text-muted);
  font-size: 0.65rem;
}

@media (max-width: 640px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .welcome-section .btn {
    width: 100%;
  }
}
</style>
