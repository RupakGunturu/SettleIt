<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import { 
  Download,
  ChevronLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Activity
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()

const timeRange = ref('Month')
const ranges = ['Week', 'Month', 'Year']

onMounted(async () => {
  if (store.groups.length === 0) {
    await store.fetchGroups()
  }
})

// --- Mock Data & Computeds ---

// In a real app, these would filter store.allExpenses based on timeRange
const totalBalance = ref(12450)
const totalIncome = ref(24000)
const totalExpense = computed(() => {
  return store.allExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
})

const budgetLimit = 30000
const budgetPercentage = computed(() => Math.min((totalExpense.value / budgetLimit) * 100, 100))

const categoryBreakdown = computed(() => {
  const categories = {}
  store.allExpenses.forEach(expense => {
    const cat = expense.category || 'Other'
    categories[cat] = (categories[cat] || 0) + Number(expense.amount)
  })
  
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0) || 1
  
  return Object.entries(categories)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / total) * 100)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4)
})

const getCategoryColor = (index) => {
  const colors = ['#8b5cf6', '#ef4444', '#f59e0b', '#3b82f6']
  return colors[index] || '#64748b'
}

const recentTransactions = computed(() => {
  return [...store.allExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const getPieSlicePath = (index) => {
  let startAngle = 0
  for (let i = 0; i < index; i++) {
    startAngle += (categoryBreakdown.value[i].percentage / 100) * 360
  }
  const angle = (categoryBreakdown.value[index].percentage / 100) * 360
  const endAngle = startAngle + angle
  const startRad = (startAngle - 90) * Math.PI / 180
  const endRad = (endAngle - 90) * Math.PI / 180
  const x1 = 100 + 90 * Math.cos(startRad)
  const y1 = 100 + 90 * Math.sin(startRad)
  const x2 = 100 + 90 * Math.cos(endRad)
  const y2 = 100 + 90 *  Math.sin(endRad)
  const largeArc = angle > 180 ? 1 : 0
  return `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

const exportCSV = () => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Type']
  const rows = store.allExpenses.map(e => [
    new Date(e.date).toLocaleDateString(),
    e.description,
    e.category,
    e.amount,
    'Expense'
  ])

  let csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `Financial_Report_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
}
</script>

<template>
  <div class="dashboard-container">
    
    <header class="dashboard-header">
      <div class="header-left">
        <button class="icon-btn back-btn" @click="router.back()">
          <ChevronLeft :size="22" />
        </button>
        <div>
          <h1>Financial Overview</h1>
          <p class="subtitle">Track your income, expenses, and budget.</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="range-selector">
          <button 
            v-for="r in ranges" 
            :key="r"
            class="range-btn"
            :class="{ active: timeRange === r }"
            @click="timeRange = r"
          >
            {{ r }}
          </button>
        </div>
        <button class="primary-btn" @click="exportCSV">
          <Download :size="18" />
          <span class="desktop-text">Export Report</span>
        </button>
      </div>
    </header>

    <main class="dashboard-grid">
      
      <section class="stats-row">
        <div class="stat-card balance-card">
          <div class="stat-icon">
            <Wallet :size="24" />
          </div>
          <div class="stat-content">
            <span class="label">Total Balance</span>
            <span class="value">{{ formatCurrency(totalBalance) }}</span>
            <span class="trend positive">
              <TrendingUp :size="14" /> +12.5% vs last month
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon income-icon">
            <ArrowDownLeft :size="24" />
          </div>
          <div class="stat-content">
            <span class="label">Total Income</span>
            <span class="value">{{ formatCurrency(totalIncome) }}</span>
            <span class="trend neutral">
              No change
            </span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon expense-icon">
            <ArrowUpRight :size="24" />
          </div>
          <div class="stat-content">
            <span class="label">Total Expense</span>
            <span class="value">{{ formatCurrency(totalExpense) }}</span>
            <span class="trend negative">
              <TrendingDown :size="14" /> +5.2% vs last month
            </span>
          </div>
        </div>
      </section>

      <section class="chart-section card">
        <div class="card-header">
          <div>
            <h3>Spending Breakdown</h3>
            <p class="chart-subtitle">{{ timeRange }} overview by category</p>
          </div>
        </div>
        
        <div class="pie-chart-container">
          <div class="chart-wrapper">
            <svg viewBox="0 0 200 200" class="pie-chart">
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.15"/>
                </filter>
                <linearGradient v-for="(cat, index) in categoryBreakdown" :key="'grad-' + index" :id="'gradient-' + index" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" :stop-color="getCategoryColor(index)" stop-opacity="1"/>
                  <stop offset="100%" :stop-color="getCategoryColor(index)" stop-opacity="0.7"/>
                </linearGradient>
              </defs>
              
              <circle cx="100" cy="100" r="95" fill="#f8fafc" />
              
              <g class="pie-slices">
                <path
                  v-for="(cat, index) in categoryBreakdown" 
                  :key="cat.name"
                  :d="getPieSlicePath(index)"
                  :fill="`url(#gradient-${index})`"
                  class="pie-slice"
                  filter="url(#shadow)"
                  @mouseenter="() => {}"
                />
              </g>
              
              <circle cx="100" cy="100" r="65" fill="white" filter="url(#shadow)" />
              
              <text x="100" y="92" text-anchor="middle" class="pie-center-amount">{{ formatCurrency(totalExpense) }}</text>
              <text x="100" y="108" text-anchor="middle" class="pie-center-label">Total Spent</text>
            </svg>
          </div>

          <div class="category-legend">
            <div 
              v-for="(cat, index) in categoryBreakdown" 
              :key="cat.name"
              class="legend-item"
            >
              <div class="legend-marker" :style="{ background: `linear-gradient(135deg, ${getCategoryColor(index)}, ${getCategoryColor(index)}dd)` }"></div>
              <div class="legend-content">
                <div class="legend-top">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-percent">{{ cat.percentage }}%</span>
                </div>
                <div class="legend-bottom">
                  <span class="cat-amount">{{ formatCurrency(cat.amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="sidebar">
        
        <div class="card budget-card">
          <div class="card-header">
            <h3>Monthly Budget</h3>
            <PieChart :size="18" class="text-sub" />
          </div>
          <div class="budget-body">
            <div class="budget-info">
              <span class="spent">{{ formatCurrency(totalExpense) }}</span>
              <span class="limit">of {{ formatCurrency(budgetLimit) }}</span>
            </div>
            <div class="progress-bar-bg">
              <div 
                class="progress-bar-fill" 
                :class="{ warning: budgetPercentage > 80 }"
                :style="{ width: `${budgetPercentage}%` }"
              ></div>
            </div>
            <p class="budget-msg" v-if="budgetPercentage < 80">You're doing great! 👍</p>
            <p class="budget-msg warning" v-else>Careful, you're close to limit! ⚠️</p>
          </div>
        </div>

        <div class="card transactions-card">
          <div class="card-header">
            <h3>Recent Activity</h3>
            <button class="link-btn" @click="router.push('/activity')">View all</button>
          </div>
          
          <div class="tx-list">
            <div v-if="recentTransactions.length === 0" class="empty-tx">
              <Activity :size="24" />
              <span>No recent transactions</span>
            </div>

            <div v-for="tx in recentTransactions" :key="tx.id" class="tx-item">
              <div class="tx-left">
                <div class="tx-icon">
                  {{ tx.description[0] }}
                </div>
                <div class="tx-details">
                  <span class="tx-desc">{{ tx.description }}</span>
                  <span class="tx-cat">{{ tx.category }}</span>
                </div>
              </div>
              <div class="tx-right">
                <span class="tx-amount">-{{ formatCurrency(tx.amount) }}</span>
                <span class="tx-date">{{ formatDate(tx.date) }}</span>
              </div>
            </div>
          </div>
        </div>

      </aside>

    </main>
  </div>
</template>

<style scoped>
/* --- Design Variables --- */
:root {
  --primary: #4f46e5;
  --bg-app: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border: #e2e8f0;
  --success: #10b981;
  --danger: #ef4444;
}

.dashboard-container {
  min-height: 100vh;
  background-color: var(--bg-app);
  font-family: 'Inter', sans-serif;
  padding-bottom: 2rem;
}

/* --- Header --- */
.dashboard-header {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .dashboard-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 80px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: white;
  border: 1px solid var(--border);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { border-color: var(--text-sub); color: var(--text-main); }

.header-left h1 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); line-height: 1.2; }
.subtitle { font-size: 0.875rem; color: var(--text-sub); }

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}

.range-selector {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  display: flex;
}

.range-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-sub);
  border-radius: 8px;
  cursor: pointer;
}
.range-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.primary-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.desktop-text { display: none; }
@media(min-width: 768px) { .desktop-text { display: inline; } }

/* --- Grid Layout --- */
.dashboard-grid {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr; /* Chart takes 2 cols, Sidebar takes 1 */
    grid-template-rows: auto 1fr;
  }
}

/* --- Stats Row --- */
.stats-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .stats-row { grid-column: 1 / -1; }
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: var(--text-sub);
}

