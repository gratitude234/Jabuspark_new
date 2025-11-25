<template>
  <span :class="badgeClass" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    status: string
    type?: 'approval' | 'question' | 'visibility'
  }>(),
  {
    type: 'approval',
  },
)

const label = computed(() => props.status.replace(/_/g, ' '))

const badgeClass = computed(() => {
  if (props.type === 'approval') {
    if (props.status === 'approved') return 'bg-emerald-100 text-emerald-800'
    if (props.status === 'archived') return 'bg-slate-200 text-slate-700'
    return 'bg-amber-100 text-amber-800'
  }
  if (props.type === 'question') {
    if (props.status === 'has_questions') return 'bg-emerald-100 text-emerald-800'
    if (props.status === 'pending_admin') return 'bg-amber-100 text-amber-800'
    return 'bg-slate-200 text-slate-700'
  }
  if (props.type === 'visibility') {
    return props.status === 'course'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-indigo-100 text-indigo-800'
  }
  return 'bg-slate-200 text-slate-700'
})
</script>
