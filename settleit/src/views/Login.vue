<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { Mail, Lock, User, LogIn, UserPlus, Loader2, Shield, QrCode, Receipt, RefreshCw, ArrowLeft } from 'lucide-vue-next'

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

const features = [
  { icon: Receipt, title: 'Smart Expense Tracker', desc: 'Track and split expenses effortlessly' },
  { icon: QrCode, title: 'QR Code Scanner', desc: 'Scan receipts instantly' },
  { icon: Shield, title: 'Secure Vault', desc: 'Your data is encrypted' },
  { icon: RefreshCw, title: 'Real-time Sync', desc: 'Access anywhere, anytime' }
]
</script>

<template>
  <div class="auth-page">
    <!-- Back to Landing -->
    <button @click="router.push('/')" class="back-to-home">
      <ArrowLeft :size="20" />
      <span>Back to Home</span>
    </button>

    <div class="auth-container">
      <!-- Left Panel - Branding & Features -->
      <div class="left-panel">
        <div class="branding">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>SettleIt</h2>
          </div>
          <p class="tagline">Smart expense tracking for your group</p>
        </div>

        <div class="features-list">
          <div v-for="(feature, idx) in features" :key="idx" class="feature-item">
            <div class="feature-icon">
              <component :is="feature.icon" :size="20" />
            </div>
            <div class="feature-text">
              <h4>{{ feature.title }}</h4>
              <p>{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <div class="decorative-blob blob-1"></div>
        <div class="decorative-blob blob-2"></div>
      </div>

      <!-- Right Panel - Form -->
      <div class="right-panel">
        <div class="form-container">
          <div class="form-header">
            <h1>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h1>
            <p>{{ isLogin ? 'Sign in to continue to SettleIt' : 'Join SettleIt and start splitting expenses' }}</p>
          </div>

          <div v-if="authStore.isConfigured === false" class="setup-warning">
            <Shield :size="24" class="warning-icon" />
            <div>
              <h3>Firebase Setup Required</h3>
              <p>To use authentication, please add your API keys to <code>src/firebase.js</code>.</p>
              <button class="demo-btn" @click="authStore.initDemoSession(); router.push('/dashboard')">
                <span>Enter Demo Mode</span>
              </button>
            </div>
          </div>

          <form v-else @submit.prevent="handleSubmit" class="auth-form">
            <div v-if="!isLogin" class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <User class="input-icon" :size="20" />
                <input 
                  v-model="form.name" 
                  type="text" 
                  placeholder="John Doe" 
                  :required="!isLogin"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <Mail class="input-icon" :size="20" />
                <input 
                  v-model="form.email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <Lock class="input-icon" :size="20" />
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

            <button type="submit" class="submit-btn" :disabled="loading">
              <Loader2 v-if="loading" class="spin" :size="20" />
              <template v-else>
                <component :is="isLogin ? LogIn : UserPlus" :size="20" />
                <span>{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
              </template>
            </button>
          </form>

          <div class="form-footer">
            <p>
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <button class="toggle-btn" @click="toggleMode">
                {{ isLogin ? 'Sign Up' : 'Sign In' }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  font-family: 'Inter', system-ui, sans-serif;
}

.back-to-home {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.back-to-home:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

.auth-container {
  width: 100%;
  max-width: 1100px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  min-height: 500px;
}

@media (min-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr 1fr;
    min-height: 600px;
  }
}

/* Left Panel */
.left-panel {
  background: linear-gradient(135deg, #5025d1 0%, #7c3aed 100%);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 250px;
}

@media (min-width: 768px) {
  .left-panel {
    padding: 3rem;
    min-height: auto;
  }
}

.branding {
  position: relative;
  z-index: 2;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

@media (min-width: 768px) {
  .logo-wrapper h2 {
    font-size: 1.75rem;
  }
}

.tagline {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

@media (min-width: 768px) {
  .tagline {
    font-size: 1.125rem;
  }
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
  margin-top: 2rem;
}

@media (max-width: 767px) {
  .features-list {
    display: none;
  }
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-text h4 {
  font-size: 0.9375rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.feature-text p {
  font-size: 0.8125rem;
  opacity: 0.8;
  margin: 0;
}

.decorative-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  z-index: 1;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.2);
  top: -100px;
  right: -100px;
}

.blob-2 {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.15);
  bottom: -50px;
  left: -50px;
}

/* Right Panel */
.right-panel {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

@media (min-width: 768px) {
  .right-panel {
    padding: 3rem;
  }
}

@media (min-width: 1024px) {
  .right-panel {
    padding: 3rem 4rem;
  }
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

@media (min-width: 768px) {
  .form-header h1 {
    font-size: 1.875rem;
  }
}

.form-header p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

@media (min-width: 768px) {
  .form-header p {
    font-size: 0.9375rem;
  }
}

.setup-warning {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.warning-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.setup-warning h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.setup-warning p {
  font-size: 0.875rem;
  color: #78350f;
  margin: 0 0 1rem 0;
}

.setup-warning code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
}

.demo-btn {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: #d97706;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #5025d1;
  background: white;
  box-shadow: 0 0 0 4px rgba(80, 37, 209, 0.1);
}

.input-wrapper input::placeholder {
  color: #cbd5e1;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #5025d1 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(80, 37, 209, 0.3);
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(80, 37, 209, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.form-footer {
  margin-top: 2rem;
  text-align: center;
}

.form-footer p {
  color: #64748b;
  font-size: 0.9375rem;
  margin: 0;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #5025d1;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(80, 37, 209, 0.1);
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .auth-page {
    padding: 0.5rem;
  }

  .back-to-home {
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .back-to-home span {
    display: none;
  }

  .auth-container {
    border-radius: 16px;
  }

  .left-panel {
    padding: 1.5rem;
    min-height: 200px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
  }

  .logo-wrapper h2 {
    font-size: 1.25rem;
  }

  .tagline {
    font-size: 0.875rem;
  }

  .right-panel {
    padding: 1.5rem 1rem;
  }

  .form-header {
    margin-bottom: 1.5rem;
  }

  .form-header h1 {
    font-size: 1.375rem;
  }

  .form-header p {
    font-size: 0.8125rem;
  }

  .auth-form {
    gap: 1rem;
  }

  .input-wrapper input {
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    font-size: 0.875rem;
  }

  .submit-btn {
    padding: 0.875rem;
    font-size: 0.9375rem;
  }
}
</style>
