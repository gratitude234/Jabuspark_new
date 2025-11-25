<template>
  <aside class="flex h-full flex-col border-r border-slate-200 bg-white/70 backdrop-blur">
    <div class="flex items-center gap-2 px-4 py-4 text-lg font-semibold text-slate-900">
      <span class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">JS</span>
      <span>Admin</span>
    </div>
    <nav class="flex flex-1 flex-col gap-1 px-2 py-2">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
        :class="
          currentPath.startsWith(item.to)
            ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        "
      >
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <div class="px-4 py-4 text-sm text-slate-600">
      <p class="font-semibold text-slate-900">{{ profileName }}</p>
      <p class="text-slate-500">{{ profileEmail }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  navItems: Array<{ label: string; to: string }>
  currentPath: string
  profileName?: string
  profileEmail?: string
}>()

const profileName = computed(() => props.profileName || 'Admin')
const profileEmail = computed(() => props.profileEmail || '')
</script>
