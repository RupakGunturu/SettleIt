<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { 
  Home, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Info
} from 'lucide-vue-next'
import { useAppStore } from './stores/app'
import { useToastStore } from './stores/toast'

const authStore = useAuthStore()
const appStore = useAppStore()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()

const searchOutput = ref({ groups: [], expenses: [] })
const searching = ref(false)

watch(() => appStore.searchQuery, async (newQuery) => {
  if (!newQuery || newQuery.length < 2) {
    searchOutput.value = { groups: [], expenses: [] }
    return
  }

  searching.value = true
  const localGroups = appStore.groups.filter(g => 
    g.name.toLowerCase().includes(newQuery.toLowerCase())
  ).slice(0, 3)
  
  const globalExpenses = await appStore.globalSearchExpenses(newQuery)
  
  searchOutput.value = {
    groups: localGroups,
    expenses: globalExpenses.slice(0, 5)
  }
  searching.value = false
})

const navigateToResult = (path) => {
  appStore.searchQuery = ''
  router.push(path)
}

onMounted(() => {
  authStore.init()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/about')
}

const navLinks = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Groups', path: '/groups', icon: Users },
  { name: 'Stats', path: '/reports', icon: BarChart3 },
  { name: 'About', path: '/about', icon: Info },
  { name: 'Settings', path: '/settings', icon: Settings },
]
</script>

<template>
  <div class="app-layout" :class="{ 'auth-layout': !authStore.user || route.name === 'Login' }">
    <!-- Desktop Sidebar -->
    <aside v-if="authStore.user && route.name !== 'Login'" class="sidebar">
      <div class="sidebar-header">
        <div class="logo" @click="router.push('/')">
          <span class="logo-icon">S</span>
          <span class="logo-text">SettleIt</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path" 
          class="sidebar-link"
          active-class="active"
        >
          <component :is="link.icon" :size="20" />
          <span>{{ link.name }}</span>
          <ChevronRight v-if="route.path === link.path" :size="16" class="active-chevron" />
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">
            {{ authStore.user.displayName ? authStore.user.displayName[0] : 'U' }}
          </div>
          <div class="user-details">
            <span class="name">{{ authStore.user.displayName || 'User' }}</span>
            <span class="email">{{ authStore.user.email }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="18" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <div class="main-wrapper">
      <!-- Desktop Top Header -->
      <header v-if="authStore.user && route.name !== 'Login'" class="top-header desktop-only">
        <div class="header-search">
          <Search :size="18" />
          <input v-model="appStore.searchQuery" type="text" placeholder="Search expenses, groups...">
          
          <!-- Search Results Dropdown -->
          <transition name="slide-up">
            <div v-if="appStore.searchQuery.length >= 2" class="search-dropdown glass-card">
              <div v-if="searching" class="search-empty">Searching...</div>
              
              <template v-else>
                <div v-if="searchOutput.groups.length > 0" class="search-section">
                  <span class="section-label">Groups</span>
                  <div 
                    v-for="group in searchOutput.groups" 
                    :key="group.id" 
                    class="search-item"
                    @click="navigateToResult(`/group/${group.id}`)"
                  >
                    <Users :size="16" />
                    <span>{{ group.name }}</span>
                  </div>
                </div>

                <div v-if="searchOutput.expenses.length > 0" class="search-section">
                  <span class="section-label">Expenses</span>
                  <div 
                    v-for="expense in searchOutput.expenses" 
                    :key="expense.id" 
                    class="search-item"
                    @click="navigateToResult(`/group/${expense.groupId}`)"
                  >
                    <Info :size="16" />
                    <span>{{ expense.description }}</span>
                    <span class="amount">₹{{ expense.amount }}</span>
                  </div>
                </div>

                <div v-if="searchOutput.groups.length === 0 && searchOutput.expenses.length === 0" class="search-empty">
                  No results found for "{{ appStore.searchQuery }}"
                </div>
              </template>
            </div>
          </transition>
        </div>
        <div class="header-actions">
          <button class="icon-btn"><Bell :size="20" /></button>
          <div class="v-divider"></div>
          <button class="add-expense-btn" @click="router.push('/add-expense')">
            <PlusCircle :size="18" />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      <main class="main-content" :class="{ 'with-sidebar': authStore.user && route.name !== 'Login' }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav v-if="authStore.user && route.name !== 'Login'" class="mobile-nav glass-card">
      <router-link to="/" class="mobile-link" active-class="active">
        <Home :size="22" />
        <span>Home</span>
      </router-link>
      <router-link to="/groups" class="mobile-link" active-class="active">
        <Users :size="22" />
        <span>Groups</span>
      </router-link>
      <router-link to="/add-expense" class="mobile-link add-btn">
        <PlusCircle :size="28" />
      </router-link>
      <router-link to="/reports" class="mobile-link" active-class="active">
        <BarChart3 :size="22" />
        <span>Stats</span>
      </router-link>
      <router-link to="/settings" class="mobile-link" active-class="active">
        <Settings :size="22" />
        <span>Settings</span>
      </router-link>
    </nav>

    <!-- Global Toasts -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toastStore.toasts" 
          :key="toast.id" 
          class="toast-item glass-card" 
          :class="toast.type"
        >
          <div class="toast-indicator"></div>
          <p>{{ toast.message }}</p>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--background);
}

