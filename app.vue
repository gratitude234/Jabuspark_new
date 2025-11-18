<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <NuxtLayout>
      <div class="mx-auto max-w-2xl px-4 pb-24 pt-6">
        <NuxtPage />
      </div>
    </NuxtLayout>
    <ToastStack />
    <nav
      class="fixed bottom-0 left-0 right-0 mx-auto flex max-w-2xl items-center justify-around border-t border-white/10 bg-slate-900/90 px-4 py-2 text-xs backdrop-blur"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center gap-1"
        :class="route.path === link.to ? 'text-amber-300' : 'text-slate-400'"
      >
        <span class="text-lg">{{ link.icon }}</span>
        <span>{{ link.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/stores/useAuth'
import ToastStack from '~/components/ToastStack.vue'

const route = useRoute()
const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/library', label: 'Library', icon: '📚' },
  { to: '/ask', label: 'Ask', icon: '❓' },
  { to: '/drill', label: 'Drill', icon: '⚡' },
  { to: '/me', label: 'Me', icon: '🙂' },
]

const auth = useAuth()

onMounted(async () => {
  await auth.init()
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW register failed', err))
  }
})
</script>
