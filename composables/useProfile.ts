import { watch } from 'vue'
import type { Profile } from '~/types/models'

type UpsertInput = Partial<
  Pick<
    Profile,
    'full_name' | 'email' | 'matric_no' | 'faculty' | 'department' | 'level' | 'avatar_url'
  >
>

export function useProfile() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = useState<Profile | null>('profile:data', () => null)
  const isLoading = useState<boolean>('profile:loading', () => false)
  const error = useState<string | null>('profile:error', () => null)
  const watcherInitialized = useState<boolean>('profile:watcher:initialized', () => false)

  async function refreshProfile(force = false) {
    if (!user.value) {
      profile.value = null
      return
    }

    if (isLoading.value && !force) return

    isLoading.value = true
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
      profile.value = (data as Profile | null) ?? null
    } catch (err: any) {
      console.error('Failed to load profile', err)
      error.value = err?.message || 'Failed to load profile'
    } finally {
      isLoading.value = false
    }
  }

  async function upsertProfile(partial: UpsertInput) {
    if (!user.value) throw new Error('Sign in required')

    isLoading.value = true
    error.value = null

    const payload = {
      id: user.value.id,
      full_name: partial.full_name ?? profile.value?.full_name ?? null,
      email: partial.email ?? profile.value?.email ?? user.value.email ?? null,
      matric_no: partial.matric_no ?? profile.value?.matric_no ?? null,
      faculty: partial.faculty ?? profile.value?.faculty ?? null,
      department: partial.department ?? profile.value?.department ?? null,
      level: partial.level ?? profile.value?.level ?? null,
      avatar_url: partial.avatar_url ?? profile.value?.avatar_url ?? null,
    }

    try {
      const { error: upsertError } = await client.from('profiles').upsert(payload, { onConflict: 'id' })
      if (upsertError) throw upsertError
      await refreshProfile(true)
    } catch (err: any) {
      console.error('Failed to update profile', err)
      error.value = err?.message || 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  if (!watcherInitialized.value && process.client) {
    watcherInitialized.value = true
    watch(
      () => user.value?.id,
      (next) => {
        if (!next) {
          profile.value = null
          return
        }
        refreshProfile()
      },
      { immediate: true },
    )
  }

  return {
    profile,
    isLoading,
    error,
    refreshProfile,
    upsertProfile,
  }
}
