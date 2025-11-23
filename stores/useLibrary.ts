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

      // Course docs must be reviewed; personal docs are "approved" by default
      const approvalStatus = visibility === 'course' ? 'pending' : 'approved'

      // 1) upload PDF to storage
      const { error: storageError } = await client.storage
        .from('docs')
        .upload(path, file, {
          upsert: true,
          contentType: 'application/pdf',
        })

      if (storageError) throw storageError

      // 2) insert document row
      //    IMPORTANT: mark question_status = 'pending_admin' and question_count = 0
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
          status: 'uploading', // ingest pipeline will update this later
          error_message: null,
          size_bytes: file.size,
          // NEW fields for admin-authored questions:
          question_status: 'pending_admin', // waiting for admin to create MCQs
          question_count: 0, // no questions yet
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 3) refresh local documents list
      await this.loadDocuments()

      // 4) kick off ingestion for Ask/Reader (embeddings, etc.)
      //    Fire-and-forget: do NOT await, so the UI doesn't get stuck.
      $fetch('/api/rag/ingest', {
        method: 'POST',
        body: { docId },
      }).catch((err) => {
        console.error('Ingest failed', err)
      })
    },

    async retryIngest(doc: DocumentRow) {
      const auth = useAuth()
      const toasts = useToasts()
      if (!auth.user) throw new Error('Sign in required')

      await $fetch('/api/rag/ingest', {
        method: 'POST',
        body: { docId: doc.id },
      })

      this.updateDoc(doc.id, { status: 'processing', error_message: null })
      toasts.info('Re-running ingest for this document.')
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
