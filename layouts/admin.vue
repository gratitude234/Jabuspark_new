<template>
  <div class="flex min-h-screen bg-slate-950 text-slate-100">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-slate-900/80 px-4 py-6 backdrop-blur md:flex"
    >
      <div class="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
          JS
        </span>
        <span>JabuSpark Admin</span>
      </div>
      <nav class="flex flex-1 flex-col gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            route.path.startsWith(item.to)
              ? 'bg-amber-400/10 text-amber-200'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          "
        >
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="mt-6 rounded-lg border border-white/5 bg-white/5 px-3 py-3 text-xs text-slate-400">
        <p class="font-semibold text-slate-200">
          {{ profile?.full_name || profile?.email || 'Admin' }}
        </p>
        <p class="capitalize text-slate-400">
          {{ profile?.role || 'admin' }}
        </p>
      </div>
    </aside>

    <!-- Mobile top bar with drawer trigger -->
    <div class="fixed inset-x-0 top-0 z-20 flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-4 py-3 backdrop-blur md:hidden">
      <button
        class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium"
        @click="drawerOpen = true"
      >
        Menu
      </button>
      <div class="text-sm font-semibold">{{ pageTitle }}</div>
      <div class="text-xs text-slate-400 capitalize">
        {{ profile?.role || '' }}
      </div>
    </div>

    <!-- Drawer -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        @click="drawerOpen = false"
      />
    </Transition>
    <Transition name="slide">
      <aside
        v-if="drawerOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-white/5 bg-slate-900 px-4 py-6 md:hidden"
      >
        <div class="mb-6 flex items-center justify-between px-1">
          <span class="text-base font-semibold">Admin</span>
          <button
            class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs"
            @click="drawerOpen = false"
          >
            Close
          </button>
        </div>
        <nav class="flex flex-col gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
            :class="
              route.path.startsWith(item.to)
                ? 'bg-amber-400/10 text-amber-200'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
            @click="drawerOpen = false"
          >
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </aside>
    </Transition>

    <!-- Main content -->
    <div class="flex min-h-screen flex-1 flex-col md:ml-64">
      <header class="sticky top-0 z-10 hidden items-center justify-between border-b border-white/5 bg-slate-900/70 px-8 py-4 backdrop-blur md:flex">
        <div>
          <p class="text-sm text-slate-400">JabuSpark Admin</p>
          <h1 class="text-xl font-semibold text-white">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-amber-200">
            {{ initials }}
          </div>
          <div class="text-sm leading-tight">
            <p class="font-medium text-white">
              {{ profile?.full_name || profile?.email || 'Admin' }}
            </p>
            <p class="text-xs text-slate-400 capitalize">{{ profile?.role || '' }}</p>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-6 pt-16 md:px-8 md:py-10 md:pt-10">
        <div v-if="loading" class="flex items-center justify-center py-20 text-sm text-slate-400">
          Loading admin...
        </div>
        <div v-else-if="error" class="rounded-lg border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-sm text-rose-100">
          {{ error }}
        </div>
        <slot v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const drawerOpen = ref(false)

const { profile, loading, error, fetchProfile, isAdmin } = useCurrentProfile()
const user = useSupabaseUser()

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Library', to: '/admin/library' },
  { label: 'Drills', to: '/admin/drills' },
  { label: 'Reports', to: '/admin/reports' },
  { label: 'Settings', to: '/admin/settings' },
]

const pageTitle = computed(() => {
  if (route.meta?.title) return String(route.meta.title)
  if (route.path.startsWith('/admin/users')) return 'Users'
  if (route.path.startsWith('/admin/library')) return 'Library'
  if (route.path.startsWith('/admin/drills')) return 'Drills'
  if (route.path.startsWith('/admin/reports')) return 'Reports'
  if (route.path.startsWith('/admin/settings')) return 'Settings'
  return 'Dashboard'
})

const initials = computed(() => {
  const source = profile.value?.full_name || profile.value?.email || ''
  const parts = source.split(' ').filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
})

watchEffect(() => {
  if (!user.value) {
    navigateTo('/auth/login')
    return
  }
  if (!loading.value && profile.value && !isAdmin.value) {
    navigateTo('/')
  }
})

onMounted(() => {
  if (user.value) {
    fetchProfile()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
