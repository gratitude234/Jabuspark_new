import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '~/types/models'

export const useAuth = defineStore('auth', {
  state: () => ({
    session: null as Session | null,
    user: null as User | null,
    profile: null as Profile | null,
    loading: false,
    error: null as string | null,
    listenerBound: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
  },
  actions: {
    async init() {
      const client = useSupabaseClient()
      this.loading = true
      try {
        const { data } = await client.auth.getSession()
        this.session = data.session
        this.user = data.session?.user ?? null
        if (this.user) {
          await this.ensureProfile(this.user)
          await this.fetchProfile()
        } else {
          this.profile = null
        }
        if (!this.listenerBound) {
          client.auth.onAuthStateChange(async (_event, session) => {
            this.session = session
            this.user = session?.user ?? null
            if (this.user) {
              await this.ensureProfile(this.user)
              await this.fetchProfile()
            } else {
              this.profile = null
            }
          })
          this.listenerBound = true
        }
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async signIn(email: string) {
      const client = useSupabaseClient()
      this.loading = true
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
      this.loading = false
      if (error) throw error
    },
    async ensureProfile(user: User | null) {
      if (!user) return
      const client = useSupabaseClient()
      const payload: Partial<Profile> & { id: string } = {
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email ?? '',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        email: user.email ?? null,
      }
      const { error } = await client.from('profiles').upsert(payload, { onConflict: 'id' })
      if (error) {
        console.error('ensureProfile error', error)
      }
    },
    async fetchProfile() {
      if (!this.user) return
      await this.ensureProfile(this.user)
      const client = useSupabaseClient()
      const { data, error } = await client
        .from('profiles')
        .select('id, full_name, avatar_url, email, role')
        .eq('id', this.user.id)
        .maybeSingle()
      if (error) {
        console.error('fetchProfile error', error)
        return
      }
      this.profile = (data as Profile) || null
    },
    async signOut() {
      const client = useSupabaseClient()
      await client.auth.signOut()
      this.session = null
      this.user = null
      this.profile = null
    },
  },
})
