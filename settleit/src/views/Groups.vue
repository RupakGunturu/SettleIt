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
  Receipt
} from 'lucide-vue-next'

const store = useAppStore()
const router = useRouter()
const viewMode = ref('grid') // 'grid' or 'list'
const searchQuery = ref('')
const showCreateModal = ref(false)

const newGroup = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  await store.fetchGroups()
})

const filteredGroups = computed(() => {
  if (!searchQuery.value) return store.groups
  const query = searchQuery.value.toLowerCase()
  return store.groups.filter(g => 
    g.name.toLowerCase().includes(query) || 
    g.description.toLowerCase().includes(query)
  )
})

const handleCreateGroup = async () => {
  if (!newGroup.value.name) return
  try {
    const group = await store.createGroup(newGroup.value.name, newGroup.value.description)
    showCreateModal.value = false
    newGroup.value = { name: '', description: '' }
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
</script>

<template>
  <div class="groups-page">
    <header class="section-header">
      <div class="title-area">
        <h1>Your Groups</h1>
        <p>Manage all your shared circles in one place</p>
      </div>
      <button class="btn btn-primary create-btn" @click="showCreateModal = true">
        <Plus :size="20" />
        <span>Create New Group</span>
      </button>
    </header>

    <div class="controls-bar glass-card">
      <div class="search-input">
        <Search :size="18" />
        <input v-model="searchQuery" type="text" placeholder="Search groups...">
      </div>
      <div class="view-toggles">
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid :size="18" />
        </button>
        <button 
          class="toggle-btn" 
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <List :size="18" />
        </button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="groups-grid">
      <div 
        v-for="group in filteredGroups" 
        :key="group.id" 
        class="group-card glass-card"
        @click="router.push(`/group/${group.id}`)"
      >
        <div class="card-brand"></div>
        <div class="card-body">
          <div class="group-icon">
            {{ group.name[0] }}
          </div>
          <div class="group-info">
            <h3>{{ group.name }}</h3>
            <p>{{ group.members?.length || 0 }} Members</p>
          </div>
        </div>
        <div class="card-footer">
          <div class="spend-stat">
            <TrendingUp :size="14" />
            <span>{{ formatCurrency(group.totalSpent || 0) }}</span>
          </div>
          <ChevronRight :size="18" class="arrow" />
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="groups-list">
      <div 
        v-for="group in filteredGroups" 
        :key="group.id" 
        class="list-item glass-card"
        @click="router.push(`/group/${group.id}`)"
      >
        <div class="item-icon">
          {{ group.name[0] }}
        </div>
        <div class="item-main">
          <h3>{{ group.name }}</h3>
          <p>{{ group.description }}</p>
        </div>
        <div class="item-stats">
          <div class="stat">
            <Users :size="16" />
            <span>{{ group.members?.length || 0 }}</span>
          </div>
          <div class="stat">
            <Receipt :size="16" />
            <span>{{ formatCurrency(group.totalSpent || 0) }}</span>
          </div>
        </div>
        <ChevronRight :size="20" class="arrow" />
      </div>
    </div>

    <div v-if="filteredGroups.length === 0" class="empty-groups glass-card">
      <div class="empty-icon">📂</div>
      <h3>No groups found</h3>
      <p>Create your first group to start splitting expenses!</p>
      <button class="btn btn-primary" @click="showCreateModal = true">Get Started</button>
    </div>

    <!-- Create Group Modal (using simplified version) -->
    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal-content glass-card">
        <h2>New Group</h2>
        <div class="form-group">
          <label>Group Name</label>
          <input v-model="newGroup.name" type="text" placeholder="e.g. Trip to Goa">
        </div>
        <div class="form-group">
          <label>Description (Optional)</label>
          <input v-model="newGroup.description" type="text" placeholder="e.g. Shared expenses for our trip">
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button class="btn btn-primary" @click="handleCreateGroup" :disabled="!newGroup.name">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.groups-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.section-header {
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

.create-btn {
  gap: 0.5rem;
  height: 48px;
  padding: 0 1.5rem;
}

.controls-bar {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.search-input input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 0.875rem;
}

.search-input input:focus { outline: none; }

.view-toggles {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.toggle-btn {
  padding: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
}

.toggle-btn.active {
  background: white;
  color: #5025d1;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.group-card {
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.group-card:hover {
  transform: translateY(-5px);
}

.card-brand {
  height: 6px;
  background: linear-gradient(90deg, #5025d1, #ec4899);
}

.card-body {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.group-icon {
  width: 52px;
  height: 52px;
  background: #f1f5f9;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #5025d1;
}

.group-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.group-info p {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spend-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
}

.arrow { color: #cbd5e1; }

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  gap: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.list-item:hover {
  background: rgba(80, 37, 209, 0.02);
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #5025d1;
}

.item-main { flex: 1; }
.item-main h3 { font-size: 1rem; font-weight: 700; color: #0f172a; }
.item-main p { font-size: 0.8125rem; color: #94a3b8; }

.item-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.empty-groups {
  padding: 5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.2; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
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
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions .btn { flex: 1; }
</style>
