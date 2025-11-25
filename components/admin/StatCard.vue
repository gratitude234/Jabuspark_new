<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-sm font-medium text-slate-500">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold text-slate-900">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>
