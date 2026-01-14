<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { Mail, Lock, User, LogIn, UserPlus, Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = ref({
  email: '',
  password: '',
  name: ''
})

onMounted(() => {
  if (route.query.email) {
    form.value.email = route.query.email
  }
  if (route.query.mode === 'signup' || route.name === 'Signup') {
    isLogin.value = false
  }
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    if (isLogin.value) {
      await authStore.login(form.value.email, form.value.password)
    } else {
      await authStore.register(form.value.email, form.value.password, form.value.name)
    }
    router.push('/dashboard')
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container glass-card">
      <div class="auth-header">
        <div class="logo-icon">S</div>
        <h1>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h1>
        <p>{{ isLogin ? 'Sign in to continue to SettleIt' : 'Join SettleIt and start splitting' }}</p>
      </div>

      <div v-if="authStore.isConfigured === false" class="setup-warning glass-card">
        <h3>Firebase Setup Required</h3>
        <p>To use authentication, please add your API keys to <code>src/firebase.js</code>.</p>
        <div class="setup-steps">
          <ol>
            <li>Go to Firebase Console</li>
            <li>Copy your Web App config</li>
            <li>Paste into <code>src/firebase.js</code></li>
          </ol>
        </div>
        <button class="btn btn-secondary" @click="authStore.initDemoSession">
          <span>Enter Demo Mode (No Database)</span>
        </button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLogin" class="form-group">
          <label>Full Name</label>
          <div class="input-with-icon">
            <User class="icon" :size="20" />
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Your Name" 
              :required="!isLogin"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <div class="input-with-icon">
            <Mail class="icon" :size="20" />
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="email@example.com" 
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-with-icon">
            <Lock class="icon" :size="20" />
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              required
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary auth-btn" :disabled="loading">
          <Loader2 v-if="loading" class="spin" :size="20" />
          <template v-else>
            <component :is="isLogin ? LogIn : UserPlus" :size="20" />
            <span>{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
          </template>
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button class="toggle-btn" @click="toggleMode">
            {{ isLogin ? 'Sign Up' : 'Sign In' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 450px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.75rem;
  color: white;
  margin-bottom: 0.5rem;
}

.auth-header h1 {
  font-size: 1.75rem;
}

.auth-header p {
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.setup-warning {
  padding: 1.5rem;
  border: 1px dashed var(--accent);
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.setup-warning h3 {
  color: var(--accent);
  font-size: 1.1rem;
}

.setup-warning p {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.setup-steps {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
}

.setup-steps ol {
  padding-left: 1.25rem;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-muted);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
}

.input-with-icon input {
  padding-left: 3rem;
}

.auth-btn {
  width: 100%;
  height: 52px;
  font-size: 1rem;
}

.error-message {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.auth-footer {
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-muted);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--primary-light);
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
