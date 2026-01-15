<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  Home, 
  Users, 
  BarChart3, 
  LogOut,
  Bell,
  ChevronRight,
  Activity,
  FolderLock
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const emit = defineEmits(['logout'])

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Activity', path: '/activity', icon: Activity },
  { name: 'Groups', path: '/groups', icon: Users },
  { name: 'Stats', path: '/reports', icon: BarChart3 },
  { name: 'Vault', path: '/vault', icon: FolderLock },
  { name: 'Reminders', path: '/reminders', icon: Bell },
]

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-area">
        <div class="logo">💸</div>
        <span class="brand">SettleIt</span>
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
</template>

<style scoped>
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
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.logo {
  font-size: 1.75rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.nav-icon-btn {
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.nav-icon-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.notification-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
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
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
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
</style>
