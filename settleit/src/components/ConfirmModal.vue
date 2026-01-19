<script setup>
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'danger', // 'danger' | 'warning' | 'info'
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="icon-wrapper" :class="type">
          <AlertTriangle :size="24" />
        </div>
        <button class="close-btn" @click="emit('cancel')">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-content">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="emit('cancel')">
          {{ cancelText }}
        </button>
        <button class="btn btn-danger" :class="type" @click="emit('confirm')">
          {{ confirmText }}
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.danger {
  background: #fee2e2;
  color: #dc2626;
}

.icon-wrapper.warning {
  background: #fef3c7;
  color: #f59e0b;
}

.icon-wrapper.info {
  background: #dbeafe;
  color: #3b82f6;
}

.close-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-content {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
}

.modal-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.modal-content p {
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.5;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-danger.warning {
  background: #f59e0b;
}

.btn-danger.warning:hover {
  background: #d97706;
}

.btn-danger.info {
  background: #3b82f6;
}

.btn-danger.info:hover {
  background: #2563eb;
}
</style>
