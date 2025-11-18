<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
    <TransitionGroup name="toast" tag="div" class="flex w-full max-w-md flex-col gap-2">
      <div
        v-for="toast in toasts.items"
        :key="toast.id"
        class="pointer-events-auto rounded-2xl border border-white/10 px-4 py-3 text-sm shadow-xl shadow-slate-900/60"
        :class="variantClass(toast.type)"
      >
        <div class="flex items-start justify-between gap-4">
          <p class="font-medium">{{ toast.message }}</p>
          <button class="text-xs text-slate-200/70" @click="toasts.dismiss(toast.id)">Dismiss</button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToasts } from '~/stores/useToasts'

const toasts = useToasts()

function variantClass(type: 'info' | 'success' | 'error') {
  if (type === 'success') return 'bg-emerald-600/90 text-white'
  if (type === 'error') return 'bg-rose-600/90 text-white'
  return 'bg-slate-800/90 text-slate-100'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
