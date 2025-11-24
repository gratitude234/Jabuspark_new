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

      const client = useSupabaseClient()
      const docId = crypto.randomUUID()

      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
      const path = `user/${auth.user.id}/${docId}.${ext}`

      const visibility = options?.visibility ?? 'personal'
      const course = options?.course ?? null
      const docType = options?.docType ?? null
      const courseCode = options?.courseCode ?? course
      const level = options?.level ?? null
      const faculty = options?.faculty ?? null
      const department = options?.department ?? null
      const isPublic = options?.isPublic ?? false

      const approvalStatus = visibility === 'course' ? 'pending' : 'approved'

      try {
        console.log('[uploadDocument] 1: starting', {
          docId,
          name: file.name,
          size: file.size,
          type: file.type,
          visibility,
          course,
        })

        // 1) upload PDF to storage
        console.log('[uploadDocument] 2: before storage upload', { path })
        const t0 = Date.now()
        const { error: storageError } = await client.storage
          .from('docs')
          .upload(path, file, {
            upsert: true,
            contentType: 'application/pdf',
          })
        const t1 = Date.now()
        console.log('[uploadDocument] 3: after storage upload', {
          storageError,
          ms: t1 - t0,
        })

        if (storageError) throw storageError

        // 2) insert document row
        console.log('[uploadDocument] 4: before insert row')
        const { error: insertError } = await client
          .from('documents')
          .insert({
            id: docId,
            user_id: auth.user.id,
            title: file.name.replace(/\.pdf$/i, ''),
            course,
            course_code: courseCode,
            kind: null,
            doc_type: docType,
            storage_path: path,
            pages_count: null,
            chunks_count: null,
            visibility,
            approval_status: approvalStatus,
            level,
            faculty,
            department,
            is_public: isPublic,
            status: 'uploading',
            error_message: null,
            size_bytes: file.size,
            question_status: 'pending_admin',
            question_count: 0,
          })
          .select()
          .single()
        console.log('[uploadDocument] 5: after insert row', { insertError })

        if (insertError) throw insertError

        // 3) refresh local documents list
        console.log('[uploadDocument] 6: before loadDocuments')
        await this.loadDocuments()
        console.log('[uploadDocument] 7: after loadDocuments')

        // 4) kick off ingest – fire-and-forget
        console.log('[uploadDocument] 8: trigger ingest', { docId })
        $fetch('/api/rag/ingest', {
          method: 'POST',
          body: { docId },
        })
          .then(() => {
            console.log('[uploadDocument] 9: ingest finished OK', { docId })
          })
          .catch((ingestErr) => {
            console.error('[uploadDocument] ingest failed', {
              docId,
              error: ingestErr,
            })
          })
      } catch (err: any) {
        console.error('[uploadDocument] ERROR', err)

        const message =
          err?.statusMessage || err?.message || 'Upload or processing failed'

        try {
          await client
            .from('documents')
            .update({
              status: 'failed',
              error_message: message.slice(0, 280),
            })
            .eq('id', docId)
        } catch (secondaryErr) {
          console.error(
            '[uploadDocument] failed to mark doc as failed',
            secondaryErr,
          )
        }

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
          docId: data.doc_id || data.metadata?.docId,
          page: data.metadata?.page,
          mode: data.mode,
          metadata: data.metadata,
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
