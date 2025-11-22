<template>
  <div class="rounded-2xl border border-white/5 bg-white/5 px-4 py-5 shadow-sm shadow-black/20">
    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold text-white">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
}>()
</script>
