// composables/useReadyDocs.ts
import { computed } from 'vue'
import type { DocumentRow } from '~/types/models'
import { useAuth } from '~/stores/useAuth'

type LibraryStore = ReturnType<
  typeof import('~/stores/useLibrary')['useLibrary']
>

/**
 * Filters the library documents to include only docs that:
 * - are fully ingested (status = 'ready')
 * - have admin-created MCQs (question_status = 'has_questions')
 * - and, if course docs, are either approved OR owned by the current user.
 */
export function useReadyDocs(library: LibraryStore) {
  const auth = useAuth()
  const userId = computed(() => auth.user?.id ?? null)

  return computed<DocumentRow[]>(() =>
    library.documents.filter((doc) => {
      if (!doc) return false

      // 1) Ingestion must be complete
      if (doc.status !== 'ready') return false

      // 2) MCQs must exist
      const questionStatus = (doc as any).question_status ?? 'none'
      if (questionStatus !== 'has_questions') return false

      const questionCount = (doc as any).question_count ?? 0
      if (questionCount <= 0) return false

      // 3) Visibility / approval rules
      const visibility = doc.visibility ?? 'personal'
      const isOwner = userId.value && doc.user_id === userId.value

      // Personal docs: once ready + MCQs, they’re good
      if (!visibility || visibility === 'personal') return true

      // Course docs
      if (visibility === 'course') {
        // Owner can always drill their own pack
        if (isOwner) return true

        // Others only see approved course packs
        const approval = (doc as any).approval_status ?? 'pending'
        return approval === 'approved'
      }

      return false
    }),
  )
}
