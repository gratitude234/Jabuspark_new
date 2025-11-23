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
      this.error = null

      try {
        const { data, error } = await client.auth.getSession()
        if (error) throw error

        this.session = data.session ?? null
        this.user = data.session?.user ?? null

        if (this.user) {
          await this.ensureProfile(this.user)
          await this.fetchProfile()
        } else {
          this.profile = null
        }

        if (!this.listenerBound) {
          client.auth.onAuthStateChange(async (_event, session) => {
            this.session = session ?? null
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
      } catch (err: any) {
        console.error('auth.init error', err)
        this.error = err?.message || 'Failed to initialise auth.'
      } finally {
        this.loading = false
      }
    },

    /**
     * Email + password sign-in (no magic link).
     * Call this from SignInCard as auth.signIn(email, password).
     */
    async signIn(email: string, password: string) {
      const client = useSupabaseClient()
      this.loading = true
      this.error = null

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        this.session = data.session ?? null
        this.user = data.user ?? data.session?.user ?? null

        if (this.user) {
          await this.ensureProfile(this.user)
          await this.fetchProfile()
        }

        return this.user
      } catch (err: any) {
        console.error('auth.signIn error', err)
        this.error = err?.message || 'Sign in failed.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async ensureProfile(user: User | null) {
      if (!user) return
      const client = useSupabaseClient()

      const payload: Partial<Profile> & { id: string } = { id: user.id }

      if (user.email) payload.email = user.email
      if (user.user_metadata?.full_name) {
        payload.full_name = user.user_metadata.full_name
      }
      if (user.user_metadata?.avatar_url) {
        payload.avatar_url = user.user_metadata.avatar_url
      }

      const { error } = await client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })

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
        .select(
          'id, full_name, email, avatar_url, matric_no, faculty, department, level, role, created_at',
        )
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
      try {
        await client.auth.signOut()
      } catch (err) {
        console.error('auth.signOut error', err)
      } finally {
        this.session = null
        this.user = null
        this.profile = null
        this.error = null
      }
    },
  },
})