.auth-layout {
  justify-content: center;
  align-items: center;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: none;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 50;
}

@media (min-width: 1024px) {
  .sidebar {
    display: flex;
  }
}

.sidebar-header {
  padding: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-icon {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.sidebar-nav {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background: #f8fafc;
  color: #0f172a;
}

.sidebar-link.active {
  background: #f1f5f9;
  color: #5025d1;
}

.active-chevron {
  margin-left: auto;
  opacity: 0.5;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #5025d1;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-details .name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.user-details .email {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #fef2f2;
}

/* Top Header Styles */
.top-header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  display: none;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}

@media (min-width: 1024px) {
  .top-header {
    display: flex;
  }
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-light);
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.header-search:focus-within {
  border-color: var(--primary-light);
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.header-search input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 0.875rem;
  color: var(--text);
}

.header-search input:focus {
  outline: none;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-left: 0.5rem;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.search-item:hover {
  background: var(--primary-light);
  color: white;
}

.search-item .amount {
  margin-left: auto;
  font-weight: 700;
  font-size: 0.875rem;
  opacity: 0.8;
}

.search-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
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
  color: #64748b;
}

.v-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
}

.add-expense-btn {
  background: #5025d1;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Main Content Styles */
.main-content {
  padding: 1rem;
  flex: 1;
}

@media (min-width: 768px) {
  .main-content {
    padding: 2rem;
  }
}

.main-content.with-sidebar {
  padding-bottom: 90px;
}

@media (min-width: 1024px) {
  .main-content.with-sidebar {
    padding-bottom: 2rem;
  }
}

/* Mobile Nav Styles */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 1rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 100;
}

@media (min-width: 1024px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.65rem;
  gap: 2px;
  min-width: 50px;
}

.mobile-link.active {
  color: #5025d1;
}

.add-btn {
  margin-top: -32px;
  background: #5025d1;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: white !important;
  box-shadow: 0 4px 15px rgba(80, 37, 209, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
}

/* Toast Store and Toast Container Styles */
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-item {
  min-width: 300px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  pointer-events: auto;
  border-radius: 8px;
}

.toast-indicator {
  width: 4px;
  height: 24px;
  border-radius: 4px;
  background: var(--primary);
}

.toast-item.success .toast-indicator { background: var(--success); }
.toast-item.error .toast-indicator { background: var(--error); }
.toast-item.info .toast-indicator { background: var(--primary); }

.toast-item p {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
