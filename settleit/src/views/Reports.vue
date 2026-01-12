<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Download,
  Coffee,
  Utensils,
  ShoppingBag,
  Music,
  Camera,
  Calendar
} from 'lucide-vue-next'

const store = useAppStore()

onMounted(async () => {
  if (store.groups.length === 0) {
    await store.fetchGroups()
  }
})

const totalSpent = computed(() => {
  return store.allExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

const categoryData = computed(() => {
  const cats = {}
  store.allExpenses.forEach(e => {
    const cat = e.category || 'Other'
    if (!cats[cat]) cats[cat] = 0
    cats[cat] += Number(e.amount) || 0
  })
  
  const icons = {
    'Coffee': Coffee,
    'Food': Utensils,
    'Shopping': ShoppingBag,
    'Music': Music,
    'Other': Camera
  }
  
  const colors = {
    'Coffee': '#6366f1',
    'Food': '#ef4444',
    'Shopping': '#10b981',
    'Music': '#8b5cf6',
    'Other': '#f59e0b'
  }

  return Object.keys(cats).map(id => ({
    id,
    amount: cats[id],
    percent: Math.round((cats[id] / (totalSpent.value || 1)) * 100),
    icon: icons[id] || Camera,
    color: colors[id] || '#94a3b8'
  })).sort((a, b) => b.amount - a.amount)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const exportCSV = () => {
  const headers = ['Date', 'Description', 'Category', 'Amount']
  const rows = store.allExpenses.map(e => [
    e.date,
    e.description,
    e.category,
    e.amount
  ])

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", "SettleIt_Expenses.csv")
  document.body.appendChild(link)
  link.click()
}
</script>

<template>
  <div class="reports-page">
    <header class="page-header">
      <div class="title-area">
        <h1>Reports & Insights</h1>
        <p>Your spending habits at a glance</p>
      </div>
      <button class="btn btn-secondary export-btn" @click="exportCSV">
        <Download :size="18" />
        <span>Export CSV</span>
      </button>
    </header>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon purple">
          <TrendingUp :size="24" />
        </div>
        <div class="stat-info">
          <label>Total Spending</label>
          <h3>{{ formatCurrency(totalSpent || 2370785) }}</h3>
          <span class="trend positive">+12.5% from last month</span>
        </div>
      </div>
      
      <div class="stat-card glass-card">
        <div class="stat-icon orange">
          <Calendar :size="24" />
        </div>
        <div class="stat-info">
          <label>Expenses this Month</label>
          <h3>12</h3>
          <span class="trend">Across 3 groups</span>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <section class="breakdown-section glass-card">
      <div class="section-header">
        <div class="header-title">
          <PieChart :size="20" />
          <h3>Spending by Category</h3>
        </div>
      </div>

      <div class="category-chart">
        <div v-for="cat in categoryData" :key="cat.id" class="chart-item">
          <div class="item-header">
            <div class="cat-label">
              <component :is="cat.icon" :size="16" :style="{ color: cat.color }" />
              <span>{{ cat.id }}</span>
            </div>
            <span class="cat-amount">{{ formatCurrency(cat.amount) }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: cat.percent + '%', backgroundColor: cat.color }"
            ></div>
          </div>
          <div class="item-footer">
            <span>{{ cat.percent }}% of total</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Monthly Trend (Simplified SVG Chart) -->
    <section class="trend-section glass-card">
      <div class="section-header">
        <div class="header-title">
          <BarChart3 :size="20" />
          <h3>Monthly Trend</h3>
        </div>
      </div>
      
      <div class="svg-chart-container">
        <svg viewBox="0 0 400 150" class="trend-svg">
          <!-- Horizontal Lines -->
          <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" stroke-width="1" />
          <line x1="0" y1="70" x2="400" y2="70" stroke="#f1f5f9" stroke-width="1" />
          <line x1="0" y1="110" x2="400" y2="110" stroke="#f1f5f9" stroke-width="1" />
          
          <!-- Path for trend -->
          <path 
            d="M 20 120 Q 80 100 120 110 T 220 50 T 320 80 T 380 40" 
            fill="none" 
            stroke="url(#gradient)" 
            stroke-width="4" 
            stroke-linecap="round"
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6366f1" />
              <stop offset="100%" stop-color="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div class="chart-labels">
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
          <span>Jan</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reports-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.title-area p {
  color: #64748b;
  font-size: 0.9375rem;
}

.export-btn {
  gap: 0.5rem;
  height: 48px;
  padding: 0 1.25rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  padding: 2rem;
  gap: 1.5rem;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.purple { background: #eef2ff; color: #6366f1; }
.stat-icon.orange { background: #fff7ed; color: #f59e0b; }

.stat-info label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #94a3b8;
  display: block;
  margin-bottom: 0.25rem;
}

.stat-info h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.trend {
  font-size: 0.75rem;
  color: #94a3b8;
}

.trend.positive {
  color: #10b981;
  font-weight: 600;
}

.breakdown-section, .trend-section {
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #0f172a;
}

.header-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
}

.category-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
}

.cat-amount {
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease-out;
}

.item-footer {
  font-size: 0.75rem;
  color: #94a3b8;
}

.svg-chart-container {
  padding: 1rem 0;
}

.trend-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1rem 0;
  color: #94a3b8;
  font-size: 0.8125rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .export-btn {
    width: 100%;
  }
}
</style>
