<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { Home, PlusCircle, Users, BarChart3, Settings, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  authStore.init()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <header class="navbar glass-card">
      <div class="container nav-content">
        <div class="logo" @click="router.push('/')">
          <span class="logo-icon">S</span>
          <span class="logo-text">SettleIt</span>
        </div>
        
        <nav class="desktop-nav">
          <router-link to="/" class="nav-link" active-class="active">
            <Home :size="20" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/add-expense" class="nav-link" active-class="active">
            <PlusCircle :size="20" />
            <span>Add Expense</span>
          </router-link>
        </nav>

        <div v-if="authStore.user" class="user-profile">
          <div class="avatar" :title="authStore.user.displayName">
            {{ authStore.user.displayName ? authStore.user.displayName[0] : 'U' }}
          </div>
          <button class="btn-logout" @click="handleLogout" title="Logout">
            <LogOut :size="18" />
          </button>
        </div>
      </div>
    </header>

    <main class="main-content container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="mobile-nav glass-card">
      <router-link to="/" class="mobile-link" active-class="active">
        <Home :size="24" />
        <span>Home</span>
      </router-link>
      <router-link to="/groups" class="mobile-link" active-class="active">
        <Users :size="24" />
        <span>Groups</span>
      </router-link>
      <router-link to="/add-expense" class="mobile-link add-btn" active-class="active">
        <PlusCircle :size="32" />
      </router-link>
      <router-link to="/reports" class="mobile-link" active-class="active">
        <BarChart3 :size="24" />
        <span>Stats</span>
      </router-link>
      <router-link to="/settings" class="mobile-link" active-class="active">
        <Settings :size="24" />
        <span>Settings</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 80px; /* Space for mobile nav */
}

.navbar {
  position: sticky;
  top: 1rem;
  margin: 1rem;
  z-index: 100;
  padding: 0.75rem 0;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-icon {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desktop-nav {
  display: none;
  gap: 1rem;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover, .nav-link.active {
  color: var(--text);
  background: var(--glass-border);
}

.nav-link.active {
  color: var(--primary-light);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid var(--glass-border);
}

.btn-logout {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border-color: var(--error);
}

.main-content {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 1rem;
  border-radius: 20px 20px 0 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none;
  }
  .app-container {
    padding-bottom: 0;
  }
}

.mobile-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.7rem;
  gap: 2px;
}

.mobile-link.active {
  color: var(--primary-light);
}

.add-btn {
  margin-top: -30px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white !important;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
  transition: transform 0.3s ease;
}

.add-btn:hover {
  transform: scale(1.1);
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
</style>
