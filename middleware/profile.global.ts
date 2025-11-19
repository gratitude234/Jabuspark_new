export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  const allowedPaths = ['/onboarding', '/login', '/signup']
  if (to.path.startsWith('/auth') || allowedPaths.includes(to.path)) {
    return
  }

  const user = useSupabaseUser()
  if (!user.value) return

  const { profile, isLoading, refreshProfile } = useProfile()

  if (!profile.value && !isLoading.value) {
    try {
      await refreshProfile()
    } catch {
      // ignore
    }
  }

  const department = profile.value?.department?.trim()
  const level = profile.value?.level?.trim()
  const needsOnboarding = !department || !level

  if (needsOnboarding && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }
})
