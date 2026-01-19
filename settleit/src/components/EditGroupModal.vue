<script setup>
import { ref } from 'vue'
import { X, Pencil, Trash2 } from 'lucide-vue-next'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'update', 'delete'])

const toastStore = useToastStore()
const groupName = ref(props.group.name)
const groupDescription = ref(props.group.description || '')

const handleUpdate = () => {
  if (!groupName.value.trim()) {
    toastStore.error('Group name is required')
    return
  }
  
  emit('update', {
    name: groupName.value.trim(),
    description: groupDescription.value.trim()
  })
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Edit Group</h2>
        <button class="close-btn" @click="emit('close')">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-content">
        <div class="input-group">
          <label>Group Name</label>
          <input 
            v-model="groupName" 
            type="text" 
            placeholder="e.g. Trip to Manali"
            autofocus
          />
        </div>

        <div class="input-group">
          <label>Description</label>
          <textarea 
            v-model="groupDescription" 
            rows="3"
            placeholder="What's this group for?"
          ></textarea>
        </div>

        <div class="danger-zone">
          <div class="danger-header">
            <Trash2 :size="18" />
            <span>Danger Zone</span>
          </div>
          <p>Once you delete a group, there is no going back. Please be certain.</p>
          <button class="btn-delete" @click="emit('delete')">
            Delete Group
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="handleUpdate">
          <Pencil :size="16" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group textarea:focus {
  border-color: #5025d1;
  box-shadow: 0 0 0 3px rgba(80, 37, 209, 0.1);
}

.danger-zone {
  margin-top: 1rem;
  padding: 1.25rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.danger-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 700;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
}

.danger-zone p {
  font-size: 0.875rem;
  color: #991b1b;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.btn-delete {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #b91c1c;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #5025d1;
  color: white;
}

.btn-primary:hover {
  background: #4318b8;
}
</style>
