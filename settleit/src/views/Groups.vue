<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../stores/app'
import { useRouter } from 'vue-router'
import { 
  Users, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  ChevronRight,
  TrendingUp,
  Briefcase,
  Plane,
  Home,
  Utensils,
  X
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()
const viewMode = ref('grid') // 'grid' | 'list'
const searchQuery = ref('')
const showCreateModal = ref(false)

const newGroup = ref({
  name: '',
  description: '',
  category: 'General'
})

onMounted(async () => {
  await store.fetchGroups()
})

const filteredGroups = computed(() => {
  if (!searchQuery.value) return store.groups
  const query = searchQuery.value.toLowerCase()
  return store.groups.filter(g => 
    g.name.toLowerCase().includes(query) || 
    g.description?.toLowerCase().includes(query)
  )
})

const handleCreateGroup = async () => {
  if (!newGroup.value.name) return
  try {
    const group = await store.createGroup(newGroup.value.name, newGroup.value.description)
    showCreateModal.value = false
    newGroup.value = { name: '', description: '', category: 'General' }
    router.push(`/group/${group.id}`)
  } catch (err) {
    alert('Error creating group: ' + err.message)
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Helper for group initials/icons
const getGroupIcon = (name) => {
  // Simple logic to return an icon based on name keywords (mock logic)
  const n = name.toLowerCase()
  if (n.includes('trip') || n.includes('travel')) return Plane
  if (n.includes('home') || n.includes('house')) return Home
  if (n.includes('dinner') || n.includes('lunch')) return Utensils
  return Briefcase
}
</script>

<template>
  <div class="page-container">
    
    <header class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Groups</h1>
          <p class="subtitle">Manage shared expenses and balances.</p>
        </div>
        
        <button class="primary-btn desktop-only" @click="showCreateModal = true">
          <Plus :size="20" />
          <span>New Group</span>
        </button>
      </div>

      <div class="controls-bar">
        <div class="search-wrapper">
          <Search :size="18" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search groups..."
            class="search-input"
          >
        </div>

        <div class="view-toggles">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="Grid View"
          >
            <LayoutGrid :size="18" />
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="List View"
          >
            <List :size="18" />
          </button>
        </div>
      </div>
    </header>

    <main class="content-area">
      
      <div v-if="viewMode === 'grid'" class="groups-grid">
        <div class="group-card create-card" @click="showCreateModal = true">
          <div class="create-icon">
            <Plus :size="32" />
          </div>
          <h3>Create New Group</h3>
          <p>Start splitting with friends</p>
        </div>

        <div 
          v-for="group in filteredGroups" 
          :key="group.id" 
          class="group-card"
          @click="router.push(`/group/${group.id}`)"
        >
          <div class="card-header">
            <div class="icon-box">
              <component :is="getGroupIcon(group.name)" :size="20" />
            </div>
            <div class="more-options">
              <ChevronRight :size="20" class="text-sub" />
            </div>
          </div>

          <div class="card-body">
            <h3>{{ group.name }}</h3>
            <p class="description">{{ group.description || 'No description' }}</p>
            
            <div class="financial-snapshot">
              <div class="stat">
                <span class="label">Total Spent</span>
                <span class="value">{{ formatCurrency(group.totalSpent || 0) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="member-pile">
              <div class="avatar" v-for="i in Math.min(3, group.members?.length || 0)" :key="i">
                {{ group.members?.[i-1]?.name?.[0] || 'U' }}
              </div>
              <div v-if="(group.members?.length || 0) > 3" class="avatar count">
                +{{ group.members.length - 3 }}
              </div>
              <div v-if="(group.members?.length || 0) === 0" class="text-xs text-slate-400">
                No members
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="groups-list">
        <div 
          v-for="group in filteredGroups" 
          :key="group.id" 
          class="list-row"
          @click="router.push(`/group/${group.id}`)"
        >
          <div class="row-left">
            <div class="row-icon">
              <component :is="getGroupIcon(group.name)" :size="20" />
            </div>
            <div class="row-info">
              <h3>{{ group.name }}</h3>
              <p>{{ group.members?.length || 0 }} members • Updated recently</p>
            </div>
          </div>
          
          <div class="row-right">
            <div class="row-stat">
              <span class="label">Total</span>
              <span class="value">{{ formatCurrency(group.totalSpent || 0) }}</span>
            </div>
            <ChevronRight :size="20" class="text-sub" />
          </div>
        </div>
      </div>

      <div v-if="filteredGroups.length === 0 && searchQuery" class="empty-state">
        <Search :size="48" class="empty-icon" />
        <h3>No groups found</h3>
        <p>We couldn't find any groups matching "{{ searchQuery }}"</p>
      </div>

    </main>

    <button class="fab mobile-only" @click="showCreateModal = true">
      <Plus :size="24" />
    </button>

    <transition name="fade">
      <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
        <div class="modal-panel">
          <div class="modal-header">
            <h2>Create Group</h2>
            <button class="close-btn" @click="showCreateModal = false">
              <X :size="24" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="input-group">
              <label>Group Name</label>
              <input 
                v-model="newGroup.name" 
                type="text" 
                placeholder="e.g. Summer Vacation"
                autoFocus
              >
            </div>
            
            <div class="input-group">
              <label>Description</label>
              <textarea 
                v-model="newGroup.description" 
                rows="3" 
                placeholder="What's this group for?"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="text-btn" @click="showCreateModal = false">Cancel</button>
            <button 
              class="primary-btn" 
              :disabled="!newGroup.name"
              @click="handleCreateGroup"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </transition>

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
}

.page-container {
  min-height: 100vh;
  background-color: var(--bg-app);
  font-family: 'Inter', sans-serif;
  padding-bottom: 80px;
}

/* --- Header --- */
.page-header {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}
.header-text .subtitle {
  color: var(--text-sub);
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.controls-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.search-wrapper {
  flex: 1;
  position: relative;
}
.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sub);
}
.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.95rem;
  outline: none;
  background: #f8fafc;
  transition: all 0.2s;
}
.search-input:focus {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.view-toggles {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}
.toggle-btn {
  padding: 8px;
  border: none;
  background: transparent;
  color: var(--text-sub);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* --- Content Area --- */
.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem 1.5rem;
}

/* Grid Layout */
.groups-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .groups-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .groups-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Cards */
.group-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
  border-color: #cbd5e1;
}

/* Create New Card (Special) */
.create-card {
  border: 2px dashed #cbd5e1;
  background: transparent;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.create-card:hover {
  border-color: var(--primary);
  background: #eef2ff;
}
.create-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef2ff;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.create-card h3 { font-size: 1.1rem; font-weight: 700; color: var(--primary); }
.create-card p { color: var(--text-sub); font-size: 0.9rem; }

/* Standard Group Card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}
.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-body h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.description {
  font-size: 0.875rem;
  color: var(--text-sub);
  line-height: 1.4;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stat { display: flex; flex-direction: column; }
.stat .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-sub); font-weight: 600; }
.stat .value { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f8fafc;
}
.member-pile { display: flex; align-items: center; }
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 2px solid white;
  margin-left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-sub);
}
.avatar:first-child { margin-left: 0; }
.avatar.count { background: #f1f5f9; font-size: 0.7rem; }

/* List Layout */
.groups-list { display: flex; flex-direction: column; gap: 0.75rem; }
.list-row {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}
.list-row:hover { background: #f8fafc; }

.row-left { display: flex; align-items: center; gap: 1rem; }
.row-icon {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
}
.row-info h3 { font-weight: 600; font-size: 1rem; color: var(--text-main); }
.row-info p { font-size: 0.8rem; color: var(--text-sub); }

.row-right { display: flex; align-items: center; gap: 1.5rem; }
.row-stat { text-align: right; }
.row-stat .label { display: block; font-size: 0.7rem; color: var(--text-sub); }
.row-stat .value { font-weight: 700; color: var(--text-main); }

/* --- Components --- */
.primary-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.primary-btn:hover { background: #4338ca; }
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.desktop-only { display: none; }
@media(min-width: 768px) { .desktop-only { display: flex; } }

.fab {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  cursor: pointer;
}
@media(min-width: 768px) { .mobile-only { display: none; } }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-sub);
}
.empty-icon { opacity: 0.2; margin-bottom: 1rem; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-panel {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.modal-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
.close-btn { background: none; border: none; color: var(--text-sub); cursor: pointer; }

.input-group { margin-bottom: 1.5rem; }
.input-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-main); }
.input-group input, .input-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-group input:focus, .input-group textarea:focus { border-color: var(--primary); }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.text-btn { background: none; border: none; font-weight: 600; color: var(--text-sub); cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>