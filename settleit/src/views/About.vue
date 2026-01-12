<script setup>
import { 
  Info, 
  HelpCircle, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Users, 
  Rocket,
  Heart
} from 'lucide-vue-next'

const sections = [
  {
    title: 'About SettleIt',
    icon: Info,
    content: 'SettleIt is a modern expense splitter designed to make shared finances simple and stress-free. Whether you are living with roommates, traveling with friends, or managing shared subscriptions, SettleIt ensures transparency and fairness for everyone involved.',
    color: '#6366f1'
  },
  {
    title: 'Why SettleIt Exists',
    icon: HelpCircle,
    content: 'Manual expense tracking is painful and prone to errors. Forgotten payments and "who-paid-for-what" confusion can strain relationships. SettleIt exists to eliminate that tension by providing a single, trustworthy source of truth.',
    color: '#ec4899'
  },
  {
    title: 'How It Works',
    icon: Layers,
    steps: [
      'Create or join a group with your friends.',
      'Add members by their email addresses.',
      'Log shared expenses as they happen.',
      'Let SettleIt automatically calculate the splits.',
      'Track real-time balances and settle up easily.'
    ],
    color: '#10b981'
  },
  {
    title: 'Technology Stack',
    icon: Zap,
    content: 'Built with cutting-edge tech: Vue 3 for a fast UI, Firebase for secure authentication, and Firestore for lightning-fast real-time data sync across all your devices.',
    color: '#f59e0b'
  },
  {
    title: 'Transparency & Fairness',
    icon: ShieldCheck,
    content: 'Every calculation is precise and accessible to all group members. Real-time updates ensure that everyone sees the latest balances instantly, fostering trust and clarity in your shared spending.',
    color: '#06b6d4'
  },
  {
    title: 'Who Is It For',
    icon: Users,
    content: 'Perfect for roommates, travel groups, small teams, and friends sharing outings. Basically, anyone who shares costs and wants to focus on the experience, not the math.',
    color: '#8b5cf6'
  }
]
</script>

<template>
  <div class="about-page">
    <header class="about-header">
      <h1>SettleIt</h1>
      <p class="tagline">Shared spending, simplified.</p>
    </header>

    <div class="about-grid">
      <div 
        v-for="section in sections" 
        :key="section.title" 
        class="about-card glass-card"
      >
        <div class="card-header">
          <div class="icon-box" :style="{ backgroundColor: section.color + '15', color: section.color }">
            <component :is="section.icon" :size="24" />
          </div>
          <h3>{{ section.title }}</h3>
        </div>
        
        <div class="card-content">
          <p v-if="section.content">{{ section.content }}</p>
          <ul v-if="section.steps" class="steps-list">
            <li v-for="(step, index) in section.steps" :key="index">
              <span class="step-num">{{ index + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <section class="vision-section glass-card">
      <div class="section-title">
        <Rocket :size="24" />
        <h2>Future Vision</h2>
      </div>
      <p>We are constantly evolving. Our roadmap includes advanced reporting, automated settlement reminders, and deep spending insights. We build based on your feedback, striving to make SettleIt the ultimate companion for your shared life.</p>
    </section>

    <footer class="about-footer">
      <div class="closing">
        <Heart :size="20" class="heart-icon" />
        <p>SettleIt is built to help you focus on the memories, not the receipts. Enjoy your moments, and leave the math to us.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 4rem;
}

.about-header {
  text-align: center;
  padding: 2rem 0;
}

.about-header h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.about-header .tagline {
  font-size: 1.25rem;
  color: #64748b;
  font-weight: 500;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.about-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.card-content p {
  line-height: 1.6;
  color: #475569;
  font-size: 0.9375rem;
}

.steps-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.steps-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  font-size: 0.9375rem;
  color: #475569;
}

.step-num {
  background: #f1f5f9;
  color: #6366f1;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.vision-section {
  padding: 3rem;
  text-align: center;
  background: linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(248,250,252,0.8));
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  color: #6366f1;
}

.section-title h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.vision-section p {
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.8;
  color: #475569;
}

.about-footer {
  text-align: center;
  padding-top: 2rem;
}

.closing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.heart-icon {
  color: #ec4899;
  animation: pulse 2s infinite;
}

.closing p {
  font-weight: 600;
  color: #64748b;
  max-width: 500px;
  font-size: 0.875rem;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .about-header h1 {
    font-size: 2.25rem;
  }
}
</style>
