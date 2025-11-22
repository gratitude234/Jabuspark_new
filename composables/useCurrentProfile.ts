import type { Profile } from '~/types/models'

export function useCurrentProfile() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = useState<Profile | null>('current:profile', () => null)
  const loading = useState<boolean>('current:profile:loading', () => false)
  const error = useState<string | null>('current:profile:error', () => null)

  const isAdmin = computed(
    () => profile.value?.role === 'admin' || profile.value?.role === 'super_admin',
  )
  const isSuperAdmin = computed(() => profile.value?.role === 'super_admin')

  async function fetchProfile(force = false) {
    if (!user.value) {
      profile.value = null
      return
    }

    if (loading.value && !force) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await client
        .from('profiles')
        .select(
          'id, full_name, email, avatar_url, matric_no, faculty, department, level, role, created_at',
        )
        .eq('id', user.value.id)
        .maybeSingle()

      if (fetchError) throw fetchError
      profile.value = (data as Profile) ?? null
    } catch (err: any) {
      console.error('Failed to load current profile', err)
      error.value = err?.message || 'Failed to load profile'
    } finally {
      loading.value = false
    }
  }

  watch(
    () => user.value?.id,
    (next, prev) => {
      if (next && next !== prev) {
        fetchProfile(true)
      }
      if (!next) profile.value = null
    },
    { immediate: true },
  )

  return {
    profile,
    loading,
    error,
    fetchProfile,
    isAdmin,
    isSuperAdmin,
  }
}
