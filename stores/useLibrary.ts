// stores/useLibrary.ts
import { defineStore } from 'pinia'
import { useSupabaseClient } from '#imports'
import type { DocumentRow } from '~/types/models'
import { useAuth } from './useAuth'
import { useToasts } from './useToasts'

interface SessionState {
  id?: string
  docId?: string
  page?: number
  mode: 'ask' | 'drill' | 'reader'
  metadata?: Record<string, any>
}

export const useLibrary = defineStore('library', {
  state: () => ({
    documents: [] as DocumentRow[],
    loading: false,
    error: null as string | null,
    lastSession: null as SessionState | null,
  }),

  actions: {
    async loadDocuments() {
      const auth = useAuth()
      if (!auth.user) return

      this.loading = true
      const client = useSupabaseClient()

      const { data, error } = await client
        .from('documents')
        .select('*, courses:course_id(id, code, title, level)')
        .order('updated_at', { ascending: false })

      this.loading = false

      if (error) {
        this.error = error.message
        return
      }

      this.documents = (data as DocumentRow[]) || []
    },

    async uploadDocument(
      file: File,
      options?: {
        visibility?: 'personal' | 'course'
        course?: string | null
        docType?: string | null
        courseCode?: string | null
        level?: string | null
        faculty?: string | null
        department?: string | null
        isPublic?: boolean | null
      },
    ) {
      const auth = useAuth()
      const toasts = useToasts()

      if (!auth.user) throw new Error('Sign in required')

      const visibility = options?.visibility ?? 'personal'
      const course = options?.course ?? null
      const docType = options?.docType ?? null
      const courseCode = options?.courseCode ?? course
      const level = options?.level ?? null
      const faculty = options?.faculty ?? null
      const department = options?.department ?? null
      const isPublic = options?.isPublic ?? false

      const payloadMeta = {
        visibility,
        course,
        docType,
        courseCode,
        level,
        faculty,
        department,
        isPublic,
      }

      try {
        console.log('[uploadDocument] browser: starting', {
          name: file.name,
          size: file.size,
          type: file.type,
          meta: payloadMeta,
        })

        // Build FormData for /api/docs/upload
        const form = new FormData()
        form.append('file', file)
        form.append('meta', JSON.stringify(payloadMeta))

        console.log('[uploadDocument] browser: sending to /api/docs/upload')

        const result: any = await $fetch('/api/docs/upload', {
          method: 'POST',
          body: form,
        })

        console.log('[uploadDocument] browser: upload OK', result)

        // Refresh local documents list
        await this.loadDocuments()
      } catch (err: any) {
        console.error('[uploadDocument] ERROR', err)

        const message =
          err?.statusMessage || err?.message || 'Upload or processing failed'

        const client = useSupabaseClient()

        // we don't know the docId here because backend is generating it,
        // so we can't reliably mark a specific row as failed.
        // (backend already sets error_message/status if it fails.)

        await this.loadDocuments()
        toasts.error(message)
        throw err
      }
    },

    async retryIngest(doc: DocumentRow) {
      const auth = useAuth()
      const toasts = useToasts()
      if (!auth.user) throw new Error('Sign in required')

      try {
        await $fetch('/api/rag/ingest', {
          method: 'POST',
          body: { docId: doc.id },
        })

        this.updateDoc(doc.id, { status: 'processing', error_message: null })
        toasts.info('Re-running ingest for this document.')
      } catch (err: any) {
        const message =
          err?.statusMessage || err?.message || 'Retry failed for this doc.'
        this.updateDoc(doc.id, {
          status: 'failed',
          error_message: message.slice(0, 280),
        })
        toasts.error(message)
      }
    },

    updateDoc(id: string, patch: Partial<DocumentRow>) {
      const idx = this.documents.findIndex((doc) => doc.id === id)
      if (idx === -1) return
      this.documents[idx] = { ...this.documents[idx], ...patch }
    },

    setLastSession(session: SessionState) {
      this.lastSession = session
    },

    async fetchLastSession() {
      const auth = useAuth()
      if (!auth.user) return

      const client = useSupabaseClient()
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.warn(error.message)
        return
      }

      if (data) {
        this.lastSession = {
          id: data.id,
          docId: data.doc_id || (data as any).metadata?.docId,
          page: (data as any).metadata?.page,
          mode: data.mode,
          metadata: (data as any).metadata,
        }
      }
    },

    async saveSession(partial: SessionState) {
      const auth = useAuth()
      if (!auth.user) return

      const client = useSupabaseClient()

      const state = {
        ...(partial.metadata || {}),
        docId: partial.docId || partial.metadata?.docId,
        page: partial.page ?? partial.metadata?.page,
      }

      const payload = {
        id: partial.id || crypto.randomUUID(),
        user_id: auth.user.id,
        mode: partial.mode,
        doc_id: state.docId || null,
        metadata: state,
        updated_at: new Date().toISOString(),
      }

      const { error } = await client
        .from('sessions')
        .upsert(payload, { onConflict: 'id' })

      if (!error) {
        this.lastSession = { ...partial, id: payload.id, metadata: state }
      }
    },
  },
})
