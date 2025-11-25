<template>
  <header class="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
    <div>
      <p class="text-xs uppercase tracking-wide text-slate-500">Admin</p>
      <h1 class="text-xl font-semibold text-slate-900">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
        {{ initials }}
      </div>
      <div class="leading-tight">
        <p class="font-semibold text-slate-900">{{ profileName }}</p>
        <p class="text-xs text-slate-500">{{ profileEmail }}</p>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  profileName?: string
  profileEmail?: string
}>()

const initials = computed(() => {
  const source = props.profileName || props.profileEmail || 'A'
  const parts = source.split(' ').filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
})

const profileName = computed(() => props.profileName || 'Admin')
const profileEmail = computed(() => props.profileEmail || '')
</script>
