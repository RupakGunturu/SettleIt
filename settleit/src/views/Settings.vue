<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  LogOut,
  Camera,
  Globe,
  DollarSign
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toastStore = useToastStore()
const isEditingProfile = ref(false)
const isUpdating = ref(false)

const profileForm = ref({
  displayName: authStore.user?.displayName || '',
  email: authStore.user?.email || ''
})

const settings = ref({
  notifications: true,
  currency: 'INR',
  language: 'English'
})

// Ensure theme is strictly light
document.documentElement.setAttribute('data-theme', 'light')
localStorage.setItem('theme', 'Light')

const handleUpdateProfile = async () => {
  if (!profileForm.value.displayName) return
  
  isUpdating.value = true
  try {
    await authStore.updateProfile(profileForm.value.displayName)
    isEditingProfile.value = false
    toastStore.success('Profile updated successfully!')
  } catch (err) {
    toastStore.error('Failed to update profile')
  } finally {
    isUpdating.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  window.location.href = '/about' // Force reload to clear states if needed, or router push
}
</script>

<template>
  <div class="settings-page">
    <header class="page-header">
      <h1>Settings</h1>
      <p>Manage your account and app preferences</p>
    </header>

    <div class="settings-grid">
      <!-- Profile Section -->
      <section class="settings-section glass-card">
        <div class="section-title">
          <User :size="20" />
          <h2>Profile Information</h2>
        </div>

        <div class="profile-card">
          <div class="avatar-wrapper">
            <div class="avatar large">
              {{ authStore.user?.displayName ? authStore.user.displayName[0] : 'U' }}
            </div>
            <button class="avatar-edit"><Camera :size="16" /></button>
          </div>
          
          <div v-if="!isEditingProfile" class="profile-details">
            <h3>{{ authStore.user?.displayName || 'User' }}</h3>
            <p>{{ authStore.user?.email }}</p>
            <button class="btn btn-outline" @click="isEditingProfile = true">Edit Profile</button>
          </div>

          <div v-else class="profile-form">
            <div class="form-group">
              <label>Display Name</label>
              <input v-model="profileForm.displayName" type="text">
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input v-model="profileForm.email" type="email" disabled>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" @click="isEditingProfile = false">Cancel</button>
              <button 
                class="btn btn-primary" 
                :disabled="isUpdating || !profileForm.displayName"
                @click="handleUpdateProfile"
              >
                {{ isUpdating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- App Settings -->
      <div class="sub-sections">
        <section class="settings-section glass-card">
          <div class="section-title">
            <SettingsIcon :size="20" />
            <h2>App Preferences</h2>
          </div>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <DollarSign :size="18" />
                <span>Default Currency</span>
              </div>
              <select v-model="settings.currency">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="IDR">IDR (Rp)</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <Globe :size="18" />
                <span>Language</span>
              </div>
              <select v-model="settings.language">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>

          </div>
        </section>

        <section class="settings-section glass-card">
          <div class="section-title">
            <Bell :size="20" />
            <h2>Notifications</h2>
          </div>
          <div class="setting-item">
            <span>Push Notifications</span>
            <label class="switch">
              <input type="checkbox" v-model="settings.notifications">
              <span class="slider"></span>
            </label>
          </div>
        </section>

        <section class="settings-section glass-card">
          <div class="section-title">
            <Shield :size="20" />
            <h2>Security</h2>
          </div>
          <button class="btn btn-outline full-width">Change Password</button>
        </section>

        <button class="logout-btn-full glass-card" @click="handleLogout">
          <LogOut :size="20" />
          <span>Logout of SettleIt</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.page-header p { color: #64748b; font-size: 0.9375rem; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .settings-grid { grid-template-columns: 380px 1fr; }
}

.settings-section { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

.section-title { display: flex; align-items: center; gap: 0.75rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
.section-title h2 { font-size: 1.125rem; font-weight: 700; color: #0f172a; }

.profile-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }

.avatar-wrapper { position: relative; }
.avatar.large { width: 100px; height: 100px; font-size: 2.5rem; font-weight: 800; background: #eef2ff; color: #5025d1; border-radius: 32px; display: flex; align-items: center; justify-content: center; }
.avatar-edit { position: absolute; bottom: 0; right: 0; background: #5025d1; color: white; border: 3px solid white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }

.profile-details h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; }
.profile-details p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.875rem; }

.sub-sections { display: flex; flex-direction: column; gap: 1.5rem; }

.settings-list { display: flex; flex-direction: column; gap: 1.25rem; }
.setting-item { display: flex; justify-content: space-between; align-items: center; }
.setting-info { display: flex; align-items: center; gap: 0.75rem; color: #475569; font-size: 0.9375rem; font-weight: 500; }

select { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.875rem; background: white; }

.theme-toggle { background: #f1f5f9; padding: 3px; border-radius: 8px; display: flex; }
.theme-toggle button { padding: 0.375rem 0.75rem; border: none; background: transparent; color: #64748b; font-size: 0.8125rem; font-weight: 600; cursor: pointer; border-radius: 6px; }
.theme-toggle button.active { background: white; color: #5025d1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.full-width { width: 100%; justify-content: center; }

.logout-btn-full { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.25rem; color: #ef4444; font-weight: 700; border: none; cursor: pointer; transition: background 0.2s; }
.logout-btn-full:hover { background: #fef2f2; }

/* Profile Form */
.profile-form { width: 100%; text-align: left; display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
.form-group input { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
.form-actions .btn { flex: 1; }

/* Switch Style */
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: #5025d1; }
input:checked + .slider:before { transform: translateX(20px); }
</style>
