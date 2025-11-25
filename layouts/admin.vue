<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900">
    <div class="hidden w-64 shrink-0 md:block">
      <AdminSidebar
        :nav-items="navItems"
        :current-path="route.path"
        :profile-name="profile?.full_name || profile?.email || 'Admin'"
        :profile-email="profile?.email || ''"
      />
    </div>

    <div class="flex flex-1 flex-col">
      <AdminTopbar
        :title="pageTitle"
        :profile-name="profile?.full_name || profile?.email || 'Admin'"
        :profile-email="profile?.email || ''"
      />
      <main class="flex-1 px-4 py-6 md:px-8 md:py-10">
        <div v-if="loading" class="flex items-center justify-center py-10 text-sm text-slate-500">Loading admin...</div>
        <div v-else-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </div>
        <slot v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const { profile, loading, error, fetchProfile, isAdmin } = useCurrentProfile()

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Documents', to: '/admin/docs' },
  { label: 'Questions', to: '/admin/questions' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Settings', to: '/admin/settings' },
]

const pageTitle = computed(() => {
  if (route.meta?.title) return String(route.meta.title)
  if (route.path.startsWith('/admin/docs')) return 'Documents'
  return 'Dashboard'
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