.balance-card .stat-icon { background: #eef2ff; color: var(--primary); }
.income-icon { background: #ecfdf5; color: var(--success); }
.expense-icon { background: #fef2f2; color: var(--danger); }

.stat-content { display: flex; flex-direction: column; }
.stat-content .label { font-size: 0.875rem; color: var(--text-sub); font-weight: 500; }
.stat-content .value { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 0.25rem 0; }
.stat-content .trend { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.trend.positive { color: var(--success); }
.trend.negative { color: var(--danger); }
.trend.neutral { color: var(--text-sub); }

/* --- Chart Section --- */
.card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.card-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

.legend { display: flex; gap: 1rem; }
.legend-item { font-size: 0.75rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-sub); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.income { background: var(--primary); }
.dot.expense { background: #cbd5e1; }

/* Pie Chart Styles */
.chart-subtitle {
  font-size: 0.875rem;
  color: var(--text-sub);
  margin-top: 0.25rem;
}

.pie-chart-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  padding: 1.5rem 0;
}

@media (min-width: 768px) {
  .pie-chart-container {
    grid-template-columns: 300px 1fr;
    align-items: center;
  }
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.pie-chart {
  width: 100%;
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.08));
}

.pie-slices {
  animation: rotateIn 0.8s ease-out;
}

@keyframes rotateIn {
  from {
    transform: rotate(-90deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}

.pie-slice {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  cursor: pointer;
  stroke: white;
  stroke-width: 2;
}

.pie-slice:hover {
  filter: brightness(1.1) saturate(1.2);
  transform: scale(1.02);
}

.pie-center-amount {
  font-size: 28px;
  font-weight: 900;
  fill: var(--text-main);
  letter-spacing: -0.5px;
  animation: fadeIn 0.6s ease-out 0.3s both;
}

.pie-center-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: fadeIn 0.6s ease-out 0.4s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Category Legend */
.category-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.legend-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.legend-marker {
  width: 12px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.legend-top,
.legend-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-main);
}

.cat-percent {
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--primary);
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 6px;
}

.cat-amount {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-sub);
}

/* --- Sidebar --- */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.text-sub { color: var(--text-sub); }

.budget-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}
.budget-info .spent { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
.budget-info .limit { font-size: 0.875rem; color: var(--text-sub); }

.progress-bar-bg {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.progress-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
}
.progress-bar-fill.warning { background: var(--danger); }

.budget-msg { font-size: 0.875rem; color: var(--text-sub); }
.budget-msg.warning { color: var(--danger); font-weight: 600; }

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
}

/* Transactions List */
.tx-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-tx {
  text-align: center;
  padding: 2rem;
  color: var(--text-sub);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tx-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f8fafc;
}
.tx-item:last-child { border-bottom: none; padding-bottom: 0; }

.tx-left { display: flex; gap: 0.75rem; align-items: center; }

.tx-icon {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--primary);
}

.tx-details { display: flex; flex-direction: column; }
.tx-desc { font-weight: 600; font-size: 0.9rem; color: var(--text-main); }
.tx-cat { font-size: 0.75rem; color: var(--text-sub); }

.tx-right { text-align: right; display: flex; flex-direction: column; }
.tx-amount { font-weight: 700; color: var(--text-main); font-size: 0.9rem; }
.tx-date { font-size: 0.75rem; color: var(--text-sub); }
</style>