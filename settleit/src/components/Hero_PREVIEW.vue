<script setup>
import { useRouter } from 'vue-router'
import { ArrowRight, TrendingUp, Users, Receipt } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <section class="hero-section">
    <div class="hero-container">
      <!-- Left Content -->
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-number">[1/8]</span>
        </div>

        <h1 class="hero-title">
          SPLIT EXPENSES
          <br />
          <span class="title-highlight">EFFORTLESSLY</span>
          <br />
          WITH FRIENDS
        </h1>

        <p class="hero-subtitle">
          Track group expenses, scan receipts, and settle up instantly. 
          No more awkward money conversations or forgotten IOUs.
        </p>

        <div class="hero-actions">
          <button @click="router.push('/login?mode=signup')" class="btn-primary">
            Get Started
          </button>
          <button @click="router.push('/login')" class="btn-secondary">
            Sign In
          </button>
        </div>

        <!-- Growth Metric -->
        <div class="growth-metric">
          <div class="metric-icon">
            <TrendingUp :size="24" />
          </div>
          <div class="metric-content">
            <div class="metric-value">₹2.5M+</div>
            <div class="metric-label">
              Expenses tracked by our users
              <br />
              through smart splitting and real-time sync
            </div>
          </div>
        </div>
      </div>

      <!-- Right Illustration Area -->
      <div class="hero-illustration">
        <!-- 3D Mockup Container -->
        <div class="mockup-container">
          <!-- Floating Icons -->
          <div class="floating-icon icon-1">
            <Receipt :size="32" class="icon-receipt" />
          </div>
          <div class="floating-icon icon-2">
            <Users :size="28" class="icon-users" />
          </div>
          <div class="floating-icon icon-3">
            <div class="icon-money">₹</div>
          </div>

          <!-- Main Illustration Placeholder -->
          <div class="illustration-card">
            <div class="card-header">
              <div class="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="card-title">Group Expenses</span>
            </div>
            
            <div class="card-body">
              <div class="expense-item">
                <div class="expense-icon groceries">🛒</div>
                <div class="expense-details">
                  <div class="expense-name">Groceries</div>
                  <div class="expense-meta">Split with 4 people</div>
                </div>
                <div class="expense-amount">₹1,240</div>
              </div>
              
              <div class="expense-item">
                <div class="expense-icon food">🍕</div>
                <div class="expense-details">
                  <div class="expense-name">Dinner</div>
                  <div class="expense-meta">Split with 3 people</div>
                </div>
                <div class="expense-amount">₹890</div>
              </div>
              
              <div class="expense-item">
                <div class="expense-icon transport">🚗</div>
                <div class="expense-details">
                  <div class="expense-name">Uber Ride</div>
                  <div class="expense-meta">Split with 2 people</div>
                </div>
                <div class="expense-amount">₹320</div>
              </div>

              <div class="total-section">
                <span>Total Spent</span>
                <span class="total-amount">₹2,450</span>
              </div>
            </div>
          </div>

          <!-- Decorative Elements -->
          <div class="pixel-text">SETTLE</div>
          <div class="pixel-text-2">IT</div>
        </div>
      </div>
    </div>

    <!-- Background Decorations -->
    <div class="bg-decoration-1"></div>
    <div class="bg-decoration-2"></div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
  padding: 120px 2rem 4rem;
  overflow: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

/* Left Content */
.hero-content {
  position: relative;
  z-index: 10;
}

.hero-badge {
  display: inline-block;
  margin-bottom: 2rem;
}

.badge-number {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  letter-spacing: 0.05em;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  line-height: 1.1;
  color: #1F2937;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.title-highlight {
  color: #6366F1;
  position: relative;
  display: inline-block;
}

.hero-subtitle {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #6B7280;
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: #6366F1;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  background: #4F46E5;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: white;
  color: #1F2937;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid #E5E7EB;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #6366F1;
  color: #6366F1;
  transform: translateY(-2px);
}

.growth-metric {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #6B7280;
}

/* Right Illustration */
.hero-illustration {
  position: relative;
  height: 600px;
}

.mockup-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.floating-icon {
  position: absolute;
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

.icon-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.icon-3 {
  bottom: 25%;
  left: 5%;
  animation-delay: 2s;
}

.icon-receipt {
  color: #EC4899;
}

.icon-users {
  color: #6366F1;
}

.icon-money {
  font-size: 2rem;
  font-weight: 800;
  color: #10B981;
}

.illustration-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-2deg);
  width: 400px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: transform 0.3s;
}

.illustration-card:hover {
  transform: translate(-50%, -50%) rotate(0deg) scale(1.02);
}

.card-header {
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-dots {
  display: flex;
  gap: 0.5rem;
}

.card-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.card-title {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.card-body {
  padding: 1.5rem;
}

.expense-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 0.75rem;
}

.expense-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.expense-icon.groceries {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.expense-icon.food {
  background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
}

.expense-icon.transport {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
}

.expense-details {
  flex: 1;
  min-width: 0;
}

.expense-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1F2937;
  margin-bottom: 0.125rem;
}

.expense-meta {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.expense-amount {
  font-weight: 700;
  font-size: 1rem;
  color: #1F2937;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  border-radius: 12px;
  margin-top: 1rem;
  font-weight: 600;
  color: #1F2937;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #6366F1;
}

.pixel-text {
  position: absolute;
  bottom: 10%;
  right: -5%;
  font-size: 8rem;
  font-weight: 900;
  color: rgba(99, 102, 241, 0.05);
  letter-spacing: -0.05em;
  line-height: 1;
  pointer-events: none;
  font-family: 'Arial Black', sans-serif;
}

.pixel-text-2 {
  position: absolute;
  bottom: -5%;
  right: 20%;
  font-size: 8rem;
  font-weight: 900;
  color: rgba(99, 102, 241, 0.05);
  letter-spacing: -0.05em;
  line-height: 1;
  pointer-events: none;
  font-family: 'Arial Black', sans-serif;
}

/* Background Decorations */
.bg-decoration-1 {
  position: absolute;
  top: 10%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.bg-decoration-2 {
  position: absolute;
  bottom: 10%;
  left: 5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 1024px) {
  .hero-illustration {
    height: 500px;
  }

  .illustration-card {
    width: 350px;
  }

  .pixel-text,
  .pixel-text-2 {
    font-size: 5rem;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 100px 1rem 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-illustration {
    height: 400px;
  }

  .illustration-card {
    width: 300px;
  }

  .floating-icon {
    padding: 0.75rem;
  }

  .pixel-text,
  .pixel-text-2 {
    display: none;
  }
}
</style>
