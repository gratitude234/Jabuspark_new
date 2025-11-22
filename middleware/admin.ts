export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const user = useSupabaseUser()
  const { profile, fetchProfile, isAdmin, loading } = useCurrentProfile()

  if (!user.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }

  if (!profile.value && !loading.value) {
    try {
      await fetchProfile(true)
    } catch {
      // ignore profile fetch errors here; layout will handle surfacing issues
    }
  }

  if (loading.value) return

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
